import {
  validateField,
  validateForm,
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeFormData,
  emailSchema,
  passwordSchema,
  createAssetSchema,
  loginFormSchema
} from '../validation';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('validates correct email addresses', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
      expect(() => emailSchema.parse('user.name+tag@domain.co.uk')).not.toThrow();
    });

    it('rejects invalid email addresses', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow();
      expect(() => emailSchema.parse('test@')).toThrow();
      expect(() => emailSchema.parse('@domain.com')).toThrow();
      expect(() => emailSchema.parse('')).toThrow();
    });

    it('converts email to lowercase', () => {
      const result = emailSchema.parse('TEST@EXAMPLE.COM');
      expect(result).toBe('test@example.com');
    });
  });

  describe('passwordSchema', () => {
    it('validates strong passwords', () => {
      expect(() => passwordSchema.parse('Password123')).not.toThrow();
      expect(() => passwordSchema.parse('MySecure1Pass')).not.toThrow();
    });

    it('rejects weak passwords', () => {
      expect(() => passwordSchema.parse('short')).toThrow();
      expect(() => passwordSchema.parse('nouppercase123')).toThrow();
      expect(() => passwordSchema.parse('NOLOWERCASE123')).toThrow();
      expect(() => passwordSchema.parse('NoNumbers')).toThrow();
    });
  });

  describe('createAssetSchema', () => {
    it('validates complete asset data', () => {
      const validAsset = {
        name: 'Test Asset',
        description: 'A test asset',
        serialNumber: 'SN123456',
        category: 'HARDWARE' as const,
        purchaseDate: '2023-01-01',
        purchasePrice: '999.99',
        vendor: 'Test Vendor',
        location: 'Office A'
      };

      expect(() => createAssetSchema.parse(validAsset)).not.toThrow();
    });

    it('validates minimal asset data', () => {
      const minimalAsset = {
        name: 'Test Asset',
        category: 'SOFTWARE' as const
      };

      expect(() => createAssetSchema.parse(minimalAsset)).not.toThrow();
    });

    it('rejects invalid asset data', () => {
      expect(() => createAssetSchema.parse({ name: '', category: 'HARDWARE' })).toThrow();
      expect(() => createAssetSchema.parse({ name: 'Test', category: 'INVALID' })).toThrow();
    });

    it('validates serial number format', () => {
      const assetWithValidSerial = {
        name: 'Test Asset',
        category: 'HARDWARE' as const,
        serialNumber: 'ABC-123_456'
      };

      expect(() => createAssetSchema.parse(assetWithValidSerial)).not.toThrow();

      const assetWithInvalidSerial = {
        name: 'Test Asset',
        category: 'HARDWARE' as const,
        serialNumber: 'ABC 123!'
      };

      expect(() => createAssetSchema.parse(assetWithInvalidSerial)).toThrow();
    });
  });

  describe('loginFormSchema', () => {
    it('validates correct login data', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'password123'
      };

      expect(() => loginFormSchema.parse(validLogin)).not.toThrow();
    });

    it('rejects invalid login data', () => {
      expect(() => loginFormSchema.parse({ email: 'invalid', password: 'test' })).toThrow();
      expect(() => loginFormSchema.parse({ email: 'test@example.com', password: '' })).toThrow();
    });
  });
});

describe('Validation Utilities', () => {
  describe('validateField', () => {
    it('returns null for valid field', () => {
      const result = validateField(emailSchema, 'test@example.com');
      expect(result).toBeNull();
    });

    it('returns error message for invalid field', () => {
      const result = validateField(emailSchema, 'invalid-email');
      expect(result).toBe('Please enter a valid email address');
    });
  });

  describe('validateForm', () => {
    it('returns success for valid form data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password'
      };

      const result = validateForm(loginFormSchema, formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.data).toEqual({
        email: 'test@example.com',
        password: 'password'
      });
    });

    it('returns errors for invalid form data', () => {
      const formData = {
        email: 'invalid-email',
        password: ''
      };

      const result = validateForm(loginFormSchema, formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('password');
      expect(result.data).toBeUndefined();
    });
  });
});

describe('Sanitization Functions', () => {
  describe('sanitizeString', () => {
    it('trims whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });

    it('collapses multiple spaces', () => {
      expect(sanitizeString('test   multiple   spaces')).toBe('test multiple spaces');
    });

    it('handles empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('trims and converts to lowercase', () => {
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
    });
  });

  describe('sanitizeNumber', () => {
    it('converts valid number strings', () => {
      expect(sanitizeNumber('123.45')).toBe(123.45);
      expect(sanitizeNumber('  999  ')).toBe(999);
    });

    it('returns null for invalid numbers', () => {
      expect(sanitizeNumber('not-a-number')).toBeNull();
      expect(sanitizeNumber('')).toBeNull();
    });
  });

  describe('sanitizeFormData', () => {
    it('sanitizes string values in form data', () => {
      const formData = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        age: 25,
        active: true
      };

      const result = sanitizeFormData(formData);
      expect(result).toEqual({
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        age: 25,
        active: true
      });
    });

    it('handles nested objects', () => {
      const formData = {
        user: {
          name: '  Jane  ',
          details: {
            address: '  123 Main St  '
          }
        }
      };

      const result = sanitizeFormData(formData);
      expect(result.user.name).toBe('Jane');
      expect(result.user.details.address).toBe('123 Main St');
    });

    it('handles arrays', () => {
      const formData = {
        tags: ['  tag1  ', '  tag2  ']
      };

      const result = sanitizeFormData(formData);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });
  });
});