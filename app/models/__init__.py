"""
Models package.

Imports all SQLAlchemy models so Alembic can discover them.
"""

from app.models.role import Role  # noqa: F401
from app.models.user import User  # noqa: F401
