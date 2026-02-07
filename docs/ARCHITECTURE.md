# Vicarity Architecture Documentation

Comprehensive overview of the Vicarity platform architecture, design decisions, and system components.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Infrastructure](#infrastructure)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [Deployment Architecture](#deployment-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## System Overview

Vicarity is a **dual-sided marketplace platform** connecting care workers with care homes. The platform is built using a modern, containerized microservices architecture with clear separation of concerns.

### High-Level Components

1. **Frontend (React SPA)**: User interface served as static files
2. **Backend API (FastAPI)**: RESTful API handling business logic
3. **Database (PostgreSQL)**: Persistent data storage
4. **Cache (Redis)**: Session storage and caching
5. **Web Server (Nginx)**: Reverse proxy and static file serving
6. **Email Service (Resend)**: Transactional email delivery

### Design Principles

- **Separation of Concerns**: Clear boundaries between frontend, backend, and infrastructure
- **Stateless API**: All state stored in database/Redis, enabling horizontal scaling
- **Security First**: Authentication, encryption, and validation at every layer
- **Developer Experience**: Type safety, clear documentation, automated testing
- **Production Ready**: Containerized, monitored, and easily deployable

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           INTERNET                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS (443) / HTTP (80)
                             ▼
                   ┌──────────────────┐
                   │  Nginx (Alpine)  │
                   │  - Reverse Proxy │
                   │  - SSL/TLS       │
                   │  - Rate Limiting │
                   │  - Static Files  │
                   └─────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      /api/*  Route    /    Route    /health Check
              │              │              │
    ┌─────────▼──────┐  ┌───▼────────┐    │
    │  FastAPI       │  │  React SPA  │    │
    │  Backend       │  │  (Static)   │    │
    │  - REST API    │  │  - HTML/JS  │    │
    │  - Auth        │  │  - CSS      │    │
    │  - Validation  │  │  - Assets   │    │
    └─────┬──────────┘  └─────────────┘    │
          │                                 │
    ┌─────┼─────────────────────────────────┘
    │     │
    │     ▼
    │  ┌──────────────────┐
    │  │  PostgreSQL      │
    │  │  (Neon - HIPAA)  │
    │  │  - User Data     │
    │  │  - Profiles      │
    │  │  - Jobs/Shifts   │
    │  └──────────────────┘
    │
    ▼
 ┌─────────────┐          ┌──────────────┐
 │   Redis 7   │          │   Resend     │
 │  - Sessions │          │  - Email API │
 │  - Cache    │          │  - Templates │
 │  - Tokens   │          └──────────────┘
 └─────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Docker Network (Bridge)                        │
│  All containers communicate via internal network (172.28.0.0/16) │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | FastAPI | 0.109.0 | High-performance async web framework |
| **Language** | Python | 3.11+ | Main programming language |
| **Database** | PostgreSQL | 15+ | Relational data storage (via Neon) |
| **ORM** | SQLAlchemy | 2.0.25 | Database abstraction layer |
| **Migrations** | Alembic | 1.13.1 | Database schema versioning |
| **Authentication** | python-jose | 3.3.0 | JWT token handling |
| **Password Hashing** | Passlib + bcrypt | 1.7.4 | Secure password storage |
| **Validation** | Pydantic | 2.5.3 | Data validation and serialization |
| **Cache** | Redis | 7.0 | Session storage and caching |
| **Email** | Resend API | 0.7.0 | Transactional email delivery |
| **ASGI Server** | Uvicorn | 0.27.0 | Production ASGI server |

### Frontend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | React | 18.2.0 | UI component library |
| **Language** | JavaScript (ES6+) | - | Main programming language |
| **Routing** | React Router | 6.21.0 | Client-side routing |
| **HTTP Client** | Axios | 1.6.5 | API communication |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| **Build Tool** | Create React App | 5.0.1 | Build and development tooling |

### Infrastructure

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Containerization** | Docker | 24+ | Application packaging |
| **Orchestration** | Docker Compose | 2.x | Multi-container management |
| **Web Server** | Nginx | 1.25 | Reverse proxy and static files |
| **CI/CD** | GitHub Actions | - | Automated deployment pipeline |
| **SSL** | Let's Encrypt | - | TLS certificate management |
| **OS** | Ubuntu | 22.04 LTS | VPS operating system |

---

## Backend Architecture

### Layered Architecture

```
┌──────────────────────────────────────────────┐
│         PRESENTATION LAYER (Routers)          │
│  - HTTP request/response handling             │
│  - Input validation (Pydantic schemas)        │
│  - Authentication checks                      │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│         BUSINESS LOGIC LAYER                  │
│  - Profile completion calculation             │
│  - Email verification logic                   │
│  - Token generation/validation                │
│  - Smart routing decisions                    │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│         DATA ACCESS LAYER (Models)            │
│  - SQLAlchemy ORM models                      │
│  - Database queries                           │
│  - Relationship management                    │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│         INFRASTRUCTURE LAYER                  │
│  - Database connection (SQLAlchemy engine)    │
│  - Redis connection                           │
│  - External APIs (Resend)                     │
└──────────────────────────────────────────────┘
```

### Directory Structure

```
api/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── config.py            # Settings management (Pydantic)
│   │   ├── database.py          # DB connection & session
│   │   ├── dependencies.py      # FastAPI dependencies
│   │   ├── security.py          # JWT & password hashing
│   │   └── email.py             # Email sending (Resend)
│   │
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── user.py              # User authentication
│   │   ├── worker_profile.py    # Worker profile data
│   │   ├── care_home_profile.py # Care home data
│   │   └── qualification.py     # UK qualifications
│   │
│   ├── routers/                 # API endpoints
│   │   ├── auth.py              # Authentication routes
│   │   ├── worker.py            # Worker profile routes
│   │   └── care_home.py         # Care home routes
│   │
│   └── schemas/                 # Pydantic request/response models
│       ├── auth.py              # Auth DTOs
│       ├── worker.py            # Worker DTOs
│       ├── care_home.py         # Care home DTOs
│       └── user.py              # User DTOs
│
├── alembic/                     # Database migrations
│   ├── versions/                # Migration files
│   └── env.py                   # Alembic configuration
│
├── main.py                      # FastAPI application entry
├── requirements.txt             # Python dependencies
└── Dockerfile                   # Container image definition
```

### Key Design Patterns

**Dependency Injection**:
FastAPI's dependency injection system is used for:
- Database session management (`get_db`)
- Authentication (`get_current_user`)
- Configuration access

**Repository Pattern**:
SQLAlchemy models act as repositories, encapsulating data access logic.

**Schema Pattern (DTO)**:
Pydantic models separate API contracts from database models:
- Request schemas (validation)
- Response schemas (serialization)
- Internal domain models (SQLAlchemy)

---

## Frontend Architecture

### Component Structure (Phase 1 Implemented)

**Status:** Landing Page Phase 1 Complete (60%)  
**See:** `vibe/LANDING_PAGE_IMPLEMENTATION.md` for detailed documentation

```
web/
├── src/
│   ├── components/              
│   │   ├── layout/              # ✅ Layout components
│   │   │   ├── Navbar/
│   │   │   │   └── Navbar.jsx   # Sticky nav with mobile menu
│   │   │   └── Footer/
│   │   │       └── Footer.jsx   # 4-column footer
│   │   │
│   │   ├── sections/            # ✅ Landing page sections
│   │   │   ├── Hero/
│   │   │   │   └── HeroSection.jsx        # Hero with dual CTAs
│   │   │   ├── Stats/
│   │   │   │   ├── StatsSection.jsx       # Real-time stats
│   │   │   │   └── AnimatedCounter.jsx    # Animated numbers
│   │   │   ├── ValueProp/
│   │   │   │   └── ValuePropSection.jsx   # Worker/home benefits
│   │   │   ├── FinalCTA/
│   │   │   │   └── FinalCTASection.jsx    # Bottom CTA
│   │   │   ├── HowItWorks/                # ⏸️ Phase 2
│   │   │   ├── Trust/                     # ⏸️ Phase 2
│   │   │   ├── Testimonials/              # ⏸️ Phase 2
│   │   │   ├── FAQ/                       # ⏸️ Phase 2
│   │   │   └── Qualifications/            # ⏸️ Phase 2
│   │   │
│   │   ├── ui/                  # ✅ Reusable UI components
│   │   │   └── buttons/
│   │   │       ├── PrimaryButton.jsx      # Brand buttons
│   │   │       └── SecondaryButton.jsx    # Outline buttons
│   │   │
│   │   ├── shared/              # ✅ Shared utilities
│   │   │   └── Container.jsx    # Responsive container
│   │   │
│   │   ├── auth/                # ⏸️ Auth components (not started)
│   │   └── common/              # ⏸️ Common components (not started)
│   │
│   ├── pages/                   # ✅ Route-level components
│   │   ├── landing/
│   │   │   └── LandingPage.jsx  # Main landing page (Phase 1)
│   │   ├── auth/                # ⏸️ Auth pages (not started)
│   │   ├── worker/              # ⏸️ Worker pages (not started)
│   │   └── care-home/           # ⏸️ Care home pages (not started)
│   │
│   ├── services/                # ✅ API communication
│   │   └── api.js               # Axios instance + public API methods
│   │
│   ├── hooks/                   # ✅ Custom React hooks
│   │   └── usePublicStats.js    # Stats fetching with auto-refresh
│   │
│   ├── contexts/                # ⏸️ React Context providers (not started)
│   ├── utils/                   # ⏸️ Utility functions (not started)
│   │
│   ├── App.js                   # ✅ Root component (renders LandingPage)
│   ├── index.js                 # ✅ React entry point
│   └── index.css                # ✅ Global styles (Tailwind + customs)
│
├── public/                      
│   ├── index.html               
│   └── favicon.ico
│
└── package.json                 
```

### Design System

**Healthcare Brand Colors:**
- **Sage** (#8A9A5B): Care workers primary
- **Terracotta** (#E2725B): Care homes primary
- **Ocean** (#2E4E6D): Trust/professional accent
- **Warm** (#F5F3F0): Background
- **Charcoal** (#2C3E3E): Text

**Typography:**
- Font: Inter (Google Fonts)
- Mobile-first scales (2rem → 3rem desktop)
- Touch-optimized (44px minimum tap targets)

**Animations:**
- `fadeIn`, `slideUp`, `scaleIn`, `counter`
- Intersection Observer for scroll-triggered animations

### State Management Strategy

**Current Implementation (Phase 1):**
- **Local State**: `useState` for component state
- **Custom Hooks**: `usePublicStats` for API data
- **API Service**: Axios with interceptors

**Planned (Future Phases):**
- **Global Auth State**: Context API for authentication  
- **Server State**: React Query for API data caching  
- **Form State**: Controlled components with validation

### API Integration

**Public API (Live):**
```javascript
// Fetches real-time statistics
GET /api/public/stats
// Returns: { total_workers, total_care_homes, ... }
```

**Implementation:**
- Service: `publicApi.getStats()` in `services/api.js`
- Hook: `usePublicStats()` with 5-minute auto-refresh
- Error handling with fallback data
- Loading states

**See:** `vibe/LANDING_PAGE_IMPLEMENTATION.md` for complete API documentation

---

## Infrastructure

### Containerization

Each service runs in its own Docker container for isolation and portability:

**API Container**:
- Base image: `python:3.11-slim`
- Installs dependencies from `requirements.txt`
- Runs Uvicorn ASGI server on port 8000
- Health check: `curl http://localhost:8000/health`

**Web Container**:
- Multi-stage build:
  1. Build stage: Node.js compiles React app
  2. Serve stage: Nginx serves static files
- Shares volume with Nginx for static file serving

**Redis Container**:
- Base image: `redis:7-alpine`
- Persistence enabled (AOF)
- Memory limit: 256MB
- Eviction policy: `allkeys-lru`

**Nginx Container**:
- Base image: `nginx:1.25-alpine`
- Custom configuration for reverse proxy
- SSL certificate volume mount
- Access/error logs to volume

### Docker Network

All containers communicate via a bridge network (`vicarity-network`):
- Subnet: `172.28.0.0/16`
- Internal DNS resolution (containers can reference each other by name)
- Only Nginx exposes ports to the host (80, 443)

### Volumes

**Persistent Volumes**:
- `redis-data`: Redis persistence
- `web-static`: Compiled React app
- `/etc/letsencrypt`: SSL certificates (bind mount)

**Bind Mounts**:
- `./infra/nginx.conf`: Nginx configuration
- `./logs/`: Application and access logs

---

## Data Flow

### User Registration Flow

```
1. User submits registration form
   ├─> Frontend validates input (email, password strength)
   └─> POST /api/auth/register
       
2. Backend processes registration
   ├─> Validates email format (Pydantic)
   ├─> Checks password strength (8+ chars, complexity)
   ├─> Checks if email exists (database query)
   ├─> Hashes password (bcrypt)
   ├─> Creates User record (PostgreSQL)
   ├─> Creates WorkerProfile or CareHomeProfile
   ├─> Generates email verification token (JWT, 24hr expiry)
   ├─> Saves token to user record
   └─> Sends verification email (Resend API)
       
3. User receives email
   ├─> Clicks verification link
   └─> Frontend parses token from URL
       
4. Email verification
   ├─> POST /api/auth/verify-email {token}
   ├─> Backend verifies JWT signature and expiry
   ├─> Marks user.email_verified = true
   ├─> Clears verification token
   └─> Returns redirect URL based on role and profile status
```

### Authentication Flow (Cookie-Based)

```
1. User submits login credentials
   └─> POST /api/auth/login {email, password}

2. Backend authenticates
   ├─> Finds user by email
   ├─> Verifies password (bcrypt.verify)
   ├─> Checks account is active
   ├─> Updates last_login_at timestamp
   ├─> Generates access token (JWT, 30min expiry)
   ├─> Generates refresh token (JWT, 7 day expiry)
   └─> Sets HTTP-only cookies (NOT in JSON response)
       ├─> access_token cookie (httpOnly, secure, SameSite=Lax)
       └─> refresh_token cookie (httpOnly, secure, SameSite=Lax)

3. Frontend receives response
   ├─> No token storage needed (handled by browser)
   ├─> Cookies sent automatically with every request
   └─> JavaScript CANNOT access tokens (XSS protection)

4. Subsequent API requests
   ├─> Browser automatically sends cookies
   ├─> Backend reads token from request.cookies.get("access_token")
   └─> Validates JWT and returns data

5. Token expiry handling (Automatic)
   ├─> API returns 401 Unauthorized
   ├─> Axios interceptor catches 401
   ├─> Calls POST /api/auth/refresh (refresh_token from cookie)
   ├─> Backend validates refresh token, sets new cookies
   ├─> Interceptor retries original request
   └─> User never sees the refresh (seamless)

6. Logout
   ├─> POST /api/auth/logout
   ├─> Backend clears cookies (Set-Cookie with max-age=0)
   ├─> Cross-tab logout via localStorage events
   └─> All tabs redirect to login
```

### Profile Update Flow

```
1. User submits profile form (any step)
   └─> PUT /api/worker/profile {data}
       
2. Backend processes update
   ├─> Validates JWT token (get current user)
   ├─> Validates input data (Pydantic schema)
   ├─> Loads existing worker profile
   ├─> Updates specified fields
   ├─> Calls profile.update_completion_status()
   │   ├─> Calculates completion percentage
   │   │   ├─> Step 1 (personal): 20%
   │   │   ├─> Step 2 (qualifications): 30%
   │   │   ├─> Step 3 (experience): 25%
   │   │   └─> Step 4 (availability): 25%
   │   └─> Updates completion status enum
   ├─> Saves to database (commit)
   └─> Returns updated profile with new percentage
       
3. Frontend updates UI
   ├─> Shows new completion percentage
   ├─> Enables next step if applicable
   └─> Redirects to dashboard if 100% complete
```

---

## Security Architecture

### Defense in Depth

Security is implemented at multiple layers:

**1. Network Layer**:
- Firewall (UFW) allows only ports 22, 80, 443
- Fail2ban blocks brute force SSH attempts
- Internal Docker network (containers isolated)

**2. Transport Layer**:
- TLS 1.2/1.3 only (once SSL configured)
- HSTS headers force HTTPS
- Certificate pinning (planned)

**3. Application Layer**:
- JWT authentication with short expiry
- CORS restrictions
- Rate limiting (Nginx)
- Input validation (Pydantic)
- SQL injection prevention (ORM)
- XSS protection (CSP headers)

**4. Data Layer**:
- Password hashing (bcrypt, cost factor 12)
- Email verification required
- Database encryption at rest (Neon HIPAA tier)
- Secure connection strings (no credentials in code)

### JWT Token Strategy

**Access Token**:
- Expiry: 30 minutes
- Claims: `sub` (user_id), `role`, `type`, `exp`, `iat`
- Storage: **HTTP-only cookie** (JavaScript cannot access)
- Cookie flags: `httpOnly`, `secure` (prod), `SameSite=Lax`
- Used for: All authenticated API requests

**Refresh Token**:
- Expiry: 7 days
- Claims: `sub` (user_id), `type`, `exp`, `iat`
- Storage: **HTTP-only cookie** (JavaScript cannot access)
- Cookie flags: `httpOnly`, `secure` (prod), `SameSite=Lax`
- Used for: Refreshing access tokens automatically

**Email Verification Token**:
- Expiry: 24 hours
- Claims: `sub` (user_id), `email`, `type`, `exp`
- Storage: Email link only
- Single use: Cleared after verification

**Password Reset Token**:
- Expiry: 1 hour
- Claims: `sub` (user_id), `email`, `type`, `exp`
- Storage: Email link only
- Single use: Cleared after reset

### Security Headers (Nginx)

```nginx
# HSTS: Force HTTPS for 1 year
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# CSP: Restrict resource loading
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.resend.com";

# Prevent clickjacking
add_header X-Frame-Options "DENY" always;

# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Referrer policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │◄───────┐
│ email (unique)  │        │
│ password_hash   │        │
│ role (enum)     │        │
│ email_verified  │        │
│ is_active       │        │
└─────────────────┘        │
        │                  │
        │ 1:1              │ 1:1
        ├──────────────────┤
        ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│ WorkerProfile    │  │ CareHomeProfile  │
├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │
│ user_id (FK)     │  │ user_id (FK)     │
│ first_name       │  │ business_name    │
│ last_name        │  │ cqc_provider_id  │
│ phone            │  │ cqc_rating       │
│ dbs_status       │  │ contact_name     │
│ qualifications   │  │ address          │
│ specializations  │  │ verification_    │
│ completion_%     │  │   status         │
└──────────────────┘  └──────────────────┘
        │
        │ M:M (via JSONB)
        ▼
┌──────────────────┐
│  Qualification   │
├──────────────────┤
│ id (PK)          │
│ code (unique)    │
│ name             │
│ category         │
│ is_mandatory     │
└──────────────────┘
```

### Key Tables

**users**:
- Primary authentication table
- Stores credentials and verification status
- Role determines which profile table to join

**worker_profiles**:
- One-to-one with users (where role = 'worker')
- 4-step wizard tracking
- JSONB for flexible qualification storage
- Arrays for specializations, languages, etc.

**care_home_profiles**:
- One-to-one with users (where role = 'care_home_*')
- CQC integration ready
- Verification workflow

**qualifications**:
- Reference table (pre-seeded)
- UK-specific care qualifications
- Workers link via JSONB array in profile

### Database Indexes

```sql
-- Critical for authentication
CREATE INDEX idx_users_email ON users(email);

-- Join optimization
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_care_home_profiles_user_id ON care_home_profiles(user_id);

-- Search optimization (future)
CREATE INDEX idx_qualifications_code ON qualifications(code);
CREATE INDEX idx_worker_profiles_postcode ON worker_profiles(postcode);
```

---

## Authentication Flow

See dedicated [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed flow diagrams.

**Summary**:
1. User registers → Email sent
2. User verifies email → Account activated
3. User logs in → Receives JWT tokens
4. User completes profile (workers) → Job board access
5. Tokens auto-refresh → Seamless UX
6. Logout → Tokens cleared

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Repository                      │
│             (source code + GitHub Actions)               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Push to main branch
                        ▼
┌─────────────────────────────────────────────────────────┐
│              GitHub Actions CI/CD Pipeline               │
│  1. Run tests (pytest)                                   │
│  2. Build Docker images                                  │
│  3. SSH to production VPS                                │
│  4. Pull latest code                                     │
│  5. Docker Compose build + up (rolling update)           │
│  6. Health check verification                            │
│  7. Rollback on failure                                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ SSH connection
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Production VPS (87.106.103.254)                  │
│  - Ubuntu 22.04 LTS                                      │
│  - Docker + Docker Compose                               │
│  - UFW firewall (22, 80, 443)                            │
│  - Fail2ban (SSH protection)                             │
│  - Let's Encrypt SSL certificates                        │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Containers
                        ▼
        ┌───────────────┴───────────────┐
        │   Docker Compose Services     │
        │  - api (FastAPI)              │
        │  - web (React + Nginx)        │
        │  - redis (Cache)              │
        │  - nginx (Reverse Proxy)      │
        └───────────────────────────────┘
```

### Zero-Downtime Deployments

Docker Compose performs rolling updates:
1. Build new images alongside old containers
2. Start new containers with updated code
3. Health check new containers
4. Switch traffic to new containers
5. Stop old containers
6. Clean up old images

If health checks fail, old containers remain running.

---

## Scalability Considerations

### Current Architecture (Single Server)

- Single VPS handles all services
- Suitable for MVP and early growth
- Database (Neon) is already externalized
- Vertical scaling available (upgrade VPS specs)

### Future Scaling Path

**Phase 1: Vertical Scaling**
- Increase VPS CPU/RAM
- Optimize database queries
- Add Redis caching
- CDN for static assets

**Phase 2: Horizontal Scaling**
- Multiple API server instances (load balanced)
- Separate Redis cluster
- Database read replicas
- Session store externalization

**Phase 3: Microservices (if needed)**
- Separate services:
  - Auth service
  - Worker service
  - Care home service
  - Job board service
  - Messaging service
- Event-driven architecture (RabbitMQ/Kafka)
- Service mesh (Istio)

### Stateless Design

The API is already designed to be stateless:
- No in-memory sessions
- All state in database or Redis
- JWT tokens (client-side storage)
- Easy to add more API instances

---

## Performance Optimizations

### Backend

- **Async I/O**: FastAPI runs async by default
- **Connection Pooling**: SQLAlchemy manages DB connections
- **Query Optimization**: Eager loading for relationships
- **Caching**: Redis for frequently accessed data (future)

### Frontend

- **Code Splitting**: React lazy loading (future)
- **Asset Optimization**: Minification and compression
- **CDN**: Serve static assets from CDN (future)
- **Service Worker**: PWA capabilities (future)

### Database

- **Indexes**: On all foreign keys and search fields
- **Query Planning**: Regular EXPLAIN ANALYZE
- **Partitioning**: By date for large tables (future)

---

## Monitoring & Observability (Planned)

### Application Metrics
- Request latency (p50, p95, p99)
- Error rates
- Active users
- API endpoint usage

### Infrastructure Metrics
- CPU, memory, disk usage
- Network I/O
- Container health
- Database connection pool

### Tools (Future)
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards
- **Sentry**: Error tracking
- **Uptime monitors**: Health check pings

---

## Design Decisions & Rationale

### Why FastAPI?
- High performance (comparable to Node.js/Go)
- Automatic OpenAPI documentation
- Type hints and validation
- Async support out of the box
- Growing ecosystem

### Why PostgreSQL?
- ACID compliance (critical for marketplace)
- Rich data types (JSONB for qualifications)
- Full-text search capabilities
- Mature ecosystem
- HIPAA-compliant hosting available (Neon)

### Why Redis?
- Fast session storage
- Simple pub/sub (future messaging)
- Rate limiting support
- Low latency caching

### Why Docker?
- Consistent environments (dev/prod)
- Easy dependency management
- Scalability (orchestration ready)
- Simplified deployment

### Why Monolithic Backend?
- Faster development (MVP)
- Simpler deployment
- Easier debugging
- Can split later if needed

---

## Next Steps

See [PROJECT_STATUS.md](../vibe/PROJECT_STATUS.md) for current priorities.

**Architecture Evolution**:
1. ✅ Monolithic backend with clear separation
2. 🚧 Complete frontend implementation
3. ⏸️ Add caching layer (Redis)
4. ⏸️ Implement background jobs (Celery)
5. ⏸️ Add monitoring (Prometheus + Grafana)
6. ⏸️ Consider microservices (if scale demands)

---

**For more details**:
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Development Guide](./DEVELOPMENT.md)
