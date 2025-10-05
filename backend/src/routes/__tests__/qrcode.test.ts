import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import qrcodeRoutes from '../qrcode';
import { authenticateToken } from '../../middleware/auth';

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 'test-user-id', role: 'ADMIN' };
    next();
  }),
  requireRole: jest.fn(() => (req: any, res: any, next: any) => next()),
}));

const app = express();
app.use(express.json());
app.use('/api/qrcode', qrcodeRoutes);

describe('QR Code Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/qrcode/asset/:id', () => {
    it('should generate QR code for existing asset', async () => {
      const mockAsset = {
        id: 'asset-1',
        name: 'Test Laptop',
        serialNumber: 'SN12345',
        category: 'HARDWARE',
        status: 'AVAILABLE',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);

      const response = await request(app)
        .get('/api/qrcode/asset/asset-1')
        .expect(200);

      expect(response.body).toHaveProperty('qrCode');
      expect(response.body).toHaveProperty('asset');
      expect(response.body.asset.id).toBe('asset-1');
      expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('should return 404 for non-existent asset', async () => {
      (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/qrcode/asset/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Asset not found');
    });
  });

  describe('POST /api/qrcode/scan', () => {
    it('should process QR code for existing asset', async () => {
      const mockAsset = {
        id: 'asset-1',
        name: 'Test Laptop',
        serialNumber: 'SN12345',
        category: 'HARDWARE',
        status: 'AVAILABLE',
        createdById: 'user-1',
        assignee: null,
        createdBy: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);

      const qrData = JSON.stringify({
        type: 'asset',
        id: 'asset-1',
        name: 'Test Laptop',
      });

      const response = await request(app)
        .post('/api/qrcode/scan')
        .send({ data: qrData })
        .expect(200);

      expect(response.body.action).toBe('existing');
      expect(response.body.asset.id).toBe('asset-1');
    });

    it('should process QR code for new asset registration', async () => {
      const qrData = JSON.stringify({
        type: 'asset',
        name: 'New Device',
        serialNumber: 'SN99999',
        category: 'HARDWARE',
      });

      const response = await request(app)
        .post('/api/qrcode/scan')
        .send({ data: qrData })
        .expect(200);

      expect(response.body.action).toBe('register');
      expect(response.body.assetData.name).toBe('New Device');
    });

    it('should return 400 for invalid QR code format', async () => {
      const response = await request(app)
        .post('/api/qrcode/scan')
        .send({ data: 'invalid-json' })
        .expect(400);

      expect(response.body.error).toBe('Invalid QR code format');
    });

    it('should return 400 for invalid QR code type', async () => {
      const qrData = JSON.stringify({
        type: 'invalid-type',
        data: 'some data',
      });

      const response = await request(app)
        .post('/api/qrcode/scan')
        .send({ data: qrData })
        .expect(400);

      expect(response.body.error).toBe('Invalid QR code type');
    });

    it('should return 400 when QR code data is missing', async () => {
      const response = await request(app)
        .post('/api/qrcode/scan')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('QR code data is required');
    });
  });
});
