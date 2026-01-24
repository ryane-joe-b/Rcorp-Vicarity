#!/bin/bash
#===============================================================================
# VICARITY MANUAL DEPLOYMENT SCRIPT
#
# This script is for manual deployments on the server.
# Usually you'll use GitHub Actions, but this is useful for:
# - Emergency deployments
# - Testing deployment process
# - First-time setup
#
# USAGE:
#   ./infra/deploy.sh              # Normal deploy
#   ./infra/deploy.sh --force      # Force rebuild all containers
#   ./infra/deploy.sh --rollback   # Rollback to previous version
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# CONFIGURATION
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="docker-compose.production.yml"
LOG_FILE="/var/log/vicarity-deploy.log"
HEALTH_CHECK_URL="http://localhost/health"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=2

#-------------------------------------------------------------------------------
# COLORS
#-------------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

#-------------------------------------------------------------------------------
# LOGGING
#-------------------------------------------------------------------------------
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        INFO)    echo -e "${BLUE}[INFO]${NC} $message" ;;
        SUCCESS) echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        WARNING) echo -e "${YELLOW}[WARNING]${NC} $message" ;;
        ERROR)   echo -e "${RED}[ERROR]${NC} $message" ;;
    esac
    
    # Also log to file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE" 2>/dev/null || true
}

#-------------------------------------------------------------------------------
# HELPER FUNCTIONS
#-------------------------------------------------------------------------------
check_requirements() {
    log INFO "Checking requirements..."
    
    # Check if running in correct directory
    if [[ ! -f "$PROJECT_DIR/$COMPOSE_FILE" ]]; then
        log ERROR "docker-compose.production.yml not found!"
        log ERROR "Make sure you're running from the project directory"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        log ERROR "Docker is not running!"
        exit 1
    fi
    
    # Check if .env file exists
    if [[ ! -f "$PROJECT_DIR/.env" ]]; then
        log WARNING ".env file not found. Creating from example..."
        if [[ -f "$PROJECT_DIR/.env.example" ]]; then
            cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
            log WARNING "Please edit .env file with your credentials!"
            exit 1
        else
            log ERROR "No .env.example found. Please create .env file manually."
            exit 1
        fi
    fi
    
    log SUCCESS "Requirements check passed"
}

save_current_state() {
    log INFO "Saving current state for potential rollback..."
    
    cd "$PROJECT_DIR"
    
    # Save current commit
    CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    echo "$CURRENT_COMMIT" > .previous_commit
    
    # Save current container images
    docker compose -f "$COMPOSE_FILE" config --images > .previous_images 2>/dev/null || true
    
    log SUCCESS "State saved (commit: ${CURRENT_COMMIT:0:8})"
}

pull_latest_code() {
    log INFO "Pulling latest code from GitHub..."
    
    cd "$PROJECT_DIR"
    
    # Stash any local changes
    git stash --include-untracked 2>/dev/null || true
    
    # Fetch and reset to origin/main
    git fetch origin main
    git reset --hard origin/main
    
    NEW_COMMIT=$(git rev-parse HEAD)
    log SUCCESS "Updated to commit: ${NEW_COMMIT:0:8}"
}

build_containers() {
    local force_rebuild="$1"
    
    log INFO "Building Docker containers..."
    
    cd "$PROJECT_DIR"
    
    if [[ "$force_rebuild" == "true" ]]; then
        docker compose -f "$COMPOSE_FILE" build --no-cache
    else
        docker compose -f "$COMPOSE_FILE" build
    fi
    
    log SUCCESS "Containers built"
}

deploy_services() {
    log INFO "Deploying services with zero-downtime..."
    
    cd "$PROJECT_DIR"
    
    # Start Redis first (dependency)
    log INFO "Starting Redis..."
    docker compose -f "$COMPOSE_FILE" up -d redis
    sleep 5
    
    # Start API
    log INFO "Starting API..."
    docker compose -f "$COMPOSE_FILE" up -d api
    
    # Wait for API to be healthy
    log INFO "Waiting for API health check..."
    local retries=$HEALTH_CHECK_RETRIES
    while [[ $retries -gt 0 ]]; do
        if docker compose -f "$COMPOSE_FILE" exec -T api curl -sf http://localhost:8000/health &> /dev/null; then
            log SUCCESS "API is healthy!"
            break
        fi
        log INFO "Waiting for API... ($retries retries left)"
        retries=$((retries - 1))
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    if [[ $retries -eq 0 ]]; then
        log ERROR "API health check failed!"
        return 1
    fi
    
    # Start web and nginx
    log INFO "Starting web and nginx..."
    docker compose -f "$COMPOSE_FILE" up -d web nginx
    
    # Final stabilization
    sleep 5
    
    log SUCCESS "All services deployed"
}

