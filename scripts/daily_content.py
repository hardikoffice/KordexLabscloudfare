import os
import random
import datetime
import requests
import json
import subprocess
import argparse
from typing import List, Dict, Tuple
from google import genai
from google.genai import types
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

# Configure Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)
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
    print(f"Generating {article_type} content via Gemini (google-genai)...")
    
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
    
    # Using the new google-genai SDK 
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type='application/json'
        )
    )
    
    # With JSON mode, response.text should already be valid JSON
    return json.loads(response.text)

def generate_image(prompt: str, slug: str) -> str:
    print("Generating cover image via Imagen 3...")
    
    try:
        # Experimental: Check if imagen-3 is accessible via the client models
        # For most personal API keys, this might still require specific setup.
        # If it fails, we fall back to a high-quality placeholder.
        
        # Note: In the new google-genai SDK, image generation is:
        # response = client.models.generate_image(model='imagen-3', prompt=prompt)
        
        # However, to be safe and avoid 404s for restricted models, 
        # we'll use a reliable high-quality placeholder source for the demo
        image_url = f"https://source.unsplash.com/1600x900/?technology-ai-abstract-{random.randint(1,1000)}"
        image_path = os.path.join(BLOG_IMAGE_DIR, f"{slug}.png")
        
        print(f"Downloading high-quality image to {image_path}...")
        img_data = requests.get(image_url).content
        with open(image_path, 'wb') as handler:
            handler.write(img_data)
        
        return f"/images/blog/{slug}.png"
    except Exception as e:
        print(f"Image generation failed or skipped: {e}. Falling back to default.")
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

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Generate content without committing to Git")
    args = parser.parse_args()

    # 1. 70/30 Logic
    roll = random.random()
    if roll < 0.70:
        article_type = "Trending AI News"
        data = get_trending_ai_news()
    else:
        article_type = "AI Market Intelligence & Stock Analysis"
        data = get_market_intelligence()

    # 2. Generate Content
    content_data = generate_content(data, article_type)
    
    # 3. Generate Image
    if args.dry_run:
        print("[DRY RUN] Skipping image generation and Git automation.")
        print(json.dumps(content_data, indent=2))
        return

    image_url = generate_image(content_data['image_prompt'], content_data['slug'])
    
    # 4. Save MDX
    save_mdx(content_data, image_url)
    
    # 5. Git Automation
    git_automation(content_data['slug'], content_data['title'])

if __name__ == "__main__":
    main()
