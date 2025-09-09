#!/bin/bash

# Monitoring script for Asset Management System
# Usage: ./scripts/monitor.sh [action]

set -e

ACTION=${1:-status}
COMPOSE_FILE="docker-compose.prod.yml"

case $ACTION in
    "status")
        echo "=== Service Status ==="
        docker-compose -f "$COMPOSE_FILE" ps
        echo ""
        
        echo "=== Health Checks ==="
        # Backend health
        if curl -f http://localhost:3001/health/detailed 2>/dev/null; then
            echo "✓ Backend is healthy"
        else
            echo "✗ Backend health check failed"
        fi
        
        # Frontend health
        if curl -f http://localhost:3000 2>/dev/null; then
            echo "✓ Frontend is healthy"
        else
            echo "✗ Frontend health check failed"
        fi
        ;;
        
    "logs")
        SERVICE=${2:-all}
        if [ "$SERVICE" = "all" ]; then
            echo "=== All Service Logs ==="
            docker-compose -f "$COMPOSE_FILE" logs --tail=100 -f
        else
            echo "=== $SERVICE Logs ==="
            docker-compose -f "$COMPOSE_FILE" logs --tail=100 -f "$SERVICE"
        fi
        ;;
        
    "metrics")
        echo "=== System Metrics ==="
        
        # Container resource usage
        echo "Container Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
        echo ""
        
        # Disk usage
        echo "Disk Usage:"
        df -h
        echo ""
        
        # Database size
        echo "Database Size:"
        docker-compose -f "$COMPOSE_FILE" exec database psql -U postgres -d asset_management_prod -c "
            SELECT 
                pg_size_pretty(pg_database_size('asset_management_prod')) as database_size,
                (SELECT count(*) FROM \"User\") as users,
                (SELECT count(*) FROM \"Asset\") as assets;
        " 2>/dev/null || echo "Could not connect to database"
        ;;
        
    "backup")
        echo "=== Creating Backup ==="
        ./scripts/backup-database.sh production
        ;;
        
    "restart")
        SERVICE=${2:-all}
        if [ "$SERVICE" = "all" ]; then
            echo "=== Restarting All Services ==="
            docker-compose -f "$COMPOSE_FILE" restart
        else
            echo "=== Restarting $SERVICE ==="
            docker-compose -f "$COMPOSE_FILE" restart "$SERVICE"
        fi
        ;;
        
    "cleanup")
        echo "=== Cleaning Up ==="
        # Remove unused Docker images
        docker image prune -f
        
        # Remove old log files (older than 30 days)
        find logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
        
        # Remove old backups (older than 30 days)
        find backups -name "*.sql.gz" -mtime +30 -delete 2>/dev/null || true
        
        echo "Cleanup completed"
        ;;
        
    "alerts")
        echo "=== System Alerts ==="
        
        # Check disk space
        DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
        if [ "$DISK_USAGE" -gt 80 ]; then
            echo "⚠️  WARNING: Disk usage is ${DISK_USAGE}%"
        fi
        
        # Check memory usage
        MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [ "$MEMORY_USAGE" -gt 80 ]; then
            echo "⚠️  WARNING: Memory usage is ${MEMORY_USAGE}%"
        fi
        
        # Check if services are running
        if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
            echo "🚨 CRITICAL: Some services are not running"
        fi
        
        # Check recent errors in logs
        ERROR_COUNT=$(docker-compose -f "$COMPOSE_FILE" logs --since="1h" 2>&1 | grep -i error | wc -l)
        if [ "$ERROR_COUNT" -gt 10 ]; then
            echo "⚠️  WARNING: ${ERROR_COUNT} errors found in the last hour"
        fi
        ;;
        
    *)
        echo "Usage: $0 [action]"
        echo "Actions:"
        echo "  status   - Show service status and health"
        echo "  logs     - Show service logs (optional: specify service name)"
        echo "  metrics  - Show system metrics"
        echo "  backup   - Create database backup"
        echo "  restart  - Restart services (optional: specify service name)"
        echo "  cleanup  - Clean up old files and images"
        echo "  alerts   - Check for system alerts"
        exit 1
        ;;
esac