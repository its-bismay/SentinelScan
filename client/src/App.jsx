import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Layout
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ScanHistory from './pages/ScanHistory';
import ScanDetails from './pages/ScanDetails';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirect Authenticated Users (e.g. from login/register back to dashboard)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { checkAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize Theme
    document.documentElement.setAttribute('data-theme', theme);
    // Validate session
    checkAuth();
  }, [theme]);

  return (
    <ErrorBoundary>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />

            {/* Guest Only */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected Scans & Dashboards */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
            <Route path="/scan/:id" element={<ProtectedRoute><ScanDetails /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
        
        {/* Global Toast Alerts */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#242a1f',
              color: '#f0f3ef',
              border: '1px solid rgba(82, 110, 68, 0.25)',
              fontSize: '13px',
              fontFamily: "'Inter', sans-serif",
            },
            success: {
              iconTheme: {
                primary: '#00d897',
                secondary: '#ffffff',
              },
            },
          }} 
        />
      </Router>
    </ErrorBoundary>
  );
};

export default App;