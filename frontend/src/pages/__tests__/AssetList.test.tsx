import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AssetList } from '../AssetList';
import { Asset, AssetCategory, AssetStatus } from '../../types/asset';
import { User } from '../../types/auth';

// Mock the services
vi.mock('../../services/assetService', () => ({
  assetService: {
    getAssets: vi.fn(),
    createAsset: vi.fn(),
    assignAsset: vi.fn(),
  },
}));

vi.mock('../../services/userService', () => ({
  userService: {
    getUsers: vi.fn(),
  },
}));

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { assetService } from '../../services/assetService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

// Mock data
const mockUser: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'ADMIN'
};

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Laptop Dell XPS',
    description: 'High-performance laptop',
    serialNumber: 'DL123456',
    category: 'HARDWARE' as AssetCategory,
    status: 'AVAILABLE' as AssetStatus,
    purchaseDate: '2024-01-15',
    purchasePrice: 1200,
    vendor: 'Dell',
    location: 'Office A',
    assigneeId: undefined,
    assignee: undefined,
    createdById: '1',
    createdBy: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Office Chair',
    description: 'Ergonomic office chair',
    serialNumber: undefined,
    category: 'FURNITURE' as AssetCategory,
    status: 'ASSIGNED' as AssetStatus,
    purchaseDate: undefined,
    purchasePrice: undefined,
    vendor: undefined,
    location: 'Office B',
    assigneeId: '2',
    assignee: {
      id: '2',
      name: 'John Doe',
      email: 'john@example.com'
    },
    createdById: '1',
    createdBy: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com'
    },
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  }
];

const mockUsers = [
  {
    id: '2',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'USER' as const,
    _count: { assignedAssets: 1 },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  }
];

