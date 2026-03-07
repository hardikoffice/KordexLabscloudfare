from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from database import get_db
import models, schemas
from .auth import get_current_user
from typing import List

router = APIRouter(prefix="/saved-blogs", tags=["saved-blogs"])

@router.get("/", response_model=List[schemas.SavedBlogOut])
async def get_saved_blogs(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.UserSavedBlog).where(models.UserSavedBlog.user_id == current_user.id)
    )
    return result.scalars().all()

@router.post("/", response_model=schemas.SavedBlogOut)
async def save_blog(
    saved_blog: schemas.SavedBlogCreate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if already exists
    result = await db.execute(
        select(models.UserSavedBlog).where(
            models.UserSavedBlog.user_id == current_user.id,
            models.UserSavedBlog.blog_id == saved_blog.blog_id
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Blog already saved")
    
    db_saved_blog = models.UserSavedBlog(
        user_id=current_user.id,
        blog_id=saved_blog.blog_id
    )
    db.add(db_saved_blog)
    await db.commit()
    await db.refresh(db_saved_blog)
    return db_saved_blog

@router.delete("/{blog_id}")
async def unsave_blog(
    blog_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        delete(models.UserSavedBlog).where(
            models.UserSavedBlog.user_id == current_user.id,
            models.UserSavedBlog.blog_id == blog_id
        )
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Saved blog not found")
    
    await db.commit()
    return {"message": "Blog removed from saved list"}
