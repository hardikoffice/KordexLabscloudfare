from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class FavoriteStockBase(BaseModel):
    ticker: str

class FavoriteStockCreate(FavoriteStockBase):
    pass

class FavoriteStockOut(FavoriteStockBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class SavedBlogBase(BaseModel):
    blog_id: str

class SavedBlogCreate(SavedBlogBase):
    pass

class SavedBlogOut(SavedBlogBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class BlogBase(BaseModel):
    title: str
    author: str
    read_time_minutes: int = 5
    hero_image_url: Optional[str] = None
    tags: List[str]
    published_at: str
    content_markdown: str

class BlogCreate(BlogBase):
    pass

class BlogOut(BlogBase):
    id: str

    class Config:
        from_attributes = True
