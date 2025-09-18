# Asset Management System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

### One-Command Setup
```bash
npm start
```

This single command will:
- ✅ Build all Docker containers
- ✅ Set up PostgreSQL database
- ✅ Run database migrations
- ✅ Seed initial user accounts
- ✅ Start all services with health checks
- ✅ Verify everything is working

## 📱 Access the Application

After startup completes (2-3 minutes):

- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:3001/health
- **Database**: localhost:5432

## 👤 Login Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | `admin@example.com` | `admin123` | Full system access, user management |
| Manager | `manager@example.com` | `manager123` | Asset management, reports |
| User | `user@example.com` | `user123` | View assigned assets, basic access |

## 🎯 Key Features

- **Asset Management**: Create, edit, delete, and assign assets
- **Role-Based Access**: Different permissions for Admin/Manager/User
- **Status Tracking**: Track asset lifecycle and history
- **Search & Filter**: Advanced search and filtering capabilities
- **Responsive Design**: Works on desktop and mobile devices

## 🔧 Management Commands

```bash
# System Management
npm start          # Start the complete system
npm stop           # Stop all services
npm run restart    # Restart all services
npm run clean      # Stop and remove all data

# Development
npm run dev        # Start in development mode
npm run logs       # View all service logs
npm run status     # Check service status
npm run monitor    # System health monitoring

# Individual Service Logs
npm run logs:backend    # Backend API logs
npm run logs:frontend   # Frontend application logs
npm run logs:database   # Database logs
```

## 🛠️ Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker is running
docker version

# Clean restart
npm run clean
npm start
```

**Database connection issues:**
```bash
# Check database status
docker-compose ps
npm run logs:database
```

**Port conflicts:**
```bash
# Check what's using the ports
lsof -i :3000 -i :3001 -i :5432
```

**Reset everything:**
```bash
npm run clean
docker system prune -f
npm start
```

## 📁 Project Structure

```
asset-management-system/
├── frontend/          # React application
├── backend/           # Express.js API
├── scripts/           # Management scripts
├── docker-compose.yml # Service orchestration
├── .env              # Environment configuration
└── README.md         # Detailed documentation
```

## 🔗 Useful Links

- **Detailed Documentation**: [README.md](./README.md)
- **Production Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Health Check**: http://localhost:3001/health
- **Database Admin**: Use any PostgreSQL client with `localhost:5432`

## 💡 Next Steps

1. **Log in** with admin credentials
2. **Create your first asset** in the Assets section
3. **Explore user management** (Admin only)
4. **Try different user roles** to see permission differences
5. **Check out the dashboard** for system overview

---

**Need help?** Check the [README.md](./README.md) for detailed documentation or the [troubleshooting section](#troubleshooting) above.