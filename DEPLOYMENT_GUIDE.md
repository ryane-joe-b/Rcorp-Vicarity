# VICARITY DEPLOYMENT GUIDE

A complete guide to deploying Vicarity to production. Follow these steps exactly and you'll have a running production system in under 30 minutes.

**Domain**: vicarity.co.uk  
**Repository**: https://github.com/ryane-joe-b/Rcorp-Vicarity

---

## TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Step 1: Buy and Access Your Server](#step-1-buy-and-access-your-server)
3. [Step 2: Run the Setup Script](#step-2-run-the-setup-script)
4. [Step 3: Configure GitHub Secrets](#step-3-configure-github-secrets)
5. [Step 4: Setup Domain and SSL](#step-4-setup-domain-and-ssl)
6. [Step 5: First Deployment](#step-5-first-deployment)
7. [Step 6: Verify Everything Works](#step-6-verify-everything-works)
8. [Daily Operations](#daily-operations)
9. [Troubleshooting](#troubleshooting)
10. [Emergency Procedures](#emergency-procedures)

---

## PREREQUISITES

Before starting, make sure you have:

| Item | Where to Get It | Notes |
|------|-----------------|-------|
| FastHost VPS | [fasthost.co.uk](https://fasthost.co.uk) | Ubuntu 22.04, 4GB RAM minimum |
| Domain Name | vicarity.co.uk | Already configured |
| Neon PostgreSQL | [neon.tech](https://neon.tech) | HIPAA tier for healthcare data |
| Resend Account | [resend.com](https://resend.com) | For transactional emails |
| GitHub Repository | [Rcorp-Vicarity](https://github.com/ryane-joe-b/Rcorp-Vicarity) | Your Vicarity codebase |

---

## STEP 1: BUY AND ACCESS YOUR SERVER

### 1.1 Purchase VPS

1. Go to FastHost and purchase a VPS:
   - **OS**: Ubuntu 22.04 LTS
   - **RAM**: 4GB minimum (8GB recommended)
   - **Storage**: 40GB SSD minimum
   - **Cost**: ~£20/month

2. Wait for the server to be provisioned (usually 5-10 minutes)

3. Note your server details:
   ```
   Server IP: _______________________
   Root Password: ___________________
   ```

### 1.2 First SSH Connection

Open your terminal and connect:

```bash
ssh root@YOUR_SERVER_IP
```

Type `yes` when asked about the fingerprint, then enter your root password.

**You should now see a command prompt on your server.**

---

## STEP 2: RUN THE SETUP SCRIPT

### 2.1 Download and Run

Copy and paste these commands into your server terminal:

```bash
# Download the setup script
curl -O https://raw.githubusercontent.com/ryane-joe-b/Rcorp-Vicarity/main/infra/setup-server.sh

# Make it executable
chmod +x setup-server.sh

# Run it (takes about 5 minutes)
sudo ./setup-server.sh
```

### 2.2 Save the Output

**IMPORTANT**: The script will output credentials at the end. You MUST save these!

Look for this section:

```
===============================================================================
VICARITY SERVER SETUP COMPLETE!
===============================================================================

GITHUB SECRETS (Add these to your repository)
-------------------------------------------------------------------------------

VPS_HOST:
123.45.67.89

VPS_USER:
deploy

VPS_SSH_KEY: (Copy EVERYTHING below, including BEGIN and END lines)
---START COPYING BELOW THIS LINE---
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAA...
-----END OPENSSH PRIVATE KEY-----
---STOP COPYING ABOVE THIS LINE---
```

Copy all three values and save them somewhere secure (password manager recommended).

### 2.3 Add Your SSH Key

To be able to SSH into the server yourself, add your public key:

```bash
# Still on the server as root
echo 'YOUR_PUBLIC_SSH_KEY_HERE' >> /home/deploy/.ssh/authorized_keys
```

Don't have an SSH key? Generate one on your local machine:

```bash
# On your LOCAL machine (not the server!)
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copy this output and use it above
```

### 2.4 Test SSH as Deploy User

```bash
# From your LOCAL machine
ssh deploy@YOUR_SERVER_IP
```

If this works, you're ready for the next step!

---

## STEP 3: CONFIGURE GITHUB SECRETS

### 3.1 Navigate to GitHub Secrets

1. Go to https://github.com/ryane-joe-b/Rcorp-Vicarity
2. Click **Settings** (tab at the top)
3. Click **Secrets and variables** (left sidebar)
4. Click **Actions**
5. Click **New repository secret**

### 3.2 Add Each Secret

Add these secrets one by one:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `VPS_HOST` | Your server IP | From Step 2.2 output |
| `VPS_USER` | `deploy` | Always "deploy" |
| `VPS_SSH_KEY` | The private key | From Step 2.2 output (entire key including BEGIN/END) |
| `NEON_DATABASE_URL` | PostgreSQL URL | Neon Dashboard > Connection Details |
| `RESEND_API_KEY` | API key | Resend Dashboard > API Keys |
| `SECRET_KEY` | Random string | Generate with: `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | `https://vicarity.co.uk` | Your domain with https |

### 3.3 Add Repository Variables

Also add these **variables** (not secrets) under "Variables" tab:

| Variable Name | Value |
|---------------|-------|
| `PRODUCTION_URL` | `https://vicarity.co.uk` |

### 3.4 Verify Secrets

Your secrets page should now show 7 secrets:

```
VPS_HOST          Updated just now
VPS_USER          Updated just now
VPS_SSH_KEY       Updated just now
NEON_DATABASE_URL Updated just now
RESEND_API_KEY    Updated just now
SECRET_KEY        Updated just now
ALLOWED_ORIGINS   Updated just now
```

---

## STEP 4: SETUP DOMAIN AND SSL

### 4.1 Configure DNS

Go to your domain registrar and add these DNS records for **vicarity.co.uk**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 300 |
| A | www | YOUR_SERVER_IP | 300 |

### 4.2 Wait for DNS Propagation

DNS changes can take up to 48 hours, but usually complete within 15 minutes.

Check if it's working:

```bash
# From your local machine
ping vicarity.co.uk
```

Should show your server IP.

### 4.3 Get SSL Certificate

SSH into your server and run:

```bash
ssh deploy@YOUR_SERVER_IP
sudo certbot certonly --standalone -d vicarity.co.uk -d www.vicarity.co.uk
```

Follow the prompts:
1. Enter your email
2. Agree to terms
3. Choose whether to share email

**SUCCESS** looks like:

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/vicarity.co.uk/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/vicarity.co.uk/privkey.pem
```

---

## STEP 5: FIRST DEPLOYMENT

### 5.1 Clone Repository (First Time Only)

SSH into your server:

```bash
ssh deploy@YOUR_SERVER_IP
cd ~
git clone https://github.com/ryane-joe-b/Rcorp-Vicarity.git vicarity
cd vicarity
```

### 5.2 Create Environment File

```bash
cp .env.example .env
nano .env
```

Fill in your values:

```env
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
RESEND_API_KEY=re_xxxxxxxxxxxxx
SECRET_KEY=your-64-character-secret-key
ENVIRONMENT=production
ALLOWED_ORIGINS=https://vicarity.co.uk
REACT_APP_API_URL=/api
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.3 Deploy!

**Option A: Manual Deploy (First Time)**

```bash
cd /home/deploy/vicarity
docker compose -f docker-compose.production.yml up -d --build
```

This will take 3-5 minutes as it builds the containers.

**Option B: Trigger via GitHub (After First Setup)**

```bash
# On your local machine
git add .
git commit -m "Initial deployment"
git push origin main
```

Watch the deployment: Go to GitHub > Actions tab

---

## STEP 6: VERIFY EVERYTHING WORKS

### 6.1 Check Container Status

```bash
ssh deploy@YOUR_SERVER_IP
cd vicarity
docker compose -f docker-compose.production.yml ps
```

All containers should show "Up" and "healthy":

```
NAME              STATUS                   PORTS
vicarity-api      Up 2 minutes (healthy)   8000/tcp
vicarity-web      Up 2 minutes (healthy)
vicarity-redis    Up 2 minutes (healthy)   6379/tcp
vicarity-nginx    Up 2 minutes (healthy)   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 6.2 Check Health Endpoint

```bash
curl https://vicarity.co.uk/health
```

Should return:

```json
{"status": "healthy", "database": "connected", "redis": "connected"}
```

### 6.3 Check in Browser

1. Open `https://vicarity.co.uk`
2. Should see your React app
3. Try logging in/registering
4. Check that API calls work

### 6.4 Check SSL

1. Visit `https://www.ssllabs.com/ssltest/`
2. Enter `vicarity.co.uk`
3. Should get an A or A+ rating

---

## DAILY OPERATIONS

### Viewing Logs

```bash
# All containers
docker compose -f docker-compose.production.yml logs -f

# Just API
docker compose -f docker-compose.production.yml logs -f api

# Last 100 lines
docker compose -f docker-compose.production.yml logs --tail=100 api
```

### Checking Server Health

```bash
/opt/monitoring/health-check.sh
```

### Restarting Services

```bash
# Restart all
docker compose -f docker-compose.production.yml restart

# Restart just API
docker compose -f docker-compose.production.yml restart api
```

### Manual Deployment

```bash
cd /home/deploy/vicarity
./infra/deploy.sh
```

### Checking Deployment Status

```bash
./infra/deploy.sh --status
```

---

## TROUBLESHOOTING

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.production.yml logs api

# Common issues:
# - Missing environment variables -> Check .env file
# - Database connection failed -> Verify NEON_DATABASE_URL
# - Port already in use -> sudo lsof -i :80
```

### 502 Bad Gateway

```bash
# API might be starting up, wait 30 seconds and try again

# If persistent, check API container:
docker compose -f docker-compose.production.yml logs api

# Restart nginx:
docker compose -f docker-compose.production.yml restart nginx
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Clean old logs
sudo truncate -s 0 /var/log/nginx/*.log
```

### Can't SSH into Server

1. Check your IP hasn't been banned:
   ```bash
   # From another server or ask FastHost support
   sudo fail2ban-client status sshd
   ```

2. Unban your IP:
   ```bash
   sudo fail2ban-client set sshd unbanip YOUR_IP
   ```

### Database Connection Issues

```bash
# Test connection from API container
docker compose -f docker-compose.production.yml exec api python -c "
import os
from sqlalchemy import create_engine
engine = create_engine(os.environ['DATABASE_URL'])
with engine.connect() as conn:
    print('Connected!')
"
```

---

## EMERGENCY PROCEDURES

### ROLLBACK TO PREVIOUS VERSION

```bash
ssh deploy@YOUR_SERVER_IP
cd /home/deploy/vicarity
./infra/deploy.sh --rollback
```

### COMPLETE SYSTEM RESTART

```bash
# Stop everything
docker compose -f docker-compose.production.yml down

# Start everything fresh
docker compose -f docker-compose.production.yml up -d --build
```

### DATABASE BACKUP (DO THIS REGULARLY!)

```bash
# Neon has automatic backups, but for extra safety:
pg_dump "YOUR_NEON_DATABASE_URL" > backup_$(date +%Y%m%d).sql
```

### RESTORE DATABASE

```bash
psql "YOUR_NEON_DATABASE_URL" < backup_20240115.sql
```

### SERVER IS COMPLETELY BROKEN

1. Create new VPS from FastHost
2. Run setup script again
3. Update GitHub secrets with new IP
4. Push to trigger deployment

---

## MONITORING CHECKLIST

Run through this checklist weekly:

- [ ] Check disk space: `df -h` (should be <80% used)
- [ ] Check memory: `free -h` (should have free memory)
- [ ] Check containers: `docker compose ps` (all healthy)
- [ ] Check SSL expiry: `sudo certbot certificates` (>30 days)
- [ ] Check fail2ban: `sudo fail2ban-client status` (should be running)
- [ ] Check recent deployments: GitHub Actions tab
- [ ] Review error logs: `docker compose logs api | grep -i error`

---

## QUICK REFERENCE COMMANDS

```bash
# SSH to server
ssh deploy@YOUR_SERVER_IP

# Go to project
cd /home/deploy/vicarity

# View all containers
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f

# Restart everything
docker compose -f docker-compose.production.yml restart

# Manual deploy
./infra/deploy.sh

# Rollback
./infra/deploy.sh --rollback

# Health check
curl https://vicarity.co.uk/health

# Server stats
htop
```

---

## SUPPORT

- **Deployment Issues**: Check GitHub Actions logs
- **Server Issues**: FastHost support portal
- **Database Issues**: Neon dashboard > Support
- **SSL Issues**: Let's Encrypt community forums

---

**Domain**: vicarity.co.uk  
**Last Updated**: January 2026  
**Version**: 1.0.0
