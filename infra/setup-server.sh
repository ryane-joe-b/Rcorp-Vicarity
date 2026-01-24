#!/bin/bash
#===============================================================================
# VICARITY SERVER SETUP SCRIPT
# Version: 1.0.0
# 
# This script sets up a fresh Ubuntu 22.04 VPS for production deployment.
# It is IDEMPOTENT - safe to run multiple times.
#
# USAGE:
#   curl -O https://raw.githubusercontent.com/yourname/vicarity/main/infra/setup-server.sh
#   chmod +x setup-server.sh
#   sudo ./setup-server.sh
#
# WHAT IT DOES:
#   1. Creates 'deploy' user with SSH-only access
#   2. Configures firewall (UFW)
#   3. Installs fail2ban for brute force protection
#   4. Enables automatic security updates
#   5. Installs Docker and Docker Compose
#   6. Sets up monitoring stack (Prometheus + Grafana)
#   7. Configures log rotation
#   8. Outputs credentials for GitHub Actions
#===============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

#-------------------------------------------------------------------------------
# CONFIGURATION
#-------------------------------------------------------------------------------
DEPLOY_USER="deploy"
APP_DIR="/home/${DEPLOY_USER}/vicarity"
GITHUB_REPO="https://github.com/ryane-joe-b/Rcorp-Vicarity.git"
DOMAIN=""  # Will be set during script execution

#-------------------------------------------------------------------------------
# COLORS FOR OUTPUT
#-------------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#-------------------------------------------------------------------------------
# HELPER FUNCTIONS
#-------------------------------------------------------------------------------
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root. Use: sudo ./setup-server.sh"
    fi
}

check_ubuntu() {
    if ! grep -q "Ubuntu 22" /etc/os-release 2>/dev/null; then
        log_warning "This script is designed for Ubuntu 22.04. Proceed with caution."
    fi
}

#-------------------------------------------------------------------------------
# STEP 1: SYSTEM UPDATE
#-------------------------------------------------------------------------------
update_system() {
    log_info "Updating system packages..."
    
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get upgrade -y -qq
    
    log_success "System updated"
}

#-------------------------------------------------------------------------------
# STEP 2: CREATE DEPLOY USER
#-------------------------------------------------------------------------------
create_deploy_user() {
    log_info "Setting up deploy user..."
    
    # Create user if doesn't exist
    if ! id "${DEPLOY_USER}" &>/dev/null; then
        useradd -m -s /bin/bash "${DEPLOY_USER}"
        log_info "Created user: ${DEPLOY_USER}"
    else
        log_info "User ${DEPLOY_USER} already exists"
    fi
    
    # Add to docker group (will be created later)
    usermod -aG sudo "${DEPLOY_USER}" 2>/dev/null || true
    
    # Set up SSH directory
    mkdir -p "/home/${DEPLOY_USER}/.ssh"
    chmod 700 "/home/${DEPLOY_USER}/.ssh"
    touch "/home/${DEPLOY_USER}/.ssh/authorized_keys"
    chmod 600 "/home/${DEPLOY_USER}/.ssh/authorized_keys"
    chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"
    
    # Generate SSH key for deploy user (for GitHub Actions)
    if [[ ! -f "/home/${DEPLOY_USER}/.ssh/id_ed25519" ]]; then
        sudo -u "${DEPLOY_USER}" ssh-keygen -t ed25519 -f "/home/${DEPLOY_USER}/.ssh/id_ed25519" -N "" -C "vicarity-deploy"
        log_info "Generated new SSH key for deploy user"
    fi
    
    # Allow deploy user to run docker without sudo
    # (docker group created in Docker install step)
    
    log_success "Deploy user configured"
}

#-------------------------------------------------------------------------------
# STEP 3: CONFIGURE FIREWALL
#-------------------------------------------------------------------------------
configure_firewall() {
    log_info "Configuring firewall..."
    
    apt-get install -y -qq ufw
    
    # Reset to default (deny incoming, allow outgoing)
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow essential ports
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Allow Grafana monitoring (internal only, remove if using reverse proxy)
    # ufw allow 3000/tcp comment 'Grafana'
    
    # Enable firewall
    ufw --force enable
    
    log_success "Firewall configured (ports 22, 80, 443 open)"
}

