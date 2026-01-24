#!/bin/bash
#===============================================================================
# INITIALIZE VICARITY REPOSITORY
#
# Run this script to push the deployment system to your GitHub repo.
#
# USAGE:
#   cd vicarity
#   ./init-repo.sh
#===============================================================================

set -e

echo "==============================================================================="
echo "INITIALIZING VICARITY REPOSITORY"
echo "==============================================================================="
echo ""

# Initialize git if not already
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main
fi

# Add remote if not exists
if ! git remote | grep -q origin; then
    echo "Adding GitHub remote..."
    git remote add origin git@github.com:ryane-joe-b/Rcorp-Vicarity.git
fi

# Stage all files
echo "Staging files..."
git add .

# Show what will be committed
echo ""
echo "Files to be committed:"
git status --short
echo ""

# Commit
echo "Creating initial commit..."
git commit -m "Initial deployment system setup

- Server setup script (infra/setup-server.sh)
- Docker Compose production config
- GitHub Actions CI/CD workflow
- Nginx reverse proxy with SSL
- Health checks and monitoring
- Complete deployment guide"

# Push
echo ""
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "==============================================================================="
echo "SUCCESS! Repository initialized."
echo "==============================================================================="
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/ryane-joe-b/Rcorp-Vicarity"
echo "2. Click Settings > Secrets and variables > Actions"
echo "3. Add your secrets (see DEPLOYMENT_GUIDE.md)"
echo ""
