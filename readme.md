# Vendor Reliability Intelligence Platform

## Project Overview

The Vendor Reliability Intelligence Platform is a full-stack web application developed to help organizations manage vendors, improve procurement processes, and evaluate vendor reliability.

This repository currently contains the **Milestone 1 Backend**.

---

## Milestone 1 - Completed

- FastAPI project setup
- Backend folder structure
- PostgreSQL database connection
- User Registration API
- User Login API
- JWT Authentication
- Password Hashing using bcrypt
- Protected API (`/users/me`)
- Basic Role-Based Authentication
- Swagger API Testing

---

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- Uvicorn

### Database
- PostgreSQL

### Authentication
- JWT (python-jose)
- OAuth2
- Passlib (bcrypt)

### Validation
- Pydantic

### API Testing
- Swagger UI

### Frontend
- Angular *(In Progress)*

---

## Project Structure

```
VendorReliabilityBackend/
│
├── app/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   ├── role_checker.py
│   └── main.py
│
├── requirements.txt
└── .env
```

---

## Installation

### Clone the Repository

```bash
git clone <repository-url>
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the Project

```bash
uvicorn app.main:app --reload
```

---

## API Endpoints

- **POST /auth/register** – Register a new user
- **POST /auth/login** – Login and generate JWT token
- **GET /users/me** – Get logged-in user details
- **GET /** – Home API

---

## Current Status

- ✅ FastAPI Setup Completed
- ✅ PostgreSQL Connected
- ✅ Register API Completed
- ✅ Login API Completed
- ✅ JWT Authentication Implemented
- ✅ Protected API Implemented
- ✅ Swagger API Tested
- ✅ Code Pushed to GitHub

---
