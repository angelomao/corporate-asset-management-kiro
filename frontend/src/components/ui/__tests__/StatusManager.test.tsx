import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { StatusManager } from '../StatusManager';

describe('StatusManager', () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render current status badge', () => {
    render(
      <StatusManager
        currentStatus="AVAILABLE"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Change Status')).toBeInTheDocument();
  });

  it('should show edit form when change status is clicked', () => {
    render(
      <StatusManager
        currentStatus="AVAILABLE"
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByText('Change Status'));

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Update Status')).toBeInTheDocument();
  });

  it('should call onStatusChange when status is updated', async () => {
    mockOnStatusChange.mockResolvedValue(undefined);

    render(
      <StatusManager
        currentStatus="AVAILABLE"
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByText('Change Status'));
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'MAINTENANCE' } });

    const reasonInput = screen.getByPlaceholderText('Reason for status change (optional)');
    fireEvent.change(reasonInput, { target: { value: 'Scheduled maintenance' } });

    fireEvent.click(screen.getByText('Update Status'));

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith('MAINTENANCE', 'Scheduled maintenance');
    });
  });

  it('should not show change status button when disabled', () => {
    render(
      <StatusManager
        currentStatus="AVAILABLE"
        onStatusChange={mockOnStatusChange}
        disabled={true}
      />
    );

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.queryByText('Change Status')).not.toBeInTheDocument();
  });

  it('should cancel editing when cancel is clicked', () => {
    render(
      <StatusManager
        currentStatus="AVAILABLE"
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByText('Change Status'));
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('Change Status')).toBeInTheDocument();
  });
});