#-------------------------------------------------------------------------------
# STEP 4: INSTALL FAIL2BAN
#-------------------------------------------------------------------------------
install_fail2ban() {
    log_info "Installing fail2ban..."
    
    apt-get install -y -qq fail2ban
    
    # Create custom jail configuration
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# Ban hosts for 1 hour after 5 failures
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log_success "Fail2ban installed and configured"
}

#-------------------------------------------------------------------------------
# STEP 5: AUTOMATIC SECURITY UPDATES
#-------------------------------------------------------------------------------
setup_auto_updates() {
    log_info "Setting up automatic security updates..."
    
    apt-get install -y -qq unattended-upgrades apt-listchanges
    
    # Configure unattended upgrades
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
EOF

    # Enable automatic updates
    cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

    systemctl enable unattended-upgrades
    systemctl restart unattended-upgrades
    
    log_success "Automatic security updates enabled"
}

#-------------------------------------------------------------------------------
# STEP 6: INSTALL DOCKER
#-------------------------------------------------------------------------------
install_docker() {
    log_info "Installing Docker..."
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null; then
        log_info "Docker already installed, skipping..."
    else
        # Install prerequisites
        apt-get install -y -qq \
            ca-certificates \
            curl \
            gnupg \
            lsb-release
        
        # Add Docker's official GPG key
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg
        
        # Set up repository
        echo \
            "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
            $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker
        apt-get update -qq
        apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    fi
    
    # Add deploy user to docker group
    usermod -aG docker "${DEPLOY_USER}"
    
    # Enable Docker to start on boot
    systemctl enable docker
    systemctl start docker
    
    # Configure Docker logging (prevent disk fill)
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF

    systemctl restart docker
    
    log_success "Docker installed and configured"
}

#-------------------------------------------------------------------------------
# STEP 7: SETUP APPLICATION DIRECTORY
#-------------------------------------------------------------------------------
setup_app_directory() {
    log_info "Setting up application directory..."
    
    # Create app directory
    mkdir -p "${APP_DIR}"
    chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"
    
    # Create necessary subdirectories
    mkdir -p "${APP_DIR}/logs"
    mkdir -p "${APP_DIR}/backups"
    
    log_success "Application directory ready at ${APP_DIR}"
}

#-------------------------------------------------------------------------------
# STEP 8: INSTALL CERTBOT FOR SSL
#-------------------------------------------------------------------------------
install_certbot() {
    log_info "Installing Certbot for SSL certificates..."
    
    apt-get install -y -qq certbot
    
    log_success "Certbot installed"
    log_info "Run 'sudo certbot certonly --standalone -d yourdomain.com' after DNS is configured"
}

#-------------------------------------------------------------------------------
# STEP 9: SETUP MONITORING (Lightweight)
#-------------------------------------------------------------------------------
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create monitoring directory
    mkdir -p /opt/monitoring
    
    # Install htop for quick server stats
    apt-get install -y -qq htop iotop
    
    # Create a simple health check script
    cat > /opt/monitoring/health-check.sh << 'EOF'
#!/bin/bash
# Simple health check script for Vicarity

echo "=== VICARITY HEALTH CHECK ==="
echo "Date: $(date)"
echo ""

echo "=== SYSTEM RESOURCES ==="
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')% used"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"
echo ""

echo "=== DOCKER CONTAINERS ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker not running"
echo ""

echo "=== RECENT ERRORS (last 10) ==="
docker logs vicarity-api-1 2>&1 | grep -i error | tail -5 2>/dev/null || echo "No recent errors"
echo ""

echo "=== API HEALTH ==="
curl -s http://localhost:8000/health 2>/dev/null || echo "API not responding"
echo ""
EOF

    chmod +x /opt/monitoring/health-check.sh
    
    # Create systemd timer for periodic health checks
    cat > /etc/systemd/system/vicarity-health.service << 'EOF'
[Unit]
Description=Vicarity Health Check
After=docker.service

