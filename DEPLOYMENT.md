# Production Deployment Guide

This guide covers deploying the Asset Management System to a production environment.

## Prerequisites

- Docker and Docker Compose installed
- SSL certificates (for HTTPS)
- Domain name configured
- Sufficient server resources (minimum 2GB RAM, 20GB disk space)

## Quick Start

1. **Clone the repository and navigate to the project directory**
   ```bash
   git clone <repository-url>
   cd asset-management-system
   ```

2. **Set up environment variables**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your actual values
   ```

3. **Deploy the application**
   ```bash
   ./scripts/deploy.sh production
   ```

## Detailed Setup

### 1. Environment Configuration

Copy the production environment template and configure it:

```bash
cp .env.production.example .env.production
```

Update the following critical values in `.env.production`:
- `DB_PASSWORD`: Strong database password
- `JWT_SECRET`: Secure JWT secret (minimum 32 characters)
- `FRONTEND_URL`: Your domain URL
- `API_URL`: Your API domain URL

### 2. SSL Certificates

Place your SSL certificates in the `ssl/` directory:
```bash
mkdir -p ssl
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

For development/testing, you can generate self-signed certificates:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

### 3. Database Setup

The deployment script will automatically:
- Create the database container
- Run migrations
- Set up proper indexes

For manual database operations:
```bash
# Run migrations
./scripts/migrate-database.sh production deploy

# Create backup
./scripts/backup-database.sh production

# Restore from backup
./scripts/restore-database.sh backups/backup-file.sql.gz production
```

### 4. Deployment

Deploy using the automated script:
```bash
./scripts/deploy.sh production
```

Or manually with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring and Maintenance

### Health Checks

Check system status:
```bash
./scripts/monitor.sh status
```

View service logs:
```bash
./scripts/monitor.sh logs [service-name]
```

### System Metrics

View resource usage and metrics:
```bash
./scripts/monitor.sh metrics
```

### Backup Management

Create manual backup:
```bash
./scripts/monitor.sh backup
```

Set up automated backups with cron:
```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/project/scripts/backup-database.sh production
```

### Log Management

Logs are stored in the `logs/` directory and automatically rotated.

View recent logs:
```bash
./scripts/monitor.sh logs
```

### Cleanup

Remove old files and unused Docker images:
```bash
./scripts/monitor.sh cleanup
```

## Security Considerations

### Network Security
- Use HTTPS only (HTTP redirects to HTTPS)
- Configure firewall to allow only necessary ports (80, 443)
- Use strong passwords and JWT secrets
- Regularly update SSL certificates

### Application Security
- Rate limiting is enabled for API endpoints
- Security headers are configured
- Input validation and sanitization
- SQL injection protection via Prisma ORM

### Database Security
- Database runs in isolated container
- Regular backups with encryption
- Strong authentication credentials
- Network isolation from external access

## Performance Optimization

### Frontend Optimizations
- Code splitting with lazy loading
- Asset compression and caching
- CDN integration (recommended)
- Bundle size optimization

### Backend Optimizations
- Connection pooling
- Request rate limiting
- Proper indexing
- Caching strategies

### Infrastructure Optimizations
- Load balancing (for high traffic)
- Database read replicas
- Redis caching layer
- Container resource limits

## Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check logs
   ./scripts/monitor.sh logs
   
   # Restart services
   ./scripts/monitor.sh restart
   ```

2. **Database connection issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml exec database pg_isready
   
   # Reset database (WARNING: destroys data)
   ./scripts/migrate-database.sh production reset
   ```

3. **SSL certificate issues**
   - Verify certificate files exist in `ssl/` directory
   - Check certificate validity: `openssl x509 -in ssl/cert.pem -text -noout`
   - Ensure proper file permissions

4. **High resource usage**
   ```bash
   # Check resource usage
   ./scripts/monitor.sh metrics
   
   # Clean up resources
   ./scripts/monitor.sh cleanup
   ```

### Log Analysis

Important log locations:
- Application logs: `logs/`
- Nginx logs: Container logs via `docker-compose logs nginx`
- Database logs: Container logs via `docker-compose logs database`

### Health Check Endpoints

- Backend health: `https://your-domain.com/health`
- Detailed health: `https://your-domain.com/health/detailed`
- Readiness probe: `https://your-domain.com/health/ready`
- Liveness probe: `https://your-domain.com/health/live`

## Scaling

### Horizontal Scaling

For high-traffic deployments:

1. **Load Balancer Setup**
   - Use multiple backend instances
   - Configure session affinity if needed
   - Implement health checks

2. **Database Scaling**
   - Set up read replicas
   - Implement connection pooling
   - Consider database sharding for very large datasets

3. **Caching Layer**
   - Add Redis for session storage
   - Implement API response caching
   - Use CDN for static assets

### Vertical Scaling

Adjust container resources in `docker-compose.prod.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Backup and Recovery

### Automated Backups

Set up automated backups:
```bash
# Daily backup at 2 AM
echo "0 2 * * * /path/to/project/scripts/backup-database.sh production" | crontab -
```

### Disaster Recovery

1. **Full System Recovery**
   ```bash
   # Restore from backup
   ./scripts/restore-database.sh backups/latest-backup.sql.gz production
   
   # Redeploy application
   ./scripts/deploy.sh production
   ```

2. **Data Recovery**
   ```bash
   # Restore specific backup
   ./scripts/restore-database.sh backups/specific-backup.sql.gz production
   ```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review application logs
3. Check system metrics and alerts
4. Consult the main README.md for development information