#!/bin/bash

# Manual startup script for when Docker Compose fails
# This runs each service individually

set -e

echo "🚀 Starting Asset Management System manually..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Create network if it doesn't exist
echo "📡 Creating Docker network..."
docker network create asset-management-network 2>/dev/null || echo "Network already exists"

# Stop and remove existing containers
echo "🧹 Cleaning up existing containers..."
docker stop asset-management-db asset-management-backend asset-management-frontend 2>/dev/null || true
docker rm asset-management-db asset-management-backend asset-management-frontend 2>/dev/null || true

# Start PostgreSQL
echo "🗄️  Starting PostgreSQL database..."
docker run -d \
  --name asset-management-db \
  --network asset-management-network \
  -e POSTGRES_DB=asset_management \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
until docker exec asset-management-db pg_isready -U postgres; do
  echo "Database is not ready yet, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Build and start backend
echo "🔧 Building and starting backend..."
docker build --target development -t asset-management-backend ./backend

# First, run Prisma setup in a temporary container
echo "🔧 Setting up Prisma..."
docker run --rm \
  --network asset-management-network \
  -e DATABASE_URL=postgresql://postgres:postgres@asset-management-db:5432/asset_management \
  -v "$(pwd)/backend:/app" \
  -w /app \
  asset-management-backend \
  sh -c "npm run prisma:generate && npm run prisma:migrate"

# Now start the backend service
echo "🚀 Starting backend service..."
docker run -d \
  --name asset-management-backend \
  --network asset-management-network \
  -e NODE_ENV=development \
  -e DATABASE_URL=postgresql://postgres:postgres@asset-management-db:5432/asset_management \
  -e JWT_SECRET=your-super-secret-jwt-key-change-in-production \
  -e PORT=3001 \
  -p 3001:3001 \
  -v "$(pwd)/backend:/app" \
  -v /app/node_modules \
  asset-management-backend \
  npm run dev

# Fix bcrypt architecture compatibility (common on macOS)
echo "🔧 Fixing bcrypt compatibility..."
sleep 5
docker exec asset-management-backend sh -c "rm -rf node_modules/bcrypt && npm install bcrypt" > /dev/null 2>&1 || true
docker restart asset-management-backend > /dev/null 2>&1

# Wait for backend to restart and seed the database
echo "🌱 Seeding database with initial users..."
sleep 10
docker exec asset-management-backend npm run prisma:seed > /dev/null 2>&1 || echo "Seed already completed or failed"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Build and start frontend
echo "🎨 Building and starting frontend..."
docker build --target development -t asset-management-frontend ./frontend
docker run -d \
  --name asset-management-frontend \
  --network asset-management-network \
  -e VITE_API_URL=http://localhost:3001/api \
  -p 3000:3000 \
  -v "$(pwd)/frontend:/app" \
  -v /app/node_modules \
  asset-management-frontend

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Database: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker logs -f <container-name>"
echo "   Stop all:  ./scripts/stop-manual.sh"
echo ""
echo "🔍 Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"