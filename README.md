# Corporate Asset Management System

A comprehensive web application for tracking, managing, and maintaining corporate assets including hardware, software, furniture, vehicles, and other company resources.

## Features

- Role-based access control (Admin, Manager, User)
- Asset lifecycle management
- Asset assignment and tracking
- Dashboard with statistics and reporting
- Search and filtering capabilities
- Responsive web interface

## Technology Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS, React Router, React Query
- **Backend**: Node.js with Express, TypeScript, JWT authentication
- **Database**: PostgreSQL with Prisma ORM
- **Development**: Docker Compose for containerized development environment

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Development Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Start the development environment:
   ```bash
   npm run dev
   ```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend application on port 3000

### Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all services
- `npm run down` - Stop all services
- `npm run clean` - Stop services and remove volumes

## Docker Compose Usage

### Development Environment

The development environment uses `docker-compose.yml` and is optimized for development with hot reloading and development tools.

**Start development environment:**
```bash
# Using npm script (recommended)
npm run dev

# If you get API version errors, try the legacy version
npm run dev:legacy

# Or directly with Docker Compose (newer syntax)
docker compose up -d

# Or with legacy Docker Compose (older syntax)
docker-compose up -d
```

**View logs:**
```bash
# Using npm script
npm run logs

# Or directly with Docker Compose
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database

# Legacy syntax (if newer commands fail)
docker-compose logs -f
```

**Stop development environment:**
```bash
# Using npm script
npm run down

# Or directly with Docker Compose
docker compose down

# Legacy syntax (if newer commands fail)
docker-compose down
```

**Clean up (removes volumes and data):**
```bash
npm run clean
# Or
docker-compose down -v
```

### Production Environment

The production environment uses `docker-compose.prod.yml` with optimized builds, security features, and monitoring.

**Quick Production Deployment:**
```bash
# Set up environment variables
cp .env.production.example .env.production
# Edit .env.production with your actual values

# Deploy using the automated script
./scripts/deploy.sh production
```

**Manual Production Deployment:**
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Production Services:**
- **Frontend**: Nginx-served React app on port 3000
- **Backend**: Node.js API on port 3001
- **Database**: PostgreSQL on port 5432
- **Nginx**: Reverse proxy with SSL on ports 80/443

**Production Management:**
```bash
# Monitor system status
./scripts/monitor.sh status

# View metrics
./scripts/monitor.sh metrics

# Create database backup
./scripts/monitor.sh backup

# Restart services
./scripts/monitor.sh restart

# View alerts
./scripts/monitor.sh alerts
```

### Environment Variables

**Development (.env):**
```bash
# Database
POSTGRES_DB=asset_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Backend
JWT_SECRET=your-development-jwt-secret
```

**Production (.env.production):**
```bash
# Database
DB_USER=postgres
DB_PASSWORD=your-secure-database-password
DB_NAME=asset_management_prod

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters

# URLs
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
```

### Database Operations

**Run migrations:**
```bash
# Development
docker-compose exec backend npm run prisma:migrate

# Production
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:prod
```

**Access database:**
```bash
# Development
docker-compose exec database psql -U postgres -d asset_management

# Production
docker-compose -f docker-compose.prod.yml exec database psql -U postgres -d asset_management_prod
```

**Backup and restore:**
```bash
# Create backup
./scripts/backup-database.sh production

# Restore from backup
./scripts/restore-database.sh backups/backup-file.sql.gz production
```

### Troubleshooting

**Common Issues:**

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   lsof -i :3000 -i :3001 -i :5432
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database connection issues:**
   ```bash
   # Check database status
   docker compose exec database pg_isready -U postgres
   
   # Restart database
   docker compose restart database
   ```

3. **Permission issues:**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   ```

4. **Clean slate restart:**
   ```bash
   # Stop everything and remove volumes
   docker compose down -v
   
   # Remove all images
   docker compose down --rmi all
   
   # Start fresh
   docker compose up -d --build
   ```

5. **Docker API version errors:**
   ```bash
   # First, restart Docker Desktop completely
   # Quit from menu bar, then reopen and wait for full startup
   
   # Check Docker versions
   docker version
   docker compose version
   
   # Try manual startup (bypasses Docker Compose)
   npm run dev:manual
   
   # Or try legacy Docker Compose syntax
   npm run dev:legacy
   
   # Or update Docker Desktop to latest version
   # Download from: https://www.docker.com/products/docker-desktop
   ```

6. **Docker permission/overlay errors (macOS):**
   ```bash
   # Clean Docker system completely
   docker system prune -a --volumes
   
   # Restart Docker Desktop
   # Or reset Docker Desktop to factory defaults in Settings → Troubleshoot
   
   # If issue persists, try building without cache
   docker compose build --no-cache
   ```

**View container resource usage:**
```bash
docker stats
```

**Access container shell:**
```bash
# Backend container
docker compose exec backend sh

# Frontend container (development)
docker compose exec frontend sh

# Database container
docker compose exec database bash
```

## Project Structure

```
├── backend/          # Express API server
├── frontend/         # React application
├── .kiro/           # Kiro specifications and documentation
└── docker-compose.yml
```

## Development

The application is designed for containerized development. All services will automatically reload when you make changes to the source code.

## Production Deployment

For detailed production deployment instructions, security considerations, and advanced configuration options, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## License

MIT