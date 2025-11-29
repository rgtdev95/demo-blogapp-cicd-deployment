# Import all models here so SQLAlchemy can find them
from app.models.user import User
from app.models.post import Post
from app.models.tag import Tag, post_tags
from app.models.comment import Comment
from app.models.like import Like, Bookmark

__all__ = ["User", "Post", "Tag", "post_tags", "Comment", "Like", "Bookmark"]

