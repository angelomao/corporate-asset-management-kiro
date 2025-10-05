#!/bin/bash

# QR Code Feature Installation Script
# This script installs all dependencies needed for the QR code feature

set -e  # Exit on error

echo "=========================================="
echo "QR Code Feature Installation"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Starting QR code feature installation..."
echo ""

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend

if npm install qrcode @types/qrcode; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ..

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd frontend

if npm install html5-qrcode; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
print_success "All dependencies installed successfully!"
echo ""

# Check if Docker is being used
if [ -f "docker-compose.yml" ]; then
    print_info "Docker Compose detected"
    echo ""
    echo "To apply changes, run:"
    echo "  docker-compose down"
    echo "  docker-compose up --build"
else
    print_info "Manual setup detected"
    echo ""
    echo "To apply changes:"
    echo "  1. Restart backend: cd backend && npm run dev"
    echo "  2. Restart frontend: cd frontend && npm run dev"
fi

echo ""
print_info "Next steps:"
echo "  1. Restart your services (see above)"
echo "  2. Login as Admin or Manager"
echo "  3. Navigate to 'QR Generator' in the sidebar"
echo "  4. Generate your first QR code!"
echo ""
print_info "Documentation:"
echo "  - Quick Start: docs/QR_CODE_QUICK_START.md"
echo "  - Full Guide: docs/QR_CODE_FEATURE.md"
echo "  - UI Guide: docs/QR_CODE_UI_GUIDE.md"
echo ""

print_success "Installation complete! 🎉"
echo ""
