import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { Dashboard } from '../Dashboard';
import { assetService } from '../../services/assetService';

// Mock the asset service
vi.mock('../../services/assetService');
const mockAssetService = assetService as any;

// Mock the UI components
vi.mock('../../components/ui', () => ({
  Card: ({ children, title, subtitle }: any) => (
    <div data-testid="card">
      {title && <h3>{title}</h3>}
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  ),
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard title and description', () => {
    mockAssetService.getDashboardData.mockResolvedValue({
      stats: {
        total: 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
        retired: 0,
        lost: 0,
      },
      recentAssets: [],
    });

    renderWithQueryClient(<Dashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview of your asset management system')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    mockAssetService.getDashboardData.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithQueryClient(<Dashboard />);

    // Should show loading placeholders
    const loadingElements = screen.getAllByTestId('card');
    expect(loadingElements).toHaveLength(5); // 4 stat cards + 1 recent assets card
  });

  it('should display dashboard statistics when data is loaded', async () => {
    const mockData = {
      stats: {
        total: 25,
        available: 10,
        assigned: 8,
        maintenance: 5,
        retired: 2,
        lost: 0,
      },
      recentAssets: [],
    };

    mockAssetService.getDashboardData.mockResolvedValue(mockData);

    renderWithQueryClient(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Assets')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  it('should display recent assets when available', async () => {
    const mockData = {
      stats: {
        total: 5,
        available: 3,
        assigned: 2,
        maintenance: 0,
        retired: 0,
        lost: 0,
      },
      recentAssets: [
        {
          id: '1',
          name: 'MacBook Pro',
          category: 'HARDWARE' as const,
          status: 'ASSIGNED' as const,
          createdAt: '2025-09-09T12:00:00.000Z',
          createdBy: { id: '1', name: 'John Doe', email: 'john@test.com' },
          assignee: { id: '2', name: 'Jane Smith', email: 'jane@test.com' },
          createdById: '1',
          updatedAt: '2025-09-09T12:00:00.000Z',
        },
        {
          id: '2',
          name: 'Office Chair',
          category: 'FURNITURE' as const,
          status: 'AVAILABLE' as const,
          createdAt: '2025-09-09T11:00:00.000Z',
          createdBy: { id: '1', name: 'John Doe', email: 'john@test.com' },
          createdById: '1',
          updatedAt: '2025-09-09T11:00:00.000Z',
        },
      ],
    };

    mockAssetService.getDashboardData.mockResolvedValue(mockData);

    renderWithQueryClient(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
      expect(screen.getByText('Office Chair')).toBeInTheDocument();
    });

    expect(screen.getByText('HARDWARE • Created by John Doe • Assigned to Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('FURNITURE • Created by John Doe')).toBeInTheDocument();
    expect(screen.getAllByTestId('status-badge')).toHaveLength(2);
  });

  it('should display "no recent assets" message when list is empty', async () => {
    const mockData = {
      stats: {
        total: 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
        retired: 0,
        lost: 0,
      },
      recentAssets: [],
    };

    mockAssetService.getDashboardData.mockResolvedValue(mockData);

    renderWithQueryClient(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No recent assets to display')).toBeInTheDocument();
    });
  });

  it('should display error state when data loading fails', async () => {
    mockAssetService.getDashboardData.mockRejectedValue(new Error('API Error'));

    renderWithQueryClient(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  it('should handle retry when error occurs', async () => {
    mockAssetService.getDashboardData
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({
        stats: {
          total: 5,
          available: 3,
          assigned: 2,
          maintenance: 0,
          retired: 0,
          lost: 0,
        },
        recentAssets: [],
      });

    renderWithQueryClient(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Try again');
    retryButton.click();

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should format dates correctly in recent assets', async () => {
    const mockData = {
      stats: {
        total: 1,
        available: 1,
        assigned: 0,
        maintenance: 0,
        retired: 0,
        lost: 0,
      },
      recentAssets: [
        {
          id: '1',
          name: 'Test Asset',
          category: 'HARDWARE' as const,
          status: 'AVAILABLE' as const,
          createdAt: '2025-09-09T14:30:00.000Z',
          createdBy: { id: '1', name: 'Test User', email: 'test@test.com' },
          createdById: '1',
          updatedAt: '2025-09-09T14:30:00.000Z',
        },
      ],
    };

    mockAssetService.getDashboardData.mockResolvedValue(mockData);

    renderWithQueryClient(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Asset')).toBeInTheDocument();
      // The exact date format will depend on the user's locale, but it should contain the date
      expect(screen.getByText(/Sep 9, 2025/)).toBeInTheDocument();
    });
  });
});