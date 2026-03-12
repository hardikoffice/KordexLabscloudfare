from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)

    favorites = relationship("UserFavoriteStock", back_populates="user", cascade="all, delete-orphan")
    saved_blogs = relationship("UserSavedBlog", back_populates="user", cascade="all, delete-orphan")

class UserFavoriteStock(Base):
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticker = Column(String, nullable=False)

    user = relationship("User", back_populates="favorites")

class UserSavedBlog(Base):
    __tablename__ = "user_saved_blogs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blog_id = Column(String, nullable=False)

    user = relationship("User", back_populates="saved_blogs")

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    read_time_minutes = Column(Integer, default=5)
    hero_image_url = Column(String)
    tags = Column(String) # Stored as comma-separated string for simplicity
    published_at = Column(String)
    content_markdown = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
