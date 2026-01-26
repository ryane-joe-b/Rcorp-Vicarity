#!/bin/bash
#===============================================================================
# EMERGENCY RECOVERY SCRIPT
# Run this on the production server to restore service NOW
#===============================================================================

set -e

echo "=== VICARITY EMERGENCY RECOVERY ==="
echo "Starting at $(date)"
echo ""

cd /home/deploy/vicarity

# Pull latest code (has the type annotation fix)
echo "1. Pulling latest code..."
git fetch origin main
git reset --hard origin/main
echo "Current commit: $(git log -1 --oneline)"
echo ""

# Stop everything
echo "2. Stopping all services..."
docker compose -f docker-compose.production.yml down
echo ""

# Remove problematic volume
echo "3. Removing web-static volume..."
docker volume rm vicarity_web-static 2>/dev/null || echo "Volume doesn't exist"
echo ""

# Rebuild everything
echo "4. Rebuilding all containers (this takes 2-3 minutes)..."
docker compose -f docker-compose.production.yml build --no-cache
echo ""

# Start everything
echo "5. Starting all services..."
docker compose -f docker-compose.production.yml up -d
echo ""

# Wait for startup
echo "6. Waiting 20 seconds for services to initialize..."
sleep 20
echo ""

# Check status
echo "7. Checking container status..."
docker compose -f docker-compose.production.yml ps
echo ""

# Test API
echo "8. Testing API health..."
if curl -sf http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ API is healthy!"
    curl http://localhost/api/health | jq . 2>/dev/null || curl http://localhost/api/health
else
    echo "❌ API health check failed!"
    echo "API Logs:"
    docker compose -f docker-compose.production.yml logs api --tail=30
fi
echo ""

# Test frontend
echo "9. Testing frontend..."
if curl -sf http://localhost/ | grep -q "root"; then
    echo "✅ Frontend is responding!"
else
    echo "❌ Frontend check failed!"
    echo "Web Logs:"
    docker compose -f docker-compose.production.yml logs web --tail=20
    echo "Nginx Logs:"
    docker compose -f docker-compose.production.yml logs nginx --tail=20
fi
echo ""

echo "=== Recovery complete at $(date) ==="
echo ""
echo "TEST FROM YOUR MACHINE:"
echo "  curl https://vicarity.co.uk/health"
echo "  curl https://vicarity.co.uk/api/public/stats"
echo "  Open https://vicarity.co.uk in browser"
echo ""
echo "VIEW LOGS:"
echo "  docker compose -f docker-compose.production.yml logs -f"
