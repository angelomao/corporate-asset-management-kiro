import React from 'react';

type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED' | 'LOST';

interface StatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: AssetStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Available',
        };
      case 'ASSIGNED':
        return {
          color: 'bg-blue-100 text-blue-800',
          label: 'Assigned',
        };
      case 'MAINTENANCE':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Maintenance',
        };
      case 'RETIRED':
        return {
          color: 'bg-gray-100 text-gray-800',
          label: 'Retired',
        };
      case 'LOST':
        return {
          color: 'bg-red-100 text-red-800',
          label: 'Lost',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
};