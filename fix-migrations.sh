#!/bin/bash
# Fix Alembic migration state on production server

echo "=== Fixing Alembic Migration State ==="

# SSH into production and fix the alembic_version table
ssh -i ~/.ssh/id_ed25519 deploy@87.106.103.254 << 'ENDSSH'
cd /var/www/vicarity

echo "1. Checking current migration state..."
docker compose -f docker-compose.production.yml exec -T db psql -U vicarity_user -d vicarity_db -c "SELECT * FROM alembic_version;" || echo "No alembic_version table yet"

echo "2. Dropping alembic_version table to start fresh..."
docker compose -f docker-compose.production.yml exec -T db psql -U vicarity_user -d vicarity_db -c "DROP TABLE IF EXISTS alembic_version;"

echo "3. Checking if worker_profiles table exists..."
docker compose -f docker-compose.production.yml exec -T db psql -U vicarity_user -d vicarity_db -c "\d worker_profiles" | head -20

echo "4. Stamping database to head (marking all migrations as applied)..."
docker compose -f docker-compose.production.yml exec -T api alembic stamp head

echo "5. Verifying migration state..."
docker compose -f docker-compose.production.yml exec -T db psql -U vicarity_user -d vicarity_db -c "SELECT * FROM alembic_version;"

echo "✅ Migration state fixed!"
ENDSSH
