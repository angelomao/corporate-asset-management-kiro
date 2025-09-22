#!/bin/bash

# EC2 Development Mode - Direct port access without nginx
# This bypasses nginx complexity and exposes services directly

set -e

echo "🚀 Starting Asset Management System in EC2 Development Mode"
echo "==========================================================="

# Get public IP for configuration
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
echo "📍 Detected Public IP: $PUBLIC_IP"

# Create development environment for EC2
echo "📝 Creating EC2 development environment..."
cat > .env << EOF
# EC2 Development Environment
NODE_ENV=development
POSTGRES_DB=asset_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_SECRET=ec2_development_jwt_secret_$(openssl rand -hex 16)

# URLs for EC2
FRONTEND_URL=http://$PUBLIC_IP:3000
API_URL=http://$PUBLIC_IP:3001/api

# Logging
LOG_LEVEL=debug
EOF

echo "✅ Environment file created"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.ec2.yml down 2>/dev/null || true

# Start development containers with explicit host binding
echo "🚀 Starting development services with external access..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
for i in {1..12}; do
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Backend is healthy"
        break
    fi
    echo "⏳ Waiting for backend... ($i/12)"
    sleep 10
done

for i in {1..12}; do
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Frontend is healthy"
        break
    fi
    echo "⏳ Waiting for frontend... ($i/12)"
    sleep 10
done

# Test external connectivity
echo ""
echo "🔍 Testing external connectivity..."
echo "Frontend test:"
curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3000 || echo "  ❌ Frontend not accessible"

echo "Backend test:"
curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3001/health || echo "  ❌ Backend not accessible"

# Show final status
echo ""
echo "🎉 EC2 Development Mode Started!"
echo "================================="
echo ""
echo "📋 Service URLs:"
echo "   🌐 Frontend:  http://$PUBLIC_IP:3000"
echo "   🔧 Backend:   http://$PUBLIC_IP:3001"
echo "   ❤️  Health:   http://$PUBLIC_IP:3001/health"
echo ""
echo "👤 Login Credentials:"
echo "   📧 Admin:    admin@example.com / admin123"
echo "   📧 Manager:  manager@example.com / manager123"
echo "   📧 User:     user@example.com / user123"
echo ""
echo "🔐 IMPORTANT: Make sure your AWS Security Group allows:"
echo "   - Port 3000 (Frontend)"
echo "   - Port 3001 (Backend)"
echo ""
echo "📊 Check status: docker-compose ps"
echo "📋 View logs:    docker-compose logs -f"
echo ""
echo "🔧 If you still can't access the frontend:"
echo "   1. Check AWS Security Group inbound rules"
echo "   2. Check if UFW firewall is blocking: sudo ufw status"
echo "   3. Verify containers are running: docker ps"
echo "   4. Check container logs: docker logs asset-management-frontend"