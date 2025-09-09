#!/bin/bash

# Database backup script for Asset Management System
# Usage: ./scripts/backup-database.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-development}
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/asset_management_${ENVIRONMENT}_${TIMESTAMP}.sql"

# Load environment variables
if [ -f "backend/.env" ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup for environment: $ENVIRONMENT"
echo "Backup file: $BACKUP_FILE"

# Extract database connection details from DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not found in environment variables"
    exit 1
fi

# Parse DATABASE_URL (format: postgresql://user:password@host:port/database)
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

# Set PGPASSWORD for non-interactive backup
export PGPASSWORD="$DB_PASSWORD"

# Create backup
echo "Creating backup..."
pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="$BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Verify backup
if [ -f "$COMPRESSED_FILE" ]; then
    BACKUP_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo "Backup completed successfully!"
    echo "File: $COMPRESSED_FILE"
    echo "Size: $BACKUP_SIZE"
else
    echo "Error: Backup file not created"
    exit 1
fi

# Clean up old backups (keep last 7 days)
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "asset_management_${ENVIRONMENT}_*.sql.gz" -mtime +7 -delete

echo "Backup process completed!"