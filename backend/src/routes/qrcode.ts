import express from 'express';
import QRCode from 'qrcode';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const qrDataSchema = z.object({
  assetId: z.string().optional(),
  assetData: z.object({
    name: z.string(),
    serialNumber: z.string().optional(),
    category: z.string(),
  }).optional(),
});

// GET /api/qrcode/asset/:id - Generate QR code for existing asset
router.get('/asset/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const asset = await prisma.asset.findUnique({
      where: { id },
    });
    
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    
    // Create QR code data with asset info
    const qrData = JSON.stringify({
      type: 'asset',
      id: asset.id,
      name: asset.name,
      serialNumber: asset.serialNumber,
      category: asset.category,
    });
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
    });
    
    res.json({
      qrCode: qrCodeDataUrl,
      asset: {
        id: asset.id,
        name: asset.name,
        serialNumber: asset.serialNumber,
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// POST /api/qrcode/scan - Process scanned QR code
router.post('/scan', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      res.status(400).json({ error: 'QR code data is required' });
      return;
    }
    
    // Parse QR code data
    let qrData;
    try {
      qrData = JSON.parse(data);
    } catch {
      res.status(400).json({ error: 'Invalid QR code format' });
      return;
    }
    
    if (qrData.type !== 'asset') {
      res.status(400).json({ error: 'Invalid QR code type' });
      return;
    }
    
    // Normalize field names (handle both camelCase and lowercase)
    if (qrData.serialnumber && !qrData.serialNumber) {
      qrData.serialNumber = qrData.serialnumber;
    }
    if (qrData.category) {
      qrData.category = qrData.category.toUpperCase();
    }
    
    // If QR code contains asset ID, fetch the asset
    if (qrData.id) {
      const asset = await prisma.asset.findUnique({
        where: { id: qrData.id },
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
      
      if (!asset) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }
      
      res.json({
        action: 'existing',
        asset,
      });
    } else {
      // QR code contains new asset data for registration
      res.json({
        action: 'register',
        assetData: qrData,
      });
    }
  } catch (error) {
    console.error('Error processing QR code:', error);
    res.status(500).json({ error: 'Failed to process QR code' });
  }
});

export default router;
