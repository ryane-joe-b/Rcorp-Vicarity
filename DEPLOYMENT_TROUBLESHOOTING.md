# Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. API Container Shows "Unhealthy" or Fails to Start

#### Symptom
```bash
docker compose -f docker-compose.production.yml ps
# Shows: vicarity-api Up XX hours (unhealthy)
```

#### Root Causes & Solutions

**A. Database Connection Error**

**Diagnosis:**
```bash
docker compose -f docker-compose.production.yml logs api --tail=50
# Look for: "Could not parse SQLAlchemy URL" or "OperationalError"
```

**Common Issue:** GitHub secret contains shell commands
```
# BAD (contains 'psql '):
psql 'postgresql://user:pass@host/db?sslmode=require'

# GOOD (clean URL):
postgresql://user:pass@host/db?sslmode=require
```

**Fix:**
1. Go to GitHub Repository Settings → Secrets and variables → Actions
2. Update `NEON_DATABASE_URL` secret to contain **ONLY** the connection string
3. Remove any `psql`, quotes, or shell commands
4. Trigger a new deployment or manually update `.env` on server

**Manual Fix on Server:**
```bash
cd /home/deploy/vicarity

# Edit .env file
nano .env

# Ensure NEON_DATABASE_URL looks like:
NEON_DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# Restart API
docker compose -f docker-compose.production.yml restart api
docker compose -f docker-compose.production.yml logs api -f
```

---

**B. Wrong Database Hostname**

**Diagnosis:**
```bash
# Check if URL has the correct hostname (should have .c-3 or similar)
docker compose -f docker-compose.production.yml exec api env | grep DATABASE_URL
```

**Fix:**
Update the GitHub secret with the correct Neon database URL from your Neon dashboard.

---

**C. Environment Variables Not Loaded**

**Diagnosis:**
```bash
# Check if .env file exists and is valid
cat /home/deploy/vicarity/.env
```

**Fix:**
```bash
cd /home/deploy/vicarity

# Recreate .env file with correct values
cat > .env << 'EOF'
NEON_DATABASE_URL=postgresql://...your-actual-url...
RESEND_API_KEY=re_...your-key...
SECRET_KEY=...your-secret...
ENVIRONMENT=production
ALLOWED_ORIGINS=https://vicarity.co.uk,https://www.vicarity.co.uk
REACT_APP_API_URL=/api
EOF

# Restart containers
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d
```

---

### 2. GitHub Actions Deployment Fails

#### Secret Validation Errors

**Error:** `❌ ERROR: NEON_DATABASE_URL contains shell commands`

**Cause:** The GitHub secret has been set incorrectly with shell command fragments.

**Fix:**
1. Copy the **raw** connection string from Neon dashboard
2. Update GitHub secret: Repository Settings → Secrets → Actions → `NEON_DATABASE_URL`
3. Paste **only** the connection string (no quotes, no `psql`, no commands)

---

#### Error: `❌ ERROR: Required variable X is missing or empty`

**Cause:** GitHub secret is not set or is empty.

**Fix:**
1. Go to Repository Settings → Secrets and variables → Actions
2. Ensure these secrets exist and have values:
   - `NEON_DATABASE_URL`
   - `RESEND_API_KEY`
   - `SECRET_KEY`
   - `ALLOWED_ORIGINS`
   - `VPS_HOST`
   - `VPS_USER`
   - `VPS_SSH_KEY`

---

### 3. `/api/health` Returns 502 Bad Gateway

#### Symptom
```bash
curl https://vicarity.co.uk/api/health
# Returns: nginx error page "An error occurred"
```

#### Root Cause
Nginx can't reach the API container (container is crashed or not responding).

#### Diagnosis
```bash
# Check container status
docker compose -f docker-compose.production.yml ps

# Check API logs
docker compose -f docker-compose.production.yml logs api --tail=100

# Test API directly (bypassing nginx)
docker compose -f docker-compose.production.yml exec api curl http://localhost:8000/health
```

