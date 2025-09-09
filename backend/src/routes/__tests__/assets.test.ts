import request from 'supertest';
import express from 'express';
import { generateToken } from '../../lib/auth';

// Mock Prisma Client before importing the routes
const mockPrisma = {
  asset: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  assetStatusHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock enums
const AssetCategory = {
  HARDWARE: 'HARDWARE',
  SOFTWARE: 'SOFTWARE',
  FURNITURE: 'FURNITURE',
  VEHICLE: 'VEHICLE',
  OTHER: 'OTHER'
} as const;

const AssetStatus = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED',
  LOST: 'LOST'
} as const;

const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  AssetCategory,
  AssetStatus,
  UserRole
}));

// Import routes after mocking
import assetRoutes from '../assets';
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
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
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
app.use('/api/assets', assetRoutes);

describe('Asset Routes', () => {
  let adminToken: string;
  let managerToken: string;
  let userToken: string;

  const mockAdmin = {
    userId: 'admin-id',
    email: 'admin@test.com',
    role: 'ADMIN' as const,
  };

  const mockManager = {
    userId: 'manager-id',
    email: 'manager@test.com',
    role: 'MANAGER' as const,
  };

  const mockUser = {
    userId: 'user-id',
    email: 'user@test.com',
    role: 'USER' as const,
  };

  const mockAsset = {
    id: 'asset-id',
    name: 'Test Laptop',
    description: 'A test laptop',
    serialNumber: 'SN123456',
    category: 'HARDWARE',
    status: 'AVAILABLE',
    purchaseDate: '2023-01-01T00:00:00.000Z',
    purchasePrice: 1000,
    vendor: 'Test Vendor',
    location: 'Office A',
    assigneeId: null,
    createdById: 'admin-id',
    createdAt: '2025-09-09T12:20:21.762Z',
    updatedAt: '2025-09-09T12:20:21.762Z',
    assignee: null,
    createdBy: { id: 'admin-id', name: 'Admin User', email: 'admin@test.com' },
  };

  beforeAll(() => {
    adminToken = generateToken(mockAdmin);
    managerToken = generateToken(mockManager);
    userToken = generateToken(mockUser);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/assets', () => {
    it('should return all assets for authenticated user', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([mockAsset]);

      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockAsset]);
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter assets by category', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([mockAsset]);

      const response = await request(app)
        .get('/api/assets?category=HARDWARE')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: { category: 'HARDWARE' },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should filter assets by status', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([mockAsset]);

      const response = await request(app)
        .get('/api/assets?status=AVAILABLE')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: { status: 'AVAILABLE' },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should search assets by name', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([mockAsset]);

      const response = await request(app)
        .get('/api/assets?search=laptop')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'laptop',
            mode: 'insensitive',
          },
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should combine multiple filters', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([mockAsset]);

      const response = await request(app)
        .get('/api/assets?category=HARDWARE&status=AVAILABLE&search=laptop')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          category: 'HARDWARE',
          status: 'AVAILABLE',
          name: {
            contains: 'laptop',
            mode: 'insensitive',
          },
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/api/assets');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Access token required' });
    });

    it('should handle database errors', async () => {
      mockPrisma.asset.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch assets' });
    });
  });

  describe('POST /api/assets', () => {
    const validAssetData = {
      name: 'New Laptop',
      description: 'A new laptop',
      serialNumber: 'SN789012',
      category: 'HARDWARE',
      purchaseDate: '2023-01-01T00:00:00.000Z',
      purchasePrice: 1500,
      vendor: 'New Vendor',
      location: 'Office B',
    };

    it('should create asset for admin user', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null); // No existing serial number
      mockPrisma.asset.create.mockResolvedValue({ ...mockAsset, ...validAssetData });

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAssetData);

      expect(response.status).toBe(201);
      expect(mockPrisma.asset.create).toHaveBeenCalledWith({
        data: {
          ...validAssetData,
          purchaseDate: new Date(validAssetData.purchaseDate),
          createdById: mockAdmin.userId,
        },
        include: expect.any(Object),
      });
    });

    it('should create asset for manager user', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);
      mockPrisma.asset.create.mockResolvedValue({ ...mockAsset, ...validAssetData });

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(validAssetData);

      expect(response.status).toBe(201);
    });

    it('should reject asset creation for regular user', async () => {
      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validAssetData);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Insufficient permissions' });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing name and category',
      };

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('name: Required');
      expect(response.body.details).toContain('category: Required');
    });

    it('should reject duplicate serial numbers', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset); // Existing asset with same serial

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAssetData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Serial number already exists',
        field: 'serialNumber',
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);
      mockPrisma.asset.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAssetData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to create asset' });
    });
  });

  describe('PUT /api/assets/:id', () => {
    const updateData = {
      name: 'Updated Laptop',
      description: 'An updated laptop',
      status: 'MAINTENANCE',
    };

    it('should update asset for admin user', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);
      const updatedAsset = { ...mockAsset, ...updateData };
      
      // Mock transaction to return the callback result
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          asset: {
            update: jest.fn().mockResolvedValue(updatedAsset),
          },
          assetStatusHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const response = await request(app)
        .put('/api/assets/asset-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should update asset for manager user', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);
      const updatedAsset = { ...mockAsset, ...updateData };
      
      // Mock transaction to return the callback result
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          asset: {
            update: jest.fn().mockResolvedValue(updatedAsset),
          },
          assetStatusHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const response = await request(app)
        .put('/api/assets/asset-id')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
    });

    it('should reject update for regular user', async () => {
      const response = await request(app)
        .put('/api/assets/asset-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Insufficient permissions' });
    });

    it('should return 404 for non-existent asset', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/assets/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Asset not found' });
    });

    it('should unassign asset when status changes to MAINTENANCE or RETIRED', async () => {
      const assignedAsset = { ...mockAsset, assigneeId: 'user-id' };
      mockPrisma.asset.findUnique.mockResolvedValue(assignedAsset);
      const retiredAsset = { ...assignedAsset, status: 'RETIRED', assigneeId: null };
      
      // Mock transaction to return the callback result
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          asset: {
            update: jest.fn().mockResolvedValue(retiredAsset),
          },
          assetStatusHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const response = await request(app)
        .put('/api/assets/asset-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'RETIRED' });

      expect(response.status).toBe(200);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should reject duplicate serial numbers', async () => {
      const existingAsset = { ...mockAsset, serialNumber: 'OLD123' };
      const duplicateAsset = { ...mockAsset, id: 'other-id', serialNumber: 'NEW123' };
      
      mockPrisma.asset.findUnique
        .mockResolvedValueOnce(existingAsset) // First call for existing asset
        .mockResolvedValueOnce(duplicateAsset); // Second call for duplicate check

      const response = await request(app)
        .put('/api/assets/asset-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ serialNumber: 'NEW123' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Serial number already exists',
        field: 'serialNumber',
      });
    });
  });

  describe('PATCH /api/assets/:id/assign', () => {
    it('should assign asset to user', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const assignedAsset = {
        ...mockAsset,
        assigneeId: mockUser.userId,
        status: 'ASSIGNED',
      };
      
      // Mock transaction to return the callback result
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          asset: {
            update: jest.fn().mockResolvedValue(assignedAsset),
          },
          assetStatusHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const response = await request(app)
        .patch('/api/assets/asset-id/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assigneeId: mockUser.userId });

      expect(response.status).toBe(200);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should unassign asset when assigneeId is null', async () => {
      const assignedAsset = { ...mockAsset, assigneeId: mockUser.userId, status: 'ASSIGNED' };
      mockPrisma.asset.findUnique.mockResolvedValue(assignedAsset);
      const unassignedAsset = {
        ...assignedAsset,
        assigneeId: null,
        status: 'AVAILABLE',
      };
      
      // Mock transaction to return the callback result
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          asset: {
            update: jest.fn().mockResolvedValue(unassignedAsset),
          },
          assetStatusHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const response = await request(app)
        .patch('/api/assets/asset-id/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assigneeId: null });

      expect(response.status).toBe(200);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should reject assignment for regular user', async () => {
      const response = await request(app)
        .patch('/api/assets/asset-id/assign')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ assigneeId: mockUser.userId });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Insufficient permissions' });
    });

    it('should return 404 for non-existent asset', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/assets/non-existent-id/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assigneeId: mockUser.userId });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Asset not found' });
    });

    it('should return 400 for non-existent assignee', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/assets/asset-id/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assigneeId: 'non-existent-user' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Assignee not found' });
    });
  });

  describe('GET /api/assets/stats', () => {
    const mockStatusCounts = [
      { status: 'AVAILABLE', _count: { id: 5 } },
      { status: 'ASSIGNED', _count: { id: 3 } },
      { status: 'MAINTENANCE', _count: { id: 2 } },
      { status: 'RETIRED', _count: { id: 1 } },
    ];

    const mockRecentAssets = [
      {
        ...mockAsset,
        id: 'recent-1',
        name: 'Recent Asset 1',
        createdAt: '2025-09-09T12:00:00.000Z',
      },
      {
        ...mockAsset,
        id: 'recent-2',
        name: 'Recent Asset 2',
        createdAt: '2025-09-09T11:00:00.000Z',
      },
    ];

    it('should return dashboard statistics for authenticated user', async () => {
      mockPrisma.asset.groupBy.mockResolvedValue(mockStatusCounts);
      mockPrisma.asset.count.mockResolvedValue(11);
      mockPrisma.asset.findMany.mockResolvedValue(mockRecentAssets);

      const response = await request(app)
        .get('/api/assets/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        stats: {
          total: 11,
          available: 5,
          assigned: 3,
          maintenance: 2,
          retired: 1,
          lost: 0,
        },
        recentAssets: mockRecentAssets,
      });

      expect(mockPrisma.asset.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: {
          id: true,
        },
      });

      expect(mockPrisma.asset.count).toHaveBeenCalled();

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should handle missing status counts gracefully', async () => {
      mockPrisma.asset.groupBy.mockResolvedValue([
        { status: 'AVAILABLE', _count: { id: 2 } },
      ]);
      mockPrisma.asset.count.mockResolvedValue(2);
      mockPrisma.asset.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/assets/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        stats: {
          total: 2,
          available: 2,
          assigned: 0,
          maintenance: 0,
          retired: 0,
          lost: 0,
        },
        recentAssets: [],
      });
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/api/assets/stats');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Access token required' });
    });

    it('should handle database errors', async () => {
      mockPrisma.asset.groupBy.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/assets/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch dashboard statistics' });
    });
  });

  describe('PATCH /api/assets/:id/status', () => {
    it('should update asset status for admin user', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);
      const updatedAsset = { ...mockAsset, status: 'MAINTENANCE' };
      
      // Mock transaction to return the callback result
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          asset: {
            update: jest.fn().mockResolvedValue(updatedAsset),
          },
          assetStatusHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const response = await request(app)
        .patch('/api/assets/asset-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'MAINTENANCE', reason: 'Scheduled maintenance' });

      expect(response.status).toBe(200);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should reject status update for regular user', async () => {
      const response = await request(app)
        .patch('/api/assets/asset-id/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'MAINTENANCE' });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent asset', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/assets/asset-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'MAINTENANCE' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Asset not found' });
    });

    it('should reject invalid status transitions', async () => {
      const retiredAsset = { ...mockAsset, status: 'RETIRED' };
      mockPrisma.asset.findUnique.mockResolvedValue(retiredAsset);

      const response = await request(app)
        .patch('/api/assets/asset-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ASSIGNED' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot change status from RETIRED to ASSIGNED');
    });

    it('should reject same status update', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);

      const response = await request(app)
        .patch('/api/assets/asset-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'AVAILABLE' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Asset already has this status' });
    });
  });

  describe('GET /api/assets/:id/status-history', () => {
    it('should return asset status history for authenticated user', async () => {
      const mockHistory = [
        {
          id: 'history-1',
          oldStatus: 'AVAILABLE',
          newStatus: 'ASSIGNED',
          reason: 'Assigned to user',
          createdAt: new Date().toISOString(),
          changedBy: { id: 'user-1', name: 'Admin User', email: 'admin@test.com' },
        },
      ];

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);
      mockPrisma.assetStatusHistory.findMany.mockResolvedValue(mockHistory);

      const response = await request(app)
        .get('/api/assets/asset-id/status-history')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHistory);
    });

    it('should return 404 for non-existent asset', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/assets/asset-id/status-history')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Asset not found' });
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/assets/asset-id/status-history');

      expect(response.status).toBe(401);
    });
  });
});