# Blog App - Full Stack Application

A modern full-stack blog application with React frontend, FastAPI backend, MySQL database, and NGINX reverse proxy. Supports both local development and containerized deployment.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NGINX (Port 80/443)                  │
│                   Reverse Proxy + SSL                   │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │   Backend    │    │  phpMyAdmin  │
│  React+Vite  │    │   FastAPI    │    │   (Admin)    │
│  Port 8081   │    │  Port 8000   │    │  Port 8080   │
└──────────────┘    └──────────────┘    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │    MySQL     │
                    │  Port 3306   │
                    └──────────────┘
```

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP Client**: Axios
- **Router**: React Router v6
- **Editor**: TipTap (Rich Text)

### Backend
- **Framework**: FastAPI
- **ORM**: SQLAlchemy (Async)
- **Database Driver**: aiomysql
- **Auth**: JWT (python-jose)
- **Validation**: Pydantic
- **Server**: Gunicorn + Uvicorn workers

### Infrastructure
- **Database**: MySQL 8.0
- **Reverse Proxy**: NGINX
- **Containerization**: Docker + Docker Compose
- **Network**: Docker bridge network (`blogapp_network`)

## 📋 Features

✅ **Authentication & Authorization**
- User registration with OTP verification
- JWT-based authentication
- Protected routes and API endpoints
- Profile management
- Password change

✅ **Blog Management**
- Create, edit, delete posts
- Draft vs Published status
- Rich text editor with formatting
- Cover images
- Tag system
- Auto-calculated read time
- Pagination

✅ **Social Features**
- Like/Unlike posts
- Bookmark posts
- Comments system
- User profiles

✅ **Admin Tools**
- phpMyAdmin for database management
- API documentation (Swagger/ReDoc)

## 🐳 Docker Deployment (Recommended)

### Prerequisites

1. **Install Docker and Docker Compose**
   - [Docker Installation Guide](https://docs.docker.com/get-docker/)

2. **Create the shared network**
   ```bash
   docker network create blogapp_network
   ```

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demo-blogapp-cicd-deployment
   ```

2. **Start the database**
   ```bash
   cd docker-apps/database
   docker compose up -d
   ```

   Wait for MySQL to be healthy:
   ```bash
   docker ps  # Check for "healthy" status
   ```

3. **Start the backend**
   ```bash
   cd ../../backend
   cp env.example .env  # Configure if needed
   docker compose build
   docker compose up -d
   ```

4. **Start the frontend**
   ```bash
   cd ../frontend
   docker compose build
   docker compose up -d
   ```

5. **Start NGINX**
   ```bash
   cd ../docker-apps/nginx
   docker compose up -d
   ```

6. **Access the application**
   - **Frontend**: http://localhost
   - **API Docs**: http://localhost/api/docs
   - **phpMyAdmin**: http://localhost/phpmyadmin

### Verify All Services

```bash
# Check all containers are running
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Should see:
# - blogapp-nginx (Up)
# - blogapp-frontend (Up)
# - blogapp-backend (Up)
# - blogapp_mysql (Up, healthy)
# - blogapp_phpmyadmin (Up)

# Verify network connectivity
docker ps --format "table {{.Names}}\t{{.Networks}}"

# All containers should be on: blogapp_network
```

### Container Management

**Stop all services:**
```bash
# From project root
docker compose -f docker-apps/nginx/docker-compose.yml down
docker compose -f frontend/docker-compose.yml down
docker compose -f backend/docker-compose.yml down
docker compose -f docker-apps/database/compose.yml down
```

**Restart a service:**
```bash
cd <service-directory>
docker compose restart
```

**View logs:**
```bash
docker logs -f blogapp-frontend
docker logs -f blogapp-backend
docker logs -f blogapp-nginx
```

**Rebuild after code changes:**
```bash
cd <service-directory>
docker compose build --no-cache
docker compose up -d
```

## 💻 Local Development (Without Docker)

### Prerequisites
- Node.js 18+ or Bun
- Python 3.10+
- MySQL 8.0 (or use Docker for database only)

### 1. Database Setup

```bash
cd docker-apps/database
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env - set DATABASE_URL to localhost:3306

# Create database tables
python create_db.py

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install  # or: bun install

# Configure environment
cp env.example .env
# Edit .env - set VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev  # or: bun run dev
```

### 4. Access Points

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **phpMyAdmin**: http://localhost:8080

## 📁 Project Structure

