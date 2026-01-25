# Vicarity Documentation

Welcome to the Vicarity documentation. This directory contains comprehensive guides for developers, operators, and contributors.

---

## Documentation Index

### Getting Started

**New to Vicarity?** Start here:

1. [**Project README**](../README.md) - Project overview and quick start
2. [**Development Guide**](./DEVELOPMENT.md) - Set up your local development environment
3. [**Architecture Overview**](./ARCHITECTURE.md) - Understand the system design

### For Developers

**Building features:**

- [**API Documentation**](./API.md) - Complete API endpoint reference
- [**Development Guide**](./DEVELOPMENT.md) - Local setup, coding standards, workflows
- [**Architecture**](./ARCHITECTURE.md) - System design and technology stack

### For Operations

**Deploying and maintaining:**

- [**Deployment Guide**](./DEPLOYMENT.md) - Production deployment procedures
- [**DEPLOYMENT_GUIDE.md**](../DEPLOYMENT_GUIDE.md) - Detailed server setup (in project root)

### Reference

**Quick lookups:**

- [**Project Status**](../vibe/PROJECT_STATUS.md) - Current progress and next priorities
- [**Environment Variables**](../README.md#environment-variables) - Required configuration

---

## Quick Links

### Documentation Files

| Document | Description | Audience |
|----------|-------------|----------|
| [API.md](./API.md) | Complete API reference with examples | Developers |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and technical decisions | Developers, Architects |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Local dev setup and workflows | Developers |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide | DevOps, Operators |

### External Resources

| Resource | Link | Description |
|----------|------|-------------|
| **Live Site** | [vicarity.co.uk](https://vicarity.co.uk) | Production application |
| **API Docs (Swagger)** | [vicarity.co.uk/api/docs](https://vicarity.co.uk/api/docs) | Interactive API documentation |
| **GitHub Repository** | [GitHub](https://github.com/ryane-joe-b/Rcorp-Vicarity) | Source code |
| **Neon Dashboard** | [neon.tech](https://neon.tech) | Database management |
| **Resend Dashboard** | [resend.com](https://resend.com) | Email service |

---

## Documentation Organization

```
docs/
├── README.md              # This file - documentation index
├── API.md                 # API endpoint reference
├── ARCHITECTURE.md        # System architecture
├── DEVELOPMENT.md         # Development guide
└── DEPLOYMENT.md          # Deployment procedures

../
├── README.md              # Main project README
├── DEPLOYMENT_GUIDE.md    # Detailed deployment walkthrough
└── vibe/
    └── PROJECT_STATUS.md  # Current project status
```

---

## Common Workflows

### I want to...

**...start developing locally**
1. Read [DEVELOPMENT.md](./DEVELOPMENT.md)
2. Clone the repo
3. Set up Python and Node environments
4. Run backend: `uvicorn main:app --reload`
5. Run frontend: `npm start`

**...deploy to production**
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Set up GitHub secrets
3. Push to `main` branch
4. Watch GitHub Actions deploy automatically

**...understand the architecture**
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review the system diagrams
3. Explore the codebase structure

**...use the API**
1. Read [API.md](./API.md)
2. Visit [/api/docs](https://vicarity.co.uk/api/docs) for interactive docs
3. Review authentication flow
4. Test endpoints with Postman or curl

**...contribute to the project**
1. Read [DEVELOPMENT.md](./DEVELOPMENT.md)
2. Check [PROJECT_STATUS.md](../vibe/PROJECT_STATUS.md) for priorities
3. Create a feature branch
4. Submit a pull request

---

## Key Concepts

### System Architecture

Vicarity is a **dual-sided marketplace** with:
- **Backend**: FastAPI (Python) REST API
- **Frontend**: React 18 SPA
- **Database**: PostgreSQL on Neon
- **Cache**: Redis
- **Infrastructure**: Docker + Nginx

### User Roles

- **Workers**: Care workers seeking jobs
- **Care Homes**: Organizations hiring workers
- **Admin**: Platform administrators (future)

### Authentication

- JWT-based authentication
- Email verification required
- 30-minute access tokens
- 7-day refresh tokens

### Profile Completion

Workers must complete their profile (4 steps) before accessing jobs:
1. Personal information (20%)
2. Qualifications (30%)
3. Skills & experience (25%)
4. Availability (25%)

---

## Technology Stack

### Backend
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **Alembic** - Migrations
- **Pydantic** - Validation
- **PostgreSQL** - Database
- **Redis** - Cache

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Web server
- **GitHub Actions** - CI/CD
- **Let's Encrypt** - SSL

---

## Development Status

**Current Phase**: MVP Development

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Complete | All auth endpoints working |
| Database | ✅ Complete | Schema designed, needs migrations |
| Infrastructure | ✅ Complete | CI/CD pipeline functional |
| Frontend | 🚧 In Progress | Basic setup, needs pages |
| SSL | ⏸️ Pending | Certificate needed |

See [PROJECT_STATUS.md](../vibe/PROJECT_STATUS.md) for detailed progress.

---

## Support & Contact

### For Developers

- Check existing documentation first
- Review code comments
- Test changes locally
- Write tests for new features

### For Issues

- Check [Troubleshooting sections](./DEPLOYMENT.md#troubleshooting)
- Review logs: `docker compose logs`
- Check GitHub Actions for deployment issues

### Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Docker Docs**: https://docs.docker.com
- **Tailwind Docs**: https://tailwindcss.com

---

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Follow code style guidelines (see [DEVELOPMENT.md](./DEVELOPMENT.md))
4. Write tests for new features
5. Submit a pull request

---

## Next Steps

**New Developers**: Start with [DEVELOPMENT.md](./DEVELOPMENT.md)

**DevOps**: Review [DEPLOYMENT.md](./DEPLOYMENT.md)

**Everyone**: Check [PROJECT_STATUS.md](../vibe/PROJECT_STATUS.md) for current priorities

---

**Last Updated**: January 25, 2026  
**Version**: 1.0.0

Built with care for the care industry 💚🧡
