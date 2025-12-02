from datetime import datetime

from pydantic import BaseModel, ConfigDict

class LikeResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BookmarkResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LikeStatus(BaseModel):
    is_liked: bool
    likes_count: int

class BookmarkStatus(BaseModel):
    is_bookmarked: bool
