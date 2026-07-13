"""
Security utilities and FastAPI authentication dependencies.

Provides OAuth2 bearer scheme and current-user extraction dependencies.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.utils.jwt import decode_token

# OAuth2 scheme for Bearer token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# In-memory token blacklist (replaced by Redis if configured)
_blacklisted_tokens: set[str] = set()


def blacklist_token(token: str) -> None:
    """Add a token to the blacklist."""
    _blacklisted_tokens.add(token)


def is_token_blacklisted(token: str) -> bool:
    """Check if a token has been blacklisted."""
    return token in _blacklisted_tokens


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency to extract and validate the current user from a JWT token.

    Decodes the Bearer token, verifies it is not blacklisted,
    and fetches the user from the database.

    Args:
        token: JWT access token extracted from Authorization header.
        db: Database session.

    Returns:
        The authenticated User model instance.

    Raises:
        HTTPException 401: If the token is invalid, expired, or blacklisted.
        HTTPException 401: If the user does not exist.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "success": False,
            "message": "Could not validate credentials.",
            "errors": ["Invalid or expired token."],
        },
        headers={"WWW-Authenticate": "Bearer"},
    )

    if is_token_blacklisted(token):
        raise credentials_exception

    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    token_type = payload.get("type")
    if token_type != "access":
        raise credentials_exception

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.uuid == user_id).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    FastAPI dependency that ensures the current user is active.

    Args:
        current_user: The authenticated user from `get_current_user`.

    Returns:
        The active User model instance.

    Raises:
        HTTPException 403: If the user account is deactivated.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": "Your account has been deactivated. Contact an administrator.",
                "errors": [],
            },
        )
    return current_user
