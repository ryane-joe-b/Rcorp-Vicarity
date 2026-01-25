#!/bin/bash
#===============================================================================
# MANUAL DEPLOYMENT SCRIPT
#
# Use this to deploy manually from your local machine until GitHub Actions
# SSH is working.
#
# Usage:
#   ./infra/manual-deploy.sh YOUR_SERVER_IP
#===============================================================================

set -e

SERVER_IP="$1"

if [ -z "$SERVER_IP" ]; then
    echo "Usage: ./infra/manual-deploy.sh YOUR_SERVER_IP"
    exit 1
fi

echo "==============================================================================="
echo "MANUAL DEPLOYMENT TO $SERVER_IP"
echo "==============================================================================="
echo ""

# Step 1: Push to GitHub
echo "Step 1: Pushing to GitHub..."
git push origin main
echo "✓ Pushed to GitHub"
echo ""

# Step 2: SSH and deploy
echo "Step 2: Deploying on server..."
echo ""

ssh deploy@$SERVER_IP << 'ENDSSH'
set -e

cd ~/vicarity

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Building containers ==="
docker compose -f docker-compose.production.yml build

echo "=== Starting services ==="
docker compose -f docker-compose.production.yml up -d

echo "=== Waiting for services to start ==="
sleep 30

echo "=== Health check ==="
docker compose -f docker-compose.production.yml ps

echo ""
echo "=== Testing API ==="
curl -f http://localhost:8000/health || echo "API not responding yet"

echo ""
echo "=== Deployment complete! ==="
ENDSSH

echo ""
echo "==============================================================================="
echo "✓ DEPLOYMENT COMPLETE"
echo "==============================================================================="
echo ""
echo "Check your site at: https://vicarity.co.uk"
echo ""
