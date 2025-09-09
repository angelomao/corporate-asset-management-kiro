import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log response
    logger.http(
      `${req.method} ${req.originalUrl} - ${statusCode} - ${duration}ms - ${req.ip}`
    );
    
    // Call original end method
    return originalEnd(chunk, encoding, cb);
  };
  
  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
    
    // Log very slow requests (> 5000ms) as errors
    if (duration > 5000) {
      logger.error(`Very slow request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

// Health metrics tracking
interface HealthMetrics {
  uptime: number;
  timestamp: string;
  memory: NodeJS.MemoryUsage;
  cpu: number;
  requests: {
    total: number;
    errors: number;
    lastMinute: number;
  };
}

class MetricsCollector {
  private requestCount = 0;
  private errorCount = 0;
  private requestsLastMinute = 0;
  private lastMinuteReset = Date.now();

  incrementRequest() {
    this.requestCount++;
    this.requestsLastMinute++;
    
    // Reset last minute counter every minute
    const now = Date.now();
    if (now - this.lastMinuteReset > 60000) {
      this.requestsLastMinute = 0;
      this.lastMinuteReset = now;
    }
  }

  incrementError() {
    this.errorCount++;
  }

  getMetrics(): HealthMetrics {
    return {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        lastMinute: this.requestsLastMinute,
      },
    };
  }
}

export const metricsCollector = new MetricsCollector();

// Metrics collection middleware
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  metricsCollector.incrementRequest();
  
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      metricsCollector.incrementError();
    }
  });
  
  next();
};