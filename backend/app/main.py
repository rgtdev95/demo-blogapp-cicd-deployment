from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import auth, posts, comments, likes, upload
import os

app = FastAPI(
    title="Blog App API",
    description="FastAPI backend for Blog Application",
    version="1.0.0",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)

app.include_router(auth.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Authentication"])
app.include_router(posts.router, prefix=f"{settings.API_PREFIX}/posts", tags=["Posts"])
app.include_router(comments.router, prefix=f"{settings.API_PREFIX}/comments", tags=["Comments"])
app.include_router(likes.router, prefix=f"{settings.API_PREFIX}", tags=["Likes & Bookmarks"])
app.include_router(upload.router, prefix=f"{settings.API_PREFIX}", tags=["Uploads"])

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/static/uploads", StaticFiles(directory="uploads"), name="static")

@app.get("/")
async def root():
    return {
        "message": "Blog App API",
        "version": "1.0.0",
        "docs": f"{settings.API_PREFIX}/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}




