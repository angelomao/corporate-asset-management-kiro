import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import logger from '../lib/logger';

export interface ApiError extends Error {
  statusCode: number;
  field?: string;
  details?: string[];
}

export class ValidationError extends Error implements ApiError {
  statusCode = 400;
  field?: string;
  details?: string[];

  constructor(message: string, field?: string, details?: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.details = details;
  }
}

export class AuthenticationError extends Error implements ApiError {
  statusCode = 401;

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements ApiError {
  statusCode = 403;

  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error implements ApiError {
  statusCode = 409;
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ConflictError';
    this.field = field;
  }
}

// Centralized error handling middleware
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  logger.error('Request error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    });
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] || 'field';
        return res.status(409).json({
          error: 'Duplicate value',
          field,
          message: `${field} already exists`
        });
      
      case 'P2025':
        // Record not found
        return res.status(404).json({
          error: 'Resource not found',
          message: 'The requested resource does not exist'
        });
      
      case 'P2003':
        // Foreign key constraint violation
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced resource does not exist'
        });
      
      default:
        logger.error('Unhandled Prisma error:', error);
        return res.status(500).json({
          error: 'Database error',
          message: 'An error occurred while processing your request'
        });
    }
  }

  // Handle custom API errors
  if ('statusCode' in error) {
    const apiError = error as ApiError;
    return res.status(apiError.statusCode).json({
      error: apiError.message,
      field: apiError.field,
      details: apiError.details
    });
  }

  // Handle generic errors
  return res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Recursively sanitize strings in request body
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};