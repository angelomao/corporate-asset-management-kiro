import api from '../lib/api';
import { Asset, DashboardData } from '../types/asset';

export const assetService = {
  // Get dashboard statistics and recent assets
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get('/assets/stats');
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
    const response = await api.get('/assets', { params });
    return response.data;
  },

  // Create a new asset
  createAsset: async (assetData: Partial<Asset>): Promise<Asset> => {
    const response = await api.post('/assets', assetData);
    return response.data;
  },

  // Update an asset
  updateAsset: async (id: string, assetData: Partial<Asset>): Promise<Asset> => {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  },

  // Assign/unassign an asset
  assignAsset: async (id: string, assigneeId: string | null): Promise<Asset> => {
    const response = await api.patch(`/assets/${id}/assign`, { assigneeId });
    return response.data;
  },

  // Update asset status
  updateAssetStatus: async (id: string, status: string, reason?: string): Promise<Asset> => {
    const response = await api.patch(`/assets/${id}/status`, { status, reason });
    return response.data;
  },

  // Get asset status history
  getAssetStatusHistory: async (id: string): Promise<any[]> => {
    const response = await api.get(`/assets/${id}/status-history`);
    return response.data;
  },

  // Delete an asset
  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },
};