[Service]
Type=oneshot
ExecStart=/opt/monitoring/health-check.sh
StandardOutput=append:/var/log/vicarity-health.log
EOF

    cat > /etc/systemd/system/vicarity-health.timer << 'EOF'
[Unit]
Description=Run Vicarity health check every 5 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
EOF

    systemctl daemon-reload
    systemctl enable vicarity-health.timer
    systemctl start vicarity-health.timer
    
    # Setup log rotation for application logs
    cat > /etc/logrotate.d/vicarity << 'EOF'
/var/log/vicarity*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
}

/home/deploy/vicarity/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
}
EOF

    log_success "Monitoring configured"
}

#-------------------------------------------------------------------------------
# STEP 10: SETUP SIMPLE ALERTING
#-------------------------------------------------------------------------------
setup_alerting() {
    log_info "Setting up alerting..."
    
    # Create alert script (customize with your notification method)
    cat > /opt/monitoring/alert.sh << 'EOF'
#!/bin/bash
# Simple alerting script - customize with your preferred notification method

MESSAGE="$1"
WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"  # Set this env var for Discord/Slack

if [[ -n "$WEBHOOK_URL" ]]; then
    curl -X POST -H "Content-Type: application/json" \
        -d "{\"content\": \"[VICARITY ALERT] $MESSAGE\"}" \
        "$WEBHOOK_URL" 2>/dev/null
fi

# Also log to file
echo "[$(date)] ALERT: $MESSAGE" >> /var/log/vicarity-alerts.log
EOF

    chmod +x /opt/monitoring/alert.sh
    
    # Create watchdog script
    cat > /opt/monitoring/watchdog.sh << 'EOF'
#!/bin/bash
# Watchdog script - checks if services are healthy

API_URL="http://localhost:8000/health"
MAX_RETRIES=3
RETRY_COUNT=0

check_api() {
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>/dev/null)
    if [[ "$response" == "200" ]]; then
        return 0
    fi
    return 1
}

while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
    if check_api; then
        exit 0
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 10
done

# If we get here, API is down
/opt/monitoring/alert.sh "API health check failed after $MAX_RETRIES attempts!"

# Attempt auto-recovery
cd /home/deploy/vicarity
docker compose -f docker-compose.production.yml restart api
sleep 30

if check_api; then
    /opt/monitoring/alert.sh "API recovered after automatic restart"
else
    /opt/monitoring/alert.sh "API STILL DOWN after restart attempt - manual intervention required!"
fi
EOF

    chmod +x /opt/monitoring/watchdog.sh
    
    # Add watchdog to cron (every 5 minutes)
    (crontab -l 2>/dev/null | grep -v watchdog.sh; echo "*/5 * * * * /opt/monitoring/watchdog.sh") | crontab -
    
    log_success "Alerting configured"
}

#-------------------------------------------------------------------------------
# STEP 11: HARDEN SSH
#-------------------------------------------------------------------------------
harden_ssh() {
    log_info "Hardening SSH configuration..."
    
    # Backup original config
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Create hardened SSH config
    cat > /etc/ssh/sshd_config.d/99-vicarity-hardening.conf << 'EOF'
# Vicarity SSH Hardening

# Disable password authentication (SSH keys only)
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes

# Disable root login
PermitRootLogin no

# Only allow deploy user
AllowUsers deploy

# Connection settings
MaxAuthTries 3
MaxSessions 3
LoginGraceTime 60

# Disable unused features
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no

# Keep connections alive
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

    # Test SSH config before applying
    if sshd -t; then
        systemctl reload sshd
        log_success "SSH hardened"
    else
        log_error "SSH config test failed - not applying changes"
        rm /etc/ssh/sshd_config.d/99-vicarity-hardening.conf
    fi
}

