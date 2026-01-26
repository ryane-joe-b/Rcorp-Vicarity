# Vicarity - Quick Start Guide

## 📍 Current Status

**Domain:** https://vicarity.co.uk  
**Status:** ✅ Backend live, SSL configured, deployment hardened  
**Date:** January 26, 2026

---

## 🚀 What's Working

### Production Environment
✅ **Frontend:** React app loads at https://vicarity.co.uk/  
✅ **API:** Healthy and responding at https://vicarity.co.uk/api/health  
✅ **SSL:** Certificates configured, HTTPS working  
✅ **Deployment:** Automated CI/CD with validation  
✅ **Database:** PostgreSQL (Neon) connected  
✅ **Redis:** Session storage working  

### Key Endpoints
```bash
# Frontend
https://vicarity.co.uk/

# API Health Check
https://vicarity.co.uk/api/health
# Returns: {"status":"healthy","database":"connected","redis":"connected",...}

# Nginx Health
https://vicarity.co.uk/health
# Returns: OK
```

---

## ⚠️ Important: GitHub Secret Required

### ACTION NEEDED
The `NEON_DATABASE_URL` GitHub secret needs to be verified/updated:

**Go to:** https://github.com/ryane-joe-b/Rcorp-Vicarity/settings/secrets/actions

**Correct format:**
```
postgresql://neondb_owner:npg_ynDpTg4l0FZL@ep-steep-thunder-ahuyp9vo-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Common mistakes to avoid:**
- ❌ DO NOT include `psql ` prefix
- ❌ DO NOT include quotes around the URL
- ❌ DO NOT include shell commands or semicolons
- ✅ Just the clean PostgreSQL connection string

---

## 🔧 Development Workflow

### Making Changes
```bash
# 1. Make your changes
# 2. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 3. GitHub Actions automatically:
#    - Validates secrets
#    - Runs tests
#    - Builds Docker images
#    - Deploys to production
#    - Runs health checks
#    - Rolls back if anything fails
```

### Monitoring Deployments
**GitHub Actions:** https://github.com/ryane-joe-b/Rcorp-Vicarity/actions

Watch for:
- ✅ Pre-deployment validation (catches bad secrets)
- ✅ Build success
- ✅ Deployment progress
- ✅ Health check results

---

## 📊 Project Structure

```
vicarity/
├── api/                          # FastAPI Backend (✅ 100% complete)
│   ├── app/
│   │   ├── core/                 # Config, database, security, email
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── routers/              # API endpoints (auth, worker, care_home)
│   │   └── schemas/              # Pydantic validation schemas
│   ├── main.py                   # FastAPI app entry point
│   └── requirements.txt
│
├── web/                          # React Frontend (⚠️ 20% - needs work)
│   ├── src/
│   │   ├── App.js                # Currently placeholder only
│   │   └── index.css             # Tailwind configured
│   └── package.json
│
├── infra/                        # Infrastructure & Deployment (✅ Complete)
│   ├── nginx.conf                # Production nginx config
│   └── setup-server.sh           # VPS setup script
│
├── vibe/                         # Project Documentation
│   ├── PROJECT_STATUS.md         # ⭐ Main status document
│   ├── DEPLOYMENT_INCIDENT_2026_01_26.md
│   └── QUICK_START.md            # This file
│
├── .github/workflows/
│   └── deploy.yml                # CI/CD pipeline with validation
│
├── docker-compose.production.yml # Multi-service orchestration
├── DEPLOYMENT_TROUBLESHOOTING.md # Troubleshooting guide
└── DEPLOYMENT_FIX_SUMMARY.md     # Technical fix analysis
```

---

## 📋 Next Steps (Priority Order)

### 1. Verify GitHub Secret (5 minutes) - **DO THIS FIRST**
- Update `NEON_DATABASE_URL` secret with correct format
- Trigger test deployment to verify validation works

### 2. Run Database Migrations (5 minutes)
```bash
ssh deploy@87.106.103.254
cd /home/deploy/vicarity

# Generate migration
docker compose -f docker-compose.production.yml exec api \
  alembic revision --autogenerate -m "Initial schema"

# Apply migration
docker compose -f docker-compose.production.yml exec api \
  alembic upgrade head

