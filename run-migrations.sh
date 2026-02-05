#!/bin/bash

# Run database migrations on production
# This script should be run on the production server

set -e

echo "🔄 Running database migrations..."

# Run migrations in the API container
docker compose -f docker-compose.production.yml exec -T api alembic upgrade head

echo "✅ Migrations completed successfully!"

# Check current migration version
echo ""
echo "Current migration version:"
docker compose -f docker-compose.production.yml exec -T api alembic current
