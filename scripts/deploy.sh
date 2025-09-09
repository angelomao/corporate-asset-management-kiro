#!/bin/bash

# Deployment script for Asset Management System
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

echo "Starting deployment for environment: $ENVIRONMENT"

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat ".env.${ENVIRONMENT}" | grep -v '^#' | xargs)
    echo "Loaded environment variables from .env.${ENVIRONMENT}"
fi

# Pre-deployment checks
echo "Running pre-deployment checks..."

# Check if required environment variables are set
REQUIRED_VARS=("DB_PASSWORD" "JWT_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Required environment variable $var is not set"
        exit 1
    fi
done

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running"
    exit 1
fi

# Create necessary directories
mkdir -p logs backups ssl

# Backup database before deployment
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Creating backup before deployment..."
    ./scripts/backup-database.sh "$ENVIRONMENT" || echo "Warning: Backup failed, continuing with deployment"
fi

# Build and deploy
echo "Building and deploying containers..."
docker-compose -f "$COMPOSE_FILE" down
docker-compose -f "$COMPOSE_FILE" build --no-cache
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 30

# Check service health
echo "Checking service health..."
for service in database backend frontend; do
    if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up (healthy)"; then
        echo "✓ $service is healthy"
    else
        echo "✗ $service is not healthy"
        docker-compose -f "$COMPOSE_FILE" logs "$service"
        exit 1
    fi
done

# Run database migrations
echo "Running database migrations..."
docker-compose -f "$COMPOSE_FILE" exec backend npm run prisma:migrate

# Post-deployment verification
echo "Running post-deployment verification..."
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Check backend health
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✓ Backend health check passed"
else
    echo "✗ Backend health check failed"
    exit 1
fi

# Check frontend
if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "✓ Frontend health check passed"
else
    echo "✗ Frontend health check failed"
    exit 1
fi

echo "Deployment completed successfully!"
echo "Application is available at: $FRONTEND_URL"
echo "API is available at: $BACKEND_URL"