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

## Project Structure

```
├── backend/          # Express API server
├── frontend/         # React application
├── .kiro/           # Kiro specifications and documentation
└── docker-compose.yml
```

## Development

The application is designed for containerized development. All services will automatically reload when you make changes to the source code.

## License

MIT