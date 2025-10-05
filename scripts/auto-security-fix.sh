#!/bin/bash

# Automated Security Fix Script
# Applies security fixes to Dockerfiles and rebuilds images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to update base images to latest secure versions
update_base_images() {
    local dockerfile="$1"
    local backup_file="${dockerfile}.backup.$(date +%s)"
    
    log "Updating base images in $dockerfile"
    
    # Create backup
    cp "$dockerfile" "$backup_file"
    
    # Update common base images to latest LTS/stable versions
    sed -i.tmp \
        -e 's/FROM node:[0-9][0-9]*-alpine/FROM node:18-alpine/g' \
        -e 's/FROM node:[0-9][0-9]*/FROM node:18-alpine/g' \
        -e 's/FROM postgres:[0-9][0-9]*-alpine/FROM postgres:15-alpine/g' \
        -e 's/FROM postgres:[0-9][0-9]*/FROM postgres:15-alpine/g' \
        -e 's/FROM nginx:[0-9][0-9]*-alpine/FROM nginx:alpine/g' \
        -e 's/FROM nginx:[0-9][0-9]*/FROM nginx:alpine/g' \
        "$dockerfile"
    
    rm -f "${dockerfile}.tmp"
    
    success "Updated base images in $dockerfile (backup: $backup_file)"
}

# Function to add security hardening to Dockerfile
add_security_hardening() {
    local dockerfile="$1"
    local temp_file=$(mktemp)
    
    log "Adding security hardening to $dockerfile"
    
    # Read the original Dockerfile and add security improvements
    {
        # Copy original content
        cat "$dockerfile"
        
        echo ""
        echo "# === SECURITY HARDENING (Auto-added) ==="
        echo ""
        
        # Add security updates
        echo "# Update system packages and install security updates"
        echo "RUN if command -v apt-get >/dev/null 2>&1; then \\"
        echo "        apt-get update && \\"
        echo "        apt-get upgrade -y && \\"
        echo "        apt-get install -y --no-install-recommends ca-certificates curl && \\"
        echo "        apt-get clean && \\"
        echo "        rm -rf /var/lib/apt/lists/*; \\"
        echo "    elif command -v apk >/dev/null 2>&1; then \\"
        echo "        apk update && \\"
        echo "        apk upgrade && \\"
        echo "        apk add --no-cache ca-certificates curl; \\"
        echo "    fi"
        echo ""
        
        # Add npm security updates
        echo "# Update npm packages and fix vulnerabilities"
        echo "RUN if command -v npm >/dev/null 2>&1; then \\"
        echo "        npm audit fix --force || true && \\"
        echo "        npm update || true; \\"
        echo "    fi"
        echo ""
        
        # Add non-root user
        echo "# Create non-root user for security"
        echo "RUN if ! id appuser >/dev/null 2>&1; then \\"
        echo "        if command -v addgroup >/dev/null 2>&1; then \\"
        echo "            addgroup -g 1001 -S appuser && \\"
        echo "            adduser -S -D -H -u 1001 -s /sbin/nologin -G appuser appuser; \\"
        echo "        else \\"
        echo "            groupadd -r appuser && \\"
        echo "            useradd -r -g appuser -u 1001 -s /bin/false appuser; \\"
        echo "        fi; \\"
        echo "    fi"
        echo ""
        
        # Set proper permissions
        echo "# Set secure permissions"
        echo "RUN if [ -d /app ]; then chown -R appuser:appuser /app; fi"
        echo ""
        
        # Switch to non-root user (commented out to avoid breaking existing setups)
        echo "# Uncomment the next line to run as non-root user"
        echo "# USER appuser"
        echo ""
        
    } > "$temp_file"
    
    # Replace original file
    mv "$temp_file" "$dockerfile"
    
    success "Added security hardening to $dockerfile"
}

# Function to fix package.json vulnerabilities
fix_package_vulnerabilities() {
    local package_dir="$1"
    
    if [[ -f "$package_dir/package.json" ]]; then
        log "Fixing npm vulnerabilities in $package_dir"
        
        cd "$package_dir"
        
        # Update npm to latest
        npm install -g npm@latest || true
        
        # Run npm audit fix
        npm audit fix --force || true
        
        # Update dependencies
        npm update || true
        
        success "Fixed npm vulnerabilities in $package_dir"
        cd "$PROJECT_ROOT"
    fi
}

# Function to create security-focused .dockerignore
create_secure_dockerignore() {
    local dir="$1"
    local dockerignore="$dir/.dockerignore"
    
    log "Creating secure .dockerignore in $dir"
    
    cat > "$dockerignore" << 'EOF'
# Security-focused .dockerignore

# Sensitive files
.env
.env.*
*.key
*.pem
*.p12
*.pfx
secrets/
credentials/

# Development files
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn

# Git and version control
.git/
.gitignore
.gitattributes

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Test and coverage files
coverage/
.nyc_output/
test-results/
*.test.js
*.spec.js

# Documentation
README.md
docs/
*.md

# Build artifacts
dist/
build/
target/

# Logs
logs/
*.log

# Temporary files
tmp/
temp/
*.tmp
EOF

    success "Created secure .dockerignore in $dir"
}

# Main function
main() {
    log "Starting Automated Security Fix Process"
    log "======================================"
    
    local fixed_count=0
    
    # Fix frontend
    if [[ -f "$PROJECT_ROOT/frontend/Dockerfile" ]]; then
        log "Processing frontend Dockerfile..."
        update_base_images "$PROJECT_ROOT/frontend/Dockerfile"
        add_security_hardening "$PROJECT_ROOT/frontend/Dockerfile"
        create_secure_dockerignore "$PROJECT_ROOT/frontend"
        fix_package_vulnerabilities "$PROJECT_ROOT/frontend"
        fixed_count=$((fixed_count + 1))
    fi
    
    # Fix backend
    if [[ -f "$PROJECT_ROOT/backend/Dockerfile" ]]; then
        log "Processing backend Dockerfile..."
        update_base_images "$PROJECT_ROOT/backend/Dockerfile"
        add_security_hardening "$PROJECT_ROOT/backend/Dockerfile"
        create_secure_dockerignore "$PROJECT_ROOT/backend"
        fix_package_vulnerabilities "$PROJECT_ROOT/backend"
        fixed_count=$((fixed_count + 1))
    fi
    
    # Create root .dockerignore if it doesn't exist
    if [[ ! -f "$PROJECT_ROOT/.dockerignore" ]]; then
        create_secure_dockerignore "$PROJECT_ROOT"
    fi
    
    # Rebuild images with security fixes
    log "Rebuilding images with security fixes..."
    
    if docker-compose build --no-cache; then
        success "Successfully rebuilt all images with security fixes"
    else
        error "Failed to rebuild some images"
        exit 1
    fi
    
    success "Automated security fixes completed!"
    log "Fixed $fixed_count Dockerfiles"
    log "Next steps:"
    log "1. Run security scan: ./scripts/security-scan.sh"
    log "2. Test the application: npm start"
    log "3. Deploy if tests pass: npm run deploy:ec2"
}

# Run main function
main "$@"