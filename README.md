# Blog App - CI/CD Demo

Full-stack blog application demonstrating on-premise deployment with React frontend, FastAPI backend, MySQL database, and Nginx reverse proxy.

## Components
- **Frontend**: React + Vite (served by Nginx)
- **Backend**: FastAPI + SQLAlchemy (proxied by Nginx)
- **Database**: MySQL + phpMyAdmin
- **Proxy**: Nginx (reverse proxy + static file serving)

## Development Setup

### Prerequisites
- Node.js 18+, Python 3.10+, Docker & Docker Compose

### Quick Start
1. **Database**: Start MySQL & phpMyAdmin
   ```bash
   cd docker-apps/database
   docker-compose up -d
   ```

2. **Backend**: Install dependencies & run
   ```bash
   cd backend
   uv venv
   source .venv/bin/activate
   uv pip install -r requirements.txt
   cp .env.example .env  # Configure database URL & SECRET_KEY
   python create_db.py
   gunicorn app.main:app -c gunicorn.conf.py
   ```

3. **Frontend**: Install & run dev server
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - phpMyAdmin: http://localhost:8080

## Production Deployment with Nginx

### Architecture
```
Internet → Nginx (port 80/443) → Frontend/Backend/Database
```

### Nginx Configuration
Update `docker-apps/nginx/conf.d/default.conf` with your server IPs:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (React app)
    location / {
        proxy_pass http://YOUR_FRONTEND_IP:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://YOUR_BACKEND_IP:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (optional)
    location /static/ {
        proxy_pass http://YOUR_BACKEND_IP:8000;
    }

    # phpMyAdmin
    location /phpmyadmin/ {
        proxy_pass http://YOUR_PHPMYADMIN_IP:8080;
    }
}
```

### Deployment Steps
1. **Configure IPs**: Replace `YOUR_*_IP` with actual server addresses
2. **SSL (Optional)**: Add SSL certificates for HTTPS
3. **Start Nginx**:
   ```bash
   cd docker-apps/nginx
   docker-compose up -d
   ```
4. **Access**: http://nginx-server-ip

### Example Configuration
For servers on `10.0.0.106` network:
- Frontend: `10.0.0.106:8081`
- Backend: `10.0.0.106:8000`
- phpMyAdmin: `10.0.0.106:8080`

### Production Notes
- Use gunicorn for backend in production
- Configure CORS in backend for Nginx domain
- Add SSL certificates for secure access
- Backend should not be directly accessible from internet
