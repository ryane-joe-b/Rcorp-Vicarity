# Database Setup Guide

Complete guide to setting up and managing the Vicarity database.

---

## Quick Start

### Option 1: Using Docker (Recommended for Production)

```bash
# SSH to production server
ssh deploy@YOUR_SERVER_IP
cd /home/deploy/vicarity

# Generate initial migration
docker compose -f docker-compose.production.yml exec api alembic revision --autogenerate -m "Initial schema"

# Apply migration
docker compose -f docker-compose.production.yml exec api alembic upgrade head

# Seed qualifications
docker compose -f docker-compose.production.yml exec api python seed_db.py

# Verify
docker compose -f docker-compose.production.yml exec api alembic current
```

### Option 2: Local Development

```bash
cd api

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Generate initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head

# Seed data
python seed_db.py

# Verify
alembic current
```

---

## Detailed Steps

### 1. Generate Initial Migration

This creates the migration file that will create all database tables.

**Production**:
```bash
docker compose -f docker-compose.production.yml exec api \
  alembic revision --autogenerate -m "Initial schema"
```

**Local**:
```bash
cd api
alembic revision --autogenerate -m "Initial schema"
```

**Expected Output**:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added table 'users'
INFO  [alembic.autogenerate.compare] Detected added table 'qualifications'
INFO  [alembic.autogenerate.compare] Detected added table 'worker_profiles'
INFO  [alembic.autogenerate.compare] Detected added table 'care_home_profiles'
  Generating /app/alembic/versions/XXXX_initial_schema.py ...  done
