# Database Setup Commands - Production Ready

**For Vicarity Production Server**

Copy and paste these commands directly into your production server terminal.

---

## Step-by-Step Production Setup

### Prerequisites

- SSH access to production server
- Server is at: `87.106.103.254` (based on PROJECT_STATUS.md)
- Docker containers are running
- `.env` file has `NEON_DATABASE_URL` configured

---

## 🚀 Execute These Commands

### 1. SSH to Production Server

```bash
ssh deploy@87.106.103.254
cd /home/deploy/vicarity
```

### 2. Generate Initial Migration

This creates the migration file that will set up all tables.

```bash
docker compose -f docker-compose.production.yml exec api \
  alembic revision --autogenerate -m "Initial schema"
```

**✅ Success looks like**:
```
INFO  [alembic.autogenerate.compare] Detected added table 'users'
INFO  [alembic.autogenerate.compare] Detected added table 'qualifications'
INFO  [alembic.autogenerate.compare] Detected added table 'worker_profiles'
INFO  [alembic.autogenerate.compare] Detected added table 'care_home_profiles'
Generating /app/alembic/versions/XXXX_initial_schema.py ...  done
```

### 3. Review the Migration (Optional but Recommended)

```bash
# See what the migration will do
docker compose -f docker-compose.production.yml exec api sh -c \
  'cat alembic/versions/*_initial_schema.py | head -50'
```

### 4. Apply the Migration

This actually creates the database tables.

```bash
docker compose -f docker-compose.production.yml exec api \
  alembic upgrade head
```

**✅ Success looks like**:
```
INFO  [alembic.runtime.migration] Running upgrade  -> abc123, Initial schema
```

### 5. Seed Qualifications Data

Populate the database with 24 UK care qualifications.

```bash
docker compose -f docker-compose.production.yml exec api \
  python seed_db.py
```

**✅ Success looks like**:
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

### 6. Verify Everything Worked

```bash
# Check migration status
docker compose -f docker-compose.production.yml exec api \
  alembic current

# Should show: abc123def456 (head)

# Check tables were created
docker compose -f docker-compose.production.yml exec api python -c "
from app.core.database import engine
from sqlalchemy import inspect
inspector = inspect(engine)
print('Tables created:', ', '.join(inspector.get_table_names()))
"

# Should show: Tables created: alembic_version, users, worker_profiles, care_home_profiles, qualifications

# Check qualifications count
docker compose -f docker-compose.production.yml exec api python -c "
from app.core.database import SessionLocal
from app.models.qualification import Qualification
db = SessionLocal()
count = db.query(Qualification).count()
print(f'Total qualifications: {count}')
db.close()
"

# Should show: Total qualifications: 24
```

---

## 🎉 Done!

If all verification commands succeeded, your database is ready!

### What Was Created:

- ✅ **users** table - For authentication
- ✅ **worker_profiles** table - For care worker profiles  
- ✅ **care_home_profiles** table - For care home profiles
- ✅ **qualifications** table - With 24 UK care qualifications
- ✅ **alembic_version** table - For migration tracking

### Next Steps:

1. Test user registration: `curl https://vicarity.co.uk/api/auth/register ...`
2. Test authentication flow
3. Build frontend pages
4. Start onboarding users!

---

## Troubleshooting

### If migration fails with "table already exists"

The database might have tables from the old `create_all()` method. You'll need to drop them:

```bash
# Connect to Neon database
# (Get the connection string from your .env file)

# Drop existing tables (CAREFUL - this deletes data!)
# Only do this if the migration failed and you're sure it's safe

# Then retry the migration
docker compose -f docker-compose.production.yml exec api \
  alembic upgrade head
```

### If you see "No module named 'app'"

The container might need a rebuild:

```bash
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

Then retry the migration commands.

### If you see connection errors

Check your database URL:

```bash
# Verify NEON_DATABASE_URL is set
docker compose -f docker-compose.production.yml exec api python -c "
from app.core.config import settings
print('Database configured:', 'Yes' if settings.db_url else 'No')
"
```

If it says "No", check your `.env` file has the correct `NEON_DATABASE_URL`.

---

## Optional: Remove Legacy create_all() Code

After migrations work, you can optionally update `main.py` to remove the old table creation:

```bash
# Edit api/main.py
nano api/main.py

# Find this line:
#   Base.metadata.create_all(bind=engine)
# 
# Change to:
#   # Tables managed by Alembic - run: alembic upgrade head
```

This is optional - the app will work fine either way.

---

## Quick Reference

| Task | Command |
|------|---------|
| **SSH to server** | `ssh deploy@87.106.103.254` |
| **Create migration** | `docker compose -f docker-compose.production.yml exec api alembic revision --autogenerate -m "Message"` |
| **Apply migrations** | `docker compose -f docker-compose.production.yml exec api alembic upgrade head` |
| **Rollback migration** | `docker compose -f docker-compose.production.yml exec api alembic downgrade -1` |
| **Check status** | `docker compose -f docker-compose.production.yml exec api alembic current` |
| **Seed data** | `docker compose -f docker-compose.production.yml exec api python seed_db.py` |
| **View logs** | `docker compose -f docker-compose.production.yml logs -f api` |

---

**Ready to go?** Just copy-paste the commands from "Execute These Commands" section above!
