# Production Deployment Guide

## 🎯 Overview

This guide covers the production deployment workflow for the Blog App using GitHub Actions, Docker, and Ansible. The production environment uses tag-based releases with enhanced security scanning and manual approval gates.

## 🏗️ Production Architecture

```
External Reverse Proxy Manager (SSL/TLS)
           ↓
    Production Server (Docker)
           ↓
    Internal NGINX → Services
           ↓
┌─────────────────────────────────────────┐
│  Frontend  │  Backend  │  Database     │
│  (React)   │  (FastAPI)│  (MySQL)      │
└─────────────────────────────────────────┘
```

## 🚀 Deployment Workflow

### Trigger: Tag-Based Release

```bash
# Create and push a release tag
git tag v1.0.0
git push origin v1.0.0
```

### Workflow Steps

1. **Quality Gates** - Linting, testing, security scanning
2. **Build & Push** - Docker images to GHCR with version tags
3. **Security Scan** - Enhanced vulnerability scanning on images
4. **Manual Approval** - Production environment protection
5. **Deploy** - Ansible automated deployment
6. **Health Checks** - Verify deployment success
7. **Cleanup** - Remove old images

## 📋 Required Secrets

Configure these secrets in your GitHub repository settings:

### Production Server Secrets
```
PROD_SERVER_IP=your.production.server.ip
PROD_SERVER_USER=your_server_user
PROD_SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
```

### Database Secrets
```
PROD_MYSQL_ROOT_PASSWORD=secure_root_password
PROD_MYSQL_DATABASE=blogapp_prod_db
PROD_MYSQL_USER=blogapp_prod_user
PROD_MYSQL_PASSWORD=secure_user_password
```

### Application Secrets
```
PROD_SECRET_KEY=your_super_secure_jwt_secret_key_here
```

## 🔧 GitHub Variables

Configure these variables in your GitHub repository settings:

### Production Configuration
```
PROD_API_URL=https://blog.yourdomain.com
PROD_DOMAIN_NAME=blog.yourdomain.com
PROD_BACKEND_PORT=8000
PROD_PHPMYADMIN_PORT=8080
```

## 🛡️ GitHub Environment Setup

1. Go to **Settings > Environments** in your GitHub repository
2. Create a new environment called `production`
3. Configure protection rules:
   - ✅ **Required reviewers** (at least yourself)
   - ✅ **Wait timer** (optional - 5 minutes)
   - ✅ **Deployment branches** (only `main` branch)

## 🖥️ Production Server Setup

### Prerequisites

Ensure your production server has:

```bash
# Docker and Docker Compose
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Create Docker network
docker network create blogapp_network

# Create necessary directories
sudo mkdir -p /opt/blogapp-prod
sudo chown $USER:$USER /opt/blogapp-prod
```

### SSH Key Setup

```bash
# On your local machine, generate SSH key pair if needed
ssh-keygen -t ed25519 -f ~/.ssh/prod_blogapp

# Copy public key to production server
ssh-copy-id -i ~/.ssh/prod_blogapp.pub user@your-prod-server

# Add private key to GitHub Secrets as PROD_SSH_PRIVATE_KEY
cat ~/.ssh/prod_blogapp | pbcopy  # or xclip -sel clip
```

## 🌐 External Reverse Proxy Configuration

Since you're using an external reverse proxy manager, configure:

### Frontend Route
- **Domain**: `blog.yourdomain.com`
- **Target**: `http://your-prod-server-ip:80`
- **SSL**: Enabled (managed by your proxy)

### API Route (Optional Direct Access)
- **Domain**: `api.blog.yourdomain.com`
- **Target**: `http://your-prod-server-ip:8000`
- **SSL**: Enabled

### Admin Tools (Optional)
- **phpMyAdmin**: `admin.blog.yourdomain.com` → `http://your-prod-server-ip:8080`
- **Monitoring**: `monitoring.blog.yourdomain.com` → `http://your-prod-server-ip:3001`

## 📊 Monitoring Stack (Optional)

Enable monitoring by running containers with the monitoring profile:

```bash
# On production server
cd /opt/blogapp-prod
docker compose --profile monitoring up -d
```

### Monitoring Services

- **Prometheus**: `:9090` - Metrics collection
- **Grafana**: `:3001` - Dashboards and visualization
- **cAdvisor**: `:8082` - Container metrics
- **Redis** (optional): `:6379` - Caching

### Default Credentials

- **Grafana**: `admin` / `admin123` (change on first login)

## 🔄 Deployment Process

### 1. Development to Production Flow

