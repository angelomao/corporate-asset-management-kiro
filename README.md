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

### Quick Start

#### 🚀 **Local Development**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd asset-management-system
   ```

2. **Start the system** (one command setup)
   ```bash
   npm start
   ```
   
   This will automatically:
   - ✅ Build all Docker containers with optimized configurations
   - ✅ Set up PostgreSQL database with health checks
   - ✅ Run database migrations and schema updates
   - ✅ Seed initial user accounts for immediate use
   - ✅ Start all services with proper networking and monitoring
   - ✅ Verify all services are healthy and ready
   - ✅ Display service URLs and login credentials

   **Startup time**: ~30-60 seconds (depending on your system)

#### ☁️ **AWS EC2 Deployment**

For deployment on AWS EC2, we provide multiple options:

```bash
# Option 1: Simplified development mode (recommended for testing)
npm run start:ec2-dev

# Option 2: Production deployment with optimized containers
npm run deploy:ec2

# Option 3: Comprehensive diagnostics and troubleshooting
npm run debug:ec2
```

**EC2 deployment features:**
- ✅ **Multiple deployment modes** - development and production options
- ✅ **Automatic IP detection** and environment configuration
- ✅ **Direct port access** - bypasses nginx complexity for easier setup
- ✅ **Security group validation** with step-by-step guidance
- ✅ **Comprehensive diagnostics** - detailed troubleshooting tools
- ✅ **Health monitoring** and service verification
- ✅ **Firewall detection** - UFW and iptables analysis

3. **Access the application**
   - **Frontend**: http://localhost:3000 (React application)
   - **Backend API**: http://localhost:3001 (Express server)
   - **Database**: localhost:5432 (PostgreSQL)
   - **Health Check**: http://localhost:3001/health

### Development Setup

**Alternative manual setup:**

1. Copy environment variables (optional):
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Start services individually:
   ```bash
   npm run dev
   ```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend application on port 3000

### Available Scripts

- `npm start` - Complete system startup with initialization
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all services
- `npm run down` - Stop all services
- `npm run clean` - Stop services and remove volumes
- `npm run restart` - Restart all services
- `npm run logs` - View all service logs
- `npm run status` - Check service status
- `npm run monitor` - System monitoring and health checks

### Login Credentials

The system automatically creates these accounts on first startup:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@example.com` | `admin123` | Full system access, user management, asset CRUD |
| **Manager** | `manager@example.com` | `manager123` | Asset management, assignment, status updates |
| **User** | `user@example.com` | `user123` | View assigned assets, basic dashboard access |

**Start with the Admin account** to explore all features and create additional users.

## Docker Compose Usage

### Development Environment

The development environment uses `docker-compose.yml` and is optimized for development with hot reloading and development tools.

**Start development environment:**
```bash
# Complete system startup (recommended)
npm start

# Quick development mode (no health checks)
npm run dev

# Manual startup (if Docker Compose has issues)
npm run dev:manual
```

**View logs:**
```bash
# All services
npm run logs

# Individual services
npm run logs:backend
npm run logs:frontend  
npm run logs:database

# Or directly with Docker Compose
docker-compose logs -f [service-name]
```

**Stop development environment:**
```bash
# Clean shutdown
npm stop

# Or directly with Docker Compose
docker-compose down

# Complete cleanup (removes all data)
npm run clean
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
# Migrations run automatically on startup
# Manual migration (if needed)
docker-compose exec backend npm run prisma:migrate

# Production
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:prod
```

