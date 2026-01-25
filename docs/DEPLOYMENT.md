# Deployment Guide

Production deployment guide for Vicarity. This document covers the automated CI/CD pipeline and manual deployment procedures.

---

## Table of Contents

- [Overview](#overview)
- [Automated Deployment (CI/CD)](#automated-deployment-cicd)
- [Manual Deployment](#manual-deployment)
- [First-Time Setup](#first-time-setup)
- [Environment Configuration](#environment-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Database Migrations](#database-migrations)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Overview

Vicarity uses **Docker Compose** for containerized deployment with a **GitHub Actions** CI/CD pipeline for automated deployments to production.

**Deployment Architecture**:
- **VPS**: Ubuntu 22.04 LTS (FastHost or similar)
- **Domain**: vicarity.co.uk
- **SSL**: Let's Encrypt via Certbot
- **Containers**: Nginx, FastAPI, React, Redis
- **Database**: PostgreSQL on Neon (external, HIPAA-tier)

**Deployment Strategy**:
- Zero-downtime rolling updates
- Automatic health checks
- Auto-rollback on failure
- Manual deployment option available

---

## Automated Deployment (CI/CD)

### How It Works

Every push to the `main` branch automatically triggers deployment:

```
Push to main
    ↓
Run Tests (pytest + npm test)
    ↓
Build Docker Images
    ↓
SSH to Production Server
    ↓
Pull Latest Code
    ↓
Build Containers
    ↓
Rolling Update (zero downtime)
    ↓
Health Checks
    ↓
Success / Auto-Rollback
```

### GitHub Actions Workflow

Location: `.github/workflows/deploy.yml`

**Jobs**:
1. **Test**: Runs Python and JavaScript tests
2. **Build**: Validates Docker images compile
3. **Deploy**: SSHs to server and deploys
4. **Verify**: Runs health checks
5. **Rollback**: Auto-rolls back on failure

### Required GitHub Secrets

Set these in: `GitHub Repo → Settings → Secrets and Variables → Actions`

| Secret | Example | Description |
|--------|---------|-------------|
| `VPS_HOST` | `87.106.103.254` | Server IP address |
| `VPS_USER` | `deploy` | SSH user (created by setup script) |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH...` | Private SSH key for deploy user |
| `NEON_DATABASE_URL` | `postgresql://user:pass@host/db` | PostgreSQL connection string |
| `RESEND_API_KEY` | `re_...` | Email service API key |
| `SECRET_KEY` | `64-char-hex-string` | Application secret (generate with `openssl rand -hex 32`) |
| `ALLOWED_ORIGINS` | `https://vicarity.co.uk` | CORS allowed origins |

### Deploying via Git Push

Simply push to main:

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

Watch deployment progress: `GitHub → Actions tab`

### Manual Trigger

You can also manually trigger deployment from GitHub:

1. Go to `Actions` tab
2. Select "Deploy to Production"
3. Click "Run workflow"
4. (Optional) Check "Skip tests" for emergency deploys

---

## Manual Deployment

If you need to deploy without GitHub Actions:

### Prerequisites

1. SSH access to server
2. `.env` file configured on server
3. Docker and Docker Compose installed

### Deploy Commands

```bash
# SSH into server
ssh deploy@YOUR_SERVER_IP

# Navigate to project
cd /home/deploy/vicarity

# Pull latest code
git pull origin main

# Deploy
docker compose -f docker-compose.production.yml up -d --build

# Check status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
```

### Using the Deploy Script

A helper script is available:

```bash
cd /home/deploy/vicarity

# Standard deploy
./infra/deploy.sh

# Deploy with no-cache build
./infra/deploy.sh --no-cache

# Check status only
./infra/deploy.sh --status

# Rollback to previous version
./infra/deploy.sh --rollback
```

---

## First-Time Setup

### 1. Server Provisioning

Purchase a VPS with:
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 40GB SSD minimum
- **Provider**: FastHost, DigitalOcean, Hetzner, etc.

### 2. Run Setup Script

The setup script configures the server for deployment:

```bash
# On local machine
scp infra/setup-server.sh root@YOUR_SERVER_IP:~/

# SSH to server
ssh root@YOUR_SERVER_IP

# Run setup
chmod +x setup-server.sh
sudo ./setup-server.sh
```

**What it does**:
- Creates `deploy` user with sudo access
- Installs Docker and Docker Compose
- Configures firewall (UFW)
- Sets up fail2ban for SSH protection
- Generates SSH key for GitHub Actions
- Configures log rotation

**Important**: Save the SSH key output for GitHub secrets!

### 3. Clone Repository

```bash
# SSH as deploy user
ssh deploy@YOUR_SERVER_IP

# Clone repo
cd ~
git clone https://github.com/YOUR_USERNAME/vicarity.git
cd vicarity
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
```

Fill in production values (see [Environment Configuration](#environment-configuration) below).

### 5. Initial Deployment

```bash
docker compose -f docker-compose.production.yml up -d --build
```

---

## Environment Configuration

### Required Environment Variables

Create `.env` file in project root:

```bash
# Database (Neon PostgreSQL)
NEON_DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require

# Security
SECRET_KEY=your-secret-key-64-characters-long-hex-string

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here

# Application
ENVIRONMENT=production
LOG_LEVEL=INFO

# CORS
ALLOWED_ORIGINS=https://vicarity.co.uk,https://www.vicarity.co.uk

# Frontend
REACT_APP_API_URL=/api
```

### Generating Secret Key

```bash
openssl rand -hex 32
```

### Getting Database URL

1. Log into Neon dashboard
2. Select your project
3. Copy connection string from "Connection Details"
4. Ensure `?sslmode=require` is appended

### Getting Resend API Key

1. Log into Resend dashboard
2. Go to API Keys
3. Create new API key
4. Copy the key (starts with `re_`)

---

## SSL/HTTPS Setup

### Prerequisites

- Domain DNS pointing to server IP
- Ports 80 and 443 open in firewall
- Nginx not running during cert generation

### Get SSL Certificate

```bash
# SSH to server
ssh deploy@YOUR_SERVER_IP

# Stop nginx if running
docker compose -f docker-compose.production.yml stop nginx

# Install certbot
sudo apt update
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone \
  -d vicarity.co.uk \
  -d www.vicarity.co.uk \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Restart nginx
docker compose -f docker-compose.production.yml up -d nginx
```

### Certificate Renewal

Certbot automatically sets up renewal. Test it:

```bash
# Dry run renewal
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

### Auto-Renewal Cron Job

Already configured by Certbot, but verify:

```bash
sudo crontab -l | grep certbot
```

Should see:
```
0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "docker compose -f /home/deploy/vicarity/docker-compose.production.yml restart nginx"
```

---

## Database Migrations

### Initial Migration

After first deployment, create and run migrations:

```bash
# SSH to server
ssh deploy@YOUR_SERVER_IP
cd /home/deploy/vicarity

# Generate initial migration
docker compose -f docker-compose.production.yml exec api \
  alembic revision --autogenerate -m "Initial schema"

# Review migration
docker compose -f docker-compose.production.yml exec api \
  cat alembic/versions/*.py

# Apply migration
docker compose -f docker-compose.production.yml exec api \
  alembic upgrade head
```

### Future Migrations

When database models change:

```bash
# Generate migration
docker compose -f docker-compose.production.yml exec api \
  alembic revision --autogenerate -m "Description of changes"

# Review generated migration
docker compose -f docker-compose.production.yml exec api \
  cat alembic/versions/XXXX_description.py

# Apply migration
docker compose -f docker-compose.production.yml exec api \
  alembic upgrade head
```

### Migration Best Practices

- Always review auto-generated migrations
- Test migrations on staging first
- Backup database before major migrations
- Never delete migration files
- Use descriptive migration messages

---

## Monitoring & Health Checks

### Health Endpoints

**Nginx Health**:
```bash
curl https://vicarity.co.uk/health
# Response: OK
```

**API Health**:
```bash
curl https://vicarity.co.uk/api/health
# Response: {"status":"healthy","database":"connected","redis":"connected"}
```

### Container Status

```bash
docker compose -f docker-compose.production.yml ps
```

Expected output:
```
NAME              STATUS                   PORTS
vicarity-api      Up 5 hours (healthy)     8000/tcp
vicarity-web      Up 5 hours (healthy)
vicarity-redis    Up 5 hours (healthy)     6379/tcp
vicarity-nginx    Up 5 hours (healthy)     0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### Viewing Logs

```bash
# All containers
docker compose -f docker-compose.production.yml logs -f

# Specific container
docker compose -f docker-compose.production.yml logs -f api

# Last 100 lines
docker compose -f docker-compose.production.yml logs --tail=100 api

# Follow logs with timestamps
docker compose -f docker-compose.production.yml logs -f --timestamps
```

### System Resource Monitoring

```bash
# CPU and memory
htop

# Disk usage
df -h

# Docker stats
docker stats

# Network connections
ss -tuln
```

---

## Rollback Procedures

### Automatic Rollback

GitHub Actions automatically rolls back if:
- Build fails
- Health checks fail after deployment
- Any deployment step errors

### Manual Rollback via GitHub

If deployed via GitHub Actions, the previous commit is stored. To rollback:

```bash
ssh deploy@YOUR_SERVER_IP
cd /home/deploy/vicarity

# Check previous commit
cat .previous_commit

# Rollback
git checkout $(cat .previous_commit)
docker compose -f docker-compose.production.yml up -d --build
```

### Rollback to Specific Commit

```bash
# View commit history
git log --oneline -10

# Checkout specific commit
git checkout <commit-hash>

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --build

# Verify
curl https://vicarity.co.uk/health
```

### Database Rollback

If migration needs to be reverted:

```bash
# Downgrade one migration
docker compose -f docker-compose.production.yml exec api \
  alembic downgrade -1

# Downgrade to specific revision
docker compose -f docker-compose.production.yml exec api \
  alembic downgrade <revision>
```

---

## Troubleshooting

### Deployment Fails

**Check GitHub Actions logs**:
1. Go to `Actions` tab
2. Click on failed workflow
3. Expand failed step
4. Review error messages

**Common issues**:
- SSH authentication failure → Check `VPS_SSH_KEY` secret
- Container won't start → Check logs: `docker compose logs`
- Health check timeout → API may need more startup time

### Container Won't Start

```bash
# Check logs for errors
docker compose -f docker-compose.production.yml logs api

# Check container status
docker compose -f docker-compose.production.yml ps

# Try starting manually with verbose output
docker compose -f docker-compose.production.yml up api
```

### 502 Bad Gateway

Usually means API is down or starting up:

```bash
# Check API status
docker compose -f docker-compose.production.yml ps api

# Check API logs
docker compose -f docker-compose.production.yml logs api

# Restart API
docker compose -f docker-compose.production.yml restart api

# Wait 30 seconds and test
sleep 30
curl https://vicarity.co.uk/api/health
```

### Database Connection Issues

```bash
# Test connection from API container
docker compose -f docker-compose.production.yml exec api python -c "
from app.core.database import engine
with engine.connect() as conn:
    print('Database connected!')
"
```

If connection fails:
- Verify `NEON_DATABASE_URL` in `.env`
- Check Neon dashboard for database status
- Ensure `?sslmode=require` is in connection string

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a -f

# Clean logs
sudo find /var/log -type f -name "*.log" -exec truncate -s 0 {} \;

# Clean old Docker images
docker image prune -a -f
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Restart nginx after renewal
docker compose -f docker-compose.production.yml restart nginx
```

---

## Emergency Procedures

### Complete System Restart

```bash
# Stop all containers
docker compose -f docker-compose.production.yml down

# Remove volumes (CAREFUL: deletes local Redis data)
docker compose -f docker-compose.production.yml down -v

# Start fresh
docker compose -f docker-compose.production.yml up -d --build
```

### Rebuild Everything

```bash
# Stop containers
docker compose -f docker-compose.production.yml down

# Remove all images
docker rmi $(docker images -q vicarity-*)

# Rebuild from scratch
docker compose -f docker-compose.production.yml up -d --build --force-recreate
```

### Server Reboot

```bash
# Reboot server
sudo reboot

# After reboot, containers should auto-restart
# If not, start manually:
cd /home/deploy/vicarity
docker compose -f docker-compose.production.yml up -d
```

---

## Security Checklist

Before going live, verify:

- [ ] All GitHub secrets are set correctly
- [ ] `.env` file has production values (not example values)
- [ ] SSL certificate is installed and valid
- [ ] Firewall (UFW) is enabled with only necessary ports
- [ ] Fail2ban is running for SSH protection
- [ ] Database uses SSL connection (`sslmode=require`)
- [ ] CORS is restricted to production domain
- [ ] Strong `SECRET_KEY` is set (64+ characters)
- [ ] Nginx security headers are configured
- [ ] Rate limiting is enabled

---

## Performance Tuning

### Docker Resource Limits

Edit `docker-compose.production.yml` to adjust resource limits:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2.0'      # Increase for better performance
          memory: 2G       # Increase if needed
```

### Database Connection Pooling

Edit `api/app/core/database.py`:

```python
engine = create_engine(
    settings.db_url,
    pool_size=20,        # Increase for more concurrent connections
    max_overflow=10,
    pool_pre_ping=True,
)
```

### Nginx Caching

Add to `infra/nginx.conf` for static asset caching:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Monitoring Setup (Optional)

### Application Metrics with Prometheus

1. Add Prometheus exporter to FastAPI
2. Configure Prometheus container
3. Set up Grafana dashboards

### Log Aggregation

1. Configure centralized logging (ELK stack or Loki)
2. Ship Docker logs to log aggregator
3. Set up alerts for errors

### Uptime Monitoring

Use external service:
- UptimeRobot
- Pingdom
- StatusCake

Configure to check:
- `https://vicarity.co.uk/health`
- Alert if down > 2 minutes

---

For detailed server setup instructions, see the original [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) in the project root.

For development setup, see [DEVELOPMENT.md](./DEVELOPMENT.md).