```
demo-blogapp-cicd-deployment/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/           # API endpoints
│   │   └── utils/             # Helper functions
│   ├── Dockerfile             # Backend container
│   ├── docker-compose.yml     # Backend orchestration
│   └── README.md              # Backend documentation
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Route pages
│   │   ├── lib/               # API client, utils
│   │   └── store/             # Zustand state
│   ├── .Dockerfile            # Frontend container (Bun + NGINX)
│   ├── docker-compose.yml     # Frontend orchestration
│   └── README.md              # Frontend documentation
│
├── docker-apps/
│   ├── database/              # MySQL + phpMyAdmin
│   │   └── compose.yml        # Database orchestration
│   │
│   └── nginx/                 # NGINX reverse proxy
│       ├── conf.d/
│       │   ├── docker.conf    # Container-based config
│       │   └── local.conf.disabled  # Host-based config
│       ├── docker-compose.yml # NGINX orchestration
│       └── README.md          # NGINX documentation
│
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (`.env`)
```env
DATABASE_URL=mysql+aiomysql://blogapp_user:blogapp_pass@blogapp_mysql:3306/blogapp_db
SECRET_KEY=<generate-with-openssl-rand-hex-32>
CORS_ORIGINS=http://localhost:8081,http://localhost
BACKEND_PORT=8000
```

#### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000
```

#### Database (`.env`)
```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=blogapp_db
MYSQL_USER=blogapp_user
MYSQL_PASSWORD=blogapp_pass
```

### Network Configuration

All Docker containers communicate via `blogapp_network`:

- **Container Names** (for Docker DNS):
  - `blogapp_mysql` - MySQL database
  - `blogapp_phpmyadmin` - phpMyAdmin
  - `blogapp-backend` - FastAPI backend
  - `blogapp-frontend` - React frontend (NGINX)
  - `blogapp-nginx` - Reverse proxy

- **Port Mappings**:
  - `80:80` - NGINX (HTTP)
  - `443:443` - NGINX (HTTPS)
  - `8081:80` - Frontend (direct access)
  - `8000:8000` - Backend (direct access)
  - `8080:80` - phpMyAdmin
  - `3306:3306` - MySQL

## 🔒 Security Considerations

### Production Checklist

- [ ] Change all default passwords
- [ ] Generate strong `SECRET_KEY` for JWT
- [ ] Configure SSL/TLS certificates for NGINX
- [ ] Update `CORS_ORIGINS` to production domain
- [ ] Disable `DEBUG=True` in backend
- [ ] Remove direct port exposure (only NGINX should be accessible)
- [ ] Set up firewall rules
- [ ] Configure database backups
- [ ] Review NGINX security headers

### SSL/TLS Setup

1. Place certificates in `docker-apps/nginx/ssl/`:
   - `cert.pem`
   - `key.pem`

2. Update NGINX config to listen on 443

3. Restart NGINX:
   ```bash
   cd docker-apps/nginx
   docker compose restart
   ```

## 🐛 Troubleshooting

### Common Issues

**Containers can't communicate:**
```bash
# Verify all containers are on blogapp_network
docker ps --format "table {{.Names}}\t{{.Networks}}"

# Inspect network
docker network inspect blogapp_network
```

**Backend can't connect to database:**
- Ensure `DATABASE_URL` uses `blogapp_mysql` (not `localhost`)
- Check MySQL is healthy: `docker ps`
- Verify credentials match between backend and database

**Frontend shows API errors:**
- Check `VITE_API_URL` in `.env`
- Rebuild frontend after changing `.env`: `docker compose build --no-cache`
- Verify backend is running: `curl http://localhost:8000/health`

**Port conflicts:**
```bash
# Check what's using a port
lsof -i :80
lsof -i :8000

# Change port in docker-compose.yml if needed
```

### Logs

```bash
# View logs for a specific service
docker logs -f blogapp-backend
docker logs -f blogapp-frontend
docker logs -f blogapp-nginx

# View all logs
docker compose logs -f
```

## 📚 Documentation

- [Backend Documentation](backend/README.md) - API setup, endpoints, Docker deployment
- [Frontend Documentation](frontend/README.md) - React app setup, Docker deployment
- [NGINX Documentation](docker-apps/nginx/README.md) - Reverse proxy configuration

## 🧪 Testing

### Manual Testing

1. **Register a new user** at http://localhost
2. **Verify OTP** (check browser console for OTP in development)
3. **Create a blog post**
4. **Test all features**: edit, delete, like, comment, bookmark

### API Testing

Use Swagger UI at http://localhost/api/docs for interactive API testing.