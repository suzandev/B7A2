# Issue Management API

A robust, production-ready REST API for managing user authentication and issue tracking. Built with TypeScript, Express.js, and PostgreSQL, this API provides comprehensive endpoints for user management, issue creation, filtering, and role-based access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Database](#database)
  - [Schema](#schema)
  - [Initialization](#initialization)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Issues](#issues)
- [Authentication & Authorization](#authentication--authorization)
- [Running the Application](#running-the-application)
- [Testing with Postman](#testing-with-postman)
- [Error Handling](#error-handling)
- [Development](#development)

---

## Features

✅ **User Authentication**

- User registration with email and password
- Secure password hashing with bcrypt
- JWT-based authentication with 7-day expiration
- Role-based access control (Contributor, Maintainer)

✅ **Issue Management**

- Create issues (authenticated users)
- Retrieve all issues with advanced filtering
- Get individual issue details
- Update issues with role-based restrictions
- Delete issues (maintainers only)

✅ **Advanced Filtering & Sorting**

- Filter by issue type (bug, feature_request)
- Filter by issue status (open, in_progress, resolved)
- Sort by creation date (newest, oldest)
- Retrieve reporter information for each issue

✅ **Security**

- Password encryption with bcrypt (salt rounds: 10)
- JWT token-based authentication
- Input validation on all endpoints
- Role-based authorization

---

## Tech Stack

| Layer                | Technology         |
| -------------------- | ------------------ |
| **Runtime**          | Node.js            |
| **Language**         | TypeScript         |
| **Framework**        | Express.js v5.2.1  |
| **Database**         | PostgreSQL         |
| **Authentication**   | JWT (jsonwebtoken) |
| **Password Hashing** | bcrypt             |
| **Environment**      | dotenv             |
| **Dev Tool**         | tsx                |

---

## Project Structure

```
src/
├── app.ts                          # Express app setup
├── index.ts                        # Application entry point
├── config/
│   └── env.ts                      # Environment configuration
├── db/
│   └── index.ts                    # Database initialization & schema
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts      # Authentication request handlers
│   │   ├── auth.service.ts         # Authentication business logic
│   │   ├── auth.route.ts           # Auth endpoints
│   │   └── auth.middleware.ts      # JWT verification middleware
│   └── issues/
│       ├── issue.controller.ts     # Issue request handlers
│       ├── issue.service.ts        # Issue business logic
│       └── issue.route.ts          # Issue endpoints
└── types/
    ├── auth.types.ts               # Authentication interfaces
    ├── issue.types.ts              # Issue interfaces
    └── express.d.ts                # Express Request extension
```

---

## Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database instance
- **Postman** (optional, for API testing)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd B7A2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install development dependencies**
   ```bash
   npm install --save-dev
   ```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
CONNECTION_STRING=postgresql://username:password@host:port/database?sslmode=require&channel_binding=require

# JWT Secret
JWT_SECRET=your-secret-key-here-use-strong-random-string

# Server Port
PORT=3000
```

**Example with Neon (PostgreSQL as a Service):**

```env
CONNECTION_STRING=postgresql://neondb_owner:password@ep-broad-sun-ao2ubzce-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=a;sdflkjadf;kfa;lkdfj
PORT=3000
```

---

## Database

### Schema

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'contributor'
    CHECK (role IN ('contributor', 'maintainer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Issues Table

```sql
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL
    CHECK (LENGTH(description) >= 20),
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('bug', 'feature_request')),
  status VARCHAR(30) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Initialization

The database schema is automatically created on application startup via `src/db/index.ts`. Tables are only created if they don't already exist.

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All authenticated endpoints require the `Authorization` header with JWT token:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication Endpoints

### 1. Sign Up

Creates a new user account.

**Endpoint:** `POST /auth/signup`

**Access:** Public

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor",
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

---

### 2. Login

Authenticates user and returns JWT token.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "contributor",
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T10:30:00Z"
    }
  }
}
```

---

## Issues Endpoints

### 3. Create Issue

Creates a new issue (bug report or feature request).

**Endpoint:** `POST /issues`

**Access:** Authenticated users (contributor, maintainer)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

---

### 4. Get All Issues

Retrieves all issues with optional filtering and sorting.

**Endpoint:** `GET /issues`

**Access:** Public

**Query Parameters:**

| Parameter | Values                      | Default | Required |
| --------- | --------------------------- | ------- | -------- |
| `sort`    | newest, oldest              | newest  | No       |
| `type`    | bug, feature_request        | (none)  | No       |
| `status`  | open, in_progress, resolved | (none)  | No       |

**Example Requests:**

```
GET /issues?sort=newest
GET /issues?type=bug&status=open
GET /issues?sort=oldest&type=feature_request&status=in_progress
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}
```

---

### 5. Get Single Issue

Retrieves detailed information about a specific issue.

**Endpoint:** `GET /issues/:id`

**Access:** Public

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

### 6. Update Issue

Updates issue title, description, or type.

**Endpoint:** `PATCH /issues/:id`

**Access:** Authenticated users with restrictions

- **Maintainer:** Can update any issue
- **Contributor:** Can update only their own issues and only if status is `open`

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (partial, at least one field required):**

```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

### 7. Delete Issue

Permanently removes an issue from the system.

**Endpoint:** `DELETE /issues/:id`

**Access:** Maintainer only

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## Authentication & Authorization

### User Roles

| Role            | Permissions                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Contributor** | • Create issues<br>• View all issues<br>• Update own issues (if status is open)<br>• Cannot delete any issues |
| **Maintainer**  | • Create issues<br>• View all issues<br>• Update any issue<br>• Delete any issue                              |

### Token Details

- **Algorithm:** HS256 (HMAC SHA-256)
- **Expiration:** 7 days
- **Payload:**
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "role": "contributor",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```

---

## Running the Application

### Development Mode

Start the application with hot reload enabled:

```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically restart on file changes.

### Production Build

Compile TypeScript to JavaScript:

```bash
npx tsc
```

---

## Testing with Postman

### 1. Import Collection

Create a new Postman collection with the following requests:

### 2. Authentication Flow

**Step 1: Sign Up**

- Method: `POST`
- URL: `http://localhost:3000/api/auth/signup`
- Body (raw JSON):
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "contributor"
  }
  ```

**Step 2: Login**

- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body (raw JSON):
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Copy the `token` from response**

### 3. Issue Operations

**Create Issue**

- Method: `POST`
- URL: `http://localhost:3000/api/issues`
- Headers:
  - `Authorization: Bearer <TOKEN_FROM_LOGIN>`
  - `Content-Type: application/json`
- Body: Issue details

**Get All Issues**

- Method: `GET`
- URL: `http://localhost:3000/api/issues?sort=newest&type=bug`

**Get Single Issue**

- Method: `GET`
- URL: `http://localhost:3000/api/issues/1`

**Update Issue**

- Method: `PATCH`
- URL: `http://localhost:3000/api/issues/1`
- Headers: Authorization header required
- Body: Updated fields

**Delete Issue**

- Method: `DELETE`
- URL: `http://localhost:3000/api/issues/1`
- Headers: Authorization header with maintainer token

---

## Error Handling

The API returns standardized error responses:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid id"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Forbidden"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Issue not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Development

### Scripts

| Script        | Description                              |
| ------------- | ---------------------------------------- |
| `npm run dev` | Start development server with hot reload |

### Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment configuration
- **typescript** - Type safety
- **tsx** - TypeScript execution

---

## License

ISC

---

## Support

For issues, questions, or contributions, please contact the development team.

---

**Last Updated:** May 22, 2026  
**Version:** 1.0.0
