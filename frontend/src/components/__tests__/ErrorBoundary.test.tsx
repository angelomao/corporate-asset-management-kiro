import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary, useErrorHandler } from '../ErrorBoundary';
import React from 'react';

// Mock console.error to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({ 
  shouldThrow = true, 
  message = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that uses the error handler hook
const ComponentWithErrorHandler: React.FC<{ shouldTriggerError?: boolean }> = ({ 
  shouldTriggerError = false 
}) => {
  const handleError = useErrorHandler();
  
  React.useEffect(() => {
    if (shouldTriggerError) {
      handleError(new Error('Hook error'));
    }
  }, [shouldTriggerError, handleError]);

  return <div>Component with error handler</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try refreshing the page.')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = () => <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should log error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.objectContaining({
        message: 'Custom error message'
      }),
      expect.any(Object)
    );
  });

  it('should reset error state when children change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Re-render with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should handle refresh button click', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByText('Refresh Page');
    refreshButton.click();

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('should display error details in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = true;

    render(
      <ErrorBoundary>
        <ThrowError message="Development error" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details:')).toBeInTheDocument();
    expect(screen.getByText('Development error')).toBeInTheDocument();

    // Restore original environment
    (import.meta.env as any).DEV = originalEnv;
  });

  it('should not display error details in production mode', () => {
    // Mock production environment
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = false;

    render(
      <ErrorBoundary>
        <ThrowError message="Production error" />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details:')).not.toBeInTheDocument();
    expect(screen.queryByText('Production error')).not.toBeInTheDocument();

    // Restore original environment
    (import.meta.env as any).DEV = originalEnv;
  });

  it('should handle errors in componentDidUpdate', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();

    // Re-render with throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle multiple consecutive errors', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError message="First error" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Reset and throw another error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    rerender(
      <ErrorBoundary>
        <ThrowError message="Second error" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledTimes(2);
  });
});

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log errors when called', () => {
    render(<ComponentWithErrorHandler shouldTriggerError={true} />);

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by useErrorHandler:',
      expect.objectContaining({
        message: 'Hook error'
      }),
      undefined
    );
  });

  it('should not log errors when not triggered', () => {
    render(<ComponentWithErrorHandler shouldTriggerError={false} />);

    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle errors with error info', () => {
    const TestComponent: React.FC = () => {
      const handleError = useErrorHandler();
      
      React.useEffect(() => {
        const errorInfo = { componentStack: 'test stack' };
        handleError(new Error('Error with info'), errorInfo);
      }, [handleError]);

      return <div>Test</div>;
    };

    render(<TestComponent />);

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by useErrorHandler:',
      expect.objectContaining({
        message: 'Error with info'
      }),
      { componentStack: 'test stack' }
    );
  });
});