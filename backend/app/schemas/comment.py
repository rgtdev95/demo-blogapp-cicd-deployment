from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    post_id: int


class CommentAuthor(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class CommentResponse(CommentBase):
    id: int
    post_id: int
    author_id: int
    author: CommentAuthor
    created_at: datetime

    class Config:
        from_attributes = True
