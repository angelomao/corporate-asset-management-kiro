import request from 'supertest';
import express from 'express';
import { generateToken } from '../../lib/auth';

// Mock UserRole enum
const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const;

// Mock Prisma Client before importing the routes
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  UserRole
}));

// Import routes after mocking
import userRoutes from '../users';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    const adminToken = generateToken({
      userId: 'admin-id',
      email: 'admin@test.com',
      role: UserRole.ADMIN
    });

    const managerToken = generateToken({
      userId: 'manager-id',
      email: 'manager@test.com',
      role: UserRole.MANAGER
    });

    const userToken = generateToken({
      userId: 'user-id',
      email: 'user@test.com',
      role: UserRole.USER
    });

    it('should return all users for admin', async () => {
      const mockUsers = [
        {
          id: 'user1',
          email: 'user1@test.com',
          name: 'User One',
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { assignedAssets: 2 }
        },
        {
          id: 'user2',
          email: 'user2@test.com',
          name: 'User Two',
          role: UserRole.MANAGER,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { assignedAssets: 0 }
        }
      ];

      const expectedUsers = mockUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }));

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              assignedAssets: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });

    it('should return all users for manager', async () => {
      const mockUsers = [
        {
          id: 'user1',
          email: 'user1@test.com',
          name: 'User One',
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { assignedAssets: 1 }
        }
      ];

      const expectedUsers = mockUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }));

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedUsers);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Insufficient permissions' });
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Access token required' });
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch users' });
    });
  });

  describe('GET /api/users/me', () => {
    const userToken = generateToken({
      userId: 'user-id',
      email: 'user@test.com',
      role: UserRole.USER
    });

    it('should return current user profile with assigned assets', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@test.com',
        name: 'Test User',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedAssets: [
          {
            id: 'asset1',
            name: 'Laptop',
            category: 'HARDWARE',
            description: 'Work laptop',
            status: 'ASSIGNED',
            serialNumber: 'LP001'
          }
        ]
      };

      const expectedUser = {
        ...mockUser,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString()
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          assignedAssets: {
            select: {
              id: true,
              name: true,
              category: true,
              description: true,
              status: true,
              serialNumber: true
            },
            where: {
              status: 'ASSIGNED'
            },
            orderBy: {
              updatedAt: 'desc'
            }
          }
        }
      });
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Access token required' });
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch user profile' });
    });
  });

  describe('PUT /api/users/me', () => {
    const userToken = generateToken({
      userId: 'user-id',
      email: 'user@test.com',
      role: UserRole.USER
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com'
      };

      const updatedUser = {
        id: 'user-id',
        email: 'updated@test.com',
        name: 'Updated Name',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expectedUser = {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user with new email
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('should allow keeping the same email', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'user@test.com' // Same email as in token
      };

      const updatedUser = {
        id: 'user-id',
        email: 'user@test.com',
        name: 'Updated Name',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expectedUser = {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedUser);
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled(); // Should not check for existing email
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        name: '', // Empty name
        email: 'invalid-email' // Invalid email format
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toHaveLength(2);
      expect(response.body.details[0].field).toBe('name');
      expect(response.body.details[1].field).toBe('email');
    });

    it('should return 400 if email is already taken', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'taken@test.com'
      };

      const existingUser = {
        id: 'other-user-id',
        email: 'taken@test.com'
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Validation failed',
        details: [{
          field: 'email',
          message: 'Email is already taken'
        }]
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .send({ name: 'Test', email: 'test@test.com' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Access token required' });
    });

    it('should handle database errors', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update user profile' });
    });
  });
});