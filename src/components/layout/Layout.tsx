import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';

const Layout: React.FC = () => {
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        width={sidebarWidth}
        onResize={handleSidebarResize}
        minWidth={minWidth}
        maxWidth={maxWidth}
      />
      <Dashboard sidebarCollapsed={sidebarCollapsed} sidebarWidth={sidebarWidth} />
    </div>
  );
};

export default Layout;