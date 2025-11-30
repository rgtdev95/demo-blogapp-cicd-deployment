# Import all models here so SQLAlchemy can find them
from app.models.comment import Comment
from app.models.like import Bookmark, Like
from app.models.post import Post
from app.models.tag import Tag, post_tags
from app.models.user import User

__all__ = ["User", "Post", "Tag", "post_tags", "Comment", "Like", "Bookmark"]
