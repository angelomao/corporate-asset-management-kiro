import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../lib/logger';
import { metricsCollector } from '../middleware/monitoring';

const router = Router();
const prisma = new PrismaClient();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check with dependencies
router.get('/detailed', async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    dependencies: {
      database: 'OK',
    },
    metrics: metricsCollector.getMetrics(),
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    logger.debug('Database health check passed');
    return res.json(healthCheck);
  } catch (error) {
    healthCheck.status = 'ERROR';
    healthCheck.dependencies.database = 'ERROR';
    logger.error('Database health check failed:', error);
    
    return res.status(503).json(healthCheck);
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if database is ready
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready', error: 'Database not available' });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({ status: 'alive' });
});

export default router;