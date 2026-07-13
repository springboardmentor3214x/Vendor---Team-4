"""
FastAPI Application Entry Point.

Configures the application with:
    - CORS middleware
    - Request logging middleware
    - Global exception handlers
    - API router registration
    - Database role seeding on startup
    - Swagger/OpenAPI documentation
"""

import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.auth import router as auth_router
from app.api.roles import router as roles_router
from app.api.users import router as users_router
from app.core.config import settings
from app.core.database import SessionLocal, engine, Base
from app.middleware import RequestLoggingMiddleware
from app.models.role import Role
from app.models.user import User
from app.utils.password import hash_password

# =============================================================================
# Logging Configuration
# =============================================================================

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)

logger = logging.getLogger("vrip")

# =============================================================================
# Default Roles
# =============================================================================

DEFAULT_ROLES = [
    {"name": "Administrator", "description": "Full system access with all administrative privileges."},
    {"name": "Procurement Manager", "description": "Manages procurement processes and vendor selection."},
    {"name": "Supply Chain Manager", "description": "Oversees supply chain operations and logistics."},
    {"name": "Vendor", "description": "External vendor with access to their own profile and submissions."},
    {"name": "Finance Officer", "description": "Manages financial operations, invoices, and payments."},
    {"name": "Auditor", "description": "Read-only access for compliance and audit purposes."},
]


def seed_roles_and_admin() -> None:
    """
    Seed default roles into the database if they do not exist.
    Also creates the default administrator user.
    """
    db = SessionLocal()
    try:
        for role_data in DEFAULT_ROLES:
            existing = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing:
                role = Role(**role_data)
                db.add(role)
                logger.info("Seeded role: '%s'", role_data["name"])

        db.commit()

        # Create default admin user if not exists
        admin_email = settings.DEFAULT_ADMIN_EMAIL
        existing_admin = db.query(User).filter(User.email == admin_email).first()

        if not existing_admin:
            admin_role = db.query(Role).filter(Role.name == "Administrator").first()
            if admin_role:
                admin_user = User(
                    first_name=settings.DEFAULT_ADMIN_FIRST_NAME,
                    last_name=settings.DEFAULT_ADMIN_LAST_NAME,
                    username="admin",
                    email=admin_email,
                    hashed_password=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
                    role_id=admin_role.id,
                    is_active=True,
                    is_verified=True,
                    is_superuser=True,
                )
                db.add(admin_user)
                db.commit()
                logger.info(
                    "Default admin user created: %s (%s)",
                    admin_user.username,
                    admin_user.email,
                )
    except Exception as e:
        db.rollback()
        logger.error("Error seeding database: %s", str(e))
    finally:
        db.close()


# =============================================================================
# Application Lifespan
# =============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for startup and shutdown events."""
    # Startup
    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)

    # Create tables if they don't exist (for development convenience)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created.")

    # Seed default roles and admin user
    seed_roles_and_admin()
    logger.info("Database seeding complete.")

    yield

    # Shutdown
    logger.info("Shutting down %s", settings.APP_NAME)


# =============================================================================
# FastAPI Application
# =============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    description="""
## Vendor Reliability Intelligence Platform - Authentication & User Management API

This API provides complete authentication and role-based access control (RBAC) for
the Vendor Reliability Intelligence Platform.

### Features
- **User Registration & Authentication** - Secure sign-up and JWT-based login
- **Token Management** - Access tokens, refresh tokens, and token blacklisting
- **Password Management** - Change password, forgot password, and reset password
- **User Administration** - CRUD operations for managing platform users
- **Role-Based Access Control** - Fine-grained permissions based on user roles

### Default Roles
| Role | Access Level |
|------|-------------|
| **Administrator** | Full system access |
| **Procurement Manager** | Procurement processes and vendor management |
| **Supply Chain Manager** | Supply chain operations |
| **Vendor** | Own profile and submissions only |
| **Finance Officer** | Financial operations |
| **Auditor** | Read-only access |

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Default Admin Credentials
- **Email**: admin@vrip.com
- **Password**: Admin@12345
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# =============================================================================
# Middleware
# =============================================================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging
app.add_middleware(RequestLoggingMiddleware)


# =============================================================================
# Global Exception Handlers
# =============================================================================


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle all HTTP exceptions with consistent JSON format."""
    detail = exc.detail

    # If detail is already a dict with our format, use it directly
    if isinstance(detail, dict) and "success" in detail:
        return JSONResponse(
            status_code=exc.status_code,
            content=detail,
        )

    # Otherwise, wrap it in our standard format
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(detail) if isinstance(detail, str) else "An error occurred.",
            "errors": [],
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors with detailed field-level errors."""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append(f"{field}: {error['msg']}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error. Please check your input.",
            "errors": errors,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions with a generic error response."""
    logger.exception("Unhandled exception: %s", str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred.",
            "errors": [str(exc)] if settings.DEBUG else [],
        },
    )


# =============================================================================
# Route Registration
# =============================================================================

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(roles_router)


# =============================================================================
# Health Check
# =============================================================================


@app.get(
    "/",
    tags=["Health"],
    summary="Health check",
    description="Returns the API status and version information.",
    response_model=dict,
)
def health_check() -> dict:
    """API health check endpoint."""
    return {
        "success": True,
        "message": f"{settings.APP_NAME} is running.",
        "data": {
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "redoc": "/redoc",
        },
    }


@app.get(
    "/api/health",
    tags=["Health"],
    summary="API health check",
    description="Returns detailed API health status.",
    response_model=dict,
)
def api_health() -> dict:
    """Detailed API health check."""
    return {
        "success": True,
        "message": "API is healthy.",
        "data": {
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "debug": settings.DEBUG,
        },
    }
