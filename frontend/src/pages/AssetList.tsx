import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Input, Select, StatusBadge, StatusManager, StatusHistory, ErrorDisplay, FieldError, AdvancedSearch, Pagination } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { assetService } from '../services/assetService';
import { userService, UserWithAssetCount } from '../services/userService';
import { Asset, AssetCategory, AssetStatus } from '../types/asset';
import { handleApiError, FormattedError } from '../utils/errorHandler';
import { createAssetSchema, validateForm, sanitizeFormData } from '../utils/validation';
import { useDebounce } from '../hooks/useDebounce';
import { useUrlState } from '../hooks/useUrlState';
import { highlightSearchTerm } from '../utils/searchHighlight';

interface AssetFormData {
  name: string;
  description: string;
  serialNumber: string;
  category: AssetCategory;
  purchaseDate: string;
  purchasePrice: string;
  vendor: string;
  location: string;
}

const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'OTHER', label: 'Other' },
];



export const AssetList: React.FC = () => {
  const { user } = useAuth();
  const { updateParams, clearParams, getParam } = useUrlState();
  
  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<UserWithAssetCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FormattedError | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  // Search and filter state from URL
  const [searchTerm, setSearchTerm] = useState(getParam('search'));
  const [categoryFilter, setCategoryFilter] = useState(getParam('category'));
  const [statusFilter, setStatusFilter] = useState(getParam('status'));
  const [assigneeFilter, setAssigneeFilter] = useState(getParam('assignee'));
  const [vendorFilter, setVendorFilter] = useState(getParam('vendor'));
  const [locationFilter, setLocationFilter] = useState(getParam('location'));
  const [currentPage, setCurrentPage] = useState(parseInt(getParam('page', '1')));
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] = useState(
    Boolean(getParam('assignee') || getParam('vendor') || getParam('location'))
  );
  
  // Form state
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    description: '',
    serialNumber: '',
    category: 'HARDWARE',
    purchaseDate: '',
    purchasePrice: '',
    vendor: '',
    location: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusHistoryAsset, setStatusHistoryAsset] = useState<{ id: string; name: string } | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);

  // Debounced search terms for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedVendorFilter = useDebounce(vendorFilter, 300);
  const debouncedLocationFilter = useDebounce(locationFilter, 300);

  const canManageAssets = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Load assets and users
  useEffect(() => {
    loadUsers();
  }, [canManageAssets]);

  useEffect(() => {
    loadAssets();
  }, [
    debouncedSearchTerm,
    categoryFilter,
    statusFilter,
    assigneeFilter,
    debouncedVendorFilter,
    debouncedLocationFilter,
    currentPage,
  ]);

  // Update URL when filters change
  useEffect(() => {
    updateParams({
      search: debouncedSearchTerm || null,
      category: categoryFilter || null,
      status: statusFilter || null,
      assignee: assigneeFilter || null,
      vendor: debouncedVendorFilter || null,
      location: debouncedLocationFilter || null,
      page: currentPage > 1 ? currentPage.toString() : null,
    });
  }, [
    debouncedSearchTerm,
    categoryFilter,
    statusFilter,
    assigneeFilter,
    debouncedVendorFilter,
    debouncedLocationFilter,
    currentPage,
    updateParams,
  ]);

  const loadUsers = async () => {
    if (!canManageAssets) return;
    
    try {
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
      };

      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (assigneeFilter && assigneeFilter !== 'unassigned') params.assignee = assigneeFilter;
      if (debouncedVendorFilter) params.vendor = debouncedVendorFilter;
      if (debouncedLocationFilter) params.location = debouncedLocationFilter;

      const response = await assetService.getAssets(params);
      setAssets(response.assets);
      setPagination(response.pagination);
    } catch (err) {
      const formattedError = handleApiError(err, 'Load Assets');
      setError(formattedError);
    } finally {
      setLoading(false);
    }
  };

  // Filter assets for unassigned filter (client-side filtering for this special case)
  const displayAssets = useMemo(() => {
    if (assigneeFilter === 'unassigned') {
      return assets.filter(asset => !asset.assigneeId);
    }
    return assets;
  }, [assets, assigneeFilter]);

  // Search and filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleAssigneeChange = useCallback((value: string) => {
    setAssigneeFilter(value);
    setCurrentPage(1);
  }, []);

  const handleVendorChange = useCallback((value: string) => {
    setVendorFilter(value);
    setCurrentPage(1);
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setLocationFilter(value);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setAssigneeFilter('');
    setVendorFilter('');
    setLocationFilter('');
    setCurrentPage(1);
    clearParams();
  }, [clearParams]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof AssetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Clear all form errors
  const clearFormErrors = () => {
    setFormErrors({});
  };

  // Handle asset creation
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFormErrors();
    
    // Sanitize form data
    const sanitizedData = sanitizeFormData(formData);
    
    // Validate form data
    const validation = validateForm(createAssetSchema, sanitizedData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    // Check for unique serial number
    if (sanitizedData.serialNumber && assets.some(a => a.serialNumber === sanitizedData.serialNumber)) {
      setFormErrors({ serialNumber: 'Serial number must be unique' });
      return;
    }

    try {
      setSubmitting(true);
      
      const assetData = {
        name: sanitizedData.name,
        description: sanitizedData.description || undefined,
        serialNumber: sanitizedData.serialNumber || undefined,
        category: sanitizedData.category,
        purchaseDate: sanitizedData.purchaseDate ? new Date(sanitizedData.purchaseDate).toISOString() : undefined,
        purchasePrice: sanitizedData.purchasePrice ? Number(sanitizedData.purchasePrice) : undefined,
        vendor: sanitizedData.vendor || undefined,
        location: sanitizedData.location || undefined,
      };

      await assetService.createAsset(assetData);
      // Reload assets to get updated pagination
      await loadAssets();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        serialNumber: '',
        category: 'HARDWARE',
        purchaseDate: '',
        purchasePrice: '',
        vendor: '',
        location: '',
      });
      setShowCreateForm(false);
    } catch (err: any) {
      const formattedError = handleApiError(err, 'Create Asset');
      
      // Handle field-specific validation errors
      if (formattedError.type === 'validation' && formattedError.details) {
        const fieldErrors: Record<string, string> = {};
        formattedError.details.forEach(detail => {
          const [field, message] = detail.split(': ');
          if (field) {
            fieldErrors[field] = message || detail;
          }
        });
        setFormErrors(fieldErrors);
      } else {
        setError(formattedError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle asset assignment
  const handleAssignAsset = async (assetId: string, assigneeId: string | null) => {
    try {
      const updatedAsset = await assetService.assignAsset(assetId, assigneeId);
      setAssets(prev => prev.map(asset => 
        asset.id === assetId ? updatedAsset : asset
      ));
    } catch (err) {
      const formattedError = handleApiError(err, 'Assign Asset');
      setError(formattedError);
    }
  };

  // Handle asset status change
  const handleAssetStatusChange = async (assetId: string, status: AssetStatus, reason?: string) => {
    try {
      const updatedAsset = await assetService.updateAssetStatus(assetId, status, reason);
      setAssets(prev => prev.map(asset => 
        asset.id === assetId ? updatedAsset : asset
      ));
    } catch (err) {
      const formattedError = handleApiError(err, 'Update Asset Status');
      setError(formattedError);
      throw err; // Re-throw to let StatusManager handle the error state
    }
  };

  // Handle showing status history
  const handleShowStatusHistory = (asset: Asset) => {
    setStatusHistoryAsset({ id: asset.id, name: asset.name });
  };

  // Handle error retry
  const handleRetry = () => {
    setError(null);
    loadAssets();
  };

  // Handle edit asset
  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description || '',
      serialNumber: asset.serialNumber || '',
      category: asset.category,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      purchasePrice: asset.purchasePrice ? asset.purchasePrice.toString() : '',
      vendor: asset.vendor || '',
      location: asset.location || '',
    });
    setShowCreateForm(true);
  };

  // Handle update asset
  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    
    clearFormErrors();
    
    // Sanitize form data
    const sanitizedData = sanitizeFormData(formData);
    
    // Validate form data
    const validation = validateForm(createAssetSchema, sanitizedData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    // Check for unique serial number (if changed)
    if (sanitizedData.serialNumber && 
        sanitizedData.serialNumber !== editingAsset.serialNumber &&
        assets.some(a => a.id !== editingAsset.id && a.serialNumber === sanitizedData.serialNumber)) {
      setFormErrors({ serialNumber: 'Serial number must be unique' });
      return;
    }

    try {
      setSubmitting(true);
      
      const assetData = {
        name: sanitizedData.name,
        description: sanitizedData.description || undefined,
        serialNumber: sanitizedData.serialNumber || undefined,
        category: sanitizedData.category,
        purchaseDate: sanitizedData.purchaseDate ? new Date(sanitizedData.purchaseDate).toISOString() : undefined,
        purchasePrice: sanitizedData.purchasePrice ? Number(sanitizedData.purchasePrice) : undefined,
        vendor: sanitizedData.vendor || undefined,
        location: sanitizedData.location || undefined,
      };

      const updatedAsset = await assetService.updateAsset(editingAsset.id, assetData);
      
      // Update the asset in the list
      setAssets(prev => prev.map(asset => 
        asset.id === editingAsset.id ? updatedAsset : asset
      ));
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        serialNumber: '',
        category: 'HARDWARE',
        purchaseDate: '',
        purchasePrice: '',
        vendor: '',
        location: '',
      });
      setShowCreateForm(false);
      setEditingAsset(null);
    } catch (err: any) {
      const formattedError = handleApiError(err, 'Update Asset');
      
      // Handle field-specific validation errors
      if (formattedError.type === 'validation' && formattedError.details) {
        const fieldErrors: Record<string, string> = {};
        formattedError.details.forEach(detail => {
          const [field, message] = detail.split(': ');
          if (field) {
            fieldErrors[field] = message || detail;
          }
        });
        setFormErrors(fieldErrors);
      } else {
        setError(formattedError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete asset
  const handleDeleteAsset = async () => {
    if (!deletingAsset) return;
    
    try {
      await assetService.deleteAsset(deletingAsset.id);
      
      // Remove asset from the list
      setAssets(prev => prev.filter(asset => asset.id !== deletingAsset.id));
      
      // Update pagination
      await loadAssets();
      
      setDeletingAsset(null);
    } catch (err) {
      const formattedError = handleApiError(err, 'Delete Asset');
      setError(formattedError);
      setDeletingAsset(null);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingAsset(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      serialNumber: '',
      category: 'HARDWARE',
      purchaseDate: '',
      purchasePrice: '',
      vendor: '',
      location: '',
    });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your organization's assets
            </p>
          </div>
        </div>
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading assets...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's assets
          </p>
        </div>
        {canManageAssets && (
          <Button onClick={() => setShowCreateForm(true)}>
            Add Asset
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <ErrorDisplay 
          error={error}
          onRetry={handleRetry}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Create Asset Form */}
      {showCreateForm && canManageAssets && (
        <Card title={editingAsset ? "Edit Asset" : "Create New Asset"}>
          <form onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter asset name"
                  className={formErrors.name ? 'border-red-300' : ''}
                />
                <FieldError error={formErrors.name} />
              </div>
              
              <Select
                label="Category *"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as AssetCategory)}
                options={ASSET_CATEGORIES}
              />
              
              <div>
                <Input
                  label="Serial Number"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  placeholder="Enter serial number"
                  className={formErrors.serialNumber ? 'border-red-300' : ''}
                />
                <FieldError error={formErrors.serialNumber} />
              </div>
              
              <Input
                label="Vendor"
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="Enter vendor name"
              />
              
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter location"
              />
              
              <Input
                label="Purchase Date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              />
              
              <div>
                <Input
                  label="Purchase Price"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  placeholder="0.00"
                  className={formErrors.purchasePrice ? 'border-red-300' : ''}
                />
                <FieldError error={formErrors.purchasePrice} />
              </div>
            </div>
            
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter asset description"
            />
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={editingAsset ? handleCancelEdit : () => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (editingAsset ? 'Updating...' : 'Creating...') : (editingAsset ? 'Update Asset' : 'Create Asset')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Advanced Search and Filters */}
      <Card>
        <AdvancedSearch
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          assigneeFilter={assigneeFilter}
          vendorFilter={vendorFilter}
          locationFilter={locationFilter}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          onAssigneeChange={handleAssigneeChange}
          onVendorChange={handleVendorChange}
          onLocationChange={handleLocationChange}
          onClearFilters={handleClearFilters}
          users={users}
          isExpanded={isAdvancedSearchExpanded}
          onToggleExpanded={() => setIsAdvancedSearchExpanded(!isAdvancedSearchExpanded)}
        />
        
        <div className="mt-4 text-sm text-gray-500">
          Showing {displayAssets.length} of {pagination.total} assets
        </div>
      </Card>

      {/* Assets List */}
      <Card>
        {displayAssets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || categoryFilter || statusFilter || assigneeFilter || vendorFilter || locationFilter
                ? 'No assets match your search criteria.' 
                : 'No assets found. Create your first asset to get started.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAssets.map((asset) => (
              <div key={asset.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {highlightSearchTerm(asset.name, debouncedSearchTerm)}
                      </h3>
                      {canManageAssets ? (
                        <StatusManager
                          currentStatus={asset.status}
                          onStatusChange={(status, reason) => handleAssetStatusChange(asset.id, status, reason)}
                        />
                      ) : (
                        <StatusBadge status={asset.status} />
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {asset.category}
                      </span>
                      <Button
                        onClick={() => handleShowStatusHistory(asset)}
                        className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1"
                      >
                        History
                      </Button>
                    </div>
                    
                    {asset.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {highlightSearchTerm(asset.description, debouncedSearchTerm)}
                      </p>
                    )}
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      {asset.serialNumber && (
                        <div>
                          <span className="font-medium">Serial:</span>{' '}
                          {highlightSearchTerm(asset.serialNumber, debouncedSearchTerm)}
                        </div>
                      )}
                      {asset.vendor && (
                        <div>
                          <span className="font-medium">Vendor:</span>{' '}
                          {highlightSearchTerm(asset.vendor, debouncedSearchTerm)}
                        </div>
                      )}
                      {asset.location && (
                        <div>
                          <span className="font-medium">Location:</span>{' '}
                          {highlightSearchTerm(asset.location, debouncedSearchTerm)}
                        </div>
                      )}
                      {asset.assignee && (
                        <div>
                          <span className="font-medium">Assigned to:</span>{' '}
                          {highlightSearchTerm(asset.assignee.name, debouncedSearchTerm)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {canManageAssets && (
                    <div className="ml-4 flex-shrink-0">
                      {asset.status === 'AVAILABLE' ? (
                        <Select
                          value=""
                          onChange={(e) => handleAssignAsset(asset.id, e.target.value || null)}
                          options={[
                            { value: '', label: 'Assign to...' },
                            ...users.map(user => ({
                              value: user.id,
                              label: `${user.name} (${user.email})`
                            }))
                          ]}
                          className="text-sm"
                        />
                      ) : asset.status === 'ASSIGNED' && asset.assignee ? (
                        <Button
                          onClick={() => handleAssignAsset(asset.id, null)}
                          className="text-sm bg-orange-100 text-orange-800 hover:bg-orange-200"
                        >
                          Unassign
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
      />

      {/* Status History Modal */}
      <StatusHistory
        assetId={statusHistoryAsset?.id || ''}
        assetName={statusHistoryAsset?.name || ''}
        isOpen={!!statusHistoryAsset}
        onClose={() => setStatusHistoryAsset(null)}
      />
    </div>
  );
};export
 default AssetList;