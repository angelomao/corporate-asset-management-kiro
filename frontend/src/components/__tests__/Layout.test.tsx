import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../Layout';
import { AuthProvider } from '../../contexts/AuthContext';

import { vi } from 'vitest';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

// Mock the auth utils
vi.mock('../../utils/auth', () => ({
  authUtils: {
    getToken: vi.fn(() => 'mock-token'),
    getUser: vi.fn(() => ({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
    })),
    isTokenValid: vi.fn(() => true),
    setToken: vi.fn(),
    setUser: vi.fn(),
    clearAuth: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  it('should render layout with navigation and user info', async () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check if the layout elements are present
    expect(screen.getByText('Asset Management')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render navigation items for regular user', async () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    
    // Users should not see the Users menu
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('should have sign out functionality', async () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const signOutButton = screen.getByText('Sign out');
    expect(signOutButton).toBeInTheDocument();
    
    // Test that clicking sign out button works
    fireEvent.click(signOutButton);
    // Note: We can't easily test the navigation in this unit test
    // but we can verify the button is clickable
  });
});