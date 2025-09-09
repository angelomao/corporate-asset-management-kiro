#!/bin/bash

# Database migration script for Asset Management System
# Usage: ./scripts/migrate-database.sh [environment] [action]

set -e

ENVIRONMENT=${1:-development}
ACTION=${2:-deploy}

# Load environment variables
if [ -f "backend/.env" ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
fi

echo "Running database migrations for environment: $ENVIRONMENT"
echo "Action: $ACTION"

# Change to backend directory
cd backend

case $ACTION in
    "deploy")
        echo "Deploying pending migrations..."
        npm run prisma:migrate
        ;;
    "reset")
        echo "WARNING: This will reset the database and lose all data!"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npx prisma migrate reset --force
        else
            echo "Reset cancelled"
            exit 0
        fi
        ;;
    "status")
        echo "Checking migration status..."
        npx prisma migrate status
        ;;
    "generate")
        echo "Generating Prisma client..."
        npm run prisma:generate
        ;;
    "create")
        if [ -z "$3" ]; then
            echo "Usage: $0 $ENVIRONMENT create <migration_name>"
            exit 1
        fi
        MIGRATION_NAME="$3"
        echo "Creating new migration: $MIGRATION_NAME"
        npx prisma migrate dev --name "$MIGRATION_NAME"
        ;;
    *)
        echo "Unknown action: $ACTION"
        echo "Available actions: deploy, reset, status, generate, create"
        exit 1
        ;;
esac

echo "Migration operation completed!"