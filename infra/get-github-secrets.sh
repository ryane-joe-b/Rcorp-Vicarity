#!/bin/bash
#===============================================================================
# GET GITHUB SECRETS
# 
# Run this script ON YOUR SERVER to get the values needed for GitHub Secrets
#
# Usage: ssh deploy@YOUR_SERVER_IP 'bash -s' < infra/get-github-secrets.sh
#===============================================================================

echo "==============================================================================="
echo "GITHUB SECRETS FOR VICARITY"
echo "==============================================================================="
echo ""
echo "Add these to: https://github.com/ryane-joe-b/Rcorp-Vicarity/settings/secrets/actions"
echo ""

echo "-------------------------------------------------------------------------------"
echo "SECRET: VPS_HOST"
echo "-------------------------------------------------------------------------------"
curl -s ifconfig.me
echo ""
echo ""

echo "-------------------------------------------------------------------------------"
echo "SECRET: VPS_USER"
echo "-------------------------------------------------------------------------------"
echo "deploy"
echo ""

echo "-------------------------------------------------------------------------------"
echo "SECRET: VPS_SSH_KEY"
echo "-------------------------------------------------------------------------------"
echo "(Copy EVERYTHING below, including BEGIN and END lines)"
echo ""
cat ~/.ssh/id_ed25519
echo ""

echo "-------------------------------------------------------------------------------"
echo "ALSO NEEDED (from your .env file):"
echo "-------------------------------------------------------------------------------"
echo "SECRET: NEON_DATABASE_URL"
echo "SECRET: RESEND_API_KEY"
echo "SECRET: SECRET_KEY (generate with: openssl rand -hex 32)"
echo "SECRET: ALLOWED_ORIGINS (e.g., https://vicarity.co.uk)"
echo ""
echo "VARIABLE: PRODUCTION_URL (e.g., https://vicarity.co.uk)"
echo ""
echo "==============================================================================="
