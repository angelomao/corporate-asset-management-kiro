import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authUtils } from '../auth';
import { User } from '../../types/auth';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('token management', () => {
    it('should store and retrieve token', () => {
      const token = 'test-token';
      authUtils.setToken(token);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('should remove token', () => {
      authUtils.removeToken();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('should get token from localStorage', () => {
      const token = 'test-token';
      localStorageMock.getItem.mockReturnValue(token);
      
      const result = authUtils.getToken();
      
      expect(result).toBe(token);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('user management', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    };

    it('should store and retrieve user', () => {
      authUtils.setUser(mockUser);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_user',
        JSON.stringify(mockUser)
      );
    });

    it('should get user from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      
      const result = authUtils.getUser();
      
      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid user data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const result = authUtils.getUser();
      
      expect(result).toBeNull();
    });
  });

  describe('token validation', () => {
    it('should return false for null token', () => {
      expect(authUtils.isTokenValid(null)).toBe(false);
    });

    it('should return false for invalid token format', () => {
      expect(authUtils.isTokenValid('invalid-token')).toBe(false);
    });

    it('should validate token structure and expiration', () => {
      // Create a mock JWT token with future expiration
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureExp };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;

      expect(authUtils.isTokenValid(mockToken)).toBe(true);
    });

    it('should return false for expired token', () => {
      // Create a mock JWT token with past expiration
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastExp };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;

      expect(authUtils.isTokenValid(mockToken)).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('should clear both token and user', () => {
      authUtils.clearAuth();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });
});