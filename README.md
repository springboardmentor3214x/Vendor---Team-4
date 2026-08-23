# Vendor Reliability Intelligence Platform

## Project Overview

The Vendor Reliability Intelligence Platform is a full-stack web application designed to support vendor reliability and procurement-related operations.

The platform provides secure user authentication, role-based access, profile management, and separate dashboards for different users in the procurement and vendor management process.

The current project implementation focuses on **Milestone 1 – User Authentication and Role Management**.

---

## Current Project Progress

### Milestone 1 – Completed

The following features have been implemented:

- FastAPI backend setup
- Angular frontend setup
- Angular Material integration
- PostgreSQL database integration
- Frontend and backend API integration
- User Registration
- Secure User Login
- Password Hashing using bcrypt
- JWT Authentication
- Forgot Password
- Reset Password
- User Profile Management
- View Profile
- Edit Profile
- Change Password
- Logout
- Role-Based Dashboard Redirection
- Angular Authentication Guard
- Angular Role Guard
- Backend JWT Validation
- Backend Role-Based Access Control
- Swagger API Testing

The **User Authentication and Role Management module is completed**.

---

## Supported User Roles

The application supports six user roles:

- Administrator
- Procurement Manager
- Supply Chain Manager
- Vendor
- Finance Officer
- Auditor

Each user is redirected to the appropriate dashboard based on their assigned role.

---

## Technologies Used

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- python-jose
- Passlib
- bcrypt

### Database

- PostgreSQL

### Frontend

- Angular
- TypeScript
- Angular Material
- RxJS
- Reactive Forms

### Authentication and Security

- JWT Authentication
- OAuth2 Password Bearer
- bcrypt Password Hashing
- Angular Route Guards
- Backend Role-Based Access Control

### Development Tools

- Visual Studio Code
- Swagger UI
- Git
- GitHub

---

## Project Structure

```text
Vendor-Team-4/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── models/
│   │   │   └── user.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   └── users.py
│   │   │
│   │   ├── schemas/
│   │   │   └── user.py
│   │   │
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   └── role_checker.py
│   │
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   └── app/
│   │       │
│   │       ├── guards/
│   │       │   ├── auth-guard.ts
│   │       │   └── role-guard.ts
│   │       │
│   │       ├── pages/
│   │       │   ├── auth/
│   │       │   ├── dashboard/
│   │       │   └── profile/
│   │       │
│   │       ├── services/
│   │       │   └── auth.service.ts
│   │       │
│   │       └── app.routes.ts
│   │
│   ├── package.json
│   └── angular.json
│
├── .gitignore
└── README.md
```

---

## Authentication Flow

The authentication process works as follows:

1. A new user creates an account using the Registration page.
2. Vendor users provide their Company Name.
3. Internal users provide their Employee ID.
4. The password is hashed using bcrypt before being stored in PostgreSQL.
5. The user logs in using their email and password.
6. FastAPI validates the user credentials.
7. A JWT Access Token is generated after successful login.
8. Angular stores the JWT Token.
9. The frontend retrieves the authenticated user's information.
10. The user's role is identified.
11. The user is redirected to the appropriate dashboard.
12. Angular Route Guards prevent unauthorized dashboard access.
13. FastAPI validates JWT Tokens and user roles for protected backend APIs.

---

## Registration Features

The Registration page contains:

- Full Name
- Employee ID for internal users
- Company Name for Vendor users
- Email Address
- Mobile Number
- Password
- Confirm Password
- Role Selection
- Submit Button

### Registration Validation

The application validates:

- Required fields
- Email format
- Unique email address
- 10-digit mobile number
- Minimum password length
- Password and Confirm Password matching
- Company Name for Vendor users
- Employee ID for internal users

Passwords are never stored directly in the database.

Passwords are hashed using bcrypt before storage.

---

## Login Features

The Login page contains:

- Email
- Password
- Show/Hide Password
- Remember Me
- Forgot Password
- Login Button
- Registration Link

The system validates the email and password.

Invalid credentials display an appropriate error message.

After successful login, the backend generates a JWT Access Token.

The user is redirected to the dashboard based on their role.

---

## Forgot and Reset Password

The application supports Forgot Password and Reset Password functionality.

The user enters their registered email address.

The backend verifies the email and generates a password reset token.

The reset token is valid for a limited period.

The user can enter and confirm a new password.

The new password is hashed before being stored in the database.

---

## User Profile Management

Authenticated users can:

- View Profile
- Edit Full Name
- Edit Mobile Number
- Change Password
- Cancel Profile Changes
- Logout

The Profile page initially opens in **view-only mode**.

Users must click the **Edit Profile** button before modifying their information.

Email and Role are protected profile details and cannot be edited.

---

## Role-Based Dashboard Redirection

After successful login, users are redirected based on their role.

| User Role | Dashboard |
|---|---|
| Administrator | Admin Dashboard |
| Procurement Manager | Procurement Dashboard |
| Supply Chain Manager | Supply Chain Dashboard |
| Vendor | Vendor Dashboard |
| Finance Officer | Finance Dashboard |
| Auditor | Auditor Dashboard |

---

## Role-Based Access Control

Role-Based Access Control is implemented in both the frontend and backend.

### Frontend Security

The Angular `authGuard` checks whether the user is authenticated.

The Angular `roleGuard` verifies whether the logged-in user's role is allowed to access a dashboard.

