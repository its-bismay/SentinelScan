import React from 'react';
import { useAuthStore } from '../../store/authStore';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { Shield, LogOut, Menu, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-content/10 sticky top-0 z-30 px-4">
      <div className="flex-1 flex gap-2 items-center">
        {isAuthenticated && (
          <button 
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-circle lg:hidden"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 font-display text-xl font-bold tracking-wider text-primary">
          <Shield className="h-6 w-6 text-primary fill-primary/20" />
          <span>Sentinel<span className="text-base-content">Scan</span></span>
        </Link>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <ThemeSwitcher />
        
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar bg-base-200">
              <div className="w-10 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <User className="h-5 w-5 m-auto mt-2 text-primary" />
                )}
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52 border border-base-content/10">
              <li className="px-4 py-2 border-b border-base-content/5">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-base-content/60 truncate">{user?.email}</p>
              </li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/history">Scan History</Link></li>
              <li><Link to="/analytics">Analytics</Link></li>
              <li><Link to="/assistant">AI Assistant</Link></li>
              <li>
                <button onClick={handleLogout} className="text-error flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
