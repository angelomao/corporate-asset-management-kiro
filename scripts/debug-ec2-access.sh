#!/bin/bash

# EC2 Access Debugging Script
# Comprehensive diagnostics for frontend access issues

echo "🔍 EC2 Frontend Access Debugging"
echo "================================="

# Get IP information
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4 2>/dev/null)

if [ -n "$PUBLIC_IP" ]; then
    echo "✅ Public IP: $PUBLIC_IP"
    echo "✅ Private IP: $PRIVATE_IP"
else
    echo "❌ Not running on EC2 or metadata service unavailable"
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "Unable to detect")
    echo "🌐 External IP: $PUBLIC_IP"
fi

echo ""
echo "🔍 Docker Container Status:"
echo "============================"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(frontend|backend|nginx)" || echo "No relevant containers found"

echo ""
echo "🔍 Port Binding Analysis:"
echo "=========================="
echo "Checking what's listening on key ports..."
netstat -tlnp 2>/dev/null | grep -E ':(3000|3001|80|443)' || echo "No services found on web ports"

echo ""
echo "🔍 Container Network Inspection:"
echo "================================="
FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep frontend | head -1)
if [ -n "$FRONTEND_CONTAINER" ]; then
    echo "Frontend container: $FRONTEND_CONTAINER"
    echo "Container IP:"
    docker inspect $FRONTEND_CONTAINER | grep -A 5 '"Networks"' | grep '"IPAddress"' || echo "Could not get container IP"
    
    echo ""
    echo "Container port mapping:"
    docker port $FRONTEND_CONTAINER || echo "No port mappings found"
    
    echo ""
    echo "Testing container internal connectivity:"
    docker exec $FRONTEND_CONTAINER curl -s -o /dev/null -w "Internal health check: %{http_code}\n" http://localhost:3000 2>/dev/null || \
    docker exec $FRONTEND_CONTAINER curl -s -o /dev/null -w "Internal health check (port 80): %{http_code}\n" http://localhost:80 2>/dev/null || \
    echo "Could not test internal connectivity"
else
    echo "❌ No frontend container found"
fi

echo ""
echo "🔍 Local Connectivity Tests:"
echo "============================="
echo "Testing localhost access..."

echo "Frontend (port 3000):"
curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3000 2>/dev/null || echo "  ❌ Not accessible on port 3000"

echo "Frontend (port 80):"
curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:80 2>/dev/null || echo "  ❌ Not accessible on port 80"

echo "Backend (port 3001):"
curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3001/health 2>/dev/null || echo "  ❌ Backend not accessible"

echo ""
echo "🔍 External Connectivity Tests:"
echo "==============================="
if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "Unable to detect" ]; then
    echo "Testing external access via public IP..."
    
    echo "Frontend via public IP:"
    timeout 10 curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://$PUBLIC_IP:3000 2>/dev/null || echo "  ❌ Not accessible externally"
    
    echo "Backend via public IP:"
    timeout 10 curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://$PUBLIC_IP:3001/health 2>/dev/null || echo "  ❌ Backend not accessible externally"
else
    echo "⚠️  Cannot test external connectivity - public IP not available"
fi

echo ""
echo "🔍 Firewall Analysis:"
echo "====================="
if command -v ufw >/dev/null 2>&1; then
    echo "UFW Status:"
    sudo ufw status numbered 2>/dev/null || echo "UFW status check failed"
else
    echo "UFW not installed"
fi

if command -v iptables >/dev/null 2>&1; then
    echo ""
    echo "iptables rules for web ports:"
    sudo iptables -L INPUT -n | grep -E '(3000|3001|80|443)' || echo "No specific iptables rules found for web ports"
else
    echo "iptables not available"
fi

echo ""
echo "🔍 Docker Compose Configuration:"
echo "================================="
echo "Active Docker Compose files:"
ls -la docker-compose*.yml 2>/dev/null || echo "No Docker Compose files found"

echo ""
echo "Current environment variables:"
env | grep -E '(API_URL|FRONTEND_URL|VITE_)' || echo "No relevant environment variables set"

echo ""
echo "📋 DIAGNOSIS SUMMARY:"
echo "====================="
echo ""
echo "🔧 RECOMMENDED FIXES:"
echo ""
echo "1. 🚀 Try the simplified EC2 development mode:"
echo "   npm run start:ec2-dev"
echo ""
echo "2. 🔐 Verify AWS Security Group has these inbound rules:"
echo "   - Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0"
echo "   - Type: Custom TCP, Port: 3001, Source: 0.0.0.0/0"
echo ""
echo "3. 🔥 If UFW is active, allow the ports:"
echo "   sudo ufw allow 3000"
echo "   sudo ufw allow 3001"
echo ""
echo "4. 🔄 If containers aren't running properly:"
echo "   docker-compose down && docker-compose up -d --build"
echo ""
echo "5. 📋 Check container logs for errors:"
echo "   docker logs asset-management-frontend"
echo "   docker logs asset-management-backend"