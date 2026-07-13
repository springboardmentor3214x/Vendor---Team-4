# Vendor Reliability Intelligence Platform — Backend API

## Module 1: User Authentication & Role Management

A production-ready FastAPI backend providing complete user authentication, JWT token management, and role-based access control (RBAC) for the Vendor Reliability Intelligence Platform.

---

## 🏗️ Architecture

```
backend/
├── app/
│   ├── api/                  # API route handlers
│   │   ├── auth.py           # Authentication endpoints (9 routes)
│   │   ├── users.py          # User management endpoints (6 routes)
│   │   └── roles.py          # Role management endpoints (4 routes)
│   ├── core/                 # Core infrastructure
│   │   ├── config.py         # Environment-based settings (Pydantic)
│   │   ├── database.py       # SQLAlchemy engine & session
│   │   ├── security.py       # OAuth2 & JWT authentication
│   │   └── dependencies.py   # RBAC dependency factories
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── user.py           # User model (18 fields)
│   │   └── role.py           # Role model
│   ├── schemas/              # Pydantic v2 request/response schemas
│   │   ├── auth.py           # Auth schemas
│   │   ├── user.py           # User CRUD schemas
│   │   └── role.py           # Role CRUD schemas
│   ├── services/             # Business logic layer
│   │   ├── auth_service.py   # Authentication operations
│   │   ├── user_service.py   # User CRUD operations
│   │   └── email_service.py  # Email sending (SMTP/console)
│   ├── utils/                # Utility functions
│   │   ├── jwt.py            # JWT token creation & verification
│   │   ├── password.py       # Bcrypt hashing
│   │   └── validators.py     # Input validation
│   ├── middleware/            # Custom middleware
│   │   └── __init__.py       # Request logging middleware
│   └── main.py               # FastAPI app entry point
├── alembic/                  # Database migrations
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Start all services (API + PostgreSQL + Redis)
docker-compose up --build

# API is now running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Option 2: Local Development

#### Prerequisites
- Python 3.12+
- PostgreSQL 14+
- Redis (optional)

#### Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Create the database
# In PostgreSQL:
# CREATE DATABASE vrip_db;

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🔐 Default Credentials

On first startup, the application automatically seeds:

### Default Roles
| Role | Description |
|------|-------------|
| Administrator | Full system access with all privileges |
| Procurement Manager | Procurement processes and vendor management |
| Supply Chain Manager | Supply chain operations and logistics |
| Vendor | Own profile and submissions only |
| Finance Officer | Financial operations and payments |
| Auditor | Read-only access for compliance |

### Default Admin User
| Field | Value |
|-------|-------|
| Email | `admin@vrip.com` |
| Password | `Admin@12345` |
| Role | Administrator |

> ⚠️ **Change these credentials in production!**

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login (returns JWT) |
| `POST` | `/api/auth/logout` | ✅ | Invalidate token |
| `POST` | `/api/auth/refresh-token` | ❌ | Refresh access token |
| `POST` | `/api/auth/forgot-password` | ❌ | Request password reset |
| `POST` | `/api/auth/reset-password` | ❌ | Reset with token |
| `POST` | `/api/auth/change-password` | ✅ | Change own password |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `PUT` | `/api/auth/profile` | ✅ | Update own profile |

### Users (`/api/users`)

| Method | Endpoint | Auth | RBAC |
|--------|----------|------|------|
| `GET` | `/api/users` | ✅ | Admin, Managers, Finance, Auditor |
| `GET` | `/api/users/{id}` | ✅ | Admin, Self, Read-access roles |
| `PUT` | `/api/users/{id}` | ✅ | Admin only |
| `DELETE` | `/api/users/{id}` | ✅ | Admin only |
| `PATCH` | `/api/users/{id}/activate` | ✅ | Admin only |
| `PATCH` | `/api/users/{id}/deactivate` | ✅ | Admin only |

### Roles (`/api/roles`)

| Method | Endpoint | Auth | RBAC |
|--------|----------|------|------|
| `GET` | `/api/roles` | ✅ | All authenticated users |
| `POST` | `/api/roles` | ✅ | Admin only |
| `PUT` | `/api/roles/{id}` | ✅ | Admin only |
| `DELETE` | `/api/roles/{id}` | ✅ | Admin only |

---

## 🧪 Testing the API

### 1. Start the Server

```bash
uvicorn app.main:app --reload
```

### 2. Open Swagger Documentation

Navigate to: **http://localhost:8000/docs**

### 3. Login as Admin

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@vrip.com&password=Admin@12345"
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
}
```

### 4. Register a New User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "SecureP@ss1",
    "phone_number": "+1-234-567-8900",
    "company_name": "Acme Corp",
    "designation": "Procurement Lead",
    "role_name": "Vendor"
  }'
```

### 5. Access Protected Endpoint

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <your_access_token>"
```

### 6. List All Users (Admin)

```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer <admin_access_token>"
```

### 7. Change Password

```bash
curl -X POST http://localhost:8000/api/auth/change-password \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "SecureP@ss1",
    "new_password": "NewSecureP@ss2"
  }'
```

### 8. Forgot Password

```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com"}'
```

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/vrip_db` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | `your-super-secret-key` | JWT signing secret |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `DEBUG` | `false` | Enable debug mode |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins |
| `REDIS_URL` | `None` | Redis URL for token blacklist |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_USER` | `None` | SMTP username |
| `SMTP_PASSWORD` | `None` | SMTP password |
| `DEFAULT_ADMIN_EMAIL` | `admin@vrip.com` | Seeded admin email |
| `DEFAULT_ADMIN_PASSWORD` | `Admin@12345` | Seeded admin password |

---

## 🔒 Security Features

- **Password Hashing**: bcrypt via Passlib (never stored as plain text)
- **Password Validation**: Minimum 8 chars, uppercase, lowercase, digit, special character
- **JWT Tokens**: Access (30 min) + Refresh (7 days) token pair
- **Token Blacklisting**: In-memory or Redis-backed
- **RBAC**: Role-based endpoint protection via FastAPI dependencies
- **CORS**: Configurable allowed origins
- **Input Validation**: Pydantic v2 with custom validators
- **Email Enumeration Prevention**: Forgot-password always returns success

---

## 📝 JWT Token Structure

```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "role": "Administrator",
  "user_id": 1,
  "exp": 1700000000,
  "type": "access"
}
```

---

## 🗄️ Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

---

## 📦 Production Deployment

1. Update `.env` with production values (especially `JWT_SECRET_KEY`)
2. Set `DEBUG=false`
3. Use a strong, random `JWT_SECRET_KEY`
4. Configure proper `CORS_ORIGINS`
5. Set up SMTP credentials for email functionality
6. Use Docker Compose for deployment:

```bash
docker-compose -f docker-compose.yml up -d --build
```

---

## 📄 License

This project is proprietary software for the Vendor Reliability Intelligence Platform.
