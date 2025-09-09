import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, StatusBadge } from '../components/ui';
import { userService } from '../services/userService';
import { UserProfile as UserProfileType, AssignedAsset } from '../types/auth';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profile = await userService.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const getCategoryLabel = (category: AssignedAsset['category']) => {
    switch (category) {
      case 'HARDWARE':
        return 'Hardware';
      case 'SOFTWARE':
        return 'Software';
      case 'FURNITURE':
        return 'Furniture';
      case 'VEHICLE':
        return 'Vehicle';
      case 'OTHER':
        return 'Other';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your profile information and assigned assets
          </p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your profile information and assigned assets
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your profile information and assigned assets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="User Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{userProfile?.name || user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{userProfile?.email || user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900">{userProfile?.role || user?.role}</p>
            </div>
          </div>
        </Card>

        <Card title="Assigned Assets">
          {userProfile?.assignedAssets && userProfile.assignedAssets.length > 0 ? (
            <div className="space-y-4">
              {userProfile.assignedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    // For now, we'll just log the asset ID since detailed asset view isn't implemented yet
                    // This creates the foundation for linking to detailed asset information
                    console.log('Navigate to asset details:', asset.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{asset.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {getCategoryLabel(asset.category)}
                      </p>
                      {asset.description && (
                        <p className="text-sm text-gray-500 mt-2">{asset.description}</p>
                      )}
                      {asset.serialNumber && (
                        <p className="text-xs text-gray-400 mt-1">
                          Serial: {asset.serialNumber}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <StatusBadge status={asset.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No assets assigned to you</p>
              <p className="text-gray-400 text-xs mt-1">
                Contact your manager if you need access to company assets
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;