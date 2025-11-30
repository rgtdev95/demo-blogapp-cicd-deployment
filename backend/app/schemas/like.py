from datetime import datetime

from pydantic import BaseModel


class LikeResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BookmarkResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LikeStatus(BaseModel):
    is_liked: bool
    likes_count: int


class BookmarkStatus(BaseModel):
    is_bookmarked: bool
