from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from database import get_db
import models, schemas
from .auth import get_current_user
from typing import List

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.get("/", response_model=List[schemas.FavoriteStockOut])
async def get_favorites(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.UserFavoriteStock).where(models.UserFavoriteStock.user_id == current_user.id)
    )
    return result.scalars().all()

@router.post("/", response_model=schemas.FavoriteStockOut)
async def add_favorite(
    favorite: schemas.FavoriteStockCreate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if already exists
    result = await db.execute(
        select(models.UserFavoriteStock).where(
            models.UserFavoriteStock.user_id == current_user.id,
            models.UserFavoriteStock.ticker == favorite.ticker
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Stock already in favorites")
    
    db_favorite = models.UserFavoriteStock(
        user_id=current_user.id,
        ticker=favorite.ticker
    )
    db.add(db_favorite)
    await db.commit()
    await db.refresh(db_favorite)
    return db_favorite

@router.delete("/{ticker}")
async def remove_favorite(
    ticker: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        delete(models.UserFavoriteStock).where(
            models.UserFavoriteStock.user_id == current_user.id,
            models.UserFavoriteStock.ticker == ticker
        )
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    await db.commit()
    return {"message": "Favorite removed"}
