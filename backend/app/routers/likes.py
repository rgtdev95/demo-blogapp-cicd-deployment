from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional

from app.database import get_db
from app.schemas.like import LikeResponse, BookmarkResponse, LikeStatus, BookmarkStatus
from app.models.like import Like, Bookmark
from app.models.post import Post
from app.models.user import User
from app.dependencies import get_current_active_user

router = APIRouter()


# ===== LIKES =====


@router.post("/posts/{post_id}/like", response_model=LikeStatus)
async def like_post(post_id: int, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Like a post (toggle - if already liked, unlike it)."""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Check if already liked
    result = await db.execute(select(Like).where(and_(Like.post_id == post_id, Like.user_id == current_user.id)))
    existing_like = result.scalar_one_or_none()

    if existing_like:
        # Unlike - remove the like
        await db.delete(existing_like)
        await db.commit()
        is_liked = False
    else:
        # Like - add new like
        new_like = Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        await db.commit()
        is_liked = True

    # Get total likes count
    likes_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post_id))

    return LikeStatus(is_liked=is_liked, likes_count=likes_count or 0)


@router.get("/posts/{post_id}/like-status", response_model=LikeStatus)
async def get_like_status(
    post_id: int, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)
):
    """Check if current user has liked a post and get total likes count."""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Check if user has liked
    result = await db.execute(select(Like).where(and_(Like.post_id == post_id, Like.user_id == current_user.id)))
    user_like = result.scalar_one_or_none()

    # Get total likes count
    likes_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post_id))

    return LikeStatus(is_liked=user_like is not None, likes_count=likes_count or 0)


@router.delete("/posts/{post_id}/like", response_model=LikeStatus)
async def unlike_post(post_id: int, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Unlike a post."""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Find and delete like
    result = await db.execute(select(Like).where(and_(Like.post_id == post_id, Like.user_id == current_user.id)))
    like = result.scalar_one_or_none()

    if like:
        await db.delete(like)
        await db.commit()

    # Get total likes count
    likes_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post_id))

    return LikeStatus(is_liked=False, likes_count=likes_count or 0)


# ===== BOOKMARKS =====


@router.post("/posts/{post_id}/bookmark", response_model=BookmarkStatus)
async def bookmark_post(
    post_id: int, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)
):
    """Bookmark a post (toggle - if already bookmarked, remove it)."""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Check if already bookmarked
    result = await db.execute(select(Bookmark).where(and_(Bookmark.post_id == post_id, Bookmark.user_id == current_user.id)))
    existing_bookmark = result.scalar_one_or_none()

    if existing_bookmark:
        # Remove bookmark
        await db.delete(existing_bookmark)
        await db.commit()
        is_bookmarked = False
    else:
        # Add bookmark
        new_bookmark = Bookmark(post_id=post_id, user_id=current_user.id)
        db.add(new_bookmark)
        await db.commit()
        is_bookmarked = True

    return BookmarkStatus(is_bookmarked=is_bookmarked)


@router.get("/posts/{post_id}/bookmark-status", response_model=BookmarkStatus)
async def get_bookmark_status(
    post_id: int, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)
):
    """Check if current user has bookmarked a post."""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Check if user has bookmarked
    result = await db.execute(select(Bookmark).where(and_(Bookmark.post_id == post_id, Bookmark.user_id == current_user.id)))
    user_bookmark = result.scalar_one_or_none()

    return BookmarkStatus(is_bookmarked=user_bookmark is not None)


@router.delete("/posts/{post_id}/bookmark", response_model=BookmarkStatus)
async def remove_bookmark(
    post_id: int, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)
):
    """Remove bookmark from a post."""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Find and delete bookmark
    result = await db.execute(select(Bookmark).where(and_(Bookmark.post_id == post_id, Bookmark.user_id == current_user.id)))
    bookmark = result.scalar_one_or_none()

    if bookmark:
        await db.delete(bookmark)
        await db.commit()

    return BookmarkStatus(is_bookmarked=False)
