#!/bin/bash

# Restart all Asset Management System services
# Usage: ./scripts/restart-all.sh

echo "🔄 Restarting Asset Management System services..."

# Restart all containers
docker restart asset-management-db asset-management-backend asset-management-frontend

echo "⏳ Waiting for services to start..."
sleep 15

# Check service status
echo "📊 Service Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep asset-management

echo ""
echo "🎉 All services restarted!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Database: localhost:5432"