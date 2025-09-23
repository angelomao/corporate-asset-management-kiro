#!/bin/bash

# Login Troubleshooting Script
# Comprehensive diagnostics for login issues

echo "🔍 Login Issue Debugging"
echo "========================"

# Get IP information
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
echo "📍 Testing with IP: $PUBLIC_IP"

echo ""
echo "🔍 Container Status Check:"
echo "=========================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(frontend|backend|postgres|database)" || echo "No relevant containers found"

echo ""
echo "🔍 Backend API Health Check:"
echo "============================="
echo "Testing backend connectivity..."

# Test backend health endpoint
echo "Health endpoint test:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3001/health || echo "❌ Backend health check failed"

# Test backend auth endpoint
echo ""
echo "Auth endpoint test:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}' || echo "❌ Auth endpoint not accessible"

echo ""
echo "🔍 Database Connection Check:"
echo "=============================="
BACKEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep backend | head -1)
if [ -n "$BACKEND_CONTAINER" ]; then
    echo "Testing database connection from backend..."
    docker exec $BACKEND_CONTAINER sh -c "curl -s http://localhost:3001/health" || echo "❌ Backend container health check failed"
else
    echo "❌ No backend container found"
fi

echo ""
echo "🔍 Database Seeding Check:"
echo "=========================="
DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "(postgres|database)" | head -1)
if [ -n "$DB_CONTAINER" ]; then
    echo "Checking if users exist in database..."
    docker exec $DB_CONTAINER psql -U postgres -d asset_management -c "SELECT email, role FROM \"User\" LIMIT 5;" 2>/dev/null || \
    docker exec $DB_CONTAINER psql -U postgres -d asset_management_prod -c "SELECT email, role FROM \"User\" LIMIT 5;" 2>/dev/null || \
    echo "❌ Could not query users table - database may not be seeded"
else
    echo "❌ No database container found"
fi

echo ""
echo "🔍 Frontend Configuration Check:"
echo "================================="
echo "Frontend environment variables:"
if [ -f "frontend/.env" ]; then
    cat frontend/.env
else
    echo "❌ No frontend/.env file found"
fi

echo ""
echo "Frontend API URL test:"
FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep frontend | head -1)
if [ -n "$FRONTEND_CONTAINER" ]; then
    echo "Testing API connectivity from frontend container..."
    docker exec $FRONTEND_CONTAINER sh -c "curl -s -w 'Status: %{http_code}\n' http://backend:3001/health" 2>/dev/null || \
    echo "❌ Frontend cannot reach backend"
else
    echo "❌ No frontend container found"
fi

echo ""
echo "🔍 CORS and Network Check:"
echo "=========================="
echo "Testing CORS headers..."
curl -s -H "Origin: http://$PUBLIC_IP:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:3001/api/auth/login \
     -w "Status: %{http_code}\n" || echo "❌ CORS preflight failed"

echo ""
echo "🔍 Login Attempt Test:"
echo "======================"
echo "Testing login with default admin credentials..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "Login response status: $HTTP_STATUS"
echo "Login response body: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Login API is working correctly"
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "⚠️  Login API is working but credentials are invalid"
    echo "   This suggests the database may not be properly seeded"
elif [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ Login endpoint not found - backend routing issue"
elif [ -z "$HTTP_STATUS" ]; then
    echo "❌ No response from backend - connection issue"
else
    echo "❌ Unexpected response status: $HTTP_STATUS"
fi

echo ""
echo "🔍 Container Logs Check:"
echo "========================"
echo "Recent backend logs:"
if [ -n "$BACKEND_CONTAINER" ]; then
    docker logs --tail=10 $BACKEND_CONTAINER 2>/dev/null || echo "❌ Could not get backend logs"
else
    echo "❌ No backend container to check logs"
fi

echo ""
echo "Recent frontend logs:"
if [ -n "$FRONTEND_CONTAINER" ]; then
    docker logs --tail=10 $FRONTEND_CONTAINER 2>/dev/null || echo "❌ Could not get frontend logs"
else
    echo "❌ No frontend container to check logs"
fi

echo ""
echo "📋 DIAGNOSIS SUMMARY:"
echo "====================="
echo ""
echo "🔧 RECOMMENDED FIXES:"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Backend API is working correctly"
    echo "   The issue is likely in the frontend configuration or CORS"
    echo "   Check browser console for JavaScript errors"
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "🔄 Database seeding issue detected"
    echo "   Run: docker exec $BACKEND_CONTAINER npm run prisma:seed"
    echo "   Or restart containers: docker-compose down && docker-compose up -d"
elif [ -z "$HTTP_STATUS" ] || [ "$HTTP_STATUS" = "000" ]; then
    echo "🔌 Backend connectivity issue"
    echo "   1. Check if backend container is running: docker ps"
    echo "   2. Check backend logs: docker logs $BACKEND_CONTAINER"
    echo "   3. Restart backend: docker-compose restart backend"
else
    echo "🔍 Backend configuration issue"
    echo "   1. Check backend logs: docker logs $BACKEND_CONTAINER"
    echo "   2. Verify environment variables"
    echo "   3. Check database connection"
fi

echo ""
echo "🚀 Quick fixes to try:"
echo "====================="
echo ""
echo "1. Restart all services:"
echo "   docker-compose down && docker-compose up -d"
echo ""
echo "2. Force database reseed:"
echo "   docker exec $BACKEND_CONTAINER npm run prisma:migrate:reset"
echo ""
echo "3. Check browser console:"
echo "   Open browser dev tools and look for JavaScript errors"
echo ""
echo "4. Test direct API access:"
echo "   Visit http://$PUBLIC_IP:3001/health in your browser"