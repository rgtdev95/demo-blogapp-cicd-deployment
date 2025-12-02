from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserResponse


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    post_id: int


class CommentAuthor(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CommentResponse(CommentBase):
    id: int
    post_id: int
    author_id: int
    author: CommentAuthor
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