**Access database:**
```bash
# Development (service name is 'postgres' in docker-compose.yml)
docker-compose exec postgres psql -U postgres -d asset_management

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

### AWS EC2 Deployment & Troubleshooting

#### **EC2 Deployment Modes**

**🚀 Development Mode (Recommended for Testing):**
```bash
npm run start:ec2-dev
```
- ✅ **Direct port access** - No nginx complexity
- ✅ **Automatic IP detection** and environment setup
- ✅ **Hot reloading** for development
- ✅ **Simple troubleshooting** - easier to debug
- ✅ **Fast startup** - minimal container overhead

**🏭 Production Mode:**
```bash
npm run deploy:ec2
```
- ✅ **Optimized containers** with production builds
- ✅ **Security hardening** and performance tuning
- ✅ **SSL-ready** configuration for HTTPS
- ✅ **Resource optimization** for production workloads

**🔍 Diagnostic Mode:**
```bash
npm run debug:ec2
```
- ✅ **Comprehensive analysis** of connectivity issues
- ✅ **Container inspection** and network diagnostics
- ✅ **Firewall detection** (UFW, iptables)
- ✅ **Port binding analysis** and service health checks

**Deploy to EC2:**
```bash
# One-command EC2 deployment
npm run deploy:ec2
```

**Troubleshoot EC2 connectivity:**
```bash
# Diagnose common EC2 issues
npm run troubleshoot:ec2
```

**Common EC2 Issues & Solutions:**

1. **Can't access frontend via public IP (Most Common):**
   ```bash
   # First, run comprehensive diagnostics
   npm run debug:ec2
   
   # Try simplified development mode
   npm run start:ec2-dev
   ```
   - **Root Cause**: Usually AWS Security Group or nginx configuration
   - **Quick Fix**: Add inbound rules in EC2 Console:
     - Port 3000 (Frontend): Custom TCP, Source: 0.0.0.0/0
     - Port 3001 (Backend): Custom TCP, Source: 0.0.0.0/0

2. **Nginx/SSL Configuration Issues:**
   ```bash
   # Use direct port access (bypasses nginx)
   npm run start:ec2-dev
   
   # This exposes services directly on ports 3000/3001
   # No SSL certificates or nginx configuration needed
   ```

3. **Firewall blocking connections:**
   ```bash
   # Check and fix UFW firewall
   sudo ufw status
   sudo ufw allow 3000
   sudo ufw allow 3001
   
   # Check iptables
   sudo iptables -L INPUT -n | grep -E '(3000|3001)'
   ```

4. **Container networking issues:**
   ```bash
   # Debug container connectivity
   npm run debug:ec2
   
   # Check container logs
   docker logs asset-management-frontend
   docker logs asset-management-backend
   
   # Restart with clean slate
   docker-compose down -v
   npm run start:ec2-dev
   ```

**EC2 Management Commands:**
```bash
# Development mode (recommended for testing)
npm run start:ec2-dev

# Check EC2 services status
docker-compose -f docker-compose.ec2.yml ps

# View EC2 logs
docker-compose -f docker-compose.ec2.yml logs -f

# Restart EC2 services
docker-compose -f docker-compose.ec2.yml restart

# Stop EC2 services
docker-compose -f docker-compose.ec2.yml down

# Clean restart
docker-compose -f docker-compose.ec2.yml down -v
npm run start:ec2-dev

# Comprehensive diagnostics
npm run debug:ec2
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

## Quick Reference

### 🚀 **Essential Commands**

#### **Local Development**
```bash
# Start everything
npm start

# Stop everything  
npm stop

# View logs
npm run logs

# Check status
npm run status

# Clean restart
npm run clean && npm start
```

#### **AWS EC2 Deployment**
```bash
# Start in EC2 development mode (recommended)
npm run start:ec2-dev

# Deploy to EC2 (production)
npm run deploy:ec2

# Debug connectivity issues
npm run debug:ec2

# General troubleshooting
npm run troubleshoot:ec2

# Check EC2 production status
docker-compose -f docker-compose.ec2.yml ps

# View EC2 logs
docker-compose -f docker-compose.ec2.yml logs -f
```

### 🔗 **Important URLs**
- **Local Frontend**: http://localhost:3000
- **Local Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **EC2 Frontend**: http://YOUR_PUBLIC_IP:3000
- **EC2 Backend**: http://YOUR_PUBLIC_IP:3001

### 👤 **Default Accounts**
- **Admin**: admin@example.com / admin123
- **Manager**: manager@example.com / manager123
- **User**: user@example.com / user123

### 📚 **Additional Resources**
- **Quick Start Guide**: [QUICK_START.md](./QUICK_START.md)
- **Production Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Database Schema**: See `backend/prisma/schema.prisma`

---

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

### Local Production Testing
For detailed production deployment instructions, security considerations, and advanced configuration options, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### AWS EC2 Deployment
For cloud deployment on AWS EC2, choose the appropriate mode:

**🚀 Quick Testing (Recommended):**
```bash
npm run start:ec2-dev
```

**🏭 Production Deployment:**
```bash
npm run deploy:ec2
```

**🔍 Troubleshooting:**
```bash
npm run debug:ec2
```

**Key features:**
- ✅ **Multiple deployment modes** for different use cases
- ✅ **Automatic IP detection** and environment configuration
- ✅ **Comprehensive diagnostics** for connectivity issues
- ✅ **Security group validation** with step-by-step guidance
- ✅ **Direct port access** option to bypass nginx complexity
- ✅ **Production optimization** with SSL-ready configuration

**Need help?** The `debug:ec2` command provides detailed diagnostics and solutions.

---

**Ready to get started?** 
- **Local development**: Run `npm start` and visit http://localhost:3000
- **EC2 testing**: Run `npm run start:ec2-dev` and visit http://YOUR_PUBLIC_IP:3000
- **EC2 production**: Run `npm run deploy:ec2` and visit http://YOUR_PUBLIC_IP:3000

## License

MIT