describe('AssetList', () => {
  const mockUseAuth = useAuth as any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the auth context
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
    });

    // Mock the services
    (assetService.getAssets as any).mockResolvedValue(mockAssets);
    (userService.getUsers as any).mockResolvedValue(mockUsers);
  });

  it('renders loading state initially', async () => {
    (assetService.getAssets as any).mockImplementation(() => new Promise(() => {}));
    
    render(<AssetList />);

    expect(screen.getByText('Loading assets...')).toBeInTheDocument();
  });

  it('renders asset list after loading', async () => {
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
      expect(screen.getByText('Office Chair')).toBeInTheDocument();
    });
  });

  it('shows Add Asset button for admin/manager users', async () => {
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Add Asset')).toBeInTheDocument();
    });
  });

  it('hides Add Asset button for regular users', async () => {
    const regularUser: User = { ...mockUser, role: 'USER' };
    
    mockUseAuth.mockReturnValue({
      user: regularUser,
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
    });
    
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.queryByText('Add Asset')).not.toBeInTheDocument();
    });
  });

  it('filters assets by search term', async () => {
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
      expect(screen.getByText('Office Chair')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search assets...');
    fireEvent.change(searchInput, { target: { value: 'Laptop' } });

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
      expect(screen.queryByText('Office Chair')).not.toBeInTheDocument();
    });
  });

  it('filters assets by category', async () => {
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
      expect(screen.getByText('Office Chair')).toBeInTheDocument();
    });

    // Find the category select by looking for the one with "All Categories" option
    const categorySelects = screen.getAllByRole('combobox');
    const categorySelect = categorySelects.find(select => 
      select.querySelector('option[value=""]')?.textContent === 'All Categories'
    );
    
    if (categorySelect) {
      fireEvent.change(categorySelect, { target: { value: 'HARDWARE' } });

      await waitFor(() => {
        expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
        expect(screen.queryByText('Office Chair')).not.toBeInTheDocument();
      });
    }
  });

  it('filters assets by status', async () => {
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
      expect(screen.getByText('Office Chair')).toBeInTheDocument();
    });

    // Find the status select by looking for the one with "All Statuses" option
    const statusSelects = screen.getAllByRole('combobox');
    const statusSelect = statusSelects.find(select => 
      select.querySelector('option[value=""]')?.textContent === 'All Statuses'
    );
    
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: 'AVAILABLE' } });

      await waitFor(() => {
        expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
        expect(screen.queryByText('Office Chair')).not.toBeInTheDocument();
      });
    }
  });

  it('clears all filters when Clear Filters is clicked', async () => {
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
    });

    // Apply filters
    const searchInput = screen.getByPlaceholderText('Search assets...');
    fireEvent.change(searchInput, { target: { value: 'Laptop' } });

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('opens create asset form when Add Asset is clicked', async () => {
    render(<AssetList />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Asset');
      fireEvent.click(addButton);
    });

    expect(screen.getByText('Create New Asset')).toBeInTheDocument();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
  });

  it('creates new asset when form is submitted', async () => {
    const newAsset: Asset = {
      ...mockAssets[0],
      id: '3',
      name: 'New Laptop',
    };
    (assetService.createAsset as any).mockResolvedValue(newAsset);

    render(<AssetList />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Asset');
      fireEvent.click(addButton);
    });

    const nameInput = screen.getByLabelText('Name *');
    fireEvent.change(nameInput, { target: { value: 'New Laptop' } });

    const submitButton = screen.getByText('Create Asset');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(assetService.createAsset).toHaveBeenCalledWith({
        name: 'New Laptop',
        category: 'HARDWARE',
        description: undefined,
        serialNumber: undefined,
        purchaseDate: undefined,
        purchasePrice: undefined,
        vendor: undefined,
        location: undefined,
      });
    });
  });

  it('shows validation error for empty name', async () => {
    render(<AssetList />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Asset');
      fireEvent.click(addButton);
    });

    const submitButton = screen.getByText('Create Asset');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('assigns asset to user', async () => {
    const updatedAsset = { ...mockAssets[0], status: 'ASSIGNED' as AssetStatus, assigneeId: '2' };
    (assetService.assignAsset as any).mockResolvedValue(updatedAsset);

    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
    });

    // Find the assignment select by looking for one with "Assign to..." option
    const assignSelects = screen.getAllByRole('combobox');
    const assignSelect = assignSelects.find(select => 
      select.querySelector('option[value=""]')?.textContent === 'Assign to...'
    );
    
    if (assignSelect) {
      fireEvent.change(assignSelect, { target: { value: '2' } });

      await waitFor(() => {
        expect(assetService.assignAsset).toHaveBeenCalledWith('1', '2');
      });
    }
  });

  it('unassigns asset from user', async () => {
    const updatedAsset = { ...mockAssets[1], status: 'AVAILABLE' as AssetStatus, assigneeId: null };
    (assetService.assignAsset as any).mockResolvedValue(updatedAsset);

    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Office Chair')).toBeInTheDocument();
    });

    const unassignButton = screen.getByText('Unassign');
    fireEvent.click(unassignButton);

    await waitFor(() => {
      expect(assetService.assignAsset).toHaveBeenCalledWith('2', null);
    });
  });

  it('shows empty state when no assets match filters', async () => {
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search assets...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentAsset' } });

    await waitFor(() => {
      expect(screen.getByText('No assets match your search criteria.')).toBeInTheDocument();
    });
  });

  it('shows error message when loading fails', async () => {
    (assetService.getAssets as any).mockRejectedValue(new Error('Network error'));

    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays asset details correctly', async () => {
    render(<AssetList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop Dell XPS')).toBeInTheDocument();
      expect(screen.getByText('High-performance laptop')).toBeInTheDocument();
      expect(screen.getByText('DL123456')).toBeInTheDocument();
      expect(screen.getByText('Dell')).toBeInTheDocument();
      expect(screen.getByText('Office A')).toBeInTheDocument();
      // Use getAllByText to handle multiple "Hardware" elements
      expect(screen.getAllByText('Hardware').length).toBeGreaterThan(0);
    });
  });
});