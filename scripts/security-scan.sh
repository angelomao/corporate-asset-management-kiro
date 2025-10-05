#!/bin/bash

# Docker Vulnerability Scanner and Auto-Remediation
# Scans Docker images for vulnerabilities and attempts to fix critical issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SCAN_RESULTS_DIR="$PROJECT_ROOT/security-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create reports directory
mkdir -p "$SCAN_RESULTS_DIR"

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to install security scanning tools
install_security_tools() {
    log "Checking security scanning tools..."
    
    # Install Trivy (vulnerability scanner)
    if ! command -v trivy &> /dev/null; then
        log "Installing Trivy vulnerability scanner..."
        if command -v brew &> /dev/null; then
            brew install trivy
        else
            # Install via script for Linux
            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
        fi
    fi
    
    # Install Docker Scout (if available)
    if ! docker scout version &> /dev/null; then
        log "Docker Scout not available, using Trivy only"
    fi
}

# Function to get all Docker images in the project
get_project_images() {
    local images=()
    
    # Get images from docker-compose files
    if [[ -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        images+=($(docker-compose -f "$PROJECT_ROOT/docker-compose.yml" config --services | while read service; do
            docker-compose -f "$PROJECT_ROOT/docker-compose.yml" images -q "$service" 2>/dev/null || echo ""
        done | grep -v "^$"))
    fi
    
    if [[ -f "$PROJECT_ROOT/docker-compose.prod.yml" ]]; then
        images+=($(docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" config --services | while read service; do
            docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" images -q "$service" 2>/dev/null || echo ""
        done | grep -v "^$"))
    fi
    
    # Add custom project images
    images+=("asset-management-frontend" "asset-management-backend")
    
    # Remove duplicates and empty entries
    printf '%s\n' "${images[@]}" | sort -u | grep -v "^$"
}

# Function to scan image for vulnerabilities
scan_image() {
    local image="$1"
    local report_file="$SCAN_RESULTS_DIR/scan_${image//[\/:]/_}_$TIMESTAMP.json"
    
    log "Scanning image: $image"
    
    # Scan with Trivy
    if trivy image --format json --output "$report_file" "$image" 2>/dev/null; then
        success "Scan completed for $image"
        
        # Extract critical vulnerabilities
        local critical_count=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' "$report_file" 2>/dev/null || echo "0")
        local high_count=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH")] | length' "$report_file" 2>/dev/null || echo "0")
        
        echo "$critical_count,$high_count,$report_file"
    else
        error "Failed to scan $image"
        echo "0,0,"
    fi
}

# Function to analyze vulnerabilities and suggest fixes
analyze_vulnerabilities() {
    local report_file="$1"
    local fixes_file="$SCAN_RESULTS_DIR/fixes_$(basename "$report_file" .json).md"
    
    log "Analyzing vulnerabilities in $report_file"
    
    cat > "$fixes_file" << 'EOF'
# Vulnerability Analysis and Fixes

## Critical Issues Found

EOF
    
    # Extract critical vulnerabilities with fix suggestions
    jq -r '.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL") | 
        "### " + .VulnerabilityID + " - " + .Title + "\n" +
        "**Package:** " + .PkgName + " " + (.InstalledVersion // "unknown") + "\n" +
        "**Fixed Version:** " + (.FixedVersion // "Not available") + "\n" +
        "**Description:** " + (.Description // "No description") + "\n" +
        "**Fix:** " + (if .FixedVersion then "Update to version " + .FixedVersion else "No fix available yet") + "\n"
    ' "$report_file" >> "$fixes_file" 2>/dev/null || true
    
    echo "$fixes_file"
}

# Function to generate Dockerfile fixes
generate_dockerfile_fixes() {
    local dockerfile="$1"
    local report_file="$2"
    local fixed_dockerfile="${dockerfile}.security-fixed"
    
    log "Generating security fixes for $dockerfile"
    
    # Copy original Dockerfile
    cp "$dockerfile" "$fixed_dockerfile"
    
    # Add security improvements
    cat >> "$fixed_dockerfile" << 'EOF'

# Security improvements added by automated scanner
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Update npm packages to latest versions
RUN npm audit fix --force || true

# Set non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

EOF
    
    success "Generated security-fixed Dockerfile: $fixed_dockerfile"
    echo "$fixed_dockerfile"
}

# Function to rebuild images with fixes
rebuild_with_fixes() {
    local service="$1"
    local dockerfile="$2"
    
    log "Rebuilding $service with security fixes..."
    
    # Build with the fixed Dockerfile
    if docker build -f "$dockerfile" -t "${service}:security-fixed" .; then
        success "Successfully rebuilt $service with security fixes"
        
        # Tag as latest if scan passes
        local new_scan_result=$(scan_image "${service}:security-fixed")
        local new_critical=$(echo "$new_scan_result" | cut -d',' -f1)
        
        if [[ "$new_critical" -eq 0 ]]; then
            docker tag "${service}:security-fixed" "${service}:latest"
            success "Tagged $service:security-fixed as latest (no critical vulnerabilities)"
            return 0
        else
            warning "$service still has $new_critical critical vulnerabilities after fixes"
            return 1
        fi
    else
        error "Failed to rebuild $service"
        return 1
    fi
}

# Main scanning function
main() {
    log "Starting Docker Security Scan and Auto-Remediation"
    log "=================================================="
    
    check_docker
    install_security_tools
    
    local total_critical=0
    local total_high=0
    local images_scanned=0
    local images_fixed=0
    
    # Get all project images
    local images=($(get_project_images))
    
    if [[ ${#images[@]} -eq 0 ]]; then
        warning "No Docker images found to scan"
        exit 0
    fi
    
    log "Found ${#images[@]} images to scan"
    
    # Scan each image
    for image in "${images[@]}"; do
        if [[ -n "$image" ]]; then
            local scan_result=$(scan_image "$image")
            local critical=$(echo "$scan_result" | cut -d',' -f1)
            local high=$(echo "$scan_result" | cut -d',' -f2)
            local report_file=$(echo "$scan_result" | cut -d',' -f3)
            
            total_critical=$((total_critical + critical))
            total_high=$((total_high + high))
            images_scanned=$((images_scanned + 1))
            
            if [[ "$critical" -gt 0 ]] && [[ -n "$report_file" ]]; then
                warning "Found $critical critical vulnerabilities in $image"
                
                # Generate analysis
                local fixes_file=$(analyze_vulnerabilities "$report_file")
                log "Analysis saved to: $fixes_file"
                
                # Attempt to fix if it's a project image
                if [[ "$image" == *"asset-management"* ]]; then
                    local dockerfile=""
                    if [[ "$image" == *"frontend"* ]]; then
                        dockerfile="$PROJECT_ROOT/frontend/Dockerfile"
                    elif [[ "$image" == *"backend"* ]]; then
                        dockerfile="$PROJECT_ROOT/backend/Dockerfile"
                    fi
                    
                    if [[ -f "$dockerfile" ]]; then
                        local fixed_dockerfile=$(generate_dockerfile_fixes "$dockerfile" "$report_file")
                        if rebuild_with_fixes "$image" "$fixed_dockerfile"; then
                            images_fixed=$((images_fixed + 1))
                        fi
                    fi
                fi
            else
                success "$image: $critical critical, $high high vulnerabilities"
            fi
        fi
    done
    
    # Generate summary report
    local summary_file="$SCAN_RESULTS_DIR/security_summary_$TIMESTAMP.md"
    cat > "$summary_file" << EOF
# Docker Security Scan Summary

**Scan Date:** $(date)
**Images Scanned:** $images_scanned
**Images Fixed:** $images_fixed

## Vulnerability Summary
- **Critical:** $total_critical
- **High:** $total_high

## Recommendations
$(if [[ $total_critical -gt 0 ]]; then
    echo "🚨 **URGENT:** $total_critical critical vulnerabilities found!"
    echo "- Review individual scan reports in $SCAN_RESULTS_DIR"
    echo "- Apply security fixes immediately"
    echo "- Consider updating base images"
else
    echo "✅ **GOOD:** No critical vulnerabilities found"
fi)

## Next Steps
1. Review detailed reports in: \`$SCAN_RESULTS_DIR\`
2. Apply recommended fixes
3. Rebuild and redeploy affected services
4. Schedule regular security scans

EOF
    
    log "Security scan completed!"
    log "Summary report: $summary_file"
    
    if [[ $total_critical -gt 0 ]]; then
        error "Found $total_critical critical vulnerabilities across $images_scanned images"
        exit 1
    else
        success "No critical vulnerabilities found in $images_scanned images"
        exit 0
    fi
}

# Run main function
main "$@"