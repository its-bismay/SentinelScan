import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3, Bot, ShieldAlert } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:sticky top-16 h-[calc(100vh-4rem)] w-64 bg-base-100 border-r border-base-content/10 z-40 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full justify-between p-4">
          <ul className="menu menu-md w-full p-0 gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink 
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                      ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-base-200'}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="p-4 bg-base-200/50 rounded-xl border border-base-content/5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-display font-semibold text-sm">SentinelGuard</span>
            </div>
            <p className="text-xs text-base-content/60">
              Active security intelligence engine monitoring vulnerability vectors.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
