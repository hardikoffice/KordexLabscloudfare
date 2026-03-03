import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

import re
import ssl

# Fallback to SQLite for local development 
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./kordexlabs.db")

# 1. Clean up accidental brackets if user copied [PASSWORD] or similar
if DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("[", "").replace("]", "")

# 2. Support PostgreSQL and ensure asyncpg driver
is_postgres = False
if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    is_postgres = True
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    else:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # 3. Strip sslmode from URL using regex (asyncpg prefers connect_args)
    DATABASE_URL = re.sub(r'[?&]sslmode=[^&]*', '', DATABASE_URL)

# PostgreSQL requires SSL for Supabase, but asyncpg often fails with self-signed certs
# in a pooled environment. We configure a custom SSL context to allow them.
connect_args = {}
if is_postgres:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ctx
else:
    # SQLite settings
    connect_args["check_same_thread"] = False

engine = create_async_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session
