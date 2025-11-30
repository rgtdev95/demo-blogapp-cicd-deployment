"""
Tests for posts endpoints.
"""

import pytest
from httpx import AsyncClient

from tests.utils import create_test_user, get_auth_headers


@pytest.mark.asyncio
class TestPostCreation:
    """Test post creation."""

    async def test_create_post_success(self, client: AsyncClient):
        """Test successful post creation."""
        # Create and authenticate user
        user_data = await create_test_user(client)
        headers = await get_auth_headers(user_data["access_token"])

        # Create post
        response = await client.post(
            "/api/posts",
            json={
                "title": "Test Post",
                "content": "This is a test post content",
                "is_draft": False,
            },
            headers=headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Post"
        assert data["content"] == "This is a test post content"
        assert data["is_draft"] is False
        assert data["author"]["name"] == "Test User"

    async def test_create_post_unauthorized(self, client: AsyncClient):
        """Test post creation without authentication fails."""
        response = await client.post(
            "/api/posts",
            json={
                "title": "Test Post",
                "content": "Content",
                "is_draft": False,
            },
        )

        assert response.status_code == 401


@pytest.mark.asyncio
class TestPostRetrieval:
    """Test post retrieval."""

    async def test_get_all_posts(self, client: AsyncClient):
        """Test getting all published posts."""
        # Create user and post
        user_data = await create_test_user(client)
        headers = await get_auth_headers(user_data["access_token"])

        await client.post(
            "/api/posts",
            json={
                "title": "Published Post",
                "content": "Content",
                "is_draft": False,
            },
            headers=headers,
        )

        # Get all posts
        response = await client.get("/api/posts")

        assert response.status_code == 200
        data = response.json()
        assert len(data["posts"]) >= 1
        assert data["posts"][0]["title"] == "Published Post"

    async def test_get_post_by_id(self, client: AsyncClient):
        """Test getting a specific post by ID."""
        # Create user and post
        user_data = await create_test_user(client)
        headers = await get_auth_headers(user_data["access_token"])

        create_response = await client.post(
            "/api/posts",
            json={
                "title": "Test Post",
                "content": "Content",
                "is_draft": False,
            },
            headers=headers,
        )
        post_id = create_response.json()["id"]

        # Get post by ID
        response = await client.get(f"/api/posts/{post_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == post_id
        assert data["title"] == "Test Post"

    async def test_get_nonexistent_post(self, client: AsyncClient):
        """Test getting non-existent post returns 404."""
        response = await client.get("/api/posts/99999")

        assert response.status_code == 404


@pytest.mark.asyncio
class TestPostUpdate:
    """Test post updates."""

    async def test_update_own_post(self, client: AsyncClient):
        """Test updating own post."""
        # Create user and post
        user_data = await create_test_user(client)
        headers = await get_auth_headers(user_data["access_token"])

        create_response = await client.post(
            "/api/posts",
            json={
                "title": "Original Title",
                "content": "Original content",
                "is_draft": True,
            },
            headers=headers,
        )
        post_id = create_response.json()["id"]

        # Update post
        response = await client.put(
            f"/api/posts/{post_id}",
            json={
                "title": "Updated Title",
                "content": "Updated content",
                "is_draft": False,
            },
            headers=headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["content"] == "Updated content"
        assert data["is_draft"] is False

    async def test_update_post_unauthorized(self, client: AsyncClient):
        """Test updating post without authentication fails."""
        response = await client.put(
            "/api/posts/1",
            json={"title": "Updated", "content": "Content", "is_draft": False},
        )

        assert response.status_code == 401


@pytest.mark.asyncio
class TestPostDeletion:
    """Test post deletion."""

    async def test_delete_own_post(self, client: AsyncClient):
        """Test deleting own post."""
        # Create user and post
        user_data = await create_test_user(client)
        headers = await get_auth_headers(user_data["access_token"])

        create_response = await client.post(
            "/api/posts",
            json={
                "title": "Post to Delete",
                "content": "Content",
                "is_draft": False,
            },
            headers=headers,
        )
        post_id = create_response.json()["id"]

        # Delete post
        response = await client.delete(f"/api/posts/{post_id}", headers=headers)

        assert response.status_code == 204

        # Verify post is deleted
        get_response = await client.get(f"/api/posts/{post_id}")
        assert get_response.status_code == 404

    async def test_delete_post_unauthorized(self, client: AsyncClient):
        """Test deleting post without authentication fails."""
        response = await client.delete("/api/posts/1")

        assert response.status_code == 401
