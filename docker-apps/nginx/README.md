# NGINX Reverse Proxy Configuration

This directory contains NGINX configuration for the Blog App, supporting both containerized and non-containerized deployments.

## Configuration Files

### `nginx.conf`
Main NGINX configuration file with global settings.

### `conf.d/docker.conf`
Configuration for **containerized deployment** - uses Docker container names for service discovery.

### `conf.d/local.conf.disabled`
Configuration for **local/non-containerized deployment** - uses host IP addresses.

## Running with Docker Containers

### Prerequisites

1. **Ensure all services are on the same network:**
```bash
docker network create blogapp_network
```

2. **Start all services:**
```bash
# Database
cd ../database
docker compose up -d

# Backend
cd ../../backend
docker compose up -d

# Frontend
cd ../frontend
docker compose up -d
```

3. **Verify all containers are on blogapp_network:**
```bash
docker ps --format "table {{.Names}}\t{{.Networks}}"
```

### Start NGINX

```bash
docker compose up -d
```

### Configuration Details (`docker.conf`)

When running with containers, NGINX uses **container names** for upstream services:

```nginx
# Frontend (React/Vite)
location / {
    proxy_pass http://blogapp-frontend:80;
    # ...
}

# Backend API
location /api/ {
    proxy_pass http://blogapp-backend:8000;
    # ...
}

# phpMyAdmin
location /phpmyadmin/ {
    proxy_pass http://blogapp_phpmyadmin:80;
    # ...
}
```

**Why container names?**
- Docker's internal DNS automatically resolves container names to their IP addresses
- Services can communicate directly without exposing ports to the host
- More portable and doesn't depend on host network configuration

### Access Points

- **Frontend**: http://localhost
- **API Docs**: http://localhost/api/docs
- **phpMyAdmin**: http://localhost/phpmyadmin

## Running WITHOUT Docker Containers

### Prerequisites

1. **Services running on host:**
   - Frontend: Running on `http://10.0.0.106:8081` (or your host IP)
   - Backend: Running on `http://10.0.0.106:8000`
   - phpMyAdmin: Running on `http://10.0.0.106:8080`

### Switch Configuration

1. **Disable docker.conf:**
```bash
mv conf.d/docker.conf conf.d/docker.conf.disabled
```

2. **Enable local.conf:**
```bash
mv conf.d/local.conf.disabled conf.d/local.conf
```

3. **Restart NGINX:**
```bash
docker compose restart
# or if running NGINX natively
sudo systemctl restart nginx
```

### Configuration Details (`local.conf`)

When running without containers, NGINX uses **host IP addresses**:

```nginx
# Frontend (React/Vite)
location / {
    proxy_pass http://10.0.0.106:8081;
    # ...
}

# Backend API
location /api/ {
    proxy_pass http://10.0.0.106:8000;
    # ...
}

# phpMyAdmin
location /phpmyadmin/ {
    proxy_pass http://10.0.0.106:8080;
    # ...
}
```

**Why host IP addresses?**
- Services are running directly on the host machine
- NGINX needs to reach them via the host network interface
- Container names won't resolve outside of Docker networks

## Key Differences

| Aspect | Docker (docker.conf) | Local (local.conf) |
|--------|---------------------|-------------------|
| **Service Discovery** | Container names | Host IP:Port |
| **Frontend** | `blogapp-frontend:80` | `10.0.0.106:8081` |
| **Backend** | `blogapp-backend:8000` | `10.0.0.106:8000` |
| **phpMyAdmin** | `blogapp_phpmyadmin:80` | `10.0.0.106:8080` |
| **Network** | Docker network | Host network |
| **DNS Resolution** | Docker internal DNS | Host DNS/IP |

## Switching Between Configurations

### From Local → Docker

```bash
# In docker-apps/nginx/conf.d/
mv local.conf local.conf.disabled
mv docker.conf.disabled docker.conf

# Restart NGINX
docker compose restart
```

### From Docker → Local

```bash
# In docker-apps/nginx/conf.d/
mv docker.conf docker.conf.disabled
mv local.conf.disabled local.conf

# Restart NGINX
docker compose restart
```

## Troubleshooting

### NGINX won't start

**Check configuration syntax:**
```bash
docker exec blogapp-nginx nginx -t
```

**View logs:**
```bash
docker logs blogapp-nginx
```

### "host not found in upstream"

This means NGINX can't resolve the container name:

1. **Check if containers are running:**
```bash
docker ps | grep blogapp
```

2. **Verify network connectivity:**
```bash
docker network inspect blogapp_network
```

3. **Ensure all containers are on the same network:**
```bash
docker ps --format "table {{.Names}}\t{{.Networks}}"
```

### 502 Bad Gateway

This means NGINX can reach the upstream but the service isn't responding:

1. **Check if the upstream service is running:**
```bash
docker ps | grep blogapp-backend  # or frontend/phpmyadmin
```

2. **Check upstream service logs:**
```bash
docker logs blogapp-backend
```

3. **Test direct access:**
```bash
# For containerized
docker exec blogapp-nginx curl http://blogapp-backend:8000/health

# For local
curl http://10.0.0.106:8000/health
```

### Port conflicts

If port 80 or 443 is already in use:

```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443

# Change ports in docker-compose.yml
ports:
  - "8080:80"    # Use 8080 instead of 80
  - "8443:443"   # Use 8443 instead of 443
```

## Security Headers

Both configurations include security headers:

- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: no-referrer-when-downgrade` - Controls referrer info
- `Content-Security-Policy` - Restricts resource loading

## WebSocket Support

Both configurations include WebSocket support for Vite HMR (Hot Module Replacement):

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

## SSL/TLS Configuration

To enable HTTPS:

1. **Place SSL certificates in `ssl/` directory:**
   - `ssl/cert.pem`
   - `ssl/key.pem`

2. **Update configuration to listen on 443:**
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

3. **Restart NGINX:**
```bash
docker compose restart
```

## Logs

Logs are stored in the `logs/` directory:
- `logs/access.log` - Access logs
- `logs/error.log` - Error logs

**View logs:**
```bash
# Real-time
tail -f logs/access.log
tail -f logs/error.log

# Or via Docker
docker logs -f blogapp-nginx
```
