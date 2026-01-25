# Development Guide

Complete guide for setting up a local Vicarity development environment and contributing to the project.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Database Setup](#database-setup)
- [Running Tests](#running-tests)
- [Code Style](#code-style)
- [Git Workflow](#git-workflow)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

---

## Prerequisites

### Required Software

| Tool | Version | Installation |
|------|---------|--------------|
| **Python** | 3.11+ | [python.org](https://python.org) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **Docker** | 24+ | [docker.com](https://docker.com) |
| **Docker Compose** | 2.x | Included with Docker Desktop |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |

### Optional but Recommended

- **VS Code** with Python and JavaScript extensions
- **Postman** or **Insomnia** for API testing
- **pgAdmin** or **DBeaver** for database management

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/vicarity.git
cd vicarity
```

### 2. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your local values
nano .env
```

**Local .env file**:
```bash
# Database (use local PostgreSQL or Neon free tier)
NEON_DATABASE_URL=postgresql://user:password@localhost/vicarity

# Security
SECRET_KEY=dev-secret-key-not-for-production

# Email (use Resend test mode or fake SMTP)
RESEND_API_KEY=re_your_test_api_key

# Application
ENVIRONMENT=development
LOG_LEVEL=DEBUG

# CORS (allow local frontend)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Frontend
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Choose Your Development Method

**Option A: Docker (Easiest)**
```bash
# Start all services
docker compose -f docker-compose.production.yml up

# Access:
# - Frontend: http://localhost
# - API: http://localhost/api
# - API Docs: http://localhost/api/docs
```

**Option B: Local Development (More Control)**

See [Backend Development](#backend-development) and [Frontend Development](#frontend-development) sections below.

---

## Backend Development

### Setup Python Environment

```bash
cd api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install pytest pytest-cov black flake8 mypy
```

### Run Development Server

```bash
# From api/ directory with venv activated
uvicorn main:app --reload --port 8000

# Or with more verbose output
uvicorn main:app --reload --port 8000 --log-level debug
```

API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Project Structure

```
api/
├── app/
│   ├── core/              # Core functionality
│   │   ├── config.py      # Settings
│   │   ├── database.py    # DB connection
│   │   ├── security.py    # Auth & JWT
│   │   ├── email.py       # Email sending
│   │   └── dependencies.py # FastAPI dependencies
│   │
│   ├── models/            # SQLAlchemy models
│   │   ├── user.py
│   │   ├── worker_profile.py
│   │   └── care_home_profile.py
│   │
│   ├── routers/           # API endpoints
│   │   ├── auth.py
│   │   ├── worker.py
│   │   └── care_home.py
│   │
│   └── schemas/           # Pydantic schemas
│       ├── auth.py
│       ├── worker.py
│       └── care_home.py
│
├── alembic/               # Database migrations
├── main.py                # App entry point
└── requirements.txt       # Dependencies
```

### Creating New Endpoints

1. **Add route handler** in appropriate router file:

```python
# api/app/routers/worker.py
@router.get("/jobs")
def get_available_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Your logic here
    return {"jobs": []}
```

2. **Add request/response schemas** in `schemas/`:

```python
# api/app/schemas/job.py
from pydantic import BaseModel

class JobResponse(BaseModel):
    id: UUID
    title: str
    description: str
```

3. **Test the endpoint**:
- Visit http://localhost:8000/docs
- Or use curl: `curl http://localhost:8000/api/worker/jobs -H "Authorization: Bearer <token>"`

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Add jobs table"

# Review the generated migration
cat alembic/versions/XXXX_add_jobs_table.py

# Apply migration
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current version
alembic current

# Show migration history
alembic history
```

### Code Formatting

```bash
# Format code with Black
black .

# Check formatting
black . --check

# Lint with flake8
flake8 .

# Type checking with mypy
mypy .
```

---

## Frontend Development

### Setup Node Environment

```bash
cd web

# Install dependencies
npm install

# Install additional tools
npm install -D eslint prettier
```

### Run Development Server

```bash
# From web/ directory
npm start
```

App will be available at: http://localhost:3000

Hot reload is enabled - changes automatically refresh the browser.

### Project Structure (Planned)

```
web/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/          # Buttons, inputs, etc.
│   │   ├── auth/            # Login, register forms
│   │   └── layout/          # Header, footer, nav
│   │
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   ├── worker/
│   │   └── care-home/
│   │
│   ├── contexts/            # React Context
│   │   └── AuthContext.jsx
│   │
│   ├── services/            # API calls
│   │   └── api.js
│   │
│   ├── utils/               # Helpers
│   │   └── validators.js
│   │
│   ├── App.js               # Root component
│   └── index.js             # Entry point
│
├── public/                  # Static files
├── package.json
└── tailwind.config.js       # Tailwind config
```

### Creating New Components

1. **Create component file**:

```jsx
// src/components/common/Button.jsx
import React from 'react';

export default function Button({ children, variant = 'primary', ...props }) {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variantClasses = {
    primary: 'bg-sage text-white hover:bg-sage-dark',
    secondary: 'bg-terracotta text-white hover:bg-terracotta-dark'
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

2. **Use in pages**:

```jsx
import Button from '../components/common/Button';

function LoginPage() {
  return (
    <form>
      {/* ... */}
      <Button variant="primary">Log In</Button>
    </form>
  );
}
```

### API Integration

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic here
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Styling with Tailwind

Tailwind is configured with custom colors:

```jsx
// Use custom colors
<div className="bg-sage text-white">
  <h1 className="text-terracotta">Welcome</h1>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

**Custom colors available**:
- `sage` - #86a890 (for workers)
- `terracotta` - #c96228 (for care homes)
- `ocean` - #006fc4 (for accents)

---

## Database Setup

### Option 1: Use Neon (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `.env` as `NEON_DATABASE_URL`

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb vicarity

# Create user
psql postgres
CREATE USER vicarity_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE vicarity TO vicarity_user;
\q

# Update .env
NEON_DATABASE_URL=postgresql://vicarity_user:dev_password@localhost/vicarity
```

### Initialize Database

```bash
cd api

# Run migrations
alembic upgrade head

# Seed qualifications (if needed)
python -c "
from app.models.qualification import seed_qualifications
from app.core.database import SessionLocal
db = SessionLocal()
seed_qualifications(db)
db.close()
"
```

### Database Tools

**pgAdmin** (GUI):
1. Download from [pgadmin.org](https://www.pgadmin.org/)
2. Add new server with your connection details

**psql** (CLI):
```bash
# Connect to database
psql "postgresql://user:pass@host/db"

# List tables
\dt

# Describe table
\d users

# Run query
SELECT * FROM users LIMIT 10;
```

---

## Running Tests

### Backend Tests

```bash
cd api

# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_register_user

# Verbose output
pytest -v

# Stop on first failure
pytest -x
```

### Frontend Tests

```bash
cd web

# Run all tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

### Writing Tests

**Backend test example**:
```python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "SecurePass123!",
        "user_type": "worker"
    })
    assert response.status_code == 201
    assert "user_id" in response.json()
```

**Frontend test example**:
```jsx
// src/components/__tests__/Button.test.jsx
import { render, screen } from '@testing-library/react';
import Button from '../common/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

---

## Code Style

### Python (Backend)

**Follow PEP 8**:
- Line length: 88 characters (Black default)
- Indentation: 4 spaces
- Use type hints
- Docstrings for all public functions

**Example**:
```python
from typing import Optional
from pydantic import BaseModel

def calculate_completion(profile: "WorkerProfile") -> int:
    """
    Calculate profile completion percentage.
    
    Args:
        profile: WorkerProfile instance
    
    Returns:
        Completion percentage (0-100)
    """
    # Implementation
    return 0
```

### JavaScript (Frontend)

**Use ESLint + Prettier**:
- Use functional components with hooks
- Destructure props
- Use meaningful variable names
- Add JSDoc comments for complex functions

**Example**:
```jsx
/**
 * Login form component
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback after successful login
 */
export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

---

## Git Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/worker-dashboard`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring
- `test/` - Adding tests

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add worker profile completion wizard"
git commit -m "Fix email verification token expiry"
git commit -m "Update API documentation for auth endpoints"

# Bad
git commit -m "updates"
git commit -m "fix bug"
git commit -m "wip"
```

### Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/add-job-board

# 2. Make changes and commit
git add .
git commit -m "Add job board UI components"

# 3. Push to GitHub
git push origin feature/add-job-board

# 4. Create Pull Request
# Go to GitHub and create PR from your branch to main

# 5. After PR is approved and merged
git checkout main
git pull origin main
git branch -d feature/add-job-board
```

---

## Debugging

### Backend Debugging

**Print debugging**:
```python
print(f"User ID: {user.id}")
print(f"Profile: {profile.__dict__}")
```

**Use debugger (pdb)**:
```python
import pdb; pdb.set_trace()
```

**VS Code debugging**:
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload"],
      "cwd": "${workspaceFolder}/api"
    }
  ]
}
```

### Frontend Debugging

**Console logging**:
```javascript
console.log('User data:', user);
console.table(users); // For arrays
console.error('Error occurred:', error);
```

**React DevTools**:
Install browser extension for inspecting component state.

**Network tab**:
Use browser DevTools to inspect API calls.

---

## Common Tasks

### Add a New API Endpoint

1. Create route in `routers/`
2. Add schemas in `schemas/`
3. Implement logic
4. Test in `/docs`
5. Write tests
6. Update API documentation

### Add a New Frontend Page

1. Create component in `pages/`
2. Add route in `App.js`
3. Create API service function
4. Style with Tailwind
5. Test navigation
6. Write component tests

### Update Database Schema

1. Modify model in `models/`
2. Generate migration: `alembic revision --autogenerate -m "Description"`
3. Review migration file
4. Apply: `alembic upgrade head`
5. Update schemas if needed

### Fix a Bug

1. Reproduce the bug locally
2. Write a failing test
3. Fix the code
4. Verify test passes
5. Test manually
6. Commit with clear message

---

## Environment-Specific Notes

### macOS Development

```bash
# Install dependencies via Homebrew
brew install python@3.11 node postgresql

# Activate venv
source api/venv/bin/activate
```

### Windows Development

```bash
# Use Windows Terminal or Git Bash

# Activate venv
api\venv\Scripts\activate

# Use PowerShell for Docker commands
```

### Linux Development

```bash
# Install dependencies via apt (Ubuntu/Debian)
sudo apt install python3.11 python3.11-venv nodejs npm postgresql

# Activate venv
source api/venv/bin/activate
```

---

## Getting Help

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org
- **Project Docs**: [/docs](./README.md)

---

## Next Steps

1. Complete the [Quick Start](#local-setup)
2. Review the [Architecture](./ARCHITECTURE.md)
3. Explore the [API Documentation](./API.md)
4. Start building! Check [vibe/PROJECT_STATUS.md](../vibe/PROJECT_STATUS.md) for priorities

Happy coding! 🚀
