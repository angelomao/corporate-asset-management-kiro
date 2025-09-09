#!/bin/bash

# Database restore script for Asset Management System
# Usage: ./scripts/restore-database.sh <backup_file> [environment]

set -e

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file> [environment]"
    echo "Example: $0 backups/asset_management_production_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
ENVIRONMENT=${2:-development}

# Load environment variables
if [ -f "backend/.env" ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
fi

echo "Starting database restore for environment: $ENVIRONMENT"
echo "Backup file: $BACKUP_FILE"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found"
    exit 1
fi

# Extract database connection details from DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not found in environment variables"
    exit 1
fi

# Parse DATABASE_URL
DB_URL_REGEX="postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)"
if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "Error: Invalid DATABASE_URL format"
    exit 1
fi

# Set PGPASSWORD for non-interactive restore
export PGPASSWORD="$DB_PASSWORD"

# Confirm restore operation
echo "WARNING: This will replace all data in database '$DB_NAME'"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Decompress backup if it's gzipped
TEMP_FILE=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    TEMP_FILE="/tmp/restore_$(basename "$BACKUP_FILE" .gz)"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Stop application (if running in Docker)
echo "Stopping application containers..."
docker-compose down || true

# Restore database
echo "Restoring database..."
psql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --file="$RESTORE_FILE" \
    --verbose

# Clean up temporary file
if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

# Run migrations to ensure schema is up to date
echo "Running database migrations..."
cd backend
npm run prisma:migrate

echo "Database restore completed successfully!"
echo "You can now start the application with: docker-compose up"