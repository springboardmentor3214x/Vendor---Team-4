"""
Application configuration using Pydantic Settings.

Loads environment variables from .env file and provides
typed access to all configuration values.
"""

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Application ----
    APP_NAME: str = "Vendor Reliability Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ---- Database ----
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/vrip_db"

    # ---- JWT ----
    JWT_SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ---- CORS ----
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # ---- Redis ----
    REDIS_URL: str | None = None

    # ---- SMTP ----
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_NAME: str = "VRIP Platform"

    # ---- Default Admin ----
    DEFAULT_ADMIN_EMAIL: str = "admin@vrip.com"
    DEFAULT_ADMIN_PASSWORD: str = "Admin@12345"
    DEFAULT_ADMIN_FIRST_NAME: str = "System"
    DEFAULT_ADMIN_LAST_NAME: str = "Administrator"


# Singleton settings instance
settings = Settings()
