"""
fix_migration_heads.py

Removes stale rows from the alembic_version table when multiple
revision IDs are present (the "multiple heads" problem).

Keeps only the single highest revision in the known migration chain,
then exits 0. If the table already has exactly one row, does nothing.

Run before 'alembic upgrade head' in the deploy workflow.
"""

import os
import sys
from sqlalchemy import create_engine, text

# Ordered migration chain — oldest first
CHAIN = [
    "001_add_emergency_contact_and_county",
    "002_add_availability_fields",
    "003_rename_hourly_rate_fields",
    "004_add_jobs_and_applications",
    "005_add_worker_availability",
]

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set", file=sys.stderr)
    sys.exit(1)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    rows = [r[0] for r in conn.execute(text("SELECT version_num FROM alembic_version")).fetchall()]
    print(f"alembic_version rows: {rows}")

    if len(rows) <= 1:
        print("Single head — nothing to fix.")
        sys.exit(0)

    # Find the highest revision in our known chain that's present in the DB
    present_in_chain = [r for r in CHAIN if r in rows]

    if not present_in_chain:
        print("WARNING: No known revisions found in alembic_version — leaving unchanged.")
        sys.exit(0)

    keep = present_in_chain[-1]
    stale = [r for r in rows if r != keep]

    print(f"Multiple heads detected. Keeping '{keep}', removing: {stale}")
    conn.execute(text("DELETE FROM alembic_version WHERE version_num != :keep"), {"keep": keep})
    conn.commit()
    print(f"Fixed. alembic_version now points to '{keep}'.")
