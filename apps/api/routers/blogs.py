from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from database import get_db
from models import Blog
from schemas import BlogOut, BlogCreate

router = APIRouter()

@router.get("/blogs", response_model=List[BlogOut])
async def get_all_blogs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).order_by(Blog.created_at.desc()))
    blogs = result.scalars().all()
    # Convert tags from comma-separated string to list
    for b in blogs:
        if isinstance(b.tags, str):
            b.tags = b.tags.split(",") if b.tags else []
    return blogs

@router.get("/blogs/trending", response_model=List[BlogOut])
async def get_trending_blogs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).order_by(Blog.created_at.desc()).limit(3))
    blogs = result.scalars().all()
    for b in blogs:
        if isinstance(b.tags, str):
            b.tags = b.tags.split(",") if b.tags else []
    return blogs

@router.get("/blogs/{blog_id}", response_model=BlogOut)
async def get_blog(blog_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).where(Blog.id == blog_id))
    blog = result.scalars().first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if isinstance(blog.tags, str):
        blog.tags = blog.tags.split(",") if blog.tags else []
    return blog

@router.post("/blogs", response_model=BlogOut)
async def create_blog(blog: BlogCreate, db: AsyncSession = Depends(get_db)):
    db_blog = Blog(
        id=str(uuid.uuid4()),
        title=blog.title,
        author=blog.author,
        read_time_minutes=blog.read_time_minutes,
        hero_image_url=blog.hero_image_url,
        tags=",".join(blog.tags),
        published_at=blog.published_at,
        content_markdown=blog.content_markdown
    )
    db.add(db_blog)
    await db.commit()
    await db.refresh(db_blog)
    
    # Convert tags back to list for response
    db_blog.tags = db_blog.tags.split(",") if db_blog.tags else []
    return db_blog
精准
