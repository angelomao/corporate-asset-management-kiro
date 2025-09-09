import React, { useState } from 'react';
import { Button, Select, Input } from './index';
import { AssetStatus } from '../../types/asset';

interface StatusManagerProps {
  currentStatus: AssetStatus;
  onStatusChange: (status: AssetStatus, reason?: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const ASSET_STATUSES: { value: AssetStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'LOST', label: 'Lost' },
];

const STATUS_COLORS: Record<AssetStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  RETIRED: 'bg-gray-100 text-gray-800',
  LOST: 'bg-red-100 text-red-800',
};

export const StatusManager: React.FC<StatusManagerProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus>(currentStatus);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartEdit = () => {
    setIsEditing(true);
    setSelectedStatus(currentStatus);
    setReason('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedStatus(currentStatus);
    setReason('');
  };

  const handleSubmit = async () => {
    if (selectedStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await onStatusChange(selectedStatus, reason || undefined);
      setIsEditing(false);
      setReason('');
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidTransitions = (status: AssetStatus): AssetStatus[] => {
    const transitions: Record<AssetStatus, AssetStatus[]> = {
      AVAILABLE: ['ASSIGNED', 'MAINTENANCE', 'RETIRED', 'LOST'],
      ASSIGNED: ['AVAILABLE', 'MAINTENANCE', 'RETIRED', 'LOST'],
      MAINTENANCE: ['AVAILABLE', 'RETIRED', 'LOST'],
      RETIRED: ['AVAILABLE'],
      LOST: ['AVAILABLE'],
    };
    return transitions[status] || [];
  };

  const validStatuses = [currentStatus, ...getValidTransitions(currentStatus)];
  const availableStatuses = ASSET_STATUSES.filter(s => validStatuses.includes(s.value));

  if (!isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[currentStatus]}`}>
          {ASSET_STATUSES.find(s => s.value === currentStatus)?.label}
        </span>
        {!disabled && (
          <Button
            onClick={handleStartEdit}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1"
          >
            Change Status
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 p-3 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
      <div className="flex items-center space-x-2">
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as AssetStatus)}
          options={availableStatuses}
          className="text-sm"
          disabled={isSubmitting}
        />
      </div>
      
      {selectedStatus !== currentStatus && (
        <Input
          placeholder="Reason for status change (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="text-sm"
          disabled={isSubmitting}
        />
      )}
      
      <div className="flex justify-end space-x-2">
        <Button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="text-xs bg-gray-300 text-gray-700 hover:bg-gray-400 px-2 py-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedStatus === currentStatus}
          className="text-xs px-2 py-1"
        >
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </div>
  );
};