#!/bin/bash

echo "Testing QR Code Scan Flow"
echo "=========================="
echo ""

# Step 1: Login to get token
echo "Step 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get auth token"
    exit 1
fi

echo "✅ Got auth token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test QR scan with the problematic data
echo "Step 2: Testing QR scan with your data..."
QR_DATA='{"type":"asset","name":"airpods","serialnumber":"923840932841903820","category":"hardware"}'

SCAN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/qrcode/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"data\":\"$QR_DATA\"}")

echo "Scan response:"
echo "$SCAN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SCAN_RESPONSE"
echo ""

# Step 3: Test with correct format
echo "Step 3: Testing QR scan with correct format..."
QR_DATA_CORRECT='{"type":"asset","name":"airpods","serialNumber":"923840932841903820","category":"HARDWARE"}'

SCAN_RESPONSE_CORRECT=$(curl -s -X POST http://localhost:3001/api/qrcode/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"data\":\"$QR_DATA_CORRECT\"}")

echo "Scan response (correct format):"
echo "$SCAN_RESPONSE_CORRECT" | python3 -m json.tool 2>/dev/null || echo "$SCAN_RESPONSE_CORRECT"
echo ""

echo "=========================="
echo "Test complete!"
