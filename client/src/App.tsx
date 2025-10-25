import React, { useEffect, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Web3Provider } from '@/config/web3';
import { useAppKitTheme } from '@reown/appkit/react';

// Components
import { GlobalChatbot } from '@/components/chatbot/GlobalChatbot';

// Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Pools } from '@/pages/Pools';
import { Portfolio } from '@/pages/Portfolio';
import { Rewards } from '@/pages/Rewards';
import { Wallet } from '@/pages/Wallet';
import { StrategyAdvisor } from '@/pages/StrategyAdvisor';
import { Settings } from '@/pages/Settings';
import { AMLFraudDetector } from '@/pages/AMLFraudDetector';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Wait for auth initialization before redirecting
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Wait for auth initialization before redirecting
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Inner component to use AppKit hooks
function AppContent() {
  const { initAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { setThemeMode } = useAppKitTheme();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Apply theme to document and AppKit modal
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setThemeMode('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setThemeMode('light');
    }
  }, [theme, setThemeMode]);

  // Memoize toast options to prevent re-creation on every render
  const toastOptions = useMemo(() => ({
    duration: 3000,
    className: 'dark:bg-gray-800 dark:text-gray-100',
    style: {
      background: theme === 'dark' ? '#1f2937' : '#fff',
      color: theme === 'dark' ? '#f3f4f6' : '#333',
      border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: theme === 'dark' ? '#1f2937' : '#fff',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: theme === 'dark' ? '#1f2937' : '#fff',
      },
    },
  }), [theme]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pools"
            element={
              <ProtectedRoute>
                <Pools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <Rewards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strategy-advisor"
            element={
              <ProtectedRoute>
                <StrategyAdvisor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aml-fraud-detector"
            element={
              <ProtectedRoute>
                <AMLFraudDetector />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      {/* Global Chatbot - Available on all pages */}
      <GlobalChatbot />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={toastOptions}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <AppContent />
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;