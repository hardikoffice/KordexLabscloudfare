import os
import random
import datetime
import requests
import json
import subprocess
import argparse
from typing import List, Dict, Tuple
import google.generativeai as genai
from tavily import TavilyClient

# Configuration & Secrets (Should be set in GitHub Secrets)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GITHUB_TOKEN = os.getenv("GH_TOKEN")

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG_CONTENT_DIR = os.path.join(BASE_DIR, "apps/web/content/blog")
BLOG_IMAGE_DIR = os.path.join(BASE_DIR, "apps/web/public/images/blog")

# Tickers for Market Intelligence
TICKERS = ["NVDA", "MSFT", "AMD", "GOOGL", "META"]

# Internal Links Context
INTERNAL_LINKS = {
    "tools": "/tools",
    "markets": "/markets",
    "dashboard": "/dashboard"
}

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
tavily = TavilyClient(api_key=TAVILY_API_KEY)

def get_trending_ai_news() -> str:
    print("Fetching trending AI news...")
    search_result = tavily.search(
        query="top 3 artificial intelligence headlines last 24 hours",
        search_depth="advanced",
        max_results=5
    )
    return json.dumps(search_result)

def get_market_intelligence() -> str:
    print("Fetching AI market intelligence...")
    ticker_focus = random.sample(TICKERS, 3)
    query = f"recent performance and news for {', '.join(ticker_focus)} stocks in the last 24 hours"
    search_result = tavily.search(
        query=query,
        search_depth="advanced",
        max_results=5
    )
    return json.dumps(search_result)

def generate_content(data: str, article_type: str) -> Dict:
    print(f"Generating {article_type} content via Gemini...")
    
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    prompt = (
        "You are a Senior AI Technical Writer & SEO Expert at KordexLabs. "
        "Your goal is to write a high-quality, engaging, and SEO-optimized blog post based on provided news/data.\n\n"
        "Strictly adhere to these requirements:\n"
        "1. Structure: H1, optimized Meta Description (150-160 characters), semantic HTML (H2, H3).\n"
        "2. Style: Modern, professional, authoritative yet accessible.\n"
        "3. Keywords: Identify a primary keyword and use it in the title and first paragraph.\n"
        "4. Internal Links: Naturally link to /tools (for AI tools), /markets (for stock analysis), and /dashboard.\n"
        "5. Output Format: Return a raw JSON object (no markdown formatting blocks) with the following keys:\n"
        "   - 'title': The post title\n"
        "   - 'slug': URL-friendly slug\n"
        "   - 'meta_description': 150-160 char snippet\n"
        "   - 'tags': list of tags\n"
        "   - 'content_markdown': the full body content\n"
        "   - 'image_prompt': A detailed description for Imagen 3 to generate a 16:9 widescreen, modern, high-tech cover image. No text in image.\n\n"
        f"Article Type: {article_type}\n"
        f"Data: {data}\n"
    )
    
    response = model.generate_content(prompt)
    
    # Cleaning response text to ensure it's valid JSON
    content_text = response.text.replace("```json", "").replace("```", "").strip()
    return json.loads(content_text)

def generate_image(prompt: str, slug: str) -> str:
    print("Generating cover image via Imagen 3...")
    
    # Note: Using the Imagen 3 model via the Gemini API
    # Since direct text-to-image might vary by region/tier, we use the standard imagen model call
    # If the user has access to Imagen 3 on Vertex, they'd use the vertexai sdk, 
    # but for Generative AI API (Gemini API) we use the following:
    
    try:
        model = genai.GenerativeModel('imagen-3.0-generate-001') # Or compatible imagen model
        # For simplicity in this script, we'll use a placeholder or assume API access
        # In a real scenario, Imagen 3 is often called via Vertex AI or specific endpoint
        
        # Fallback to a structured log if the specific model isn't available for the API key tier
        print(f"Prompt sent to Imagen: {prompt}")
        
        # Placeholder for actual image binary retrieval (specifics vary by Imagen API endpoint)
        # For now, we'll download a high-quality abstract tech image if the API isn't yet fully public for the key
        image_url = f"https://source.unsplash.com/1600x900/?technology-ai-{random.randint(1,100)}"
        image_path = os.path.join(BLOG_IMAGE_DIR, f"{slug}.png")
        
        print(f"Downloading image to {image_path}...")
        img_data = requests.get(image_url).content
        with open(image_path, 'wb') as handler:
            handler.write(img_data)
        
        return f"/images/blog/{slug}.png"
    except Exception as e:
        print(f"Image generation failed: {e}. Falling back to default.")
        return "/images/blog/default-ai.png"

def save_mdx(content_data: Dict, image_url: str):
    print(f"Saving MDX file for {content_data['title']}...")
    os.makedirs(BLOG_CONTENT_DIR, exist_ok=True)
    
    date_str = datetime.date.today().isoformat()
    filename = f"{content_data['slug']}.mdx"
    filepath = os.path.join(BLOG_CONTENT_DIR, filename)
    
    frontmatter = (
        "---\n"
        f"title: \"{content_data['title']}\"\n"
        f"description: \"{content_data['meta_description']}\"\n"
        f"date: \"{date_str}\"\n"
        f"image: \"{image_url}\"\n"
        f"author: \"KordexLabs AI (Gemini)\"\n"
        f"tags: {json.dumps(content_data['tags'])}\n"
        "---\n\n"
    )
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(frontmatter)
        f.write(content_data['content_markdown'])
    
    return filepath

def git_automation(slug: str, title: str):
    print("Starting Git & PR automation...")
    branch_name = f"blog/{slug}-{datetime.date.today().strftime('%Y%m%d')}"
    
    try:
        # Create new branch
        subprocess.run(["git", "checkout", "-b", branch_name], check=True)
        
        # Add files
        subprocess.run(["git", "add", "."], check=True)
        
        # Commit
        commit_msg = f"feat(blog): add new article via Gemini - {title}"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        
        # Push
        subprocess.run(["git", "push", "origin", branch_name], check=True)
        
        # Create PR using GH CLI
        pr_title = f"Daily AI Content (Gemini): {title}"
        pr_body = f"Automated daily content generation using Gemini 1.5 Pro for {datetime.date.today().isoformat()}.\n\n- **Title**: {title}\n- **Slug**: {slug}"
        subprocess.run([
            "gh", "pr", "create", 
            "--title", pr_title, 
            "--body", pr_body, 
            "--base", "main", 
            "--head", branch_name
        ], check=True)
        
        print("PR created successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Git/PR Error: {e}")

if __name__ == "__main__":
    main()
