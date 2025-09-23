#!/bin/bash

# EC2 Environment Setup Script
# Configures the application for EC2 public IP access

echo "🚀 EC2 Environment Setup"
echo "========================"

# Function to get public IP
get_public_ip() {
    # Try EC2 metadata first
    PUBLIC_IP=$(curl -s --connect-timeout 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
    
    if [ -z "$PUBLIC_IP" ]; then
        # Try external IP services
        PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null)
    fi
    
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(curl -s --connect-timeout 5 ipinfo.io/ip 2>/dev/null)
    fi
    
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(curl -s --connect-timeout 5 icanhazip.com 2>/dev/null)
    fi
    
    echo "$PUBLIC_IP"
}

# Get the public IP
PUBLIC_IP=$(get_public_ip)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" = "" ]; then
    echo "❌ Could not detect public IP address"
    echo "Please provide your EC2 public IP manually:"
    read -p "Enter your EC2 public IP: " PUBLIC_IP
    
    if [ -z "$PUBLIC_IP" ]; then
        echo "❌ No IP provided. Exiting."
        exit 1
    fi
fi

echo "📍 Using Public IP: $PUBLIC_IP"

# Validate IP format
if ! echo "$PUBLIC_IP" | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' > /dev/null; then
    echo "⚠️  Warning: IP format looks unusual: $PUBLIC_IP"
    echo "Continuing anyway..."
fi

echo ""
echo "🔧 Configuring environment files..."
echo "==================================="

# Create root environment file
cat > .env << EOF
# EC2 Environment Configuration
NODE_ENV=development
PUBLIC_IP=$PUBLIC_IP

# Database
POSTGRES_DB=asset_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT
JWT_SECRET=ec2_jwt_secret_$(openssl rand -hex 16)
JWT_EXPIRES_IN=24h

# URLs
FRONTEND_URL=http://$PUBLIC_IP:3000
API_URL=http://$PUBLIC_IP:3001/api

# Logging
LOG_LEVEL=debug
EOF

# Create frontend environment file
cat > frontend/.env << EOF
# Frontend Configuration for EC2
VITE_API_URL=http://$PUBLIC_IP:3001/api
VITE_NODE_ENV=development
EOF

# Create backend environment file
cat > backend/.env << EOF
# Backend Configuration for EC2
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/asset_management
JWT_SECRET=ec2_jwt_secret_$(openssl rand -hex 16)
JWT_EXPIRES_IN=24h
PORT=3001
FRONTEND_URL=http://$PUBLIC_IP:3000
LOG_LEVEL=debug
EOF

echo "✅ Environment files created:"
echo ""
echo "📄 Root .env:"
cat .env
echo ""
echo "📄 Frontend .env:"
cat frontend/.env
echo ""
echo "📄 Backend .env:"
cat backend/.env

echo ""
echo "🔄 Rebuilding and restarting containers..."
echo "=========================================="

# Stop existing containers
docker-compose down

# Remove old containers and images to ensure clean build
docker-compose rm -f
docker system prune -f

# Build and start with new configuration
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 30

echo ""
echo "🔍 Checking service health..."
echo "============================="

# Check backend health
echo "Backend health check:"
for i in {1..10}; do
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Backend is healthy (localhost)"
        break
    fi
    echo "⏳ Waiting for backend... ($i/10)"
    sleep 5
done

# Check external backend access
echo ""
echo "External backend access:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" http://$PUBLIC_IP:3001/health || echo "❌ Backend not accessible externally"

# Check frontend
echo ""
echo "Frontend access:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" http://$PUBLIC_IP:3000 || echo "❌ Frontend not accessible externally"

echo ""
echo "🌱 Ensuring database is seeded..."
echo "================================="
BACKEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep backend | head -1)
if [ -n "$BACKEND_CONTAINER" ]; then
    docker exec $BACKEND_CONTAINER npm run prisma:seed || echo "Database may already be seeded"
else
    echo "❌ Backend container not found"
fi

echo ""
echo "🧪 Testing login API..."
echo "======================="
LOGIN_RESPONSE=$(curl -s -X POST http://$PUBLIC_IP:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Login API working correctly"
elif [ "$HTTP_STATUS" = "000" ] || [ -z "$HTTP_STATUS" ]; then
    echo "❌ Cannot reach login API - check security group and firewall"
else
    echo "⚠️  Login API responded with status: $HTTP_STATUS"
fi

echo ""
echo "🎉 EC2 Setup Complete!"
echo "======================"
echo ""
echo "📋 Access Information:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend:  http://$PUBLIC_IP:3001"
echo "Health:   http://$PUBLIC_IP:3001/health"
echo ""
echo "👤 Login Credentials:"
echo "📧 Admin:   admin@example.com / admin123"
echo "📧 Manager: manager@example.com / manager123"
echo "📧 User:    user@example.com / user123"
echo ""
echo "🔐 CRITICAL: AWS Security Group Setup"
echo "====================================="
echo "Your AWS Security Group MUST allow these inbound rules:"
echo "1. Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0 (Frontend)"
echo "2. Type: Custom TCP, Port: 3001, Source: 0.0.0.0/0 (Backend)"
echo "3. Type: SSH, Port: 22, Source: Your IP (for SSH access)"
echo ""
echo "🔥 Firewall Check:"
echo "=================="
echo "If you still can't access, check UFW firewall:"
echo "sudo ufw status"
echo "sudo ufw allow 3000"
echo "sudo ufw allow 3001"
echo ""
echo "🚀 Ready to test!"
echo "Visit: http://$PUBLIC_IP:3000"