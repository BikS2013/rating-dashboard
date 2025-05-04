import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default sidebar width (w-64 = 16rem = 256px)
  const minWidth = 256; // Minimum sidebar width
  const maxWidth = 480; // Maximum sidebar width

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSidebarResize = useCallback((width: number) => {
    setSidebarWidth(width);
  }, []);

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Top Navigation Bar */}
      <nav className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-900'} text-white flex items-center justify-between h-12`}>
        <div className="flex items-center">
          <div className="px-6 py-3 font-semibold">
            Ratings Dashboard
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className={`px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-800'} focus:outline-none`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          width={sidebarWidth}
          onResize={handleSidebarResize}
          minWidth={minWidth}
          maxWidth={maxWidth}
        />
        <Dashboard
          sidebarCollapsed={sidebarCollapsed}
          sidebarWidth={sidebarWidth}
        />
      </div>
    </div>
  );
};

export default Layout;