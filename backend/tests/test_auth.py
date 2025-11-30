"""
Tests for authentication endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestAuthRegistration:
    """Test user registration flow."""

    async def test_register_new_user(self, client: AsyncClient):
        """Test successful user registration."""
        response = await client.post(
            "/api/auth/register",
            json={"name": "John Doe", "email": "john@example.com", "password": "securepass123"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User registered successfully. Please verify your email with OTP."
        assert data["email"] == "john@example.com"
        assert "otp_code" in data
        assert len(data["otp_code"]) == 6

    async def test_register_duplicate_email(self, client: AsyncClient):
        """Test registration with existing email fails."""
        # Register first user
        await client.post(
            "/api/auth/register",
            json={"name": "John Doe", "email": "john@example.com", "password": "pass123"},
        )

        # Try to register with same email
        response = await client.post(
            "/api/auth/register",
            json={"name": "Jane Doe", "email": "john@example.com", "password": "pass456"},
        )

        assert response.status_code == 422  # FastAPI returns 422 for validation errors
        # Note: In production, you might want to customize this to return 400


@pytest.mark.asyncio
class TestAuthVerification:
    """Test OTP verification flow."""

    async def test_verify_valid_otp(self, client: AsyncClient):
        """Test successful OTP verification."""
        # Register user
        register_response = await client.post(
            "/api/auth/register",
            json={"name": "Test User", "email": "test@example.com", "password": "testpass"},
        )
        otp_code = register_response.json()["otp_code"]

        # Verify OTP
        verify_response = await client.post(
            "/api/auth/verify",
            json={"email": "test@example.com", "otp_code": otp_code},
        )

        assert verify_response.status_code == 200
        data = verify_response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test@example.com"

    async def test_verify_invalid_otp(self, client: AsyncClient):
        """Test verification with invalid OTP fails."""
        # Register user
        await client.post(
            "/api/auth/register",
            json={"name": "Test User", "email": "test@example.com", "password": "testpass"},
        )

        # Try to verify with wrong OTP
        response = await client.post(
            "/api/auth/verify",
            json={"email": "test@example.com", "otp_code": "000000"},
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid OTP code"

    async def test_verify_nonexistent_user(self, client: AsyncClient):
        """Test verification for non-existent user fails."""
        response = await client.post(
            "/api/auth/verify",
            json={"email": "nonexistent@example.com", "otp_code": "123456"},
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
class TestAuthLogin:
    """Test user login flow."""

    async def test_login_success(self, client: AsyncClient):
        """Test successful login with verified user."""
        # Register and verify user
        register_response = await client.post(
            "/api/auth/register",
            json={"name": "Test User", "email": "test@example.com", "password": "testpass123"},
        )
        otp_code = register_response.json()["otp_code"]

        await client.post(
            "/api/auth/verify",
            json={"email": "test@example.com", "otp_code": otp_code},
        )

        # Login
        response = await client.post(
            "/api/auth/login",
            data={"username": "test@example.com", "password": "testpass123"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient):
        """Test login with wrong password fails."""
        # Register and verify user
        register_response = await client.post(
            "/api/auth/register",
            json={"name": "Test User", "email": "test@example.com", "password": "correctpass"},
        )
        otp_code = register_response.json()["otp_code"]

        await client.post(
            "/api/auth/verify",
            json={"email": "test@example.com", "otp_code": otp_code},
        )

        # Try to login with wrong password
        response = await client.post(
            "/api/auth/login",
            data={"username": "test@example.com", "password": "wrongpass"},
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"

    async def test_login_unverified_user(self, client: AsyncClient):
        """Test login with unverified user fails."""
        # Register but don't verify
        await client.post(
            "/api/auth/register",
            json={"name": "Test User", "email": "test@example.com", "password": "testpass"},
        )

        # Try to login
        response = await client.post(
            "/api/auth/login",
            data={"username": "test@example.com", "password": "testpass"},
        )

        assert response.status_code == 403
        assert response.json()["detail"] == "Please verify your email first"


@pytest.mark.asyncio
class TestAuthProfile:
    """Test user profile endpoints."""

    async def test_get_current_user(self, client: AsyncClient):
        """Test getting current user information."""
        # Register and verify user
        register_response = await client.post(
            "/api/auth/register",
            json={"name": "Test User", "email": "test@example.com", "password": "testpass"},
        )
        otp_code = register_response.json()["otp_code"]

        verify_response = await client.post(
            "/api/auth/verify",
            json={"email": "test@example.com", "otp_code": otp_code},
        )
        token = verify_response.json()["access_token"]

        # Get current user
        response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"

    async def test_get_current_user_unauthorized(self, client: AsyncClient):
        """Test getting current user without token fails."""
        response = await client.get("/api/auth/me")

        assert response.status_code == 401
