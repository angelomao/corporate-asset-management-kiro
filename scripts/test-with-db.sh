#!/bin/bash

# Test runner script that sets up test database before running tests

set -e

echo "🔧 Setting up test environment..."

# Check if TEST_DATABASE_URL is set
if [ -z "$TEST_DATABASE_URL" ]; then
  echo "⚠️  TEST_DATABASE_URL not set, using default DATABASE_URL"
fi

# Run database migrations for test database
echo "📦 Running database migrations..."
cd backend
npx prisma migrate deploy

# Seed test database
echo "🌱 Seeding test database..."
npx ts-node ../scripts/seed-test-db.ts

# Run tests
echo "🧪 Running tests..."
if [ "$1" = "integration" ]; then
  npm test -- --testPathPattern="integration"
elif [ "$1" = "unit" ]; then
  npm test -- --testPathIgnorePatterns="integration"
elif [ "$1" = "e2e" ]; then
  cd ..
  npm run test:e2e
else
  npm test
fi

echo "✅ Tests completed!"