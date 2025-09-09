import api from '../lib/api';
import { Asset, DashboardData } from '../types/asset';

export const assetService = {
  // Get dashboard statistics and recent assets
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get('/api/assets/stats');
    return response.data;
  },

  // Get all assets with optional filtering
  getAssets: async (params?: {
    category?: string;
    status?: string;
    search?: string;
    assignee?: string;
    vendor?: string;
    location?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ assets: Asset[]; pagination: any }> => {
    const response = await api.get('/api/assets', { params });
    return response.data;
  },

  // Create a new asset
  createAsset: async (assetData: Partial<Asset>): Promise<Asset> => {
    const response = await api.post('/api/assets', assetData);
    return response.data;
  },

  // Update an asset
  updateAsset: async (id: string, assetData: Partial<Asset>): Promise<Asset> => {
    const response = await api.put(`/api/assets/${id}`, assetData);
    return response.data;
  },

  // Assign/unassign an asset
  assignAsset: async (id: string, assigneeId: string | null): Promise<Asset> => {
    const response = await api.patch(`/api/assets/${id}/assign`, { assigneeId });
    return response.data;
  },

  // Update asset status
  updateAssetStatus: async (id: string, status: string, reason?: string): Promise<Asset> => {
    const response = await api.patch(`/api/assets/${id}/status`, { status, reason });
    return response.data;
  },

  // Get asset status history
  getAssetStatusHistory: async (id: string): Promise<any[]> => {
    const response = await api.get(`/api/assets/${id}/status-history`);
    return response.data;
  },
};