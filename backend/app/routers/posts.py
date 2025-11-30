from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import re

from app.database import get_db
from app.schemas.post import PostCreate, PostUpdate, PostResponse, PostListResponse, AuthorInfo
from app.models.post import Post
from app.models.user import User
from app.models.tag import Tag, post_tags
from app.models.like import Like
from app.models.comment import Comment
from app.dependencies import get_current_active_user

router = APIRouter()


def calculate_read_time(content: str) -> int:
    """Calculate estimated read time in minutes based on word count."""
    # Strip HTML tags
    text = re.sub(r"<[^>]+>", "", content)
    words = len(text.split())
    # Average reading speed: 200 words per minute
    return max(1, words // 200)


def generate_excerpt(content: str, seo_description: Optional[str] = None) -> str:
    """Generate excerpt from content or SEO description."""
    if seo_description:
        return seo_description

    # Strip HTML tags
    text = re.sub(r"<[^>]+>", "", content)
    # Take first 150 characters
    return text[:150] + "..." if len(text) > 150 else text


async def get_or_create_tags(db: AsyncSession, tag_names: List[str]) -> List[Tag]:
    """Get existing tags or create new ones."""
    tags = []
    for tag_name in tag_names:
        tag_name = tag_name.strip().lower()
        if not tag_name:
            continue

        result = await db.execute(select(Tag).where(Tag.name == tag_name))
        tag = result.scalar_one_or_none()

        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
            await db.flush()

        tags.append(tag)

    return tags


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)
):
    """Create a new blog post."""
    # Calculate read time
    read_time = calculate_read_time(post_data.content)

    # Generate excerpt
    excerpt = generate_excerpt(post_data.content, post_data.seo_description)

    # Create post
    new_post = Post(
        title=post_data.title,
        content=post_data.content,
        excerpt=excerpt,
        cover_image=post_data.cover_image,
        seo_title=post_data.seo_title,
        seo_description=post_data.seo_description,
        is_draft=post_data.is_draft,
        read_time=read_time,
        author_id=current_user.id,
        published_at=None if post_data.is_draft else datetime.utcnow(),
    )

    db.add(new_post)
    await db.flush()

    # Handle tags
    print(f"DEBUG: Received tags: {post_data.tags}")
    if post_data.tags:
        tags = await get_or_create_tags(db, post_data.tags)
        print(f"DEBUG: Processed tags: {tags}")
        for tag in tags:
            print(f"DEBUG: Linking tag {tag.name} (id={tag.id}) to post {new_post.id}")
            await db.execute(post_tags.insert().values(post_id=new_post.id, tag_id=tag.id))

    await db.commit()
    await db.refresh(new_post)

    # Load author and get counts
    result = await db.execute(select(Post).options(selectinload(Post.author)).where(Post.id == new_post.id))
    post = result.scalar_one()

    # Get likes and comments count
    likes_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post.id))
    comments_count = await db.scalar(select(func.count(Comment.id)).where(Comment.post_id == post.id))

    # Get tags
    tags_result = await db.execute(select(Tag).join(post_tags).where(post_tags.c.post_id == post.id))
    tags = tags_result.scalars().all()

    response = PostResponse.from_orm(post)
    response.likes_count = likes_count or 0
    response.comments_count = comments_count or 0
    response.tags = [tag.name for tag in tags]

    return response


