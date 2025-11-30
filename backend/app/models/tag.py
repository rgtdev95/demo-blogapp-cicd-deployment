from sqlalchemy import Column, Integer, String, Table, ForeignKey
from app.database import Base

# Association table for post tags (many-to-many)
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)

    def __repr__(self):
        return f"<Tag(id={self.id}, name={self.name})>"
