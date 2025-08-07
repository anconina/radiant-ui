#!/bin/bash

# Docker utility scripts for development and deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Build Docker image
build_image() {
    local env=${1:-prod}
    local tag=${2:-latest}
    
    log_info "Building Docker image for $env environment..."
    
    case $env in
        dev)
            docker build -f .docker/Dockerfile.dev -t radiant-ui:dev-$tag .
            ;;
        test)
            docker build -f .docker/Dockerfile.test -t radiant-ui:test-$tag .
            ;;
        e2e)
            docker build -f .docker/Dockerfile.e2e -t radiant-ui:e2e-$tag .
            ;;
        prod|production)
            docker build -f .docker/Dockerfile -t radiant-ui:$tag .
            docker tag radiant-ui:$tag radiant-ui:latest
            ;;
        *)
            log_error "Unknown environment: $env"
            exit 1
            ;;
    esac
    
    log_success "Docker image built successfully"
}

# Run container
run_container() {
    local env=${1:-prod}
    local port=${2:-8080}
    
    log_info "Running container for $env environment..."
    
    case $env in
        dev)
            docker-compose -f .docker/docker-compose.yml up dev
            ;;
        test)
            docker-compose -f .docker/docker-compose.yml up test
            ;;
        e2e)
            docker-compose -f .docker/docker-compose.yml up e2e
            ;;
        prod|production)
            docker run -d \
                --name radiant-ui-prod \
                -p $port:8080 \
                --restart unless-stopped \
                radiant-ui:latest
            ;;
        *)
            log_error "Unknown environment: $env"
            exit 1
            ;;
    esac
    
    log_success "Container started successfully"
}

# Stop container
stop_container() {
    local name=${1:-radiant-ui-prod}
    
    log_info "Stopping container $name..."
    
    if docker ps -q -f name=$name | grep -q .; then
        docker stop $name
        docker rm $name
        log_success "Container stopped and removed"
    else
        log_warning "Container $name not running"
    fi
}

# Push to registry
push_image() {
    local registry=${1:-docker.io}
    local repo=${2:-radiant-ui}
    local tag=${3:-latest}
    
    log_info "Pushing image to $registry/$repo:$tag..."
    
    # Tag image for registry
    docker tag radiant-ui:$tag $registry/$repo:$tag
    
    # Push to registry
    docker push $registry/$repo:$tag
    
    log_success "Image pushed successfully"
}

# Clean up Docker resources
cleanup() {
    log_info "Cleaning up Docker resources..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log_success "Docker cleanup complete"
}

# Health check
health_check() {
    local container=${1:-radiant-ui-prod}
    local max_attempts=${2:-10}
    local attempt=0
    
    log_info "Performing health check on $container..."
    
    while [ $attempt -lt $max_attempts ]; do
        if docker exec $container curl -f http://localhost:8080/health > /dev/null 2>&1; then
            log_success "Container is healthy"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_warning "Health check attempt $attempt/$max_attempts failed"
        sleep 3
    done
    
    log_error "Container health check failed"
    return 1
}

# Main script logic
case "${1}" in
    build)
        build_image "${2}" "${3}"
        ;;
    run)
        run_container "${2}" "${3}"
        ;;
    stop)
        stop_container "${2}"
        ;;
    push)
        push_image "${2}" "${3}" "${4}"
        ;;
    health)
        health_check "${2}" "${3}"
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|run|stop|push|health|cleanup} [options]"
        echo ""
        echo "Commands:"
        echo "  build [env] [tag]       Build Docker image"
        echo "  run [env] [port]        Run container"
        echo "  stop [name]             Stop and remove container"
        echo "  push [registry] [repo] [tag]  Push image to registry"
        echo "  health [container] [attempts]  Health check"
        echo "  cleanup                 Clean up Docker resources"
        echo ""
        echo "Environments: dev, test, e2e, prod"
        exit 1
        ;;
esac