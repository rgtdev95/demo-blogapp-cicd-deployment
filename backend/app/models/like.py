from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", backref="likes")
    user = relationship("User", backref="likes")

    # Ensure one user can only like a post once
    __table_args__ = (UniqueConstraint("post_id", "user_id", name="unique_post_user_like"),)

    def __repr__(self):
        return f"<Like(id={self.id}, post_id={self.post_id}, user_id={self.user_id})>"


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", backref="bookmarks")
    user = relationship("User", backref="bookmarks")

    # Ensure one user can only bookmark a post once
    __table_args__ = (UniqueConstraint("post_id", "user_id", name="unique_post_user_bookmark"),)

    def __repr__(self):
        return f"<Bookmark(id={self.id}, post_id={self.post_id}, user_id={self.user_id})>"
