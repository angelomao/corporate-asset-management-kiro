import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyToken, JWTPayload } from '../lib/auth';
import { AuthenticationError, AuthorizationError } from './errorHandler';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Authentication middleware to verify JWT tokens
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next(new AuthenticationError('Access token required'));
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error: any) {
    if (error.message?.includes('expired')) {
      return next(new AuthenticationError('Token has expired'));
    }
    if (error.message?.includes('invalid')) {
      return next(new AuthenticationError('Invalid token'));
    }
    return next(new AuthenticationError('Token verification failed'));
  }
}

// Role-based access control middleware
export function requireRole(roles: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

// Convenience middleware for common role combinations
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireManagerOrAdmin = requireRole([UserRole.MANAGER, UserRole.ADMIN]);
export const requireAnyRole = requireRole([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]);