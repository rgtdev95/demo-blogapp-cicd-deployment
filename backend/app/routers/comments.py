from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.schemas.comment import CommentCreate, CommentResponse
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.dependencies import get_current_active_user

router = APIRouter()


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a comment to a post (authenticated users only)."""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == comment_data.post_id))
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Create comment
    new_comment = Comment(
        content=comment_data.content,
        post_id=comment_data.post_id,
        author_id=current_user.id
    )
    
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    
    # Load author relationship
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(Comment.id == new_comment.id)
    )
    comment = result.scalar_one()
    
    return comment


@router.get("/post/{post_id}", response_model=List[CommentResponse])
async def get_post_comments(
    post_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all comments for a specific post."""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Get comments
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at.desc())
    )
    comments = result.scalars().all()
    
    return comments


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a comment (owner only)."""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check ownership
    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
    
    await db.delete(comment)
    await db.commit()
    
    return None
