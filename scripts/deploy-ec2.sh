#!/bin/bash

# EC2 Production Deployment Script
# Optimized for AWS EC2 instances

set -e

echo "🚀 Deploying Asset Management System to EC2"
echo "============================================="

# Get public IP for configuration
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
echo "📍 Detected Public IP: $PUBLIC_IP"

# Create production environment file
echo "📝 Creating production environment..."
cat > .env.production << EOF
# Production Environment for EC2
NODE_ENV=production
DB_USER=postgres
DB_PASSWORD=secure_password_$(date +%s)
JWT_SECRET=super_secure_jwt_secret_$(openssl rand -hex 32)

# URLs - Update these with your domain or IP
FRONTEND_URL=http://$PUBLIC_IP
API_URL=http://$PUBLIC_IP:3001/api

# Logging
LOG_LEVEL=info
EOF

echo "✅ Environment file created"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Clean up old images (optional)
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start production containers
echo "🏗️  Building production containers..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

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

# Show final status
echo ""
echo "🎉 Deployment Complete!"
echo "======================="
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
echo "   - Port 80 (HTTP)"
echo "   - Port 443 (HTTPS)"
echo ""
echo "📊 Check status: docker-compose -f docker-compose.prod.yml ps"
echo "📋 View logs:    docker-compose -f docker-compose.prod.yml logs -f"