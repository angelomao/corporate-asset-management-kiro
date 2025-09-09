import { z } from 'zod';
import { UserRole, AssetCategory, AssetStatus } from '@prisma/client';

// Common validation patterns
const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .toLowerCase();

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number');

const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

const serialNumberSchema = z.string()
  .min(1, 'Serial number cannot be empty')
  .max(50, 'Serial number too long')
  .regex(/^[a-zA-Z0-9-_]+$/, 'Serial number can only contain letters, numbers, hyphens, and underscores');

const priceSchema = z.number()
  .min(0, 'Price cannot be negative')
  .max(999999.99, 'Price too large');

const dateSchema = z.string()
  .datetime('Invalid date format')
  .or(z.date());

// User validation schemas
export const registerSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema,
  role: z.nativeEnum(UserRole).optional().default(UserRole.USER)
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// Asset validation schemas
export const createAssetSchema = z.object({
  name: z.string()
    .min(1, 'Asset name is required')
    .max(100, 'Asset name too long'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  serialNumber: serialNumberSchema.optional(),
  category: z.nativeEnum(AssetCategory, {
    errorMap: () => ({ message: 'Invalid asset category' })
  }),
  purchaseDate: dateSchema.optional(),
  purchasePrice: priceSchema.optional(),
  vendor: z.string()
    .max(100, 'Vendor name too long')
    .optional(),
  location: z.string()
    .max(100, 'Location too long')
    .optional()
});

export const updateAssetSchema = z.object({
  name: z.string()
    .min(1, 'Asset name is required')
    .max(100, 'Asset name too long')
    .optional(),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  serialNumber: serialNumberSchema.optional(),
  category: z.nativeEnum(AssetCategory, {
    errorMap: () => ({ message: 'Invalid asset category' })
  }).optional(),
  status: z.nativeEnum(AssetStatus, {
    errorMap: () => ({ message: 'Invalid asset status' })
  }).optional(),
  purchaseDate: dateSchema.optional(),
  purchasePrice: priceSchema.optional(),
  vendor: z.string()
    .max(100, 'Vendor name too long')
    .optional(),
  location: z.string()
    .max(100, 'Location too long')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export const assignAssetSchema = z.object({
  assigneeId: z.string()
    .uuid('Invalid user ID format')
    .nullable()
});

// Query parameter validation schemas
export const assetQuerySchema = z.object({
  category: z.nativeEnum(AssetCategory).optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  search: z.string().max(100, 'Search term too long').optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional()
});

export const userQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().max(100, 'Search term too long').optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional()
});

// Validation middleware factory
export const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
};