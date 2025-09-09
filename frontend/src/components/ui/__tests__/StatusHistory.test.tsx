import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusHistory } from '../StatusHistory';
import * as assetService from '../../../services/assetService';

// Mock the asset service
vi.mock('../../../services/assetService');

const mockAssetService = assetService as any;

describe('StatusHistory', () => {
  const mockHistoryData = [
    {
      id: '1',
      oldStatus: 'AVAILABLE',
      newStatus: 'ASSIGNED',
      reason: 'Assigned to user',
      createdAt: '2023-01-01T10:00:00Z',
      changedBy: {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: '2',
      oldStatus: 'ASSIGNED',
      newStatus: 'MAINTENANCE',
      reason: 'Scheduled maintenance',
      createdAt: '2023-01-02T14:30:00Z',
      changedBy: {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockAssetService.getAssetStatusHistory.mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Loading status history...')).toBeInTheDocument();
  });

  it('should render status history data', async () => {
    mockAssetService.getAssetStatusHistory.mockResolvedValue(mockHistoryData);

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Status History - Test Asset')).toBeInTheDocument();
    });

    expect(screen.getByText('AVAILABLE → ASSIGNED')).toBeInTheDocument();
    expect(screen.getByText('ASSIGNED → MAINTENANCE')).toBeInTheDocument();
    expect(screen.getByText('Assigned to user')).toBeInTheDocument();
    expect(screen.getByText('Scheduled maintenance')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should render empty state when no history', async () => {
    mockAssetService.getAssetStatusHistory.mockResolvedValue([]);

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No status history available')).toBeInTheDocument();
    });
  });

  it('should render error state when fetch fails', async () => {
    mockAssetService.getAssetStatusHistory.mockRejectedValue(
      new Error('Failed to fetch history')
    );

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load status history')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should retry loading when retry button is clicked', async () => {
    mockAssetService.getAssetStatusHistory
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce(mockHistoryData);

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('AVAILABLE → ASSIGNED')).toBeInTheDocument();
    });

    expect(mockAssetService.getAssetStatusHistory).toHaveBeenCalledTimes(2);
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    mockAssetService.getAssetStatusHistory.mockResolvedValue(mockHistoryData);

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when isOpen is false', () => {
    mockAssetService.getAssetStatusHistory.mockResolvedValue(mockHistoryData);

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(screen.queryByText('Status History - Test Asset')).not.toBeInTheDocument();
  });

  it('should format dates correctly', async () => {
    mockAssetService.getAssetStatusHistory.mockResolvedValue(mockHistoryData);

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      // Check that dates are formatted (exact format may vary based on locale)
      expect(screen.getByText(/Jan.*1.*2023/)).toBeInTheDocument();
      expect(screen.getByText(/Jan.*2.*2023/)).toBeInTheDocument();
    });
  });

  it('should handle missing reason gracefully', async () => {
    const historyWithoutReason = [
      {
        id: '1',
        oldStatus: 'AVAILABLE',
        newStatus: 'ASSIGNED',
        reason: null,
        createdAt: '2023-01-01T10:00:00Z',
        changedBy: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    ];

    mockAssetService.getAssetStatusHistory.mockResolvedValue(historyWithoutReason);

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('AVAILABLE → ASSIGNED')).toBeInTheDocument();
    });

    // Should not crash and should render without reason
    expect(screen.queryByText('null')).not.toBeInTheDocument();
  });

  it('should call API with correct asset ID', async () => {
    mockAssetService.getAssetStatusHistory.mockResolvedValue(mockHistoryData);

    render(
      <StatusHistory
        assetId="test-asset-123"
        assetName="Test Asset"
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(mockAssetService.getAssetStatusHistory).toHaveBeenCalledWith('test-asset-123');
    });
  });

  it('should handle keyboard navigation for close button', () => {
    const mockOnClose = vi.fn();
    mockAssetService.getAssetStatusHistory.mockResolvedValue(mockHistoryData);

    render(
      <StatusHistory
        assetId="asset-1"
        assetName="Test Asset"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.keyDown(closeButton, { key: 'Enter' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});