#### Fix
See "API Container Shows Unhealthy" section above.

---

### 4. SSL Certificate Issues

#### Error: `nginx: [emerg] cannot load certificate`

**Cause:** Let's Encrypt certificates don't exist at `/etc/letsencrypt/live/vicarity.co.uk/`

**Fix:**
```bash
# Stop nginx
docker compose -f docker-compose.production.yml stop nginx

# Obtain certificates with certbot
sudo certbot certonly --standalone \
  -d vicarity.co.uk \
  -d www.vicarity.co.uk \
  --email support@vicarity.co.uk \
  --agree-tos

# Verify certificates exist
sudo ls -la /etc/letsencrypt/live/vicarity.co.uk/

# Restart nginx
docker compose -f docker-compose.production.yml up -d nginx
```

---

### 5. Deployment Validation Commands

Run these on the **production server** to verify deployment health:

```bash
cd /home/deploy/vicarity

# 1. Check all container statuses
docker compose -f docker-compose.production.yml ps

# 2. Check .env file (redacted)
cat .env | sed 's/\(.*=\).*/\1***REDACTED***/'

# 3. Test API health directly
docker compose -f docker-compose.production.yml exec api curl http://localhost:8000/health

# 4. Check API can connect to database
docker compose -f docker-compose.production.yml exec api python -c "
from app.core.database import SessionLocal
from sqlalchemy import text
db = SessionLocal()
try:
    result = db.execute(text('SELECT 1'))
    print('✅ Database connection successful!')
except Exception as e:
    print(f'❌ Database error: {e}')
finally:
    db.close()
"

# 5. Test public endpoints
curl https://vicarity.co.uk/
curl https://vicarity.co.uk/api/health

# 6. Check nginx logs for errors
docker compose -f docker-compose.production.yml logs nginx --tail=50 | grep error

# 7. Check API logs for errors
docker compose -f docker-compose.production.yml logs api --tail=100
```

---

## Quick Reference: Correct Secret Formats

### NEON_DATABASE_URL
```
postgresql://username:password@hostname.neon.tech/database?sslmode=require
```

### RESEND_API_KEY
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### SECRET_KEY
```
# Generate with: openssl rand -hex 32
a8b04d160b930306076a536277ed9b956e1df993093b04d2f7696a6d1ee97103
```

### ALLOWED_ORIGINS
```
https://vicarity.co.uk,https://www.vicarity.co.uk
```

---

## Emergency Rollback

If deployment breaks production:

```bash
cd /home/deploy/vicarity

# Check previous commit
cat .previous_commit

# Rollback to previous commit
git reset --hard $(cat .previous_commit)

# Rebuild and restart
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build

# Monitor
docker compose -f docker-compose.production.yml logs -f
```

---

## Getting Help

1. **Check GitHub Actions logs:** https://github.com/ryane-joe-b/Rcorp-Vicarity/actions
2. **SSH to server:** `ssh deploy@87.106.103.254`
3. **Run diagnostic commands** from "Deployment Validation Commands" section
4. **Check container logs** for specific error messages
5. **Verify GitHub secrets** are correctly formatted

---

## Prevention Checklist

Before every deployment:

- [ ] GitHub secrets are correctly formatted (no shell commands)
- [ ] Database URL includes correct hostname (with `.c-3` or similar)
- [ ] All required secrets exist in GitHub
- [ ] SECRET_KEY is at least 32 characters
- [ ] ALLOWED_ORIGINS includes both domain variants
- [ ] Recent backups exist
- [ ] Rollback commit is recorded

---

## Automated Checks

The deployment workflow now includes:

✅ **Pre-deployment validation** - Checks GitHub secrets before deploying
✅ **.env validation** - Validates generated .env file on server
✅ **Health checks** - Waits for API to be healthy before completing
✅ **Detailed error logs** - Shows diagnostics if deployment fails
✅ **Automatic rollback** - Reverts to previous version if health checks fail

These improvements prevent the most common deployment issues.
