#!/bin/bash

# EC2 Deployment Troubleshooting Script
# This script helps diagnose and fix common EC2 deployment issues

echo "🔍 EC2 Deployment Troubleshooting"
echo "=================================="

# Get the public IP
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
echo "🔍 Checking Docker containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Checking port bindings..."
netstat -tlnp | grep -E ':(3000|3001|80|443)' || echo "No services found on common ports"

echo ""
echo "🔍 Testing local connectivity..."
echo "Frontend (port 3000):"
curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3000 || echo "  ❌ Frontend not accessible locally"

echo "Backend (port 3001):"
curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:3001/health || echo "  ❌ Backend not accessible locally"

echo ""
echo "🔍 Checking firewall (iptables)..."
if command -v iptables >/dev/null 2>&1; then
    sudo iptables -L INPUT -n | grep -E '(3000|3001|80|443)' || echo "  No specific rules found for web ports"
else
    echo "  iptables not available"
fi

echo ""
echo "🔍 Checking if UFW is active..."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw status || echo "  UFW not configured"
else
    echo "  UFW not installed"
fi

echo ""
echo "📋 TROUBLESHOOTING CHECKLIST:"
echo "=============================="
echo ""
echo "1. 🔐 AWS Security Group (MOST COMMON ISSUE):"
echo "   - Go to EC2 Console → Security Groups"
echo "   - Find your instance's security group"
echo "   - Add inbound rules:"
echo "     * Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0"
echo "     * Type: Custom TCP, Port: 3001, Source: 0.0.0.0/0"
echo "     * Type: HTTP, Port: 80, Source: 0.0.0.0/0"
echo ""
echo "2. 🌐 Test URLs (replace with your public IP):"
if [ -n "$PUBLIC_IP" ]; then
    echo "   Frontend: http://$PUBLIC_IP:3000"
    echo "   Backend:  http://$PUBLIC_IP:3001/health"
else
    echo "   Frontend: http://YOUR_PUBLIC_IP:3000"
    echo "   Backend:  http://YOUR_PUBLIC_IP:3001/health"
fi
echo ""
echo "3. 🔄 If containers aren't running:"
echo "   npm stop && npm start"
echo ""
echo "4. 📱 For production deployment:"
echo "   npm run deploy:prod"
echo ""
echo "5. 🔍 Check container logs:"
echo "   docker logs asset-management-frontend"
echo "   docker logs asset-management-backend"

echo ""
echo "🚀 Quick fixes to try:"
echo "====================="
echo ""
echo "# Restart with explicit host binding"
echo "docker-compose down"
echo "docker-compose up -d"
echo ""
echo "# Or use production setup (recommended for EC2)"
echo "npm run deploy:prod"