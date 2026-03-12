import streamlit as st
import requests
import datetime
import uuid

# Configuration
API_URL = "https://kordexlabs.onrender.com/api/blogs"

# Optional Cloudinary Setup
try:
    import cloudinary
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False

# Cloudinary Setup (User should fill these or use environment variables)
# if CLOUDINARY_AVAILABLE:
#     cloudinary.config(
#       cloud_name = 'your_cloud_name',
#       api_key = 'your_api_key',
#       api_secret = 'your_api_secret'
#     )

st.set_page_config(page_title="KordexLabs CMS", layout="wide")

st.title("🚀 KordexLabs Content Management System")
st.write("Publish daily AI news directly to the website.")

if not CLOUDINARY_AVAILABLE:
    st.warning("⚠️ 'cloudinary' module not found. Image uploads are disabled. Please run: pip install -r requirements.txt")

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
    
    submit = st.form_submit_button("Publish Blog")

if submit:
    if not title or not content:
        st.error("Title and Content are required!")
    else:
        with st.spinner("Publishing..."):
            final_image_url = image_url_input
            
            # Handle Upload to Cloudinary if file provided
            if hero_image and CLOUDINARY_AVAILABLE:
                try:
                    # upload_result = cloudinary.uploader.upload(hero_image)
                    # final_image_url = upload_result['secure_url']
                    st.warning("Cloudinary upload is simulated. Please configure credentials in the script.")
                    final_image_url = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" # Fallback
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
                response = requests.post(API_URL, json=payload)
                if response.status_code == 200:
                    st.success(f"Successfully published: {title}")
                    st.balloons()
                else:
                    st.error(f"Failed to publish: {response.status_code} - {response.text}")
            except Exception as e:
                st.error(f"Error connecting to backend: {e}")

st.sidebar.title("CMS Info")
st.sidebar.info("""
This tool connects to your Render backend to insert records into the Neon database.
Make sure your backend is running and the database table is created.
""")
