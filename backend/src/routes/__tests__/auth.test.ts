import request from 'supertest';
import express from 'express';
import { UserRole } from '@prisma/client';
import authRoutes from '../auth';
import { generateToken } from '../../lib/auth';

// Mock Prisma
jest.mock('../../lib/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}));

import { prisma } from '../../lib/database';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$12$hashedpassword', // This would be a real bcrypt hash
        role: UserRole.USER
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock the verifyPassword function directly
      const { verifyPassword } = require('../../lib/auth');
      jest.spyOn(require('../../lib/auth'), 'verifyPassword').mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: '$2b$12$hashedpassword',
        role: UserRole.USER
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock the verifyPassword function to return false
      jest.spyOn(require('../../lib/auth'), 'verifyPassword').mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'testpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('email: Invalid email format');
    });

    it('should require password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('password: Required');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with admin token', async () => {
      const adminToken = generateToken({
        userId: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      });

      const mockCreatedUser = {
        id: 'newuser123',
        email: 'newuser@example.com',
        name: 'New User',
        role: UserRole.USER,
        createdAt: new Date()
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          password: 'testpassword123'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration without admin token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          password: 'testpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should reject registration with non-admin token', async () => {
      const userToken = generateToken({
        userId: 'user123',
        email: 'user@example.com',
        role: UserRole.USER
      });

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          password: 'testpassword123'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should reject duplicate email', async () => {
      const adminToken = generateToken({
        userId: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      });

      const existingUser = {
        id: 'existing123',
        email: 'existing@example.com'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'existing@example.com',
          name: 'Existing User',
          password: 'testpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists');
      expect(response.body.field).toBe('email');
    });

    it('should validate input data', async () => {
      const adminToken = generateToken({
        userId: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      });

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email',
          name: '',
          password: '123' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Invalid email format'),
          expect.stringContaining('Name is required'),
          expect.stringContaining('Password must be at least 8 characters')
        ])
      );
    });
  });
});