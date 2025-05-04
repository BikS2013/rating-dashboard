import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';
import { useTheme } from '../../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

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
      {/* Top Navigation Bar - Fixed (A1) */}
      <nav className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-900'} text-white flex items-center justify-between h-10 fixed top-0 left-0 right-0 z-30`}>
        <div className="flex items-center">
          <div className="px-4 py-2 font-semibold text-sm">
            Ratings Dashboard
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className={`px-3 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-800'} focus:outline-none`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} size="sm" />
        </button>
      </nav>

      {/* Main Content Area - Adjusted to account for fixed header */}
      <div className="flex-1 flex relative mt-10"> {/* Reduced to mt-10 for smaller header */}
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