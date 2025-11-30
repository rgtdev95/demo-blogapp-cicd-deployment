"""
Utility functions for tests.
"""

from typing import Dict

from httpx import AsyncClient


async def create_test_user(client: AsyncClient, email: str = "test@example.com", password: str = "testpass123") -> Dict:
    """
    Helper function to create and verify a test user.
    Returns the user data with access token.
    """
    # Register user
    register_response = await client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": email, "password": password},
    )
    assert register_response.status_code == 201
    register_data = register_response.json()

    # Verify OTP
    verify_response = await client.post(
        "/api/auth/verify",
        json={"email": email, "otp_code": register_data["otp_code"]},
    )
    assert verify_response.status_code == 200
    verify_data = verify_response.json()

    return {
        "email": email,
        "password": password,
        "access_token": verify_data["access_token"],
        "user": verify_data["user"],
    }


async def get_auth_headers(token: str) -> Dict[str, str]:
    """
    Helper function to create authorization headers.
    """
    return {"Authorization": f"Bearer {token}"}
