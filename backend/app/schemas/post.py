from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)


class TagResponse(TagBase):
    id: int
    
    class Config:
        from_attributes = True


class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    seo_title: Optional[str] = Field(None, max_length=255)
    seo_description: Optional[str] = None
    is_draft: bool = True
    tags: List[str] = []


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    seo_title: Optional[str] = Field(None, max_length=255)
    seo_description: Optional[str] = None
    is_draft: Optional[bool] = None
    tags: Optional[List[str]] = None


class AuthorInfo(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True


class PostResponse(PostBase):
    id: int
    author_id: int
    author: AuthorInfo
    read_time: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    likes_count: int = 0
    comments_count: int = 0
    
    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
