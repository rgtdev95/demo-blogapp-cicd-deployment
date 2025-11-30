from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)

    # OTP verification fields
    otp_code = Column(String(6), nullable=True)
    otp_created_at = Column(DateTime(timezone=True), nullable=True)
    is_verified = Column(Integer, default=0)  # 0 = not verified, 1 = verified

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"
