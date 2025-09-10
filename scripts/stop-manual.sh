#!/bin/bash

# Manual stop script for manually started containers

echo "🛑 Stopping Asset Management System..."

# Stop containers
echo "Stopping containers..."
docker stop asset-management-db asset-management-backend asset-management-frontend 2>/dev/null || true

# Remove containers
echo "Removing containers..."
docker rm asset-management-db asset-management-backend asset-management-frontend 2>/dev/null || true

# Remove network
echo "Removing network..."
docker network rm asset-management-network 2>/dev/null || true

echo "✅ All services stopped and cleaned up!"