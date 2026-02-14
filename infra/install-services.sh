#!/bin/bash
# Installs Vicarity systemd services for auto-start on reboot and crash recovery
# Run this ONCE on your server: bash infra/install-services.sh
#
# What this does:
#   1. Installs vicarity.service  → starts docker compose on server boot
#   2. Installs vicarity-watchdog → auto-restarts if containers crash
#   3. Enables both to run on boot

set -euo pipefail

APP_DIR="/root/vicarity"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()    { echo -e "${YELLOW}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Must be root
[[ $EUID -ne 0 ]] && log_error "Run as root: sudo bash infra/install-services.sh"

# Check we're in the right directory
[[ ! -f "$APP_DIR/docker-compose.production.yml" ]] && \
    log_error "docker-compose.production.yml not found at $APP_DIR. Is the app at /root/vicarity?"

echo "============================================================"
echo " Vicarity Service Installer"
echo "============================================================"
echo ""

# ---------------------------------------------------------------
# 1. Install main docker-compose systemd service
# ---------------------------------------------------------------
log_info "Installing vicarity.service (auto-start on boot)..."

cp "$SCRIPT_DIR/vicarity.service" /etc/systemd/system/vicarity.service
chmod 644 /etc/systemd/system/vicarity.service

log_success "vicarity.service installed"

# ---------------------------------------------------------------
# 2. Install watchdog script
# ---------------------------------------------------------------
log_info "Installing watchdog script..."

cp "$SCRIPT_DIR/vicarity-watchdog.sh" /usr/local/bin/vicarity-watchdog.sh
chmod 755 /usr/local/bin/vicarity-watchdog.sh

log_success "Watchdog script installed at /usr/local/bin/vicarity-watchdog.sh"

# ---------------------------------------------------------------
# 3. Install watchdog systemd service
# ---------------------------------------------------------------
log_info "Installing vicarity-watchdog.service..."

cp "$SCRIPT_DIR/vicarity-watchdog.service" /etc/systemd/system/vicarity-watchdog.service
chmod 644 /etc/systemd/system/vicarity-watchdog.service

log_success "vicarity-watchdog.service installed"

# ---------------------------------------------------------------
# 4. Create log file with correct permissions
# ---------------------------------------------------------------
log_info "Creating log file..."
touch /var/log/vicarity-watchdog.log
chmod 640 /var/log/vicarity-watchdog.log
log_success "Log file created at /var/log/vicarity-watchdog.log"

# ---------------------------------------------------------------
# 5. Reload systemd and enable services
# ---------------------------------------------------------------
log_info "Reloading systemd..."
systemctl daemon-reload
log_success "Systemd reloaded"

log_info "Enabling vicarity.service (will start on boot)..."
systemctl enable vicarity.service
log_success "vicarity.service enabled"

log_info "Enabling vicarity-watchdog.service..."
systemctl enable vicarity-watchdog.service
log_success "vicarity-watchdog.service enabled"

# ---------------------------------------------------------------
# 6. Start watchdog (main service already running via docker compose)
# ---------------------------------------------------------------
log_info "Starting watchdog..."
systemctl start vicarity-watchdog.service
log_success "Watchdog started"

echo ""
echo "============================================================"
echo -e "${GREEN} Installation Complete!${NC}"
echo "============================================================"
echo ""
echo "Services installed:"
echo "  vicarity.service         - Starts docker compose on server boot"
echo "  vicarity-watchdog.service - Auto-heals crashed containers"
echo ""
echo "Useful commands:"
echo "  systemctl status vicarity            # Check main service"
echo "  systemctl status vicarity-watchdog   # Check watchdog"
echo "  journalctl -u vicarity -f            # View service logs"
echo "  tail -f /var/log/vicarity-watchdog.log  # View watchdog logs"
echo ""
echo "To TEST the auto-restart:"
echo "  docker compose down               # Stop containers"
echo "  reboot                            # Reboot server"
echo "  # Containers will come back up automatically"
echo ""
