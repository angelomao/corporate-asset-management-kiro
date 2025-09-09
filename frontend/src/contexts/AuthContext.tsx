import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';
import { authUtils } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authUtils.getToken();
      const storedUser = authUtils.getUser();

      if (storedToken && authUtils.isTokenValid(storedToken) && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        
        // Optionally verify token with server
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          authUtils.setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear auth data
          authUtils.clearAuth();
          setToken(null);
          setUser(null);
        }
      } else {
        // Clear any invalid auth data
        authUtils.clearAuth();
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      
      // Store auth data
      authUtils.setToken(response.token);
      authUtils.setUser(response.user);
      
      // Update state
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      // Clear any existing auth data on login failure
      authUtils.clearAuth();
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = (): void => {
    // Clear auth data
    authUtils.clearAuth();
    
    // Update state
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token && authUtils.isTokenValid(token));

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};