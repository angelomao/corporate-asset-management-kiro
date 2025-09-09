import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, StatusBadge } from '../components/ui';
import { assetService } from '../services/assetService';
import { DashboardData } from '../types/asset';

export const Dashboard: React.FC = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: assetService.getDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your asset management system
          </p>
        </div>
        
        <Card>
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Failed to load dashboard data</div>
            <button
              onClick={() => refetch()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const recentAssets = dashboardData?.recentAssets || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your asset management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-8 mx-auto rounded"></div>
              ) : (
                stats?.total || 0
              )}
            </div>
            <div className="text-sm text-gray-500">Total Assets</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-8 mx-auto rounded"></div>
              ) : (
                stats?.available || 0
              )}
            </div>
            <div className="text-sm text-gray-500">Available</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-8 mx-auto rounded"></div>
              ) : (
                stats?.assigned || 0
              )}
            </div>
            <div className="text-sm text-gray-500">Assigned</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-8 mx-auto rounded"></div>
              ) : (
                stats?.maintenance || 0
              )}
            </div>
            <div className="text-sm text-gray-500">Maintenance</div>
          </div>
        </Card>
      </div>

      <Card title="Recent Assets" subtitle="Latest assets added to the system">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentAssets.length > 0 ? (
          <div className="space-y-4">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{asset.name}</div>
                  <div className="text-sm text-gray-500">
                    {asset.category} • Created by {asset.createdBy.name}
                    {asset.assignee && ` • Assigned to ${asset.assignee.name}`}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(asset.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="ml-4">
                  <StatusBadge status={asset.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent assets to display
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;