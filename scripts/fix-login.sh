#!/bin/bash

# Login Fix Script
# Quick fixes for common login issues

echo "🔧 Login Issue Quick Fix"
echo "========================"

echo "🔍 Step 1: Checking current status..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(frontend|backend|postgres|database)"

echo ""
echo "🔄 Step 2: Restarting services..."
docker-compose down
sleep 5
docker-compose up -d

echo ""
echo "⏳ Step 3: Waiting for services to be ready..."
sleep 30

echo ""
echo "🔍 Step 4: Checking backend health..."
for i in {1..10}; do
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Backend is healthy"
        break
    fi
    echo "⏳ Waiting for backend... ($i/10)"
    sleep 5
done

echo ""
echo "🌱 Step 5: Re-seeding database..."
BACKEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep backend | head -1)
if [ -n "$BACKEND_CONTAINER" ]; then
    echo "Running database seed..."
    docker exec $BACKEND_CONTAINER npm run prisma:seed || echo "Seed may have already run"
else
    echo "❌ Backend container not found"
fi

echo ""
echo "🧪 Step 6: Testing login..."
sleep 5

LOGIN_TEST=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$LOGIN_TEST" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Login is working correctly!"
    echo ""
    echo "🎉 SUCCESS! You can now login with:"
    echo "   📧 Email: admin@example.com"
    echo "   🔑 Password: admin123"
    echo ""
    echo "🌐 Access your application at:"
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
    echo "   Frontend: http://$PUBLIC_IP:3000"
    echo "   Backend:  http://$PUBLIC_IP:3001"
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "⚠️  API is responding but login failed"
    echo "   This might be a database seeding issue"
    echo ""
    echo "🔄 Trying database reset..."
    docker exec $BACKEND_CONTAINER npm run prisma:migrate:reset --force || echo "Reset failed"
    sleep 10
    docker exec $BACKEND_CONTAINER npm run prisma:seed || echo "Seed failed"
    
    echo ""
    echo "🧪 Testing login again..."
    LOGIN_TEST2=$(curl -s -X POST http://localhost:3001/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@example.com","password":"admin123"}' \
      -w "HTTP_STATUS:%{http_code}")
    
    HTTP_STATUS2=$(echo "$LOGIN_TEST2" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$HTTP_STATUS2" = "200" ]; then
        echo "✅ Login is now working after database reset!"
    else
        echo "❌ Login still not working. Check logs:"
        echo "   docker logs $BACKEND_CONTAINER"
    fi
else
    echo "❌ Backend is not responding correctly"
    echo "   Status code: $HTTP_STATUS"
    echo ""
    echo "🔍 Check backend logs:"
    echo "   docker logs $BACKEND_CONTAINER"
    echo ""
    echo "🔍 Check if backend is running:"
    echo "   docker ps | grep backend"
fi

echo ""
echo "📋 Default Login Credentials:"
echo "============================="
echo "👤 Admin:   admin@example.com / admin123"
echo "👤 Manager: manager@example.com / manager123"  
echo "👤 User:    user@example.com / user123"

echo ""
echo "🔧 If login still doesn't work:"
echo "==============================="
echo "1. Check browser console for JavaScript errors"
echo "2. Verify the frontend can reach the backend:"
echo "   curl http://localhost:3001/health"
echo "3. Check container logs:"
echo "   docker logs asset-management-frontend"
echo "   docker logs asset-management-backend"
echo "4. Run comprehensive diagnostics:"
echo "   npm run debug:login"