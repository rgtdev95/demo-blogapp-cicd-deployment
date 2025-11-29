# Backend Setup & Testing Guide

## Quick Start

### 1. Database Setup (Already Running ✅)
Your MySQL and phpMyAdmin are already running via Docker Compose.

### 2. Install Python Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

The `.env` file is already created with default values. Update if needed:
- `DATABASE_URL`: Connection string for MySQL
- `SECRET_KEY`: Change this in production!
- `CORS_ORIGINS`: Frontend URL (currently set to http://localhost:5173)

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

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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

## Database Access

phpMyAdmin is available at http://localhost:8080
- **Server**: mysql
- **Username**: blogapp_user
- **Password**: blogapp_pass
- **Database**: blogapp_db

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

## Next Steps

1. **Test all endpoints** using Swagger UI or curl
2. **Frontend Integration** - Update React app to use these APIs
3. **Add seed data** for testing (optional)
4. **Error handling improvements** (optional)
5. **Rate limiting** (optional for production)
