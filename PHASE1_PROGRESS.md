# PHASE 1: AUTHENTICATION SYSTEM - PROGRESS TRACKER

## COMPLETED ✅

### Backend - Database Models
- ✅ `User` model with role-based authentication
- ✅ `WorkerProfile` with 4-step completion tracking
- ✅ `CareHomeProfile` with business verification
- ✅ `Qualification` master list with seed data
- ✅ Profile completion percentage calculation
- ✅ Smart enums for all status fields

### Backend - Core Infrastructure
- ✅ Database connection (`app/core/database.py`)
- ✅ Configuration management (`app/core/config.py`)
- ✅ JWT token creation/validation (`app/core/security.py`)
- ✅ Password hashing with bcrypt
- ✅ Email verification tokens
- ✅ Password reset tokens
- ✅ Password strength validation

### Backend - API Schemas
- ✅ Auth request/response schemas
- ✅ User schemas
- ✅ Worker profile schemas
- ✅ Care home profile schemas

### Backend - Dependencies
- ✅ `get_current_user` - JWT validation
- ✅ `get_current_verified_user` - Email verification check
- ✅ `get_current_worker` - Role-based access
- ✅ `get_current_care_home` - Role-based access
- ✅ `get_current_worker_with_complete_profile` - Profile completion check

---

## IN PROGRESS 🚧

### Backend - Auth Router
Need to create `/api/auth` endpoints:
- [ ] `POST /register` - User registration with automatic profile creation
- [ ] `POST /login` - Authentication with role-based redirect info
- [ ] `POST /verify-email` - Email verification
- [ ] `POST /refresh` - Refresh access token
- [ ] `GET /me` - Current user info with profile
- [ ] `POST /password-reset-request` - Request password reset
- [ ] `POST /password-reset-confirm` - Confirm password reset

### Backend - Profile Routers
- [ ] Worker profile endpoint (`GET /PUT /api/worker/profile`)
- [ ] Care home profile endpoint (`GET /PUT /api/care-home/profile`)

### Backend - Database Migration
- [ ] Alembic initial migration
- [ ] Seed qualifications data

### Backend - Email Service
- [ ] Resend integration
- [ ] Verification email template
- [ ] Welcome email templates (worker vs care home)
- [ ] Password reset email template

---

## TODO 📋

### Backend - Main App
- [ ] Update `main.py` to include new routers
- [ ] Add proper CORS configuration
- [ ] Add request logging middleware

### Frontend - Complete Build
- [ ] Install Tailwind CSS
- [ ] Color theme (Sage/Terracotta/Blue)
- [ ] Auth context with React Context API
- [ ] Protected route component with smart routing
- [ ] Landing page with dual CTAs
- [ ] Registration flow (3 pages)
- [ ] Profile completion wizard (4 steps)
- [ ] Worker dashboard
- [ ] Care home dashboard

---

## ARCHITECTURE DECISIONS

### User Flow - Care Worker
```
1. Landing Page → "Find Care Work"
2. Role Selection → Choose "Care Worker"
3. Register → Email + Password
4. Email Verification → Click link in email
5. Profile Wizard:
   - Step 1: Personal Details (20%)
   - Step 2: Qualifications (30%)
   - Step 3: Skills & Experience (25%)
   - Step 4: Availability (25%)
6. Worker Dashboard → Job Board (only if 100% complete)
```

### User Flow - Care Home
```
1. Landing Page → "Hire Care Staff"
2. Role Selection → Choose "Care Home"
3. Register → Email + Password
4. Email Verification → Click link in email
5. Care Home Dashboard → Can post jobs immediately
6. Profile Completion → Optional but encouraged (verification badge)
```

### Smart Routing Logic
```python
if not authenticated:
    → redirect to /login

if not email_verified:
    → redirect to /verify-email

if role == 'worker' and profile_completion < 100%:
    → redirect to /complete-profile?step={current_step}

if role == 'worker' and profile_completion == 100%:
    → allow access to /dashboard/worker

if role == 'care_home':
    → allow access to /dashboard/care-home
```

### Database Schema
```
users (authentication)
├── worker_profiles (1:1)
└── care_home_profiles (1:1)

qualifications (master list - seeded)
```

### Token Strategy
- **Access Token**: 30 minutes, includes user_id and role
- **Refresh Token**: 7 days, used to get new access tokens
- **Email Verification**: 24 hours, one-time use
- **Password Reset**: 1 hour, one-time use

---

## NEXT STEPS

1. **Create auth router** with registration and login
2. **Create profile routers** for worker and care home
3. **Setup Alembic** and create initial migration
4. **Integrate Resend** for email sending
5. **Update main.py** to wire everything together
6. **Test backend** endpoints with curl/Postman
7. **Build frontend** starting with landing page

---

## FILES CREATED

```
api/
├── app/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Settings
│   │   ├── database.py         # DB connection
│   │   ├── dependencies.py     # Auth dependencies
│   │   └── security.py         # JWT, password hashing
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py             # User model
│   │   ├── worker_profile.py   # Worker profile
│   │   ├── care_home_profile.py # Care home profile
│   │   └── qualification.py    # Qualifications + seeds
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py             # Auth schemas
│   │   ├── user.py             # User schemas
│   │   ├── worker.py           # Worker schemas
│   │   └── care_home.py        # Care home schemas
│   └── routers/
│       └── __init__.py
```

---

## ENVIRONMENT VARIABLES NEEDED

```env
# Database
NEON_DATABASE_URL=postgresql://...

# Security
SECRET_KEY=<generate with: openssl rand -hex 32>

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@vicarity.co.uk

# Frontend
FRONTEND_URL=https://vicarity.co.uk
ALLOWED_ORIGINS=https://vicarity.co.uk

# Environment
ENVIRONMENT=production
```

---

**Last Updated**: 2026-01-25  
**Status**: Backend models and core complete, need routers and frontend
