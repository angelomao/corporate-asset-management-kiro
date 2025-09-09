import { z } from 'zod';

// Common validation patterns
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const serialNumberSchema = z.string()
  .min(1, 'Serial number cannot be empty')
  .max(50, 'Serial number is too long')
  .regex(/^[a-zA-Z0-9-_]+$/, 'Serial number can only contain letters, numbers, hyphens, and underscores');

export const priceSchema = z.string()
  .refine((val) => val === '' || !isNaN(Number(val)), 'Must be a valid number')
  .refine((val) => val === '' || Number(val) >= 0, 'Price cannot be negative')
  .refine((val) => val === '' || Number(val) <= 999999.99, 'Price is too large');

// Login form validation
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// User registration validation
export const registerFormSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// User profile update validation
export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema
});

// Asset creation validation
export const createAssetSchema = z.object({
  name: z.string()
    .min(1, 'Asset name is required')
    .max(100, 'Asset name is too long'),
  description: z.string()
    .max(500, 'Description is too long')
    .optional(),
  serialNumber: z.string()
    .max(50, 'Serial number is too long')
    .regex(/^[a-zA-Z0-9-_]*$/, 'Serial number can only contain letters, numbers, hyphens, and underscores')
    .optional()
    .or(z.literal('')),
  category: z.enum(['HARDWARE', 'SOFTWARE', 'FURNITURE', 'VEHICLE', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  purchaseDate: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, 'Purchase date cannot be in the future'),
  purchasePrice: priceSchema.optional().or(z.literal('')),
  vendor: z.string()
    .max(100, 'Vendor name is too long')
    .optional()
    .or(z.literal('')),
  location: z.string()
    .max(100, 'Location is too long')
    .optional()
    .or(z.literal(''))
});

// Asset update validation (all fields optional)
export const updateAssetSchema = createAssetSchema.partial();

// Validation helper functions
export const validateField = <T>(schema: z.ZodSchema<T>, value: T): string | null => {
  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid value';
    }
    return 'Validation error';
  }
};

export const validateForm = <T>(schema: z.ZodSchema<T>, data: T): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
} => {
  try {
    const validatedData = schema.parse(data);
    return {
      isValid: true,
      errors: {},
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        isValid: false,
        errors
      };
    }
    return {
      isValid: false,
      errors: { _form: 'Validation failed' }
    };
  }
};

// Real-time validation hook
export const useFieldValidation = <T>(schema: z.ZodSchema<T>) => {
  return (value: T): string | null => {
    return validateField(schema, value);
  };
};

// Sanitization functions
export const sanitizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sanitizeNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  return isNaN(num) ? null : num;
};

// Form data sanitization
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};