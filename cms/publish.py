import streamlit as st
import requests
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration — support both local and remote backends
DEFAULT_API_URL = "https://kordexlabs.onrender.com/api/blogs"
API_URL = os.getenv("CMS_API_URL", DEFAULT_API_URL)

# Optional Cloudinary Setup
try:
    import cloudinary
    import cloudinary.uploader
    
    if not os.getenv("CLOUDINARY_URL") and not (os.getenv("CLOUDINARY_CLOUD_NAME") and os.getenv("CLOUDINARY_API_KEY") and os.getenv("CLOUDINARY_API_SECRET")):
        st.warning("Cloudinary credentials not found in environment variables. Image uploads will fail.")
    
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False

st.set_page_config(page_title="KordexLabs CMS", layout="wide")

st.title("🚀 KordexLabs Content Management System")
st.write("Publish daily AI news directly to the website.")

# --- Sidebar ---
st.sidebar.title("⚙️ Settings")

# API URL toggle
use_local = st.sidebar.toggle("Use Local Backend", value=False)
if use_local:
    API_URL = "http://localhost:8000/api/blogs"
    st.sidebar.success(f"🟢 Using: Local (`{API_URL}`)")
else:
    st.sidebar.info(f"🌐 Using: Remote (`{API_URL}`)")

# Connection check
st.sidebar.markdown("---")
st.sidebar.subheader("🔗 Connection Status")
try:
    health = requests.get(API_URL.replace("/blogs", "").rstrip("/").rsplit("/api", 1)[0], timeout=10)
    if health.status_code == 200:
        st.sidebar.success("✅ Backend is online")
    else:
        st.sidebar.warning(f"⚠️ Backend returned status {health.status_code}")
except requests.exceptions.ConnectionError:
    st.sidebar.error("❌ Cannot connect to backend — is it running?")
except Exception as e:
    st.sidebar.error(f"❌ Connection error: {e}")

# Existing blogs
st.sidebar.markdown("---")
st.sidebar.subheader("📰 Published Articles")
try:
    existing = requests.get(API_URL, timeout=10)
    if existing.status_code == 200:
        blogs = existing.json()
        if blogs:
            for b in blogs:
                st.sidebar.markdown(f"• **{b.get('title', 'Untitled')}** — {b.get('author', 'Unknown')}")
        else:
            st.sidebar.caption("No articles published yet.")
    else:
        st.sidebar.caption("Could not fetch articles.")
except Exception:
    st.sidebar.caption("Could not connect to fetch articles.")

if not CLOUDINARY_AVAILABLE:
    st.warning("⚠️ 'cloudinary' module not found. Image uploads are disabled. Run: `pip install -r requirements.txt`")

# --- Publish Form ---
with st.form("blog_form"):
    title = st.text_input("Blog Title", placeholder="Enter a catchy title...")
    author = st.text_input("Author Name", value="Hardik")
    
    col1, col2 = st.columns(2)
    with col1:
        read_time = st.number_input("Read Time (minutes)", min_value=1, value=5)
    with col2:
        published_at = st.date_input("Publish Date", value=datetime.date.today())
    
    tags_str = st.text_input("Tags (comma separated)", placeholder="AI, Machine Learning, Trending")
    
    hero_image = st.file_uploader("Header Image", type=["jpg", "jpeg", "png", "webp"], disabled=not CLOUDINARY_AVAILABLE)
    image_url_input = st.text_input("Or Image URL", placeholder="https://images.unsplash.com/...")
    
    content = st.text_area("Content (Markdown)", height=400, placeholder="Write your blog content here using markdown...")
    
    submit = st.form_submit_button("🚀 Publish Blog")

if submit:
    if not title or not content:
        st.error("Title and Content are required!")
    else:
        with st.spinner("Publishing..."):
            final_image_url = image_url_input
            
            # Handle Upload to Cloudinary if file provided
            if hero_image and CLOUDINARY_AVAILABLE:
                try:
                    # Upload file to Cloudinary
                    st.info("Uploading image to Cloudinary...")
                    upload_result = cloudinary.uploader.upload(hero_image.getvalue())
                    final_image_url = upload_result.get("secure_url", image_url_input)
                    st.success("Image uploaded successfully!")
                except Exception as e:
                    st.error(f"Image upload failed: {e}")
            elif hero_image and not CLOUDINARY_AVAILABLE:
                st.error("Cannot upload image because 'cloudinary' library is missing.")
            
            payload = {
                "title": title,
                "author": author,
                "read_time_minutes": read_time,
                "hero_image_url": final_image_url,
                "tags": [t.strip() for t in tags_str.split(",") if t.strip()],
                "published_at": str(published_at),
                "content_markdown": content
            }
            
            try:
                response = requests.post(API_URL, json=payload, timeout=15)
                if response.status_code == 200:
                    st.success(f"✅ Successfully published: **{title}**")
                    st.balloons()
                else:
                    st.error(f"Failed to publish: {response.status_code} — {response.text}")
            except requests.exceptions.ConnectionError:
                st.error("❌ Cannot connect to backend. Make sure it is running.")
            except requests.exceptions.Timeout:
                st.error("❌ Request timed out. The backend may be waking up (Render free tier). Try again in 30 seconds.")
            except Exception as e:
                st.error(f"Error: {e}")
