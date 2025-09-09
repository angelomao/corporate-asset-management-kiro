export type AssetCategory = 'HARDWARE' | 'SOFTWARE' | 'FURNITURE' | 'VEHICLE' | 'OTHER';
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED' | 'LOST';

export interface Asset {
  id: string;
  name: string;
  description?: string;
  serialNumber?: string;
  category: AssetCategory;
  status: AssetStatus;
  purchaseDate?: string;
  purchasePrice?: number;
  vendor?: string;
  location?: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
  retired: number;
  lost: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentAssets: Asset[];
}