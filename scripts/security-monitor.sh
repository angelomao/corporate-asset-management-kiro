#!/bin/bash

# Security Monitoring Dashboard
# Provides real-time security status and metrics

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPORTS_DIR="$PROJECT_ROOT/security-reports"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Function to display security dashboard
show_dashboard() {
    clear
    echo -e "${BOLD}${BLUE}🛡️  Docker Security Dashboard${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    # System status
    echo -e "${BOLD}System Status:${NC}"
    if docker info >/dev/null 2>&1; then
        echo -e "  Docker: ${GREEN}✅ Running${NC}"
    else
        echo -e "  Docker: ${RED}❌ Not Running${NC}"
    fi
    
    if command -v trivy >/dev/null 2>&1; then
        echo -e "  Trivy Scanner: ${GREEN}✅ Installed${NC}"
    else
        echo -e "  Trivy Scanner: ${YELLOW}⚠️  Not Installed${NC}"
    fi
    
    echo ""
    
    # Recent scan results
    echo -e "${BOLD}Recent Scan Results:${NC}"
    if [[ -d "$REPORTS_DIR" ]]; then
        local latest_scan=$(find "$REPORTS_DIR" -name "security_summary_*.md" -type f -exec ls -t {} + | head -1)
        if [[ -n "$latest_scan" ]]; then
            local scan_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$latest_scan" 2>/dev/null || date -r "$latest_scan" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "Unknown")
            echo -e "  Last Scan: ${GREEN}$scan_date${NC}"
            
            # Extract vulnerability counts from summary
            if grep -q "Critical.*0" "$latest_scan" 2>/dev/null; then
                echo -e "  Critical Vulnerabilities: ${GREEN}✅ 0${NC}"
            else
                local critical=$(grep -o "Critical.*[0-9]\+" "$latest_scan" 2>/dev/null | grep -o "[0-9]\+" | head -1 || echo "Unknown")
                if [[ "$critical" != "Unknown" && "$critical" -gt 0 ]]; then
                    echo -e "  Critical Vulnerabilities: ${RED}🚨 $critical${NC}"
                else
                    echo -e "  Critical Vulnerabilities: ${GREEN}✅ 0${NC}"
                fi
            fi
        else
            echo -e "  ${YELLOW}⚠️  No scan results found${NC}"
        fi
    else
        echo -e "  ${YELLOW}⚠️  No security reports directory${NC}"
    fi
    
    echo ""
    
    # Docker images status
    echo -e "${BOLD}Docker Images:${NC}"
    local images=($(docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "(asset-management|postgres|nginx)" | head -5))
    for image in "${images[@]}"; do
        if [[ -n "$image" ]]; then
            echo -e "  📦 $image"
        fi
    done
    
    echo ""
    
    # Quick actions
    echo -e "${BOLD}Quick Actions:${NC}"
    echo -e "  ${BLUE}[1]${NC} Run Security Scan"
    echo -e "  ${BLUE}[2]${NC} Auto-Fix Critical Issues"
    echo -e "  ${BLUE}[3]${NC} View Latest Report"
    echo -e "  ${BLUE}[4]${NC} System Health Check"
    echo -e "  ${BLUE}[5]${NC} Refresh Dashboard"
    echo -e "  ${BLUE}[q]${NC} Quit"
    echo ""
}

# Function to run security scan
run_security_scan() {
    echo -e "${BLUE}Running security scan...${NC}"
    if "$SCRIPT_DIR/security-scan.sh"; then
        echo -e "${GREEN}✅ Security scan completed successfully${NC}"
    else
        echo -e "${RED}❌ Security scan failed${NC}"
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Function to auto-fix issues
auto_fix_issues() {
    echo -e "${BLUE}Running auto-fix for critical issues...${NC}"
    if "$SCRIPT_DIR/auto-security-fix.sh"; then
        echo -e "${GREEN}✅ Auto-fix completed successfully${NC}"
    else
        echo -e "${RED}❌ Auto-fix failed${NC}"
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Function to view latest report
view_latest_report() {
    if [[ -d "$REPORTS_DIR" ]]; then
        local latest_report=$(find "$REPORTS_DIR" -name "security_summary_*.md" -type f -exec ls -t {} + | head -1)
        if [[ -n "$latest_report" ]]; then
            echo -e "${BLUE}Latest Security Report:${NC}"
            echo "========================"
            cat "$latest_report"
        else
            echo -e "${YELLOW}No security reports found${NC}"
        fi
    else
        echo -e "${YELLOW}No security reports directory found${NC}"
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Function to check system health
system_health_check() {
    echo -e "${BLUE}System Health Check:${NC}"
    echo "===================="
    
    # Docker status
    if docker info >/dev/null 2>&1; then
        echo -e "Docker: ${GREEN}✅ Healthy${NC}"
        echo "  Version: $(docker --version)"
        echo "  Images: $(docker images -q | wc -l | tr -d ' ')"
        echo "  Containers: $(docker ps -q | wc -l | tr -d ' ') running"
    else
        echo -e "Docker: ${RED}❌ Not running${NC}"
    fi
    
    echo ""
    
    # Security tools
    if command -v trivy >/dev/null 2>&1; then
        echo -e "Trivy: ${GREEN}✅ Available${NC}"
        echo "  Version: $(trivy --version | head -1)"
    else
        echo -e "Trivy: ${YELLOW}⚠️  Not installed${NC}"
    fi
    
    echo ""
    
    # Disk space for reports
    if [[ -d "$REPORTS_DIR" ]]; then
        local report_size=$(du -sh "$REPORTS_DIR" 2>/dev/null | cut -f1 || echo "Unknown")
        echo -e "Security Reports: ${GREEN}✅ Available${NC}"
        echo "  Directory: $REPORTS_DIR"
        echo "  Size: $report_size"
        echo "  Files: $(find "$REPORTS_DIR" -type f | wc -l | tr -d ' ')"
    else
        echo -e "Security Reports: ${YELLOW}⚠️  Directory not found${NC}"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Main interactive loop
main() {
    while true; do
        show_dashboard
        read -p "Select an option: " choice
        
        case $choice in
            1)
                run_security_scan
                ;;
            2)
                auto_fix_issues
                ;;
            3)
                view_latest_report
                ;;
            4)
                system_health_check
                ;;
            5)
                # Refresh dashboard (just continue loop)
                ;;
            q|Q)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please try again.${NC}"
                sleep 1
                ;;
        esac
    done
}

# Run main function
main "$@"