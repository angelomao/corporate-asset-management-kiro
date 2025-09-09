import { vi } from 'vitest';
import { ErrorHandler, handleApiError, getErrorMessage } from '../errorHandler';
import { AxiosError } from 'axios';

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ErrorHandler', () => {
  afterEach(() => {
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('formatError', () => {
    it('handles string errors', () => {
      const result = ErrorHandler.formatError('Simple error message');
      expect(result).toEqual({
        message: 'Simple error message',
        type: 'unknown'
      });
    });

    it('handles generic Error objects', () => {
      const error = new Error('Generic error');
      const result = ErrorHandler.formatError(error);
      expect(result).toEqual({
        message: 'Generic error',
        type: 'unknown'
      });
    });

    it('handles network errors (no response)', () => {
      const axiosError = {
        isAxiosError: true,
        response: undefined,
        code: 'ECONNABORTED'
      } as AxiosError;

      const result = ErrorHandler.formatError(axiosError);
      expect(result).toEqual({
        message: 'Request timeout. Please check your connection and try again.',
        type: 'network'
      });
    });

    it('handles 401 authentication errors', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: 'Token expired' }
        }
      } as AxiosError;

      const result = ErrorHandler.formatError(axiosError);
      expect(result).toEqual({
        message: 'Token expired',
        type: 'authentication'
      });
    });

    it('handles 403 authorization errors', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: { error: 'Access denied' }
        }
      } as AxiosError;

      const result = ErrorHandler.formatError(axiosError);
      expect(result).toEqual({
        message: 'Access denied',
        type: 'authorization'
      });
    });

    it('handles 400 validation errors with details', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            error: 'Validation failed',
            details: [
              { field: 'email', message: 'Invalid email format' },
              { field: 'password', message: 'Password too short' }
            ]
          }
        }
      } as AxiosError;

      const result = ErrorHandler.formatError(axiosError);
      expect(result).toEqual({
        message: 'Please correct the following errors:',
        details: ['email: Invalid email format', 'password: Password too short'],
        type: 'validation'
      });
    });

    it('handles 409 conflict errors', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 409,
          data: { error: 'Email already exists', field: 'email' }
        }
      } as AxiosError;

      const result = ErrorHandler.formatError(axiosError);
      expect(result).toEqual({
        message: 'Email already exists',
        field: 'email',
        type: 'validation'
      });
    });

    it('handles 500 server errors', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      } as AxiosError;

      const result = ErrorHandler.formatError(axiosError);
      expect(result).toEqual({
        message: 'Server error. Please try again later.',
        type: 'server'
      });
    });

    it('handles unknown error types', () => {
      const result = ErrorHandler.formatError({ unknown: 'object' });
      expect(result).toEqual({
        message: 'An unexpected error occurred',
        type: 'unknown'
      });
    });
  });

  describe('utility functions', () => {
    it('getErrorMessage returns formatted message', () => {
      const message = getErrorMessage('Test error');
      expect(message).toBe('Test error');
    });

    it('isNetworkError identifies network errors correctly', () => {
      const networkError = {
        isAxiosError: true,
        response: undefined
      } as AxiosError;

      expect(ErrorHandler.isNetworkError(networkError)).toBe(true);
      expect(ErrorHandler.isNetworkError('string error')).toBe(false);
    });

    it('isAuthenticationError identifies auth errors correctly', () => {
      const authError = {
        isAxiosError: true,
        response: { status: 401, data: { error: 'Unauthorized' } }
      } as AxiosError;

      expect(ErrorHandler.isAuthenticationError(authError)).toBe(true);
      expect(ErrorHandler.isAuthenticationError('string error')).toBe(false);
    });

    it('isValidationError identifies validation errors correctly', () => {
      const validationError = {
        isAxiosError: true,
        response: { status: 400, data: { error: 'Validation failed' } }
      } as AxiosError;

      expect(ErrorHandler.isValidationError(validationError)).toBe(true);
      expect(ErrorHandler.isValidationError('string error')).toBe(false);
    });
  });

  describe('handleApiError', () => {
    it('logs error and returns formatted error', () => {
      const error = new Error('Test error');
      const result = handleApiError(error, 'Test Context');

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[ErrorHandler - Test Context]:',
        expect.objectContaining({
          message: 'Test error',
          type: 'unknown',
          originalError: error
        })
      );

      expect(result).toEqual({
        message: 'Test error',
        type: 'unknown'
      });
    });
  });
});