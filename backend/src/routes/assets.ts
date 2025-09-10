import express from 'express';
import { z } from 'zod';
import { PrismaClient, AssetCategory, AssetStatus } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createAssetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  category: z.nativeEnum(AssetCategory),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().positive().optional(),
  vendor: z.string().optional(),
  location: z.string().optional(),
});

const updateAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  category: z.nativeEnum(AssetCategory).optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().positive().optional(),
  vendor: z.string().optional(),
  location: z.string().optional(),
});

const assignAssetSchema = z.object({
  assigneeId: z.string().nullable(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(AssetStatus),
  reason: z.string().optional(),
});

// GET /api/assets/stats - Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get asset counts by status
    const statusCounts = await prisma.asset.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get total count
    const totalAssets = await prisma.asset.count();

    // Get recent assets (5 most recent)
    const recentAssets = await prisma.asset.findMany({
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

    // Format status counts for easier frontend consumption
    const stats = {
      total: totalAssets,
      available: statusCounts.find(s => s.status === 'AVAILABLE')?._count.id || 0,
      assigned: statusCounts.find(s => s.status === 'ASSIGNED')?._count.id || 0,
      maintenance: statusCounts.find(s => s.status === 'MAINTENANCE')?._count.id || 0,
      retired: statusCounts.find(s => s.status === 'RETIRED')?._count.id || 0,
      lost: statusCounts.find(s => s.status === 'LOST')?._count.id || 0,
    };

    res.json({
      stats,
      recentAssets,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/assets - Retrieve all assets with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      category, 
      status, 
      search, 
      assignee, 
      vendor, 
      location,
      page = '1',
      limit = '50',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const where: any = {};
    
    // Filter by category if provided
    if (category && Object.values(AssetCategory).includes(category as AssetCategory)) {
      where.category = category;
    }
    
    // Filter by status if provided
    if (status && Object.values(AssetStatus).includes(status as AssetStatus)) {
      where.status = status;
    }
    
    // Filter by assignee if provided
    if (assignee && typeof assignee === 'string') {
      where.assigneeId = assignee;
    }
    
    // Advanced search functionality
    if (search && typeof search === 'string') {
      const searchTerms = search.trim().split(/\s+/);
      
      // Create OR conditions for multiple fields
      where.OR = searchTerms.map(term => ({
        OR: [
          {
            name: {
              contains: term,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: term,
              mode: 'insensitive',
            },
          },
          {
            serialNumber: {
              contains: term,
              mode: 'insensitive',
            },
          },
          {
            vendor: {
              contains: term,
              mode: 'insensitive',
            },
          },
          {
            location: {
              contains: term,
              mode: 'insensitive',
            },
          },
          {
            assignee: {
              name: {
                contains: term,
                mode: 'insensitive',
              },
            },
          },
        ],
      }));
    }
    
    // Filter by vendor if provided
    if (vendor && typeof vendor === 'string') {
      where.vendor = {
        contains: vendor,
        mode: 'insensitive',
      };
    }
    
    // Filter by location if provided
    if (location && typeof location === 'string') {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const validSortFields = ['name', 'category', 'status', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    // Get total count for pagination
    const totalCount = await prisma.asset.count({ where });

    const assets = await prisma.asset.findMany({
      where,
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
        [sortField]: sortDirection,
      },
      skip,
      take: limitNum,
    });

    res.json({
      assets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// POST /api/assets - Create new asset
router.post('/', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const validatedData = createAssetSchema.parse(req.body);
    
    // Check if serial number already exists (if provided)
    if (validatedData.serialNumber) {
      const existingAsset = await prisma.asset.findUnique({
        where: { serialNumber: validatedData.serialNumber },
      });
      
      if (existingAsset) {
        res.status(400).json({ 
          error: 'Serial number already exists',
          field: 'serialNumber'
        });
        return;
      }
    }

    const asset = await prisma.asset.create({
      data: {
        ...validatedData,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
        createdById: req.user!.userId,
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

    res.status(201).json(asset);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }
    
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// PUT /api/assets/:id - Update asset
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateAssetSchema.parse(req.body);
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });
    
    if (!existingAsset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    
    // Check if serial number already exists (if provided and different from current)
    if (validatedData.serialNumber && validatedData.serialNumber !== existingAsset.serialNumber) {
      const duplicateAsset = await prisma.asset.findUnique({
        where: { serialNumber: validatedData.serialNumber },
      });
      
      if (duplicateAsset) {
        res.status(400).json({ 
          error: 'Serial number already exists',
          field: 'serialNumber'
        });
        return;
      }
    }

    // Use transaction if status is being changed to create audit trail
    const asset = await prisma.$transaction(async (tx) => {
      // Prepare update data
      let updateData: any = {
        ...validatedData,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
      };
      
      // If status is being changed to MAINTENANCE or RETIRED, unassign the asset
      if (validatedData.status && ['MAINTENANCE', 'RETIRED', 'LOST'].includes(validatedData.status)) {
        updateData.assigneeId = null;
      }

      const updatedAsset = await tx.asset.update({
        where: { id },
        data: updateData,
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
      
      // Create audit trail record if status changed
      if (validatedData.status && validatedData.status !== existingAsset.status) {
        await tx.assetStatusHistory.create({
          data: {
            assetId: id,
            oldStatus: existingAsset.status,
            newStatus: validatedData.status,
            changedById: req.user!.userId,
            reason: 'Status updated via asset edit',
          },
        });
      }
      
      return updatedAsset;
    });

    res.json(asset);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }
    
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// PATCH /api/assets/:id/assign - Assign/unassign asset
router.patch('/:id/assign', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = assignAssetSchema.parse(req.body);
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });
    
    if (!existingAsset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    
    // If assigning to a user, verify the user exists
    if (assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: assigneeId },
      });
      
      if (!user) {
        res.status(400).json({ error: 'Assignee not found' });
        return;
      }
    }
    
    // Update asset assignment and status with audit trail
    const newStatus = assigneeId ? AssetStatus.ASSIGNED : AssetStatus.AVAILABLE;
    
    const asset = await prisma.$transaction(async (tx) => {
      const updatedAsset = await tx.asset.update({
        where: { id },
        data: {
          assigneeId,
          status: newStatus,
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
      
      // Create audit trail record if status changed
      if (newStatus !== existingAsset.status) {
        await tx.assetStatusHistory.create({
          data: {
            assetId: id,
            oldStatus: existingAsset.status,
            newStatus: newStatus,
            changedById: req.user!.userId,
            reason: assigneeId ? 'Asset assigned to user' : 'Asset unassigned from user',
          },
        });
      }
      
      return updatedAsset;
    });

    res.json(asset);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }
    
    console.error('Error assigning asset:', error);
    res.status(500).json({ error: 'Failed to assign asset' });
  }
});

// PATCH /api/assets/:id/status - Update asset status with audit trail
router.patch('/:id/status', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = updateStatusSchema.parse(req.body);
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });
    
    if (!existingAsset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    
    // Don't update if status is the same
    if (existingAsset.status === status) {
      res.status(400).json({ error: 'Asset already has this status' });
      return;
    }
    
    // Validate status transitions
    const validTransitions: Record<AssetStatus, AssetStatus[]> = {
      AVAILABLE: ['ASSIGNED', 'MAINTENANCE', 'RETIRED', 'LOST'],
      ASSIGNED: ['AVAILABLE', 'MAINTENANCE', 'RETIRED', 'LOST'],
      MAINTENANCE: ['AVAILABLE', 'RETIRED', 'LOST'],
      RETIRED: ['AVAILABLE'], // Allow bringing retired assets back
      LOST: ['AVAILABLE'], // Allow marking found assets as available
    };
    
    if (!validTransitions[existingAsset.status].includes(status)) {
      res.status(400).json({ 
        error: `Cannot change status from ${existingAsset.status} to ${status}` 
      });
      return;
    }
    
    // Use transaction to update asset and create audit record
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      let updateData: any = { status };
      
      // If status is being changed to MAINTENANCE or RETIRED, unassign the asset
      if (['MAINTENANCE', 'RETIRED', 'LOST'].includes(status)) {
        updateData.assigneeId = null;
      }
      
      // Update the asset
      const updatedAsset = await tx.asset.update({
        where: { id },
        data: updateData,
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
      
      // Create audit trail record
      await tx.assetStatusHistory.create({
        data: {
          assetId: id,
          oldStatus: existingAsset.status,
          newStatus: status,
          changedById: req.user!.userId,
          reason: reason || null,
        },
      });
      
      return updatedAsset;
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }
    
    console.error('Error updating asset status:', error);
    res.status(500).json({ error: 'Failed to update asset status' });
  }
});

// GET /api/assets/:id/status-history - Get asset status history
router.get('/:id/status-history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset exists
    const asset = await prisma.asset.findUnique({
      where: { id },
    });
    
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    
    const statusHistory = await prisma.assetStatusHistory.findMany({
      where: { assetId: id },
      include: {
        changedBy: {
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

    res.json(statusHistory);
  } catch (error) {
    console.error('Error fetching asset status history:', error);
    res.status(500).json({ error: 'Failed to fetch asset status history' });
  }
});

// DELETE /api/assets/:id - Delete asset (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
      include: {
        assignee: true,
      },
    });
    
    if (!existingAsset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    
    // Check if asset is assigned
    if (existingAsset.assigneeId) {
      res.status(400).json({ 
        error: 'Cannot delete assigned asset',
        message: 'Please unassign the asset before deleting it'
      });
      return;
    }
    
    // Delete asset and related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete status history records first (due to foreign key constraints)
      await tx.assetStatusHistory.deleteMany({
        where: { assetId: id },
      });
      
      // Delete maintenance records
      await tx.maintenanceRecord.deleteMany({
        where: { assetId: id },
      });
      
      // Delete the asset
      await tx.asset.delete({
        where: { id },
      });
    });

    res.json({ 
      message: 'Asset deleted successfully',
      deletedAsset: {
        id: existingAsset.id,
        name: existingAsset.name,
      }
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export default router;