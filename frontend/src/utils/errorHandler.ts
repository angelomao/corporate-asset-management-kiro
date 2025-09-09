import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  error: string;
  message?: string;
  field?: string;
  details?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

export interface FormattedError {
  message: string;
  field?: string;
  details?: string[];
  type: 'validation' | 'authentication' | 'authorization' | 'network' | 'server' | 'unknown';
}

export class ErrorHandler {
  static formatError(error: unknown): FormattedError {
    // Handle Axios errors (API responses)
    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error);
    }

    // Handle generic JavaScript errors
    if (error instanceof Error) {
      return {
        message: error.message || 'An unexpected error occurred',
        type: 'unknown'
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        message: error,
        type: 'unknown'
      };
    }

    // Fallback for unknown error types
    return {
      message: 'An unexpected error occurred',
      type: 'unknown'
    };
  }

  private static isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
    return (error as AxiosError)?.isAxiosError === true;
  }

  private static handleAxiosError(error: AxiosError<ApiErrorResponse>): FormattedError {
    const response = error.response;
    const data = response?.data;

    // Network errors (no response)
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        return {
          message: 'Request timeout. Please check your connection and try again.',
          type: 'network'
        };
      }
      return {
        message: 'Network error. Please check your connection and try again.',
        type: 'network'
      };
    }

    // Handle different HTTP status codes
    switch (response.status) {
      case 400:
        return this.handleValidationError(data);
      
      case 401:
        return {
          message: data?.error || 'Authentication required. Please log in again.',
          type: 'authentication'
        };
      
      case 403:
        return {
          message: data?.error || 'You do not have permission to perform this action.',
          type: 'authorization'
        };
      
      case 404:
        return {
          message: data?.error || 'The requested resource was not found.',
          type: 'server'
        };
      
      case 409:
        return {
          message: data?.error || 'A conflict occurred with the current state.',
          field: data?.field,
          type: 'validation'
        };
      
      case 422:
        return this.handleValidationError(data);
      
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          type: 'server'
        };
      
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Server error. Please try again later.',
          type: 'server'
        };
      
      default:
        return {
          message: data?.error || `Request failed with status ${response.status}`,
          type: 'server'
        };
    }
  }

  private static handleValidationError(data?: ApiErrorResponse): FormattedError {
    if (data?.details && Array.isArray(data.details)) {
      return {
        message: 'Please correct the following errors:',
        details: data.details.map(detail => 
          typeof detail === 'string' ? detail : `${detail.field}: ${detail.message}`
        ),
        type: 'validation'
      };
    }

    return {
      message: data?.error || 'Validation failed. Please check your input.',
      field: data?.field,
      type: 'validation'
    };
  }

  static getErrorMessage(error: unknown): string {
    const formatted = this.formatError(error);
    return formatted.message;
  }

  static isNetworkError(error: unknown): boolean {
    const formatted = this.formatError(error);
    return formatted.type === 'network';
  }

  static isAuthenticationError(error: unknown): boolean {
    const formatted = this.formatError(error);
    return formatted.type === 'authentication';
  }

  static isValidationError(error: unknown): boolean {
    const formatted = this.formatError(error);
    return formatted.type === 'validation';
  }

  static logError(error: unknown, context?: string) {
    const formatted = this.formatError(error);
    
    console.error(`[ErrorHandler${context ? ` - ${context}` : ''}]:`, {
      message: formatted.message,
      type: formatted.type,
      field: formatted.field,
      details: formatted.details,
      originalError: error
    });

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: sendToErrorReportingService(formatted, context);
    }
  }
}

// Utility functions for common error handling patterns
export const handleApiError = (error: unknown, context?: string): FormattedError => {
  ErrorHandler.logError(error, context);
  return ErrorHandler.formatError(error);
};

export const getErrorMessage = (error: unknown): string => {
  return ErrorHandler.getErrorMessage(error);
};

export const isNetworkError = (error: unknown): boolean => {
  return ErrorHandler.isNetworkError(error);
};

export const isAuthenticationError = (error: unknown): boolean => {
  return ErrorHandler.isAuthenticationError(error);
};

export const isValidationError = (error: unknown): boolean => {
  return ErrorHandler.isValidationError(error);
};