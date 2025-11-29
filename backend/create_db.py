"""
Script to create database tables.
Run this after starting the MySQL database.
"""
import asyncio
from app.database import engine, Base
from app.models import User, Post, Tag, Comment, Like, Bookmark  # Import all models


async def create_tables():
    """Create all database tables."""
    async with engine.begin() as conn:
        # Drop all tables (use with caution!)
        # await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created successfully!")


if __name__ == "__main__":
    asyncio.run(create_tables())
