import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateToken, requireRole, requireAdmin, requireManagerOrAdmin } from '../auth';
import { generateToken } from '../../lib/auth';

// Mock Express objects
const mockRequest = (authHeader?: string): Partial<Request> => ({
  headers: authHeader ? { authorization: authHeader } : {}
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: UserRole.USER
      };
      const token = generateToken(payload);
      
      const req = mockRequest(`Bearer ${token}`) as Request;
      const res = mockResponse() as Response;
      
      authenticateToken(req, res, mockNext);
      
      expect(req.user).toEqual(expect.objectContaining(payload));
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without token', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      
      authenticateToken(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      const req = mockRequest('Bearer invalid-token') as Request;
      const res = mockResponse() as Response;
      
      authenticateToken(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with malformed authorization header', () => {
      const req = mockRequest('InvalidFormat token') as Request;
      const res = mockResponse() as Response;
      
      authenticateToken(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow user with correct role', () => {
      const req = {
        user: { userId: 'user123', email: 'test@example.com', role: UserRole.ADMIN }
      } as Request;
      const res = mockResponse() as Response;
      
      const middleware = requireRole(UserRole.ADMIN);
      middleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow user with one of multiple allowed roles', () => {
      const req = {
        user: { userId: 'user123', email: 'test@example.com', role: UserRole.MANAGER }
      } as Request;
      const res = mockResponse() as Response;
      
      const middleware = requireRole([UserRole.ADMIN, UserRole.MANAGER]);
      middleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject user without required role', () => {
      const req = {
        user: { userId: 'user123', email: 'test@example.com', role: UserRole.USER }
      } as Request;
      const res = mockResponse() as Response;
      
      const middleware = requireRole(UserRole.ADMIN);
      middleware(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated request', () => {
      const req = {} as Request;
      const res = mockResponse() as Response;
      
      const middleware = requireRole(UserRole.USER);
      middleware(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user', () => {
      const req = {
        user: { userId: 'user123', email: 'admin@example.com', role: UserRole.ADMIN }
      } as Request;
      const res = mockResponse() as Response;
      
      requireAdmin(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject non-admin user', () => {
      const req = {
        user: { userId: 'user123', email: 'user@example.com', role: UserRole.USER }
      } as Request;
      const res = mockResponse() as Response;
      
      requireAdmin(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireManagerOrAdmin', () => {
    it('should allow manager user', () => {
      const req = {
        user: { userId: 'user123', email: 'manager@example.com', role: UserRole.MANAGER }
      } as Request;
      const res = mockResponse() as Response;
      
      requireManagerOrAdmin(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow admin user', () => {
      const req = {
        user: { userId: 'user123', email: 'admin@example.com', role: UserRole.ADMIN }
      } as Request;
      const res = mockResponse() as Response;
      
      requireManagerOrAdmin(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject regular user', () => {
      const req = {
        user: { userId: 'user123', email: 'user@example.com', role: UserRole.USER }
      } as Request;
      const res = mockResponse() as Response;
      
      requireManagerOrAdmin(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});