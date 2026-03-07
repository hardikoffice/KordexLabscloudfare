from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
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