```bash
# 1. Develop feature
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 2. Create PR to dev
# PR gets automatically tested and merged

# 3. Test on development environment
# Dev environment automatically updated

# 4. Create PR from dev to main
# Final review and merge

# 5. Create release tag
git checkout main
git pull origin main
git tag v1.0.0
git push origin v1.0.0

# 6. Production deployment automatically triggers
```

### 2. Manual Release Process

```bash
# 1. Go to GitHub Actions
# 2. Find "Production Release" workflow run
# 3. Review security scan results
# 4. Approve production deployment
# 5. Monitor deployment progress
```

## 🚨 Rollback Procedure

### Quick Rollback

```bash
# On production server
cd /opt/blogapp-prod

# 1. Stop current containers
docker compose down

# 2. Pull previous image version
docker pull ghcr.io/your-username/blogapp-backend:v1.0.0
docker pull ghcr.io/your-username/blogapp-frontend:v1.0.0

# 3. Update .env to use specific version (optional)
# Or use previous backup

# 4. Start containers
docker compose up -d
```

### Full Rollback with Backup

```bash
# 1. Stop containers
docker compose down

# 2. Restore from backup
cd /opt/backups/blogapp
tar -xzf blogapp-backup-TIMESTAMP.tar.gz -C /opt/

# 3. Restore database
docker exec -i blogapp_mysql_prod mysql -u root -p < database-backup-TIMESTAMP.sql

# 4. Start containers
cd /opt/blogapp-prod
docker compose up -d
```

## 📈 Monitoring and Alerting

### Health Check Endpoints

- **Frontend**: `http://your-server/`
- **Backend**: `http://your-server:8000/health`
- **API Docs**: `http://your-server:8000/api/docs`

### Log Files

```bash
# Application logs
docker logs blogapp-backend-prod
docker logs blogapp-frontend-prod
docker logs blogapp-nginx-prod

# System logs
journalctl -u docker.service -f
```

### Performance Monitoring

Access Grafana dashboards at:
- **URL**: `http://your-server:3001`
- **Login**: `admin` / `admin123`

## 🔐 Security Considerations

### Production Checklist

- [ ] All default passwords changed
- [ ] SSH key-based authentication only
- [ ] Firewall configured (only necessary ports open)
- [ ] SSL/TLS certificates configured
- [ ] Database backups scheduled
- [ ] Log monitoring configured
- [ ] Security updates automated
- [ ] Secrets properly managed
- [ ] Network segmentation implemented

### Regular Maintenance

```bash
# Weekly security updates
sudo apt update && sudo apt upgrade -y

# Monthly container updates
docker system prune -f
docker image prune -a -f

# Backup verification
ls -la /opt/backups/blogapp/
```

## 🧪 Testing Production Deployment

### Pre-Production Testing

1. **Staging Environment**: Test with production-like data
2. **Load Testing**: Verify performance under load
3. **Security Testing**: Run security scans
4. **Backup Testing**: Verify backup and restore procedures

### Post-Deployment Verification

```bash
# 1. Health checks
curl -f http://your-server/
curl -f http://your-server:8000/health

# 2. Database connectivity
docker exec blogapp_mysql_prod mysqladmin ping -u root -p

# 3. Container status
docker ps
docker compose ps
```

## 📞 Troubleshooting

### Common Issues

**Deployment fails at approval step:**
- Check GitHub environment protection rules
- Ensure you have reviewer permissions

**Containers fail to start:**
- Check Docker logs: `docker logs container-name`
- Verify environment variables
- Check disk space: `df -h`

**Database connection issues:**
- Verify database container health
- Check network connectivity
- Validate credentials

**Image pull failures:**
- Check GitHub Container Registry permissions
- Verify GITHUB_TOKEN has packages:read permission
- Re-authenticate to registry

### Support Commands

```bash
# View all container logs
docker compose logs -f

# Check resource usage
docker stats

# Inspect networks
docker network inspect blogapp_network

# View deployment info
cat /opt/blogapp-prod/deployment-info.json
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Ansible Documentation](https://docs.ansible.com/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

## 🎉 Congratulations!

You now have a professional-grade production deployment pipeline that showcases:

- ✅ **Tag-based releases** with semantic versioning
- ✅ **Multi-stage security scanning** with vulnerability management
- ✅ **Manual approval gates** for production safety
- ✅ **Infrastructure as Code** with Ansible automation
- ✅ **Container orchestration** with Docker Compose
- ✅ **Monitoring and observability** with Prometheus/Grafana
- ✅ **Automated backups** and rollback procedures
- ✅ **Health checks** and deployment verification

This setup demonstrates enterprise-level DevOps practices perfect for your homelab portfolio!
