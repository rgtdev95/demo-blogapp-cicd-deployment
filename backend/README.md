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
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure environment variables:**
- Copy `.env.example` to `.env` and update values
- Make sure DATABASE_URL matches your database configuration

4. **Run database migrations:**
```bash
# From backend directory
alembic upgrade head
```

5. **Start the FastAPI server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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
