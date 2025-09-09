import axios, { AxiosError, AxiosResponse } from 'axios';
import { authUtils } from '../utils/auth';
import { ErrorHandler } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle request errors
api.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token && authUtils.isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    ErrorHandler.logError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Log error details
    ErrorHandler.logError(error, 'API Response');
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token is invalid or expired
      authUtils.clearAuth();
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      // Network error or timeout
      const networkError = new Error('Network error. Please check your connection and try again.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

// Utility function for making API calls with enhanced error handling
export const apiCall = async <T>(
  apiFunction: () => Promise<AxiosResponse<T>>,
  context?: string
): Promise<T> => {
  try {
    const response = await apiFunction();
    return response.data;
  } catch (error) {
    ErrorHandler.logError(error, context);
    throw error;
  }
};

// Retry utility for failed requests
export const retryApiCall = async <T>(
  apiFunction: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication/authorization errors
      if (ErrorHandler.isAuthenticationError(error)) {
        throw error;
      }
      
      // Don't retry on validation errors
      if (ErrorHandler.isValidationError(error)) {
        throw error;
      }
      
      // Only retry on network errors or server errors
      if (attempt < maxRetries && ErrorHandler.isNetworkError(error)) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

export default api;