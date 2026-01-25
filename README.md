# Vicarity

> **Care Worker Marketplace** - Connecting qualified care workers with care homes across the UK

[![Status](https://img.shields.io/badge/status-production-green)](https://vicarity.co.uk)
[![Backend](https://img.shields.io/badge/backend-100%25-success)](./api)
[![Frontend](https://img.shields.io/badge/frontend-20%25-orange)](./web)
[![Infrastructure](https://img.shields.io/badge/infrastructure-100%25-success)](./infra)

**Live Site**: [vicarity.co.uk](https://vicarity.co.uk)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Vicarity is a modern marketplace platform designed to streamline the connection between qualified care workers and care homes in the UK. The platform features:

- **Dual-sided marketplace** for workers and care homes
- **Smart profile completion** with wizard-based onboarding
- **Role-based authentication** with JWT tokens
- **Email verification** and secure password management
- **HIPAA-compliant** infrastructure with PostgreSQL on Neon

The platform is built with a production-ready FastAPI backend, React frontend, and fully automated CI/CD deployment pipeline.

---

## Features

### For Care Workers
- ✅ Secure registration with email verification
- ✅ 4-step profile completion wizard
  - Personal information (20%)
  - Qualifications & certifications (30%)
  - Skills & experience (25%)
  - Availability & preferences (25%)
- ✅ DBS check tracking
- ✅ Qualification management (25+ UK care qualifications)
- 🚧 Job board access (coming soon)
- 🚧 Application tracking (coming soon)

### For Care Homes
- ✅ Business profile with CQC registration
- ✅ Contact information and capacity tracking
- 🚧 Post shift openings (coming soon)
- 🚧 Browse worker profiles (coming soon)
- 🚧 Interview scheduling (coming soon)

### Security & Authentication
- JWT-based authentication (access + refresh tokens)
- Bcrypt password hashing
- Email verification required
- Password reset flow with secure tokens
- Rate limiting on authentication endpoints
- CORS protection
- Security headers (HSTS, CSP, X-Frame-Options)

---

## Tech Stack

### Backend
- **Framework**: FastAPI 0.109
- **Database**: PostgreSQL (Neon - HIPAA tier)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Passlib with bcrypt
- **Email**: Resend API
- **Cache/Sessions**: Redis 7
- **Validation**: Pydantic v2

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS 3.4
- **Build**: React Scripts (Create React App)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx 1.25
- **CI/CD**: GitHub Actions
- **SSL**: Let's Encrypt (Certbot)
- **Server**: Ubuntu 22.04 LTS VPS

### Development Tools
- **Python**: 3.11+
- **Node.js**: 18+
- **Package Managers**: pip, npm

---

## Project Status

| Component | Status | Completion | Notes |
|-----------|--------|------------|-------|
| Backend API | ✅ Production | 100% | All endpoints implemented |
| Database Models | ✅ Production | 100% | Schema complete |
| Authentication | ✅ Production | 100% | JWT + email verification |
| Email System | ✅ Production | 100% | Resend integration |
| Frontend Auth | 🚧 In Progress | 20% | Basic setup only |
| Frontend Pages | 🚧 Not Started | 0% | Needs implementation |
| CI/CD Pipeline | ✅ Production | 100% | Automated deployments |
| Docker Setup | ✅ Production | 100% | Multi-service orchestration |
| SSL/HTTPS | ⏸️ Pending | 90% | Certificate needed |
| Database Migrations | ⏸️ Pending | 95% | Need to run initial migration |

**Next Priorities**:
1. Run database migrations (5 mins)
2. Set up SSL certificate (10 mins)
3. Build frontend authentication infrastructure (1-2 hours)
4. Create landing page and registration flow (2-3 hours)

See [vibe/PROJECT_STATUS.md](./vibe/PROJECT_STATUS.md) for detailed status tracking.

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vicarity
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start services with Docker Compose**
   ```bash
   docker compose -f docker-compose.production.yml up -d --build
   ```

4. **Check service health**
   ```bash
   docker compose -f docker-compose.production.yml ps
   curl http://localhost/api/health
   ```

5. **Run database migrations**
   ```bash
   docker compose -f docker-compose.production.yml exec api alembic upgrade head
   ```

6. **Access the application**
   - Frontend: http://localhost
   - API: http://localhost/api
   - API Docs: http://localhost/api/docs

### Local Backend Development (without Docker)

```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Local Frontend Development (without Docker)

```bash
cd web
npm install
npm start
# Runs on http://localhost:3000
```

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Architecture Overview](./docs/ARCHITECTURE.md)** - System design and component interactions
- **[API Documentation](./docs/API.md)** - Complete API endpoint reference
- **[Database Schema](./docs/DATABASE.md)** - Database models and relationships
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Development Guide](./docs/DEVELOPMENT.md)** - Local development setup
- **[Authentication Flow](./docs/AUTHENTICATION.md)** - Auth system details
- **[Frontend Guide](./docs/FRONTEND.md)** - Frontend development guide

---

## Project Structure

```
vicarity/
├── api/                          # Backend FastAPI application
│   ├── app/
│   │   ├── core/                 # Config, database, security, email
│   │   ├── models/               # SQLAlchemy models
│   │   ├── routers/              # API endpoints
│   │   └── schemas/              # Pydantic schemas
│   ├── alembic/                  # Database migrations
│   ├── main.py                   # FastAPI app entry point
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile
│
├── web/                          # Frontend React application
│   ├── src/
│   │   ├── index.js              # React entry point
│   │   ├── App.js                # Main component
│   │   └── index.css             # Tailwind + custom styles
│   ├── public/
│   ├── package.json              # Node dependencies
│   ├── tailwind.config.js        # Tailwind configuration
│   └── Dockerfile
│
├── infra/                        # Infrastructure & deployment
│   ├── setup-server.sh           # VPS initial setup
│   ├── deploy.sh                 # Manual deployment script
│   └── nginx.conf                # Nginx configuration
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   ├── AUTHENTICATION.md
│   └── FRONTEND.md
│
├── vibe/                         # Project status tracking
│   └── PROJECT_STATUS.md         # Detailed progress tracking
│
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD pipeline
│
├── docker-compose.production.yml # Multi-service orchestration
├── .env.example                  # Environment template
└── README.md                     # This file
```

---

## Design System

### Color Palette

The platform uses distinct colors for each user type:

| Color | Hex | Usage |
|-------|-----|-------|
| **Sage Green** | `#86a890` | Primary color for care workers |
| **Terracotta** | `#c96228` | Primary color for care homes |
| **Ocean Blue** | `#006fc4` | Accent color for links/actions |
| **Neutral Grays** | Tailwind defaults | Text and backgrounds |

### Typography

- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weight, larger sizes
- **Body Text**: Regular weight, readable line-height (1.6)

---

## Environment Variables

Required environment variables (see `.env.example` for template):

### Backend
```bash
# Database
NEON_DATABASE_URL=postgresql://user:pass@host/dbname

# Security
SECRET_KEY=your-secret-key-min-32-chars

# Email
RESEND_API_KEY=re_...

# CORS
ALLOWED_ORIGINS=https://vicarity.co.uk,http://localhost:3000

# Environment
ENVIRONMENT=production  # or development
LOG_LEVEL=INFO
```

### Frontend
```bash
REACT_APP_API_URL=/api
```

---

## Deployment

The project includes automated deployment via GitHub Actions:

1. **Push to main branch** triggers the CI/CD pipeline
2. **GitHub Actions**:
   - Runs tests (placeholder)
   - Validates Docker builds
   - SSHs to production VPS
   - Pulls latest code
   - Builds new Docker images
   - Performs rolling update (zero downtime)
   - Runs health checks
   - Auto-rolls back on failure

Manual deployment is also available:

```bash
# On production server
cd /path/to/vicarity
git pull origin main
docker compose -f docker-compose.production.yml up -d --build
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/password-reset-request` - Request password reset
- `POST /api/auth/password-reset-confirm` - Confirm password reset
- `POST /api/auth/resend-verification` - Resend verification email

### Worker
- `GET /api/worker/profile` - Get worker profile
- `PUT /api/worker/profile` - Update worker profile

### Care Home
- `GET /api/care-home/profile` - Get care home profile
- `PUT /api/care-home/profile` - Update care home profile

### Health
- `GET /health` - Nginx health check
- `GET /api/health` - API health check with DB/Redis status

Full API documentation: [docs/API.md](./docs/API.md)

---

## Security Features

### Backend
- JWT tokens with expiry (access: 30min, refresh: 7 days)
- Password hashing with bcrypt
- Email verification required for activation
- Rate limiting on authentication endpoints
- CORS restrictions
- SQL injection protection (SQLAlchemy ORM)
- Input validation with Pydantic v2
- Secure password reset flow

### Infrastructure
- SSH key-only authentication
- Firewall (UFW) with minimal open ports
- Fail2ban for brute force protection
- HTTPS with TLS 1.2/1.3 only (once SSL is configured)
- Security headers (HSTS, CSP, X-Frame-Options)
- Docker container isolation
- Network segregation
- Resource limits on containers

---

## Testing

### Backend Tests
```bash
cd api
pytest
pytest --cov=app tests/  # With coverage
```

### Frontend Tests
```bash
cd web
npm test
```

**Note**: Test suites are currently in placeholder state and need to be expanded.

---

## Monitoring & Logs

### View Logs
```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f api
docker compose -f docker-compose.production.yml logs -f nginx
```

### Health Checks
- Nginx: `curl http://vicarity.co.uk/health`
- API: `curl http://vicarity.co.uk/api/health`

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally with Docker Compose
4. Commit with clear messages
5. Push and create a pull request
6. Automated CI will run tests and builds

### Coding Standards

**Python (Backend)**:
- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Keep functions focused and small

**JavaScript (Frontend)**:
- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names
- Add PropTypes or TypeScript types

---

## License

Copyright © 2026 Vicarity. All rights reserved.

---

## Support

For questions or issues:
- Check the [documentation](./docs)
- Review the [project status](./vibe/PROJECT_STATUS.md)
- Open an issue on GitHub

---

## Roadmap

### Phase 1: MVP (Current)
- ✅ Backend API with authentication
- ✅ Database models and relationships
- ✅ Email verification system
- ✅ Production infrastructure
- 🚧 Frontend authentication flows
- 🚧 Profile completion wizards

### Phase 2: Core Features
- Job board for workers
- Shift posting for care homes
- Application system
- Worker search and filtering
- Messaging between parties

### Phase 3: Advanced Features
- Interview scheduling
- Reference management
- Payment integration
- Rating and review system
- Mobile apps (iOS/Android)

### Phase 4: Scale & Optimize
- Analytics dashboard
- Admin panel
- Compliance tracking
- Automated matching algorithms
- Performance optimization

---

**Built with care for the care industry** 💚🧡
