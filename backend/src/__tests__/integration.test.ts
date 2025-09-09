import { PrismaClient, UserRole, AssetCategory, AssetStatus } from '@prisma/client';
import { hashPassword } from '../lib/auth';

// Use a separate test database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.assetStatusHistory.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up database after tests
    await prisma.assetStatusHistory.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('User Operations', () => {
    it('should create and retrieve users', async () => {
      const hashedPassword = await hashPassword('testpassword123');
      
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: hashedPassword,
          role: UserRole.USER
        }
      });

      expect(user).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER
      });
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // Retrieve user
      const retrievedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      expect(retrievedUser).toMatchObject({
        id: user.id,
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER
      });
    });

    it('should enforce unique email constraint', async () => {
      const hashedPassword = await hashPassword('testpassword123');
      
      await prisma.user.create({
        data: {
          email: 'unique@example.com',
          name: 'First User',
          password: hashedPassword,
          role: UserRole.USER
        }
      });

      // Attempt to create another user with same email
      await expect(
        prisma.user.create({
          data: {
            email: 'unique@example.com',
            name: 'Second User',
            password: hashedPassword,
            role: UserRole.USER
          }
        })
      ).rejects.toThrow();
    });

    it('should update user information', async () => {
      const hashedPassword = await hashPassword('testpassword123');
      
      const user = await prisma.user.create({
        data: {
          email: 'update@example.com',
          name: 'Original Name',
          password: hashedPassword,
          role: UserRole.USER
        }
      });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: 'Updated Name',
          email: 'updated@example.com'
        }
      });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe('updated@example.com');
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
    });
  });

  describe('Asset Operations', () => {
    let testUser: any;

    beforeEach(async () => {
      const hashedPassword = await hashPassword('testpassword123');
      testUser = await prisma.user.create({
        data: {
          email: `asset-test-${Date.now()}@example.com`,
          name: 'Asset Test User',
          password: hashedPassword,
          role: UserRole.ADMIN
        }
      });
    });

    it('should create and retrieve assets', async () => {
      const asset = await prisma.asset.create({
        data: {
          name: 'Test Laptop',
          description: 'A test laptop for integration testing',
          serialNumber: 'TEST-001',
          category: AssetCategory.HARDWARE,
          status: AssetStatus.AVAILABLE,
          purchaseDate: new Date('2023-01-01'),
          purchasePrice: 1000,
          vendor: 'Test Vendor',
          location: 'Test Office',
          createdById: testUser.id
        }
      });

      expect(asset).toMatchObject({
        name: 'Test Laptop',
        description: 'A test laptop for integration testing',
        serialNumber: 'TEST-001',
        category: AssetCategory.HARDWARE,
        status: AssetStatus.AVAILABLE,
        purchasePrice: 1000,
        vendor: 'Test Vendor',
        location: 'Test Office',
        createdById: testUser.id
      });
      expect(asset.id).toBeDefined();
      expect(asset.createdAt).toBeDefined();
      expect(asset.updatedAt).toBeDefined();

      // Retrieve asset with relations
      const retrievedAsset = await prisma.asset.findUnique({
        where: { id: asset.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      expect(retrievedAsset?.createdBy).toMatchObject({
        id: testUser.id,
        name: testUser.name,
        email: testUser.email
      });
    });

    it('should enforce unique serial number constraint', async () => {
      await prisma.asset.create({
        data: {
          name: 'First Asset',
          serialNumber: 'UNIQUE-001',
          category: AssetCategory.HARDWARE,
          status: AssetStatus.AVAILABLE,
          createdById: testUser.id
        }
      });

      // Attempt to create another asset with same serial number
      await expect(
        prisma.asset.create({
          data: {
            name: 'Second Asset',
            serialNumber: 'UNIQUE-001',
            category: AssetCategory.HARDWARE,
            status: AssetStatus.AVAILABLE,
            createdById: testUser.id
          }
        })
      ).rejects.toThrow();
    });

    it('should handle asset assignment workflow', async () => {
      const hashedPassword = await hashPassword('testpassword123');
      const assignee = await prisma.user.create({
        data: {
          email: `assignee-${Date.now()}@example.com`,
          name: 'Assignee User',
          password: hashedPassword,
          role: UserRole.USER
        }
      });

      const asset = await prisma.asset.create({
        data: {
          name: 'Assignment Test Asset',
          category: AssetCategory.HARDWARE,
          status: AssetStatus.AVAILABLE,
          createdById: testUser.id
        }
      });

      // Assign asset
      const assignedAsset = await prisma.asset.update({
        where: { id: asset.id },
        data: {
          assigneeId: assignee.id,
          status: AssetStatus.ASSIGNED
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      expect(assignedAsset.assigneeId).toBe(assignee.id);
      expect(assignedAsset.status).toBe(AssetStatus.ASSIGNED);
      expect(assignedAsset.assignee).toMatchObject({
        id: assignee.id,
        name: assignee.name,
        email: assignee.email
      });

      // Unassign asset
      const unassignedAsset = await prisma.asset.update({
        where: { id: asset.id },
        data: {
          assigneeId: null,
          status: AssetStatus.AVAILABLE
        }
      });

      expect(unassignedAsset.assigneeId).toBeNull();
      expect(unassignedAsset.status).toBe(AssetStatus.AVAILABLE);
    });

    it('should filter assets by category and status', async () => {
      // Create assets with different categories and statuses
      await prisma.asset.createMany({
        data: [
          {
            name: 'Hardware Asset 1',
            category: AssetCategory.HARDWARE,
            status: AssetStatus.AVAILABLE,
            createdById: testUser.id
          },
          {
            name: 'Hardware Asset 2',
            category: AssetCategory.HARDWARE,
            status: AssetStatus.ASSIGNED,
            createdById: testUser.id
          },
          {
            name: 'Software Asset 1',
            category: AssetCategory.SOFTWARE,
            status: AssetStatus.AVAILABLE,
            createdById: testUser.id
          }
        ]
      });

      // Filter by category
      const hardwareAssets = await prisma.asset.findMany({
        where: { category: AssetCategory.HARDWARE }
      });
      expect(hardwareAssets).toHaveLength(2);
      expect(hardwareAssets.every(asset => asset.category === AssetCategory.HARDWARE)).toBe(true);

      // Filter by status
      const availableAssets = await prisma.asset.findMany({
        where: { status: AssetStatus.AVAILABLE }
      });
      expect(availableAssets).toHaveLength(2);
      expect(availableAssets.every(asset => asset.status === AssetStatus.AVAILABLE)).toBe(true);

      // Filter by both category and status
      const availableHardware = await prisma.asset.findMany({
        where: {
          category: AssetCategory.HARDWARE,
          status: AssetStatus.AVAILABLE
        }
      });
      expect(availableHardware).toHaveLength(1);
      expect(availableHardware[0].name).toBe('Hardware Asset 1');
    });

    it('should search assets by name', async () => {
      await prisma.asset.createMany({
        data: [
          {
            name: 'MacBook Pro',
            category: AssetCategory.HARDWARE,
            status: AssetStatus.AVAILABLE,
            createdById: testUser.id
          },
          {
            name: 'MacBook Air',
            category: AssetCategory.HARDWARE,
            status: AssetStatus.AVAILABLE,
            createdById: testUser.id
          },
          {
            name: 'Dell Laptop',
            category: AssetCategory.HARDWARE,
            status: AssetStatus.AVAILABLE,
            createdById: testUser.id
          }
        ]
      });

      // Search for MacBook
      const macBooks = await prisma.asset.findMany({
        where: {
          name: {
            contains: 'MacBook',
            mode: 'insensitive'
          }
        }
      });
      expect(macBooks).toHaveLength(2);
      expect(macBooks.every(asset => asset.name.includes('MacBook'))).toBe(true);

      // Case insensitive search
      const laptops = await prisma.asset.findMany({
        where: {
          name: {
            contains: 'laptop',
            mode: 'insensitive'
          }
        }
      });
      expect(laptops).toHaveLength(1);
      expect(laptops[0].name).toBe('Dell Laptop');
    });
  });

  describe('Asset Status History Operations', () => {
    let testUser: any;
    let testAsset: any;

    beforeEach(async () => {
      const hashedPassword = await hashPassword('testpassword123');
      testUser = await prisma.user.create({
        data: {
          email: `history-test-${Date.now()}@example.com`,
          name: 'History Test User',
          password: hashedPassword,
          role: UserRole.ADMIN
        }
      });

      testAsset = await prisma.asset.create({
        data: {
          name: 'History Test Asset',
          category: AssetCategory.HARDWARE,
          status: AssetStatus.AVAILABLE,
          createdById: testUser.id
        }
      });
    });

    it('should create and retrieve status history', async () => {
      const statusHistory = await prisma.assetStatusHistory.create({
        data: {
          assetId: testAsset.id,
          oldStatus: AssetStatus.AVAILABLE,
          newStatus: AssetStatus.ASSIGNED,
          reason: 'Assigned to user for testing',
          changedById: testUser.id
        }
      });

      expect(statusHistory).toMatchObject({
        assetId: testAsset.id,
        oldStatus: AssetStatus.AVAILABLE,
        newStatus: AssetStatus.ASSIGNED,
        reason: 'Assigned to user for testing',
        changedById: testUser.id
      });
      expect(statusHistory.id).toBeDefined();
      expect(statusHistory.createdAt).toBeDefined();

      // Retrieve with relations
      const retrievedHistory = await prisma.assetStatusHistory.findMany({
        where: { assetId: testAsset.id },
        include: {
          changedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      expect(retrievedHistory).toHaveLength(1);
      expect(retrievedHistory[0].changedBy).toMatchObject({
        id: testUser.id,
        name: testUser.name,
        email: testUser.email
      });
    });

    it('should track multiple status changes', async () => {
      // Create multiple status changes
      const changes = [
        {
          oldStatus: AssetStatus.AVAILABLE,
          newStatus: AssetStatus.ASSIGNED,
          reason: 'Initial assignment'
        },
        {
          oldStatus: AssetStatus.ASSIGNED,
          newStatus: AssetStatus.MAINTENANCE,
          reason: 'Scheduled maintenance'
        },
        {
          oldStatus: AssetStatus.MAINTENANCE,
          newStatus: AssetStatus.AVAILABLE,
          reason: 'Maintenance completed'
        }
      ];

      for (const change of changes) {
        await prisma.assetStatusHistory.create({
          data: {
            assetId: testAsset.id,
            oldStatus: change.oldStatus,
            newStatus: change.newStatus,
            reason: change.reason,
            changedById: testUser.id
          }
        });
        
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const history = await prisma.assetStatusHistory.findMany({
        where: { assetId: testAsset.id },
        orderBy: { createdAt: 'asc' }
      });

      expect(history).toHaveLength(3);
      expect(history[0].newStatus).toBe(AssetStatus.ASSIGNED);
      expect(history[1].newStatus).toBe(AssetStatus.MAINTENANCE);
      expect(history[2].newStatus).toBe(AssetStatus.AVAILABLE);
    });
  });

  describe('Complex Queries and Aggregations', () => {
    let testUser: any;

    beforeEach(async () => {
      const hashedPassword = await hashPassword('testpassword123');
      testUser = await prisma.user.create({
        data: {
          email: `complex-test-${Date.now()}@example.com`,
          name: 'Complex Test User',
          password: hashedPassword,
          role: UserRole.ADMIN
        }
      });
    });

    it('should perform asset statistics aggregation', async () => {
      // Create assets with different statuses
      await prisma.asset.createMany({
        data: [
          { name: 'Asset 1', category: AssetCategory.HARDWARE, status: AssetStatus.AVAILABLE, createdById: testUser.id },
          { name: 'Asset 2', category: AssetCategory.HARDWARE, status: AssetStatus.AVAILABLE, createdById: testUser.id },
          { name: 'Asset 3', category: AssetCategory.HARDWARE, status: AssetStatus.ASSIGNED, createdById: testUser.id },
          { name: 'Asset 4', category: AssetCategory.SOFTWARE, status: AssetStatus.MAINTENANCE, createdById: testUser.id },
          { name: 'Asset 5', category: AssetCategory.SOFTWARE, status: AssetStatus.RETIRED, createdById: testUser.id }
        ]
      });

      // Get status counts
      const statusCounts = await prisma.asset.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      });

      const statusMap = statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>);

      expect(statusMap[AssetStatus.AVAILABLE]).toBe(2);
      expect(statusMap[AssetStatus.ASSIGNED]).toBe(1);
      expect(statusMap[AssetStatus.MAINTENANCE]).toBe(1);
      expect(statusMap[AssetStatus.RETIRED]).toBe(1);

      // Get total count
      const totalCount = await prisma.asset.count();
      expect(totalCount).toBeGreaterThanOrEqual(5);
    });

    it('should get user with assigned assets count', async () => {
      const hashedPassword = await hashPassword('testpassword123');
      const assignee = await prisma.user.create({
        data: {
          email: `assignee-count-${Date.now()}@example.com`,
          name: 'Assignee Count User',
          password: hashedPassword,
          role: UserRole.USER
        }
      });

      // Create assets and assign some to the user
      const asset1 = await prisma.asset.create({
        data: {
          name: 'Assigned Asset 1',
          category: AssetCategory.HARDWARE,
          status: AssetStatus.ASSIGNED,
          assigneeId: assignee.id,
          createdById: testUser.id
        }
      });

      const asset2 = await prisma.asset.create({
        data: {
          name: 'Assigned Asset 2',
          category: AssetCategory.SOFTWARE,
          status: AssetStatus.ASSIGNED,
          assigneeId: assignee.id,
          createdById: testUser.id
        }
      });

      // Create unassigned asset
      await prisma.asset.create({
        data: {
          name: 'Unassigned Asset',
          category: AssetCategory.HARDWARE,
          status: AssetStatus.AVAILABLE,
          createdById: testUser.id
        }
      });

      // Get user with assigned assets count
      const userWithCount = await prisma.user.findUnique({
        where: { id: assignee.id },
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              assignedAssets: true
            }
          }
        }
      });

      expect(userWithCount?._count.assignedAssets).toBe(2);

      // Get user with actual assigned assets
      const userWithAssets = await prisma.user.findUnique({
        where: { id: assignee.id },
        include: {
          assignedAssets: {
            select: {
              id: true,
              name: true,
              category: true,
              status: true
            },
            where: {
              status: AssetStatus.ASSIGNED
            }
          }
        }
      });

      expect(userWithAssets?.assignedAssets).toHaveLength(2);
      expect(userWithAssets?.assignedAssets.every(asset => asset.status === AssetStatus.ASSIGNED)).toBe(true);
    });
  });
});