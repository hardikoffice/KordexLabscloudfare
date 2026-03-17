import streamlit as st
import requests
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration — support both local and remote backends
# Default to live worker
DEFAULT_API_URL = "https://kordexlabs-api.hardikoffice260706.workers.dev/api/blogs"
API_URL = os.getenv("CMS_API_URL", DEFAULT_API_URL)

# R2 Setup (via Hono Worker)
# We use the Hono worker's API for uploads
R2_AVAILABLE = True

st.set_page_config(page_title="KordexLabs CMS", layout="wide")

st.title("🚀 KordexLabs Content Management System")
st.write("Publish daily AI news directly to the website.")

# --- Sidebar ---
st.sidebar.title("⚙️ Settings")

# API URL toggle (Default to Remote for deployment)
use_local = st.sidebar.toggle("Use Local Backend", value=False)
if use_local:
    API_URL = "http://localhost:8787/api/blogs"
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

# Market Data Management
st.sidebar.markdown("---")
st.sidebar.subheader("📊 Market Data")
st.sidebar.write("Fetch latest AI stock prices from Polygon.io.")

if st.sidebar.button("🔄 Sync Markets"):
    try:
        # Construct the Base API URL (remove /blogs)
        base_api = API_URL.replace("/blogs", "").rstrip("/")
        # We use the default secret key from the worker
        SECRET_KEY = "kordexlabs_very_secret_key_change_in_production"
        sync_url = f"{base_api}/stocks/sync?secret={SECRET_KEY}"
        
        with st.sidebar.spinner("Triggering sync..."):
            sync_res = requests.get(sync_url, timeout=30)
            if sync_res.status_code == 200:
                st.sidebar.success("✅ Sync started in background!")
                st.sidebar.info("The worker is now fetching 30 days of data for 10 stocks. This takes exactly 2 minutes.")
            else:
                st.sidebar.error(f"Failed: {sync_res.status_code}")
                st.sidebar.write(f"URL Attempted: `{sync_url.split('?')[0]}`")
                st.sidebar.code(sync_res.text)
    except Exception as e:
        st.sidebar.error(f"Error: {e}")

# Existing blogs
st.sidebar.markdown("---")
st.sidebar.subheader("📰 Published Articles")
try:
    existing = requests.get(API_URL, timeout=10)
    if existing.status_code == 200:
        blogs = existing.json()
        if blogs:
            for b in blogs:
                col_text, col_del = st.sidebar.columns([0.8, 0.2])
                with col_text:
                    st.markdown(f"• **{b.get('title', 'Untitled')}**")
                with col_del:
                    if st.button("🗑️", key=f"del_{b.get('id')}", help="Delete this article"):
                        # Use session state to confirm deletion
                        st.session_state[f"confirm_delete_{b.get('id')}"] = True
                
                # Show confirmation if button clicked
                if st.session_state.get(f"confirm_delete_{b.get('id')}", False):
                    st.sidebar.warning("Are you sure?")
                    c1, c2 = st.sidebar.columns(2)
                    with c1:
                        if st.button("Yes", key=f"yes_{b.get('id')}"):
                            try:
                                # Call backend DELETE endpoint - ensuring no double slashes
                                base_api = API_URL.rstrip("/")
                                del_url = f"{base_api}/{b.get('id')}"
                                del_res = requests.delete(del_url, timeout=10)
                                if del_res.status_code == 200:
                                    st.sidebar.success("Deleted!")
                                    st.rerun()
                                else:
                                    st.sidebar.error(f"Failed: {del_res.status_code}")
                                    st.sidebar.code(del_res.text)
                            except Exception as e:
                                st.sidebar.error(f"Error: {e}")
                    with c2:
                        if st.button("No", key=f"no_{b.get('id')}"):
                            st.session_state[f"confirm_delete_{b.get('id')}"] = False
                            st.rerun()
        else:
            st.sidebar.caption("No articles published yet.")
    else:
        st.sidebar.caption("Could not fetch articles.")
except Exception:
    st.sidebar.caption("Could not connect to fetch articles.")

# Using R2 exclusively for image storage

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
    
    hero_image = st.file_uploader("Header Image", type=["jpg", "jpeg", "png", "webp", "gif"])
    image_url_input = st.text_input("Or Image URL", placeholder="https://images.unsplash.com/...")
    
    content = st.text_area("Content (Markdown)", height=400, placeholder="Write your blog content here using markdown...")
    
    submit = st.form_submit_button("🚀 Publish Blog")

if submit:
    if not title or not content:
        st.error("Title and Content are required!")
    else:
        with st.spinner("Publishing..."):
            final_image_url = image_url_input
            
            # Handle Upload to R2 if file provided
            if hero_image:
                try:
                    # Upload file to Hono Worker -> R2
                    st.info("Uploading image to Cloudflare R2...")
                    
                    # API_URL is likely ".../api/blogs", we need ".../api/images/upload"
                    base_url = API_URL.split("/api")[0]
                    upload_endpoint = f"{base_url}/api/images/upload"
                    
                    # Send as multipart/form-data
                    files = {"image": (hero_image.name, hero_image, hero_image.type)}
                    
                    upload_response = requests.post(
                        upload_endpoint,
                        files=files,
                        timeout=30
                    )
                    
                    if upload_response.status_code == 200:
                        upload_result = upload_response.json()
                        final_image_url = upload_result["url"]
                        st.success("Image uploaded to R2 successfully!")
                    else:
                        st.error(f"R2 upload failed with status {upload_response.status_code}: {upload_response.text}")
                except Exception as e:
                    st.error(f"Image upload error: {e}")
            
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