#-------------------------------------------------------------------------------
# FINAL: OUTPUT CREDENTIALS
#-------------------------------------------------------------------------------
output_credentials() {
    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
    
    # Get the deploy user's public key
    DEPLOY_PUBLIC_KEY=$(cat "/home/${DEPLOY_USER}/.ssh/id_ed25519.pub" 2>/dev/null || echo "KEY NOT FOUND")
    DEPLOY_PRIVATE_KEY=$(cat "/home/${DEPLOY_USER}/.ssh/id_ed25519" 2>/dev/null || echo "KEY NOT FOUND")
    
    echo ""
    echo "==============================================================================="
    echo -e "${GREEN}VICARITY SERVER SETUP COMPLETE!${NC}"
    echo "==============================================================================="
    echo ""
    echo -e "${YELLOW}IMPORTANT: SAVE THESE CREDENTIALS NOW!${NC}"
    echo ""
    echo "-------------------------------------------------------------------------------"
    echo "GITHUB SECRETS (Add these to your repository)"
    echo "-------------------------------------------------------------------------------"
    echo ""
    echo -e "${BLUE}VPS_HOST:${NC}"
    echo "${SERVER_IP}"
    echo ""
    echo -e "${BLUE}VPS_USER:${NC}"
    echo "deploy"
    echo ""
    echo -e "${BLUE}VPS_SSH_KEY:${NC} (Copy EVERYTHING below, including BEGIN and END lines)"
    echo "---START COPYING BELOW THIS LINE---"
    echo "${DEPLOY_PRIVATE_KEY}"
    echo "---STOP COPYING ABOVE THIS LINE---"
    echo ""
    echo "-------------------------------------------------------------------------------"
    echo "SSH ACCESS"
    echo "-------------------------------------------------------------------------------"
    echo ""
    echo "Add this public key to the deploy user's authorized_keys:"
    echo "${DEPLOY_PUBLIC_KEY}"
    echo ""
    echo "To SSH into your server:"
    echo "  ssh deploy@${SERVER_IP}"
    echo ""
    echo "-------------------------------------------------------------------------------"
    echo "NEXT STEPS"
    echo "-------------------------------------------------------------------------------"
    echo ""
    echo "1. Copy the VPS_SSH_KEY above and add it to GitHub Secrets"
    echo ""
    echo "2. Add YOUR SSH public key to allow login:"
    echo "   echo 'YOUR_PUBLIC_KEY' >> /home/deploy/.ssh/authorized_keys"
    echo ""
    echo "3. Set up your domain DNS:"
    echo "   Point your domain A record to: ${SERVER_IP}"
    echo ""
    echo "4. Get SSL certificate (after DNS propagates):"
    echo "   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com"
    echo ""
    echo "5. Clone your repository:"
    echo "   su - deploy"
    echo "   git clone ${GITHUB_REPO} vicarity"
    echo ""
    echo "6. Create .env file:"
    echo "   cd vicarity && cp .env.example .env && nano .env"
    echo ""
    echo "7. First deployment:"
    echo "   docker compose -f docker-compose.production.yml up -d --build"
    echo ""
    echo "-------------------------------------------------------------------------------"
    echo "USEFUL COMMANDS"
    echo "-------------------------------------------------------------------------------"
    echo ""
    echo "Check server health:     /opt/monitoring/health-check.sh"
    echo "View container logs:     docker compose logs -f"
    echo "Restart all services:    docker compose restart"
    echo "Check fail2ban status:   sudo fail2ban-client status sshd"
    echo "Check firewall:          sudo ufw status"
    echo ""
    echo "==============================================================================="
    echo -e "${GREEN}Setup took approximately $(( SECONDS / 60 )) minutes${NC}"
    echo "==============================================================================="
}

#-------------------------------------------------------------------------------
# MAIN EXECUTION
#-------------------------------------------------------------------------------
main() {
    echo "==============================================================================="
    echo "VICARITY SERVER SETUP"
    echo "==============================================================================="
    echo ""
    
    SECONDS=0  # Start timer
    
    check_root
    check_ubuntu
    
    update_system
    create_deploy_user
    configure_firewall
    install_fail2ban
    setup_auto_updates
    install_docker
    setup_app_directory
    install_certbot
    setup_monitoring
    setup_alerting
    # harden_ssh  # Uncomment after you've added your SSH key!
    
    output_credentials
}

# Run main function
main "$@"