@router.get("", response_model=PostListResponse)
async def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    is_draft: Optional[bool] = None,
    author_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of blog posts (public feed)."""
    # Base query - only published posts for public feed
    query = select(Post).options(selectinload(Post.author))

    # Filter by draft status (default to published only)
    if is_draft is None:
        query = query.where(Post.is_draft == False)
    else:
        query = query.where(Post.is_draft == is_draft)

    # Filter by author
    if author_id:
        query = query.where(Post.author_id == author_id)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Apply pagination
    query = query.order_by(Post.published_at.desc(), Post.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    posts = result.scalars().all()

    # Build response with counts
    posts_response = []
    for post in posts:
        likes_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post.id))
        comments_count = await db.scalar(select(func.count(Comment.id)).where(Comment.post_id == post.id))

        # Get tags
        tags_result = await db.execute(select(Tag).join(post_tags).where(post_tags.c.post_id == post.id))
        tags = tags_result.scalars().all()

        post_resp = PostResponse.from_orm(post)
        post_resp.likes_count = likes_count or 0
        post_resp.comments_count = comments_count or 0
        post_resp.tags = [tag.name for tag in tags]
        posts_response.append(post_resp)

    total_pages = (total + page_size - 1) // page_size if total else 0

    return PostListResponse(posts=posts_response, total=total or 0, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/my-posts", response_model=PostListResponse)
async def get_my_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's posts (including drafts)."""
    # Query user's posts
    query = select(Post).options(selectinload(Post.author)).where(Post.author_id == current_user.id)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Apply pagination
    query = query.order_by(Post.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    posts = result.scalars().all()

    # Build response
    posts_response = []
    for post in posts:
        likes_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post.id))
        comments_count = await db.scalar(select(func.count(Comment.id)).where(Comment.post_id == post.id))

        # Get tags
        tags_result = await db.execute(select(Tag).join(post_tags).where(post_tags.c.post_id == post.id))
        tags = tags_result.scalars().all()

        post_resp = PostResponse.from_orm(post)
        post_resp.likes_count = likes_count or 0
        post_resp.comments_count = comments_count or 0
        post_resp.tags = [tag.name for tag in tags]
        posts_response.append(post_resp)

    total_pages = (total + page_size - 1) // page_size if total else 0

    return PostListResponse(posts=posts_response, total=total or 0, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single blog post by ID."""
    result = await db.execute(select(Post).options(selectinload(Post.author)).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Get counts
    likes_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post.id))
    comments_count = await db.scalar(select(func.count(Comment.id)).where(Comment.post_id == post.id))

    # Get tags
    tags_result = await db.execute(select(Tag).join(post_tags).where(post_tags.c.post_id == post.id))
    tags = tags_result.scalars().all()

    post_resp = PostResponse.from_orm(post)
    post_resp.likes_count = likes_count or 0
    post_resp.comments_count = comments_count or 0
    post_resp.tags = [tag.name for tag in tags]

    return post_resp


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a blog post (owner only)."""
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Check ownership
    if post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this post")

    # Update fields
    if post_update.title is not None:
        post.title = post_update.title
    if post_update.content is not None:
        post.content = post_update.content
        post.read_time = calculate_read_time(post_update.content)
    if post_update.excerpt is not None:
        post.excerpt = post_update.excerpt
    elif post_update.content is not None:
        post.excerpt = generate_excerpt(post_update.content, post_update.seo_description)
    if post_update.cover_image is not None:
        post.cover_image = post_update.cover_image
    if post_update.seo_title is not None:
        post.seo_title = post_update.seo_title
    if post_update.seo_description is not None:
        post.seo_description = post_update.seo_description
    if post_update.is_draft is not None:
        post.is_draft = post_update.is_draft
        # Set published_at when changing from draft to published
        if not post_update.is_draft and post.published_at is None:
            post.published_at = datetime.utcnow()

    # Update tags if provided
    if post_update.tags is not None:
        # Remove existing tags
        await db.execute(post_tags.delete().where(post_tags.c.post_id == post.id))
        # Add new tags
        if post_update.tags:
            tags = await get_or_create_tags(db, post_update.tags)
            for tag in tags:
                await db.execute(post_tags.insert().values(post_id=post.id, tag_id=tag.id))

    await db.commit()
    await db.refresh(post)

    # Load author and get counts
    result = await db.execute(select(Post).options(selectinload(Post.author)).where(Post.id == post.id))
    post = result.scalar_one()

    likes_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post.id))
    comments_count = await db.scalar(select(func.count(Comment.id)).where(Comment.post_id == post.id))

    # Get tags
    tags_result = await db.execute(select(Tag).join(post_tags).where(post_tags.c.post_id == post.id))
    tags = tags_result.scalars().all()

    post_resp = PostResponse.from_orm(post)
    post_resp.likes_count = likes_count or 0
    post_resp.comments_count = comments_count or 0
    post_resp.tags = [tag.name for tag in tags]

    return post_resp


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Delete a blog post (owner only)."""
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Check ownership
    if post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this post")

    await db.delete(post)
    await db.commit()

    return None
