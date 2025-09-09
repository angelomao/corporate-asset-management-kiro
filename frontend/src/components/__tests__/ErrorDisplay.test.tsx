
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorDisplay, FieldError, LoadingError } from '../ui/ErrorDisplay';
import { FormattedError } from '../../utils/errorHandler';

describe('ErrorDisplay', () => {
  it('renders string error message', () => {
    render(<ErrorDisplay error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders formatted error with details', () => {
    const error: FormattedError = {
      message: 'Validation failed',
      type: 'validation',
      details: ['Field 1 is required', 'Field 2 is invalid']
    };

    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('Field 1 is required')).toBeInTheDocument();
    expect(screen.getByText('Field 2 is invalid')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const mockRetry = vi.fn();
    render(<ErrorDisplay error="Test error" onRetry={mockRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('shows dismiss button when onDismiss is provided', () => {
    const mockDismiss = vi.fn();
    render(<ErrorDisplay error="Test error" onDismiss={mockDismiss} />);
    
    const dismissButton = screen.getByText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling for different error types', () => {
    const validationError: FormattedError = {
      message: 'Validation error',
      type: 'validation'
    };

    const { rerender } = render(<ErrorDisplay error={validationError} />);
    const errorContainer = screen.getByText('Validation error').closest('.rounded-md');
    expect(errorContainer).toHaveClass('bg-yellow-50');

    const networkError: FormattedError = {
      message: 'Network error',
      type: 'network'
    };

    rerender(<ErrorDisplay error={networkError} />);
    const networkContainer = screen.getByText('Network error').closest('.rounded-md');
    expect(networkContainer).toHaveClass('bg-blue-50');
  });

  it('does not render when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('FieldError', () => {
  it('renders field error message', () => {
    render(<FieldError error="Field is required" />);
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('does not render when error is undefined', () => {
    const { container } = render(<FieldError error={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies correct styling', () => {
    render(<FieldError error="Test error" />);
    const errorElement = screen.getByText('Test error');
    expect(errorElement).toHaveClass('text-red-600');
  });
});

describe('LoadingError', () => {
  it('renders loading error with retry button', () => {
    const mockRetry = vi.fn();
    render(<LoadingError error="Loading failed" onRetry={mockRetry} />);
    
    expect(screen.getByText('Loading failed')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});