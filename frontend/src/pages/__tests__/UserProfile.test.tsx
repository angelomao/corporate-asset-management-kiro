import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserProfile } from '../UserProfile';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { UserProfile as UserProfileType } from '../../types/auth';

// Mock the auth context
vi.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as any;

// Mock the user service
vi.mock('../../services/userService');
const mockUserService = userService as any;

// Mock the UI components
vi.mock('../../components/ui', () => ({
  Card: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3>{title}</h3>
      {children}
    </div>
  ),
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

const mockUser = {
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  role: 'USER' as const,
};

const mockUserProfile: UserProfileType = {
  ...mockUser,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  assignedAssets: [
    {
      id: '1',
      name: 'MacBook Pro',
      category: 'HARDWARE',
      description: 'Development laptop',
      status: 'ASSIGNED',
      serialNumber: 'MBP123456',
    },
    {
      id: '2',
      name: 'Office Chair',
      category: 'FURNITURE',
      description: 'Ergonomic office chair',
      status: 'ASSIGNED',
    },
  ],
};

describe('UserProfile', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    mockUserService.getCurrentUserProfile.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<UserProfile />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('displays user information and assigned assets', async () => {
    mockUserService.getCurrentUserProfile.mockResolvedValue(mockUserProfile);

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByText('Office Chair')).toBeInTheDocument();
    expect(screen.getByText('Development laptop')).toBeInTheDocument();
    expect(screen.getByText('Ergonomic office chair')).toBeInTheDocument();
    expect(screen.getByText('Serial: MBP123456')).toBeInTheDocument();
  });

  it('displays empty state when no assets are assigned', async () => {
    const userProfileWithoutAssets: UserProfileType = {
      ...mockUserProfile,
      assignedAssets: [],
    };

    mockUserService.getCurrentUserProfile.mockResolvedValue(userProfileWithoutAssets);

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('No assets assigned to you')).toBeInTheDocument();
    });

    expect(screen.getByText('Contact your manager if you need access to company assets')).toBeInTheDocument();
  });

  it('displays error state when profile fetch fails', async () => {
    mockUserService.getCurrentUserProfile.mockRejectedValue(new Error('Network error'));

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load user profile')).toBeInTheDocument();
    });
  });

  it('displays category labels correctly', async () => {
    mockUserService.getCurrentUserProfile.mockResolvedValue(mockUserProfile);

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Hardware')).toBeInTheDocument();
    });

    expect(screen.getByText('Furniture')).toBeInTheDocument();
  });

  it('displays status badges for assets', async () => {
    mockUserService.getCurrentUserProfile.mockResolvedValue(mockUserProfile);

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getAllByTestId('status-badge')).toHaveLength(2);
    });
  });

  it('falls back to auth context user data if profile is not loaded', async () => {
    mockUserService.getCurrentUserProfile.mockResolvedValue({
      ...mockUserProfile,
      name: '',
      email: '',
      role: 'USER',
    });

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });
});