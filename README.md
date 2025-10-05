# Corporate Asset Management System

A comprehensive web application for tracking, managing, and maintaining corporate assets including hardware, software, furniture, vehicles, and other company resources.

## Features

### 🎯 **Core Functionality**
- **Complete Asset CRUD**: Create, read, update, and delete assets with validation
- **QR Code Registration**: Scan QR codes to quickly register devices and access asset information
- **QR Code Generation**: Generate, download, and print QR codes for asset labeling
- **Role-Based Access Control**: Admin, Manager, and User roles with appropriate permissions
- **Asset Assignment**: Assign/unassign assets to users with status tracking
- **Status Management**: Track asset lifecycle (Available, Assigned, Maintenance, Retired, Lost)
- **Advanced Search**: Multi-field search with filters (category, status, assignee, location)
- **Audit Trail**: Complete history of asset status changes with timestamps

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication system
- **Password Hashing**: bcrypt encryption for secure password storage
- **Rate Limiting**: API protection against abuse and brute force attacks
- **Input Validation**: Comprehensive validation on both frontend and backend
- **CORS Protection**: Properly configured cross-origin resource sharing

### 🎨 **User Experience**
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Real-time Updates**: Live updates for asset status and assignment changes
- **Error Handling**: User-friendly error messages and validation feedback
- **Loading States**: Clear feedback during data operations
- **Pagination**: Efficient handling of large asset lists

### 🔧 **Production Ready**
- **Health Monitoring**: Built-in health checks and system monitoring
- **Logging System**: Comprehensive logging with Winston for debugging
- **Database Migrations**: Automatic schema updates and data seeding
- **Docker Containerization**: Fully containerized with optimized builds
- **Environment Configuration**: Flexible configuration for different environments

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe UI development
- **Vite** for fast development server and optimized production builds
- **Tailwind CSS** for responsive, utility-first styling
- **React Query** for efficient data fetching, caching, and synchronization
- **React Hook Form** with Zod validation for robust form handling
- **React Router** for client-side routing and navigation
- **Code Splitting** with lazy loading for optimized bundle sizes

### Backend
- **Node.js** with Express.js for RESTful API development
- **TypeScript** for comprehensive type safety and better developer experience
- **Prisma ORM** with PostgreSQL for type-safe database operations
- **JWT Authentication** with secure token management
- **bcrypt** for secure password hashing with architecture compatibility
- **Winston** for structured logging and monitoring
- **Helmet** for security headers and CORS protection
- **Express Rate Limit** for API protection and abuse prevention

### Database
- **PostgreSQL 15** with Alpine Linux for lightweight, reliable data storage
- **Prisma Migrations** for version-controlled schema management
- **Automatic Seeding** for development and testing data
- **Health Checks** for database connectivity monitoring

### DevOps & Infrastructure
- **Docker** with multi-stage builds for optimized containerization
- **Docker Compose** with health checks and dependency management
- **Named Volumes** for persistent data and development efficiency
- **Automated Startup Scripts** for reliable system initialization
- **Production Deployment** configurations with Nginx and SSL
- **Monitoring Scripts** for system health and maintenance

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

For deployment on AWS EC2, we provide comprehensive setup and troubleshooting tools:

```bash
# Complete EC2 setup (recommended - fixes all common issues)
npm run setup:ec2

# Quick fixes for specific issues
npm run fix:ec2-login      # Fix login/API connectivity issues
npm run start:ec2-dev      # Simplified development mode
npm run deploy:ec2         # Production deployment
npm run debug:ec2          # Comprehensive diagnostics
```

**Key features:**
- ✅ **Automatic environment setup** - detects public IP and configures all services
- ✅ **CORS configuration** - automatically allows external access
- ✅ **Login troubleshooting** - fixes frontend API connectivity issues
- ✅ **Security group validation** with AWS console guidance
- ✅ **Firewall detection** - UFW and iptables analysis
- ✅ **Health monitoring** - comprehensive service verification

3. **Access the application** at http://localhost:3000



### Available Scripts

#### **Local Development**
- `npm start` - Complete system startup with initialization
- `npm stop` - Stop all services
- `npm run clean` - Stop services and remove volumes
- `npm run restart` - Restart all services
- `npm run logs` - View all service logs
- `npm run status` - Check service status

#### **AWS EC2 Deployment**
- `npm run setup:ec2` - Complete EC2 environment setup
- `npm run fix:ec2-login` - Fix login/API connectivity issues
- `npm run start:ec2-dev` - Start in EC2 development mode
- `npm run deploy:ec2` - Production EC2 deployment
- `npm run debug:ec2` - EC2 connectivity diagnostics
- `npm run debug:login` - Login-specific troubleshooting

### Login Credentials

The system automatically creates these accounts on first startup:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@example.com` | `admin123` | Full system access, user management, asset CRUD |
| **Manager** | `manager@example.com` | `manager123` | Asset management, assignment, status updates |
| **User** | `user@example.com` | `user123` | View assigned assets, basic dashboard access |

**Start with the Admin account** to explore all features and create additional users.

## System Management

- **Database migrations** and seeding happen automatically during startup
- **Environment variables** are configured automatically or via `.env` files  
- **Backup/restore scripts** available in `scripts/` directory
- **Production deployment** detailed in [DEPLOYMENT.md](./DEPLOYMENT.md)

### Troubleshooting

**Quick fixes:**
```bash
# Clean restart
npm run clean && npm start

# Check service status
npm run status

# View logs
npm run logs
```

**For EC2 deployment issues:**
```bash
npm run debug:ec2      # General connectivity issues
npm run debug:login    # Login-specific problems
```

**Common issues:**
- **Port conflicts**: Check what's using ports 3000, 3001, 5432
- **Docker issues**: Restart Docker Desktop and try `npm run clean && npm start`
- **Permission errors**: Run `chmod +x scripts/*.sh`

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
# Complete EC2 setup (recommended)
npm run setup:ec2

# Quick fixes
npm run fix:ec2-login      # Fix login issues
npm run start:ec2-dev      # Development mode
npm run deploy:ec2         # Production mode

# Diagnostics
npm run debug:ec2          # General EC2 issues
npm run debug:login        # Login-specific issues

# Management
docker-compose ps          # Check status
docker-compose logs -f     # View logs
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
- **Database Schema**: `backend/prisma/schema.prisma`
- **EC2 Setup**: Run `npm run setup:ec2` for complete configuration
- **Troubleshooting**: Run `npm run debug:ec2` or `npm run debug:login`

---

## Project Structure

```
├── backend/          # Express API server
├── frontend/         # React application
├── .kiro/           # Kiro specifications and documentation
└── docker-compose.yml
```



## Production Deployment

**Local Production**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**AWS EC2**: Run `npm run setup:ec2` for complete configuration.

---

**Ready to get started?** 
- **Local**: `npm start` → http://localhost:3000
- **EC2**: `npm run setup:ec2` → http://YOUR_PUBLIC_IP:3000

## License

MIT