Users cannot access another role's dashboard by manually changing the browser URL.

### Backend Security

FastAPI validates JWT Tokens using `get_current_user`.

The `RoleChecker` checks whether the authenticated user has the required role.

Unauthorized users receive a `403 Forbidden` response.

---

# How to Run the Project

The backend and frontend must be run in separate terminals.

---

## Step 1 – Clone the Repository

Clone the GitHub repository:

```bash
git clone <repository-url>
```

Move into the project folder:

```bash
cd Vendor-Team-4
```

---

# Backend Setup

## Step 2 – Move to the Backend Folder

```bash
cd backend
```

---

## Step 3 – Create a Python Virtual Environment

Run:

```bash
python -m venv venv
```

---

## Step 4 – Activate the Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

After activation, the terminal should display:

```text
(venv)
```

---

## Step 5 – Install Backend Requirements

Install all required Python packages using:

```bash
pip install -r requirements.txt
```

This installs the required backend dependencies such as FastAPI, SQLAlchemy, PostgreSQL drivers, JWT libraries, and password hashing libraries.

---

## Step 6 – Create the `.env` File

The `.env` file is not included in GitHub because it contains sensitive configuration information.

Inside the `backend` folder, create a new file named:

```text
.env
```

The location should be:

```text
Vendor-Team-4/
└── backend/
    └── .env
```

Add the following configuration:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
SECRET_KEY=YOUR_SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Replace:

```text
USERNAME
```

with your PostgreSQL username.

Replace:

```text
PASSWORD
```

with your PostgreSQL password.

Replace:

```text
DATABASE_NAME
```

with your PostgreSQL database name.

Replace:

```text
YOUR_SECRET_KEY
```

with a secure secret key used for JWT Authentication.

### Example Format

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/vendor_database
SECRET_KEY=your_secure_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Do not commit the `.env` file to GitHub.

---

## Step 7 – Create the PostgreSQL Database

Open PostgreSQL or pgAdmin.

Create a database for the project.

Example database name:

```text
vendor_database
```

Make sure the database name matches the database name configured in the `.env` file.

---

## Step 8 – Run the FastAPI Backend

Run:

```bash
uvicorn app.main:app --reload
```

The backend server will run at:

```text
http://127.0.0.1:8000
```

Swagger API Documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

## Step 9 – Open a New Terminal

Keep the backend server running.

Open another terminal.

Move to the frontend folder:

```bash
cd frontend
```

If you are currently inside the backend folder, use:

```bash
cd ../frontend
```

---

## Step 10 – Install Frontend Dependencies

Run:

```bash
npm install
```

This installs the Angular and frontend dependencies defined in `package.json`.

---

## Step 11 – Run the Angular Frontend

Run:

```bash
npm start
```

The Angular application will run at:

```text
http://localhost:4200
```

---

## Step 12 – Open the Application

Open a browser and visit:

```text
http://localhost:4200
```

The Login page will be displayed.

New users can create an account using the Registration page.

After successful login, the user is redirected to the dashboard based on their role.

---

## Important

Both servers must run at the same time.

### Backend Terminal

```bash
uvicorn app.main:app --reload
```

### Frontend Terminal

```bash
npm start
```

The application requires both the Angular frontend and FastAPI backend to be running.

---

## Available APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate user and generate JWT Token |
| POST | `/auth/forgot-password` | Generate password reset token |
| POST | `/auth/reset-password` | Reset user password |
| GET | `/users/me` | Get authenticated user profile |
| PUT | `/users/me` | Update user profile |
| PUT | `/users/me/password` | Update user password |
| GET | `/users/admin` | Administrator role access |
| GET | `/users/procurement` | Procurement Manager role access |
| GET | `/users/supply-chain` | Supply Chain Manager role access |
| GET | `/users/vendor` | Vendor role access |
| GET | `/users/finance` | Finance Officer role access |
| GET | `/users/auditor` | Auditor role access |

---

## API Testing

The backend APIs can be tested using Swagger UI.

Start the FastAPI backend and open:

```text
http://127.0.0.1:8000/docs
```

Swagger UI provides documentation and testing options for the available APIs.

---

## Security

The application implements the following security features:

- bcrypt Password Hashing
- JWT Authentication
- JWT Token Validation
- Password Reset Tokens
- Angular Authentication Guards
- Angular Role Guards
- Backend Role-Based Access Control

Sensitive environment variables are stored in the local `.env` file.

The following files and folders are excluded from Git tracking using `.gitignore`:

- `.env`
- `__pycache__`
- `.pyc` files
- Python Virtual Environment
- `node_modules`
- Angular Build Files

---

## Current Project Status

### Milestone 1 – Completed

The User Authentication and Role Management module has been completed.

The current application supports:

- Secure User Registration
- Secure User Login
- JWT Authentication
- Password Hashing
- Forgot Password
- Reset Password
- Profile Management
- Password Update
- Logout
- Six User Roles
- Role-Based Dashboard Redirection
- Angular Route Protection
- Backend JWT Validation
- Backend Role Validation

### Upcoming Development

The following modules will be implemented in upcoming milestones:

- Vendor Management
- Procurement Management
- Purchase Orders
- Vendor Performance
- Vendor Reliability
- Analytics
- Reports
- Notifications
- Audit Logs

---

## Team

Vendor Team 4
