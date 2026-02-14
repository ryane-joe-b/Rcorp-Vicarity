#!/bin/bash
# Vicarity Watchdog - monitors and auto-heals crashed containers
# Installed at: /usr/local/bin/vicarity-watchdog.sh

APP_DIR="/home/deploy/vicarity"
COMPOSE_FILE="docker-compose.production.yml"
HEALTH_URL="http://localhost/api/health"
LOG_FILE="/var/log/vicarity-watchdog.log"
CHECK_INTERVAL=30  # seconds between checks
MAX_RESTART_ATTEMPTS=3
RESTART_COOLDOWN=60  # seconds to wait after restart before checking again

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_health() {
    # Check if nginx is responding (overall health check)
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL" 2>/dev/null)
    if [[ "$response" == "200" ]]; then
        return 0
    fi
    return 1
}

check_container() {
    local container="$1"
    # Returns 0 if running and healthy, 1 otherwise
    status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
    if [[ "$status" == "running" ]]; then
        return 0
    fi
    return 1
}

restart_services() {
    log "⚠️  Attempting to restart services..."
    cd "$APP_DIR" || { log "❌ Cannot cd to $APP_DIR"; return 1; }

    # Try a gentle restart first
    docker compose -f "$COMPOSE_FILE" restart 2>&1 | tee -a "$LOG_FILE"
    sleep 30

    if check_health; then
        log "✅ Services recovered after restart"
        return 0
    fi

    # If gentle restart didn't work, do full down/up
    log "⚠️  Gentle restart failed, trying full restart..."
    docker compose -f "$COMPOSE_FILE" down 2>&1 | tee -a "$LOG_FILE"
    sleep 5
    docker compose -f "$COMPOSE_FILE" up -d 2>&1 | tee -a "$LOG_FILE"
    sleep 45

    if check_health; then
        log "✅ Services recovered after full restart"
        return 0
    fi

    log "❌ Services STILL DOWN after full restart - manual intervention required!"
    return 1
}

log "🚀 Vicarity Watchdog started"

consecutive_failures=0

while true; do
    if ! check_health; then
        consecutive_failures=$((consecutive_failures + 1))
        log "⚠️  Health check failed (attempt $consecutive_failures)"

        # Check individual containers for better diagnosis
        for container in vicarity-api vicarity-nginx vicarity-redis; do
            if ! check_container "$container"; then
                log "❌ Container $container is not running"
            fi
        done

        # Only restart after 2 consecutive failures (avoids restarting on transient errors)
        if [[ $consecutive_failures -ge 2 ]]; then
            log "🔄 Triggering auto-recovery after $consecutive_failures failures"

            if restart_services; then
                consecutive_failures=0
                log "✅ Recovery successful"
            else
                log "❌ Recovery failed - sleeping for 5 minutes before next attempt"
                sleep 300
            fi
        fi
    else
        if [[ $consecutive_failures -gt 0 ]]; then
            log "✅ Health check passed (was failing $consecutive_failures times)"
        fi
        consecutive_failures=0
    fi

    sleep "$CHECK_INTERVAL"
done
