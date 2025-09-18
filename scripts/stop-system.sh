#!/bin/bash

# Stop Asset Management System
# Usage: ./scripts/stop-system.sh

echo "🛑 Stopping Asset Management System..."

# Stop all services
docker-compose down

echo "✅ All services stopped successfully!"
echo ""
echo "💡 To start again, run: npm start"
echo "🧹 To clean up completely, run: npm run clean"