verify_deployment() {
    log INFO "Verifying deployment..."
    
    # Check all containers are running
    local unhealthy=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | jq -r 'select(.Health == "unhealthy") | .Name' 2>/dev/null || true)
    
    if [[ -n "$unhealthy" ]]; then
        log ERROR "Unhealthy containers: $unhealthy"
        return 1
    fi
    
    # Check nginx health endpoint
    local retries=10
    while [[ $retries -gt 0 ]]; do
        if curl -sf "$HEALTH_CHECK_URL" &> /dev/null; then
            log SUCCESS "Health check passed!"
            return 0
        fi
        retries=$((retries - 1))
        sleep 2
    done
    
    log ERROR "Health check failed!"
    return 1
}

cleanup() {
    log INFO "Cleaning up old Docker images..."
    
    docker image prune -f
    
    log SUCCESS "Cleanup complete"
}

rollback() {
    log WARNING "Starting rollback..."
    
    cd "$PROJECT_DIR"
    
    # Get previous commit
    if [[ ! -f .previous_commit ]]; then
        log ERROR "No previous commit found for rollback!"
        exit 1
    fi
    
    PREVIOUS_COMMIT=$(cat .previous_commit)
    
    if [[ "$PREVIOUS_COMMIT" == "unknown" ]] || [[ -z "$PREVIOUS_COMMIT" ]]; then
        log ERROR "Invalid previous commit!"
        exit 1
    fi
    
    log INFO "Rolling back to commit: ${PREVIOUS_COMMIT:0:8}"
    
    # Checkout previous commit
    git checkout "$PREVIOUS_COMMIT"
    
    # Rebuild and restart
    docker compose -f "$COMPOSE_FILE" up -d --build
    
    # Wait and verify
    sleep 10
    
    if verify_deployment; then
        log SUCCESS "Rollback successful!"
    else
        log ERROR "Rollback verification failed! Manual intervention required."
        exit 1
    fi
}

show_status() {
    echo ""
    echo "==============================================================================="
    echo -e "${GREEN}DEPLOYMENT STATUS${NC}"
    echo "==============================================================================="
    echo ""
    
    cd "$PROJECT_DIR"
    
    echo "Current commit: $(git rev-parse --short HEAD)"
    echo "Branch: $(git branch --show-current)"
    echo ""
    
    echo "Container Status:"
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
    
    echo "Health Check:"
    curl -s "$HEALTH_CHECK_URL" 2>/dev/null || echo "Health endpoint not responding"
    echo ""
    
    echo "Recent Logs (last 10 lines from API):"
    docker compose -f "$COMPOSE_FILE" logs --tail=10 api 2>/dev/null || echo "No logs available"
    echo ""
    
    echo "==============================================================================="
}

#-------------------------------------------------------------------------------
# MAIN
#-------------------------------------------------------------------------------
main() {
    local force_rebuild="false"
    local do_rollback="false"
    local show_status_only="false"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --force)
                force_rebuild="true"
                shift
                ;;
            --rollback)
                do_rollback="true"
                shift
                ;;
            --status)
                show_status_only="true"
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --force      Force rebuild all containers (no cache)"
                echo "  --rollback   Rollback to previous version"
                echo "  --status     Show current deployment status"
                echo "  --help       Show this help message"
                exit 0
                ;;
            *)
                log ERROR "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    echo "==============================================================================="
    echo -e "${BLUE}VICARITY DEPLOYMENT${NC}"
    echo "==============================================================================="
    echo ""
    
    # Status only
    if [[ "$show_status_only" == "true" ]]; then
        show_status
        exit 0
    fi
    
    # Rollback
    if [[ "$do_rollback" == "true" ]]; then
        check_requirements
        rollback
        show_status
        exit 0
    fi
    
    # Normal deployment
    START_TIME=$(date +%s)
    
    check_requirements
    save_current_state
    pull_latest_code
    build_containers "$force_rebuild"
    
    if deploy_services; then
        if verify_deployment; then
            cleanup
            
            END_TIME=$(date +%s)
            DURATION=$((END_TIME - START_TIME))
            
            echo ""
            echo "==============================================================================="
            echo -e "${GREEN}DEPLOYMENT SUCCESSFUL!${NC}"
            echo "==============================================================================="
            echo ""
            echo "Duration: ${DURATION} seconds"
            echo "Health check: $HEALTH_CHECK_URL"
            echo ""
            
            show_status
        else
            log ERROR "Deployment verification failed!"
            log WARNING "Attempting automatic rollback..."
            rollback
            exit 1
        fi
    else
        log ERROR "Deployment failed!"
        log WARNING "Attempting automatic rollback..."
        rollback
        exit 1
    fi
}

# Run main function
main "$@"
