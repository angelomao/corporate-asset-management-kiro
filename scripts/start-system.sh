#!/bin/bash

# Complete system startup script for Asset Management System
# Usage: ./scripts/start-system.sh

set -e

echo "🚀 Starting Asset Management System..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Create logs directory
mkdir -p logs

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true

# Remove any orphaned containers
docker container prune -f 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to initialize..."
echo "   This may take a few minutes on first run..."

# Wait for database to be ready
echo "📊 Waiting for database..."
timeout=60
counter=0
while ! docker exec asset-management-db pg_isready -U postgres > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database failed to start within $timeout seconds"
        docker-compose logs postgres
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done
echo " ✅ Database ready!"

# Wait for backend to be ready
echo "🔧 Waiting for backend..."
timeout=180
counter=0
while ! curl -f http://localhost:3001/health > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Backend failed to start within $timeout seconds"
        docker-compose logs backend
        exit 1
    fi
    sleep 5
    counter=$((counter + 5))
    echo -n "."
done
echo " ✅ Backend ready!"

# Wait for frontend to be ready
echo "🎨 Waiting for frontend..."
timeout=60
counter=0
while ! curl -f http://localhost:3000 > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Frontend failed to start within $timeout seconds"
        docker-compose logs frontend
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done
echo " ✅ Frontend ready!"

echo ""
echo "🎉 Asset Management System is now running!"
echo ""
echo "📋 Service Information:"
echo "   🌐 Frontend:  http://localhost:3000"
echo "   🔧 Backend:   http://localhost:3001"
echo "   🗄️  Database:  localhost:5432"
echo ""
echo "👤 Login Credentials:"
echo "   📧 Admin:    admin@example.com / admin123"
echo "   📧 Manager:  manager@example.com / manager123"
echo "   📧 User:     user@example.com / user123"
echo ""
echo "🔧 Management Commands:"
echo "   📊 View logs:     docker-compose logs -f [service]"
echo "   🛑 Stop system:   docker-compose down"
echo "   🔄 Restart:       ./scripts/restart-all.sh"
echo "   📈 Monitor:       ./scripts/monitor.sh status"
echo ""
echo "🌟 System is ready for use!"