```

### 2. Review the Migration

Before applying, review the generated migration file:

**Production**:
```bash
docker compose -f docker-compose.production.yml exec api \
  cat alembic/versions/*_initial_schema.py
```

**Local**:
```bash
cat api/alembic/versions/*_initial_schema.py
```

Check that it includes:
- `users` table
- `worker_profiles` table
- `care_home_profiles` table  
- `qualifications` table
- Proper indexes
- Foreign key constraints

### 3. Apply Migration

Run the migration to create tables:

**Production**:
```bash
docker compose -f docker-compose.production.yml exec api \
  alembic upgrade head
```

**Local**:
```bash
alembic upgrade head
```

**Expected Output**:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> abc123, Initial schema
```

### 4. Seed Qualifications

Populate the qualifications table with UK care qualifications:

**Production**:
```bash
docker compose -f docker-compose.production.yml exec api \
  python seed_db.py
```

**Local**:
```bash
python seed_db.py
```

**Expected Output**:
```
============================================================
Vicarity Database Seeding
============================================================

📚 Seeding qualifications...
✅ Seeded 24 qualifications

============================================================
✅ Database seeding complete!
============================================================
```

### 5. Verify Setup

Check migration status:

**Production**:
```bash
docker compose -f docker-compose.production.yml exec api \
  alembic current
```

**Local**:
```bash
alembic current
```

**Expected Output**:
```
abc123def456 (head)
```

Check tables exist:

**Production**:
```bash
docker compose -f docker-compose.production.yml exec api python -c "
from app.core.database import engine
from sqlalchemy import inspect
inspector = inspect(engine)
print('Tables:', inspector.get_table_names())
"
```

**Local**:
```bash
python -c "
from app.core.database import engine
from sqlalchemy import inspect
inspector = inspect(engine)
print('Tables:', inspector.get_table_names())
"
```

**Expected Output**:
```
Tables: ['alembic_version', 'users', 'worker_profiles', 'care_home_profiles', 'qualifications']
```

Check qualifications were seeded:

**Production**:
```bash
docker compose -f docker-compose.production.yml exec api python -c "
from app.core.database import SessionLocal
from app.models.qualification import Qualification
db = SessionLocal()
count = db.query(Qualification).count()
print(f'Qualifications in database: {count}')
db.close()
"
```

**Local**:
```bash
python -c "
from app.core.database import SessionLocal
from app.models.qualification import Qualification
db = SessionLocal()
count = db.query(Qualification).count()
print(f'Qualifications in database: {count}')
db.close()
"
```

**Expected Output**:
```
Qualifications in database: 24
```

---

## Database Schema

### Tables Created

1. **users** - Authentication and user accounts
   - Stores email, password hash, role
   - Email verification status
   - Password reset tokens

2. **worker_profiles** - Care worker profiles
   - Personal information (name, phone, DOB, address)
   - Qualifications (JSONB)
   - Skills and experience
   - Availability preferences
   - Profile completion tracking (4 steps)

3. **care_home_profiles** - Care home profiles
   - Business information
   - CQC registration details
   - Contact information
   - Verification status

4. **qualifications** - Master list of qualifications
   - 24 UK care qualifications pre-seeded
   - Categories: mandatory, clinical, specialized, professional
   - Expiry tracking

### Relationships

```
users (1) ─────► (1) worker_profiles
users (1) ─────► (1) care_home_profiles
```

### Indexes

- `users.email` (unique)
- `worker_profiles.user_id` (foreign key)
- `care_home_profiles.user_id` (foreign key)
- `qualifications.code` (unique)

---

## Common Database Operations

### Create a New Migration

When you modify models:

```bash
# Production
docker compose -f docker-compose.production.yml exec api \
  alembic revision --autogenerate -m "Description of changes"

# Local
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations

```bash
# Production
docker compose -f docker-compose.production.yml exec api \
  alembic upgrade head

# Local
alembic upgrade head
```

### Rollback Migration

```bash
# Rollback one migration
docker compose -f docker-compose.production.yml exec api \
  alembic downgrade -1

# Rollback to specific revision
docker compose -f docker-compose.production.yml exec api \
  alembic downgrade abc123
```

### View Migration History

```bash
# Production
docker compose -f docker-compose.production.yml exec api \
  alembic history

# Local
alembic history
```

### Check Current Version

```bash
# Production
docker compose -f docker-compose.production.yml exec api \
  alembic current

# Local
alembic current
```

---

## Troubleshooting

### Migration Fails with "Table already exists"

This means tables were created via `Base.metadata.create_all()` instead of migrations.

**Solution**: Drop and recreate:

```bash
# DANGER: This deletes all data!
# Backup first if needed

# Access database directly
psql "YOUR_NEON_DATABASE_URL"

# Drop all tables
DROP TABLE IF EXISTS care_home_profiles CASCADE;
DROP TABLE IF EXISTS worker_profiles CASCADE;
DROP TABLE IF EXISTS qualifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS alembic_version CASCADE;

# Exit psql
\q

# Now run migrations
alembic upgrade head
```

### "alembic_version table doesn't exist"

First time running migrations. This is normal.

**Solution**: Just run `alembic upgrade head`

### "Target database is not up to date"

Your local database is behind the migration files.

**Solution**: 
```bash
alembic upgrade head
```

### Connection Error

Check your database URL:

```bash
# Print current database URL (sanitized)
python -c "
from app.core.config import settings
url = settings.db_url
print('Database:', url.split('@')[1] if '@' in url else 'Not configured')
"
```

Verify in `.env`:
- `NEON_DATABASE_URL` is set correctly
- URL includes `?sslmode=require` for Neon
- No spaces or line breaks in the URL

---

## Database Backup & Restore

### Backup (Neon Dashboard)

Neon provides automatic backups. To create a manual backup:

1. Go to Neon dashboard
2. Select your project
3. Click "Backups"
4. Click "Create backup"

### Manual Backup (SQL Dump)

```bash
# Backup
pg_dump "YOUR_NEON_DATABASE_URL" > backup_$(date +%Y%m%d).sql

# Restore
psql "YOUR_NEON_DATABASE_URL" < backup_20260125.sql
```

---

## Removing the Legacy create_all() Call

After migrations are set up, remove the old table creation code:

Edit `api/main.py`:

**Before**:
```python
# Create database tables (in production, use Alembic migrations)
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
```

**After**:
```python
# Database tables are managed via Alembic migrations
# To create tables, run: alembic upgrade head
print("Database ready (tables managed by Alembic)")
```

---

## Next Steps

After database setup is complete:

1. ✅ Migrations applied
2. ✅ Qualifications seeded
3. ✅ Tables verified
4. ⏸️ Test user registration via API
5. ⏸️ Test profile creation
6. ⏸️ Build frontend authentication

---

**Questions?** Check:
- [API Documentation](../docs/API.md)
- [Development Guide](../docs/DEVELOPMENT.md)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org)
- [Alembic Docs](https://alembic.sqlalchemy.org)
