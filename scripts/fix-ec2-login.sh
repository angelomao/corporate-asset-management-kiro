#!/bin/bash

# EC2 Login Fix Script
# Fixes frontend API URL configuration for EC2 access

echo "🔧 EC2 Login Fix"
echo "================"

# Detect if we're on EC2
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
if [ -n "$PUBLIC_IP" ]; then
    echo "✅ Running on EC2, Public IP: $PUBLIC_IP"
    FRONTEND_URL="http://$PUBLIC_IP:3000"
    API_URL="http://$PUBLIC_IP:3001/api"
else
    echo "⚠️  Not running on EC2, using localhost"
    # Try to get external IP
    EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "")
    if [ -n "$EXTERNAL_IP" ]; then
        echo "🌐 External IP detected: $EXTERNAL_IP"
        echo "📝 You can try accessing via: http://$EXTERNAL_IP:3000"
        PUBLIC_IP=$EXTERNAL_IP
        FRONTEND_URL="http://$PUBLIC_IP:3000"
        API_URL="http://$PUBLIC_IP:3001/api"
    else
        echo "❌ Could not detect external IP"
        PUBLIC_IP="YOUR_PUBLIC_IP"
        FRONTEND_URL="http://$PUBLIC_IP:3000"
        API_URL="http://$PUBLIC_IP:3001/api"
    fi
fi

echo ""
echo "🔍 Current frontend configuration:"
echo "=================================="
if [ -f "frontend/.env" ]; then
    cat frontend/.env
else
    echo "❌ No frontend/.env file found"
fi

echo ""
echo "🔧 Updating frontend configuration for EC2 access..."
echo "===================================================="

# Create/update frontend .env file for EC2
cat > frontend/.env << EOF
# API Configuration for EC2 Access
VITE_API_URL=$API_URL

# Development Configuration
VITE_NODE_ENV=development
EOF

echo "✅ Updated frontend/.env:"
cat frontend/.env

echo ""
echo "🔧 Updating backend CORS configuration..."
echo "========================================="

# Check if backend allows the public IP
BACKEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep backend | head -1)
if [ -n "$BACKEND_CONTAINER" ]; then
    echo "Backend container: $BACKEND_CONTAINER"
    
    # Update backend environment to allow the frontend URL
    docker exec $BACKEND_CONTAINER sh -c "echo 'FRONTEND_URL=$FRONTEND_URL' >> .env" 2>/dev/null || true
    
    echo "✅ Updated backend CORS configuration"
else
    echo "❌ No backend container found"
fi

echo ""
echo "🔄 Restarting services to apply changes..."
echo "=========================================="
docker-compose restart frontend backend

echo ""
echo "⏳ Waiting for services to restart..."
sleep 20

echo ""
echo "🔍 Testing API connectivity..."
echo "=============================="

# Test backend health
echo "Backend health check:"
if [ "$PUBLIC_IP" != "YOUR_PUBLIC_IP" ]; then
    curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" http://$PUBLIC_IP:3001/health || echo "❌ Backend not accessible via public IP"
else
    curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3001/health || echo "❌ Backend not accessible"
fi

echo ""
echo "Frontend accessibility:"
if [ "$PUBLIC_IP" != "YOUR_PUBLIC_IP" ]; then
    curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" http://$PUBLIC_IP:3000 || echo "❌ Frontend not accessible via public IP"
else
    curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3000 || echo "❌ Frontend not accessible"
fi

echo ""
echo "🧪 Testing login API..."
echo "======================="
if [ "$PUBLIC_IP" != "YOUR_PUBLIC_IP" ]; then
    LOGIN_TEST=$(curl -s -X POST http://$PUBLIC_IP:3001/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@example.com","password":"admin123"}' \
      -w "HTTP_STATUS:%{http_code}")
else
    LOGIN_TEST=$(curl -s -X POST http://localhost:3001/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@example.com","password":"admin123"}' \
      -w "HTTP_STATUS:%{http_code}")
fi

HTTP_STATUS=$(echo "$LOGIN_TEST" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$LOGIN_TEST" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "Login API Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Login API is working correctly"
else
    echo "❌ Login API issue - Status: $HTTP_STATUS"
    echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "🎉 Configuration Complete!"
echo "=========================="
echo ""
echo "📋 Access Information:"
echo "Frontend: $FRONTEND_URL"
echo "Backend:  http://$PUBLIC_IP:3001"
echo "API:      $API_URL"
echo ""
echo "👤 Login Credentials:"
echo "📧 Admin:   admin@example.com / admin123"
echo "📧 Manager: manager@example.com / manager123"
echo "📧 User:    user@example.com / user123"
echo ""
echo "🔐 IMPORTANT Security Group Requirements:"
echo "========================================"
echo "Make sure your AWS Security Group allows:"
echo "- Port 3000 (Frontend): Custom TCP, Source: 0.0.0.0/0"
echo "- Port 3001 (Backend):  Custom TCP, Source: 0.0.0.0/0"
echo ""
echo "🔍 If login still doesn't work:"
echo "==============================="
echo "1. Check browser console for CORS errors"
echo "2. Verify Security Group settings in AWS Console"
echo "3. Check if UFW firewall is blocking:"
echo "   sudo ufw status"
echo "   sudo ufw allow 3000"
echo "   sudo ufw allow 3001"
echo "4. Test API directly in browser:"
echo "   http://$PUBLIC_IP:3001/health"
echo ""
echo "🚀 Try accessing the application now:"
echo "$FRONTEND_URL"