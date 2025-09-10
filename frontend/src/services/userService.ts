import api from '../lib/api';
import { User, UserProfile } from '../types/auth';

export interface UserWithAssetCount extends User {
  _count: {
    assignedAssets: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  // Get all users (admin/manager only)
  getUsers: async (): Promise<UserWithAssetCount[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get current user profile with assigned assets
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (userData: { name: string; email: string }): Promise<User> => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
};