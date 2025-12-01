# Docker Setup Guide for React.js Frontend

This guide explains the Docker configuration for building and running the React.js frontend application.

## 📋 Overview

The frontend uses a **multi-stage Docker build** approach:
1. **Build Stage**: Uses Bun to install dependencies and build the React application
2. **Production Stage**: Uses Nginx to serve the static files

This approach keeps the final image small (~25-30MB) while maintaining fast build times.

## 🏗️ Architecture

### Multi-Stage Build Process

```
┌─────────────────────────────────────┐
│   Stage 1: Builder (oven/bun:1)     │
│   - Install dependencies            │
│   - Build React app with Vite       │
│   - Output: /app/dist               │
└─────────────────┬───────────────────┘
                  │
                  │ Copy dist files
                  ▼
┌─────────────────────────────────────┐
│ Stage 2: Production (nginx:alpine)  │
│   - Serve static files              │
│   - Handle React Router             │
│   - Gzip compression                │
│   - Security headers                │
└─────────────────────────────────────┘
```

## 📁 Files Explained

### 1. `.Dockerfile`

The Dockerfile defines how to build the Docker image:

**Build Stage:**
- Uses `oven/bun:1` as the base image (fast JavaScript runtime)
- Installs dependencies with `bun install --frozen-lockfile`
- Accepts build arguments (`VITE_API_URL`, `VITE_APP_ENV`) for environment configuration
- Builds the app with `bun run build`

**Production Stage:**
- Uses `nginx:alpine` for minimal footprint
- Installs `wget` for healthchecks
- Copies custom `nginx.conf` for React Router support
- Copies built files from the builder stage
- Includes healthcheck to monitor container status

### 2. `nginx.conf`

Custom Nginx configuration that provides:

**React Router Support:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
This ensures that all routes (e.g., `/profile`, `/dashboard`) are handled by React Router instead of returning 404 errors.

**Performance Optimizations:**
- **Gzip Compression**: Compresses text-based files (JS, CSS, HTML) to reduce bandwidth
- **Static Asset Caching**: Caches JS/CSS files for 1 year since they have content hashes
- **No Caching for index.html**: Ensures users always get the latest version

**Security Headers:**
- `X-Frame-Options`: Prevents clickjacking attacks
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-XSS-Protection`: Enables browser XSS protection
- `Referrer-Policy`: Controls referrer information

### 3. `docker-frontend-compose.yml`

Docker Compose configuration for orchestrating the container:

**Build Arguments:**
```yaml
args:
  VITE_API_URL: ${VITE_API_URL:-http://localhost:8000}
  VITE_APP_ENV: ${VITE_APP_ENV:-production}
```
These are passed during build time and baked into the compiled JavaScript.

**Healthcheck:**
Monitors container health by checking if Nginx responds to HTTP requests.

**Networking:**
Uses external network `blogapp_network` to communicate with backend services.

### 4. `.dockerignore`

Excludes unnecessary files from the Docker build context:
- `node_modules`: Will be installed fresh in the container
- `dist`: Build output that will be created during build
- `.env`: Sensitive environment variables
- Test files and documentation
- IDE and OS-specific files

This significantly reduces build time and context size.

## 🚀 Usage

### Building the Image

```bash
# Build with default values
docker compose -f docker-frontend-compose.yml build

# Build with custom API URL
VITE_API_URL=http://api.example.com docker compose -f docker-frontend-compose.yml build
```

### Running the Container

```bash
# Start the container
docker compose -f docker-frontend-compose.yml up -d

# View logs
docker compose -f docker-frontend-compose.yml logs -f

# Stop the container
docker compose -f docker-frontend-compose.yml down
```

### Accessing the Application

Once running, access the application at: `http://localhost:8081`

## 🔧 Environment Variables

### Build-Time Variables (Baked into the compiled code)

These must be set during the build process:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_APP_ENV` | Application environment | `production` |

**Important**: Vite only exposes environment variables prefixed with `VITE_` to the client-side code.

### Setting Environment Variables

**Option 1: Using .env file**
```bash
# Create .env file in frontend directory
echo "VITE_API_URL=http://api.example.com" > .env
echo "VITE_APP_ENV=production" >> .env

# Build
docker compose -f docker-frontend-compose.yml build
```

**Option 2: Inline with docker compose**
```bash
VITE_API_URL=http://api.example.com docker compose -f docker-frontend-compose.yml build
```

**Option 3: In CI/CD pipeline**
```yaml
# GitHub Actions example
- name: Build Docker image
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
    VITE_APP_ENV: production
  run: docker compose -f docker-frontend-compose.yml build
```

## 🏥 Health Checks

The container includes a healthcheck that:
- Runs every 30 seconds
- Times out after 3 seconds
- Allows 5 seconds for startup
- Fails after 3 consecutive failures

**Check container health:**
```bash
docker inspect --format='{{.State.Health.Status}}' blogapp-frontend
```

## 🔍 Troubleshooting

### Issue: Routes return 404

**Problem**: Direct access to routes like `/profile` returns 404  
**Solution**: Ensure `nginx.conf` is properly copied into the container

### Issue: API calls fail

**Problem**: Frontend can't reach the backend API  
**Solution**: 
1. Check `VITE_API_URL` was set during build
2. Verify network connectivity between containers
3. Check if backend is running and accessible

### Issue: Changes not reflected

**Problem**: Code changes don't appear in the running container  
**Solution**: 
1. Rebuild the image: `docker compose build --no-cache`
2. Restart the container: `docker compose up -d`

### Issue: Build fails with "Module not found"

**Problem**: Dependencies missing or lockfile out of sync  
**Solution**: 
1. Delete `node_modules` and `bun.lockb` locally
2. Run `bun install` to regenerate lockfile
3. Rebuild the Docker image

## 📊 Image Size Optimization

Current setup produces a small production image:
- **Builder stage**: ~1.2GB (discarded)
- **Final image**: ~25-30MB (nginx:alpine + static files)

**Why it's small:**
- Multi-stage build discards build tools
- Only static files are copied to production
- Alpine Linux base image
- No Node.js/Bun runtime in production

## 🔐 Security Best Practices

1. **Nginx Security Headers**: Protects against common web vulnerabilities
2. **No Source Code in Production**: Only compiled JavaScript is included
3. **Minimal Base Image**: Alpine Linux reduces attack surface
4. **Read-Only Root Filesystem**: Can be enabled for additional security
5. **Non-Root User**: Nginx runs as non-root user by default

## 🌐 Production Deployment

For production deployments, consider:

1. **Use Environment-Specific Builds**:
   ```bash
   VITE_API_URL=https://api.production.com \
   VITE_APP_ENV=production \
   docker compose build
   ```

2. **Enable HTTPS** (use reverse proxy like Traefik or nginx):
   ```yaml
   labels:
     - "traefik.enable=true"
     - "traefik.http.routers.frontend.rule=Host(`example.com`)"
     - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
   ```

3. **Resource Limits**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 128M
   ```

4. **Monitoring**: Use healthchecks and monitoring tools (Prometheus, Grafana)

## 📚 Additional Resources

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## ✅ Checklist for Deployment

- [ ] Set `VITE_API_URL` to production API endpoint
- [ ] Build fresh image with `--no-cache` flag
- [ ] Test all routes work correctly
- [ ] Verify API calls succeed
- [ ] Check healthcheck status
- [ ] Monitor logs for errors
- [ ] Test on mobile devices
- [ ] Verify caching headers work
- [ ] Check security headers with tools like [securityheaders.com](https://securityheaders.com/)
