import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <Dashboard sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
};

export default Layout;