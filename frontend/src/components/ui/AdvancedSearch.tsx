import React, { useState, useEffect } from 'react';
import { Input, Select, Button } from './index';
import { AssetCategory, AssetStatus } from '../../types/asset';
import { UserWithAssetCount } from '../../services/userService';

interface AdvancedSearchProps {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: string;
  assigneeFilter: string;
  vendorFilter: string;
  locationFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onClearFilters: () => void;
  users?: UserWithAssetCount[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'OTHER', label: 'Other' },
];

const ASSET_STATUSES: { value: AssetStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'LOST', label: 'Lost' },
];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  searchTerm,
  categoryFilter,
  statusFilter,
  assigneeFilter,
  vendorFilter,
  locationFilter,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onAssigneeChange,
  onVendorChange,
  onLocationChange,
  onClearFilters,
  users = [],
  isExpanded,
  onToggleExpanded,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Update local search term when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange(value);
  };

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    searchTerm || 
    categoryFilter || 
    statusFilter || 
    assigneeFilter || 
    vendorFilter || 
    locationFilter
  );

  return (
    <div className="space-y-4">
      {/* Basic Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search assets by name, description, serial number..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        
        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[
            { value: '', label: 'All Categories' },
            ...ASSET_CATEGORIES
          ]}
        />
        
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            ...ASSET_STATUSES
          ]}
        />
        
        <div className="flex space-x-2">
          <Button
            onClick={onToggleExpanded}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
          >
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              className="bg-red-100 text-red-700 hover:bg-red-200"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <Select
            label="Assigned To"
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
            options={[
              { value: '', label: 'All Users' },
              { value: 'unassigned', label: 'Unassigned' },
              ...users.map(user => ({
                value: user.id,
                label: `${user.name} (${user.email})`
              }))
            ]}
          />
          
          <Input
            label="Vendor"
            placeholder="Filter by vendor..."
            value={vendorFilter}
            onChange={(e) => onVendorChange(e.target.value)}
          />
          
          <Input
            label="Location"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
            </span>
          )}
          {categoryFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Category: {ASSET_CATEGORIES.find(c => c.value === categoryFilter)?.label}
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Status: {ASSET_STATUSES.find(s => s.value === statusFilter)?.label}
            </span>
          )}
          {assigneeFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Assignee: {assigneeFilter === 'unassigned' ? 'Unassigned' : users.find(u => u.id === assigneeFilter)?.name}
            </span>
          )}
          {vendorFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Vendor: "{vendorFilter}"
            </span>
          )}
          {locationFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
              Location: "{locationFilter}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};