import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DashboardState } from '../models/types';

interface DashboardContextType {
  dashboardState: DashboardState;
  setSelectedCategory: (category: string | null) => void;
  setActiveTab: (tab: 'details' | 'distribution') => void;
  toggleMessageExpansion: (messageId: number) => void;
}

const defaultDashboardState: DashboardState = {
  selectedCategory: null,
  activeTab: 'details',
  expandedMessages: {},
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(defaultDashboardState);

  const setSelectedCategory = (category: string | null) => {
    setDashboardState({
      ...dashboardState,
      selectedCategory: category,
    });
  };

  const setActiveTab = (tab: 'details' | 'distribution') => {
    setDashboardState({
      ...dashboardState,
      activeTab: tab,
    });
  };

  const toggleMessageExpansion = (messageId: number) => {
    setDashboardState({
      ...dashboardState,
      expandedMessages: {
        ...dashboardState.expandedMessages,
        [messageId]: !dashboardState.expandedMessages[messageId],
      },
    });
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardState,
        setSelectedCategory,
        setActiveTab,
        toggleMessageExpansion,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};