# Seed qualifications
docker compose -f docker-compose.production.yml exec api python seed_db.py
```

### 3. Build Frontend Auth Infrastructure (1-2 hours)
**Files to create:**
- `web/src/contexts/AuthContext.jsx` - JWT token management
- `web/src/services/api.js` - Axios wrapper with auth
- `web/src/components/ProtectedRoute.jsx` - Smart routing
- `web/src/utils/validators.js` - Form validation

### 4. Create Landing Page (1 hour)
- `web/src/pages/LandingPage.jsx`
- Hero section with dual CTAs
- Features section
- Footer

### 5. Build Registration Flow (2-3 hours)
- `web/src/pages/auth/Register.jsx`
- `web/src/pages/auth/Login.jsx`
- `web/src/pages/auth/VerifyEmail.jsx`
- `web/src/pages/auth/ResetPassword.jsx`

### 6. Worker Profile Wizard (3-4 hours)
- `web/src/pages/worker/CompleteProfileWizard.jsx`
- 4-step form with progress tracking
- Save draft functionality

**Estimated time to MVP:** 7-11 hours of focused development

---

## 🆘 Troubleshooting

### If Deployment Fails
1. **Check GitHub Actions logs:** https://github.com/ryane-joe-b/Rcorp-Vicarity/actions
2. **Look for validation errors** - They'll tell you exactly what's wrong
3. **Read the error message** - Now includes diagnostics and logs
4. **See full guide:** `DEPLOYMENT_TROUBLESHOOTING.md`

### If API is Down
```bash
# SSH to server
ssh deploy@87.106.103.254

# Check container status
cd /home/deploy/vicarity
docker compose -f docker-compose.production.yml ps

# Check API logs
docker compose -f docker-compose.production.yml logs api --tail=50

# Restart if needed
docker compose -f docker-compose.production.yml restart api
```

### Common Issues
| Issue | Solution |
|-------|----------|
| 502 Bad Gateway on `/api/*` | API container down - check logs |
| Deployment validation fails | Fix GitHub secret format |
| "Database: error" in health check | Check DATABASE_URL format |
| SSL certificate error | Certificates expired - renew with certbot |

**Full troubleshooting guide:** See `DEPLOYMENT_TROUBLESHOOTING.md`

---

## 📚 Key Documentation

### Must Read
- **`vibe/PROJECT_STATUS.md`** - Complete project status and roadmap
- **`DEPLOYMENT_TROUBLESHOOTING.md`** - Deployment issue resolution
- **`DEPLOYMENT_FIX_SUMMARY.md`** - Recent deployment improvements

### Reference
- **`docs/ARCHITECTURE.md`** - System architecture
- **`docs/API.md`** - API endpoints documentation
- **`docs/DEPLOYMENT.md`** - Deployment procedures
- **`vibe/DEPLOYMENT_INCIDENT_2026_01_26.md`** - Recent incident analysis

---

## 🔐 Security

### Secrets Management
- All secrets stored in GitHub Actions
- Never commit secrets to git
- Validation prevents malformed secrets from deploying
- Logs sanitize sensitive values (`***REDACTED***`)

### Required GitHub Secrets
- `NEON_DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - Email service API key
- `SECRET_KEY` - JWT signing key (32+ chars)
- `ALLOWED_ORIGINS` - CORS origins
- `VPS_HOST` - Server IP address
- `VPS_USER` - SSH username (deploy)
- `VPS_SSH_KEY` - SSH private key

---

## 💡 Pro Tips

### Fast Debugging
```bash
# Check everything at once
ssh deploy@87.106.103.254 "cd /home/deploy/vicarity && docker compose -f docker-compose.production.yml ps && docker compose -f docker-compose.production.yml logs api --tail=20"
```

### Local Development
```bash
# Run backend locally
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Run frontend locally
cd web
npm install
npm start
```

### Quick Health Check
```bash
curl https://vicarity.co.uk/api/health | jq
```

---

## 🎯 Success Metrics

**Current:**
- ✅ Backend API: 100% complete
- ✅ Deployment: 100% automated with validation
- ✅ SSL: Working
- ⚠️ Frontend: 20% complete

**MVP Goal:**
- ✅ Backend API: 100% (done)
- ✅ Frontend: 80% (auth + registration + profile completion)
- ✅ Deployment: 100% (done)
- ⚠️ Testing: 50% (needs work)

---

## 🚨 Emergency Contacts

### If Everything Breaks
1. **Rollback deployment:**
   ```bash
   ssh deploy@87.106.103.254
   cd /home/deploy/vicarity
   git reset --hard $(cat .previous_commit)
   docker compose -f docker-compose.production.yml down
   docker compose -f docker-compose.production.yml up -d --build
   ```

2. **Check GitHub Actions:** https://github.com/ryane-joe-b/Rcorp-Vicarity/actions

3. **Read incident reports:** `vibe/DEPLOYMENT_INCIDENT_*.md`

---

**Last Updated:** January 26, 2026  
**Next Update:** After frontend auth implementation  
**Maintained by:** Development Team
