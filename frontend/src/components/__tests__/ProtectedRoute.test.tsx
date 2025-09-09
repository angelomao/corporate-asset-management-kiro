import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthContextType } from '../../types/auth';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderProtectedRoute = (children: React.ReactNode, requiredRole?: 'ADMIN' | 'MANAGER' | 'USER') => {
  return render(
    <BrowserRouter>
      <ProtectedRoute requiredRole={requiredRole}>
        {children}
      </ProtectedRoute>
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  const mockAuthContext: AuthContextType = {
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    },
    token: 'valid-token',
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
  };

  it('should show loading spinner when loading', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      isLoading: true,
    });

    renderProtectedRoute(<div>Protected Content</div>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument(); // Loading spinner
  });

  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue(mockAuthContext);

    renderProtectedRoute(<div>Protected Content</div>);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should allow access when user role meets requirement', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      user: { ...mockAuthContext.user!, role: 'MANAGER' },
    });

    renderProtectedRoute(<div>Manager Content</div>, 'USER');
    
    expect(screen.getByText('Manager Content')).toBeInTheDocument();
  });

  it('should deny access when user role is insufficient', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      user: { ...mockAuthContext.user!, role: 'USER' },
    });

    renderProtectedRoute(<div>Admin Content</div>, 'ADMIN');
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access this page.")).toBeInTheDocument();
  });

  it('should allow admin access to all roles', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      user: { ...mockAuthContext.user!, role: 'ADMIN' },
    });

    renderProtectedRoute(<div>Admin Content</div>, 'ADMIN');
    
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});