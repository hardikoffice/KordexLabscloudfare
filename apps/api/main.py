from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import blogs, tools, stocks, auth, favorites
from database import engine, Base

app = FastAPI(title="KordexLabs API", version="1.0.0")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://kordexlabs.vercel.app",
        "https://kordexlabs.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(blogs.router, prefix="/api")
app.include_router(tools.router, prefix="/api")
app.include_router(stocks.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(favorites.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "KordexLabs API is running", "version": "1.0.0"}
