"""
JWT token creation and verification utilities.

Handles access tokens, refresh tokens, and password reset tokens.
Uses python-jose with HS256 algorithm.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(data: dict[str, Any]) -> str:
    """
    Create a JWT access token.

    The token includes user_id, email, role, and an expiration timestamp.

    Args:
        data: Dictionary containing token payload (sub, email, role, user_id).

    Returns:
        Encoded JWT access token string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    """
    Create a JWT refresh token with longer expiry.

    Args:
        data: Dictionary containing token payload (sub, email, role, user_id).

    Returns:
        Encoded JWT refresh token string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_reset_token(email: str) -> str:
    """
    Create a short-lived JWT token for password reset.

    The token expires in 15 minutes.

    Args:
        email: The email address of the user requesting a reset.

    Returns:
        Encoded JWT reset token string.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"sub": email, "exp": expire, "type": "reset"}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any] | None:
    """
    Decode and verify a JWT token.

    Returns the payload if the token is valid, or None if
    the token is expired, tampered, or otherwise invalid.

    Args:
        token: The JWT token string to decode.

    Returns:
        Decoded token payload dictionary, or None if invalid.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def verify_token_type(token: str, expected_type: str) -> dict[str, Any] | None:
    """
    Decode a JWT token and verify it matches the expected type.

    Args:
        token: The JWT token string.
        expected_type: Expected token type ('access', 'refresh', or 'reset').

    Returns:
        Decoded payload if valid and type matches, None otherwise.
    """
    payload = decode_token(token)
    if payload is None:
        return None
    if payload.get("type") != expected_type:
        return None
    return payload
