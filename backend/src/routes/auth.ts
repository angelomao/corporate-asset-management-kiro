import { Router, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/database';
import { hashPassword, verifyPassword, generateToken } from '../lib/auth';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { registerSchema, loginSchema, validateBody } from '../lib/validation';
import { asyncHandler, ConflictError, AuthenticationError } from '../middleware/errorHandler';

const router = Router();

// POST /api/auth/register - User registration (admin only)
router.post('/register', 
  authenticateToken, 
  requireAdmin, 
  validateBody(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, name, password, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictError('User already exists', 'email');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  })
);

// POST /api/auth/login - User authentication
router.post('/login', 
  validateBody(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  })
);

export default router;