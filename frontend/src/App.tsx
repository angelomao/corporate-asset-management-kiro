import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Login, ProtectedRoute, Layout } from './components';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AssetList = lazy(() => import('./pages/AssetList'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const UserList = lazy(() => import('./pages/UserList'));
const QRCodeGenerator = lazy(() => import('./pages/QRCodeGenerator'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes with layout */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Dashboard />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="assets" element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AssetList />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="profile" element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner />}>
                        <UserProfile />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route 
                    path="users" 
                    element={
                      <ProtectedRoute requiredRole="MANAGER">
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner />}>
                            <UserList />
                          </Suspense>
                        </ErrorBoundary>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="qr-generator" 
                    element={
                      <ProtectedRoute requiredRole="MANAGER">
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner />}>
                            <QRCodeGenerator />
                          </Suspense>
                        </ErrorBoundary>
                      </ProtectedRoute>
                    } 
                  />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;