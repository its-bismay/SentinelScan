import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuthStore } from '../../store/authStore';
import { useLocation } from 'react-router-dom';

// Pages where we show the public footer
const PUBLIC_ROUTES = ['/', '/about', '/login', '/register'];

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { pathname } = useLocation();

  const showFooter = PUBLIC_ROUTES.includes(pathname) || !isAuthenticated;

  return (
    <div className="flex flex-col min-h-screen bg-base-300">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 relative">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-hidden">
          {children}
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
};

export default AppLayout;
