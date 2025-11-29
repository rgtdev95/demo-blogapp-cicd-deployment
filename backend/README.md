# Blog App Backend

FastAPI backend for the Blog Application with MySQL database.

## Setup

### Prerequisites
- Python 3.10+
- Docker and Docker Compose

### Installation

1. **Start the database services:**
```bash
cd database
docker-compose up -d
```

2. **Install Python dependencies:**
```bash
cd backend
uv venv
.source venv/bin/activate  # On Windows: venv\Scripts\activate
uv pip install -r requirements.txt
```

3. **Configure environment variables:**
- Copy `.env.example` to `.env` and update values
- Generate a secure SECRET_KEY: `openssl rand -hex 32`
- Make sure DATABASE_URL matches your database configuration

4. **Run database migrations:**
```bash
# From backend directory
alembic upgrade head
```

5. **Start the FastAPI server:**

**Development:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port $PORT
```

**Production (with gunicorn):**
```bash
gunicorn app.main:app -c gunicorn.conf.py
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Database Management

phpMyAdmin is available at: http://localhost:8080
- Server: mysql
- Username: blogapp_user (or as configured in .env)
- Password: blogapp_pass (or as configured in .env)

## Quick Start

### 1. Database Setup (Already Running ✅)
Your MySQL and phpMyAdmin are already running via Docker Compose.

### 2. Install Python Dependencies

```bash
cd backend
uv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
uv pip install -r requirements.txt
```

### 3. Configure Environment

The `.env` file is already created with default values. Update if needed:
- `DATABASE_URL`: Connection string for MySQL
- `SECRET_KEY`: Change this in production!
- `CORS_ORIGINS`: Frontend URL (currently set to http://localhost:5173)
- `PORT`: Backend server port (default: 8000)

### 4. Create Database Tables

```bash
# From backend directory with venv activated
python create_db.py
```

This will create all tables:
- `users` (with OTP verification fields)
- `posts` (with draft/publish support)
- `tags` and `post_tags` (many-to-many)
- `comments`
- `likes`
- `bookmarks`

### 5. Start the FastAPI Server

**Development:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port $PORT
```

**Production:**
```bash
gunicorn app.main:app -c gunicorn.conf.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user (returns OTP for development)
- `POST /verify` - Verify OTP and get JWT token
- `POST /login` - Login with email/password (OAuth2 form)
- `GET /me` - Get current user info (protected)
- `PUT /me` - Update profile (protected)
- `POST /change-password` - Change password (protected)
- `POST /logout` - Logout (client-side token removal)

### Blog Posts (`/api/posts`)
- `POST /` - Create new post (protected)
- `GET /` - Get public posts (paginated, published only)
- `GET /my-posts` - Get current user's posts including drafts (protected)
- `GET /{post_id}` - Get single post
- `PUT /{post_id}` - Update post (owner only, protected)
- `DELETE /{post_id}` - Delete post (owner only, protected)

### Comments (`/api/comments`)
- `POST /` - Add comment to post (protected)
- `GET /post/{post_id}` - Get all comments for a post
- `DELETE /{comment_id}` - Delete comment (owner only, protected)

### Likes & Bookmarks (`/api`)
- `POST /posts/{post_id}/like` - Toggle like on post (protected)
- `GET /posts/{post_id}/like-status` - Get like status (protected)
- `DELETE /posts/{post_id}/like` - Unlike post (protected)
- `POST /posts/{post_id}/bookmark` - Toggle bookmark (protected)
- `GET /posts/{post_id}/bookmark-status` - Get bookmark status (protected)
- `DELETE /posts/{post_id}/bookmark` - Remove bookmark (protected)

## Testing the API

### 1. Register a User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response will include OTP code (development only).

### 2. Verify OTP

```bash
curl -X POST "http://localhost:8000/api/auth/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "123456"
  }'
```

Save the `access_token` from the response.

### 3. Login (Alternative to OTP)

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

### 4. Create a Blog Post

```bash
curl -X POST "http://localhost:8000/api/posts" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "<h2>Hello World</h2><p>This is my first blog post!</p>",
    "cover_image": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    "tags": ["test", "first-post"],
    "is_draft": false
  }'
```

### 5. Get Public Feed

```bash
curl "http://localhost:8000/api/posts?page=1&page_size=12"
```

### 6. Like a Post

```bash
curl -X POST "http://localhost:8000/api/posts/1/like" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Using Swagger UI

The easiest way to test is using the interactive Swagger UI:

1. Go to http://localhost:8000/api/docs
2. Click "Authorize" button
3. Login to get a token, then paste it in the authorization dialog
4. Try out all the endpoints interactively!

## Features Implemented

✅ **Authentication**
- User registration with OTP verification
- JWT-based authentication
- Profile management
- Password change

✅ **Blog Posts**
- Create/Edit/Delete posts
- Draft vs Published status
- Auto-calculated read time
- Tag management
- Pagination
- Ownership validation

✅ **Social Features**
- Comments on posts
- Like/Unlike posts
- Bookmark/Save posts
- Comment deletion (owner only)

✅ **Data Validation**
- Pydantic schemas for all requests
- Email validation
- Password strength requirements
- Ownership checks

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection and session
│   ├── dependencies.py      # Shared dependencies (auth, etc.)
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API route handlers
│   └── utils/               # Utility functions
├── alembic/                 # Database migrations
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

## Development

- The API runs on port 8000 by default
- CORS is configured for frontend at http://localhost:5173
- Debug mode is enabled in development
