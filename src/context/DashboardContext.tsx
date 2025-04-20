import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DashboardState } from '../models/types';

interface DashboardContextType {
  dashboardState: DashboardState;
  setSelectedCategory: (category: string | null) => void;
  setActiveTab: (tab: 'details' | 'distribution') => void;
  toggleFeedbackExpansion: (feedbackId: number) => void;
  toggleConversationExpansion: (ratingId: number) => void;
}

const defaultDashboardState: DashboardState = {
  selectedCategory: null,
  activeTab: 'details',
  expandedFeedbacks: {},
  expandedConversations: {},
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

  const toggleFeedbackExpansion = (feedbackId: number) => {
    setDashboardState({
      ...dashboardState,
      expandedFeedbacks: {
        ...dashboardState.expandedFeedbacks,
        [feedbackId]: !dashboardState.expandedFeedbacks[feedbackId],
      },
    });
  };

  const toggleConversationExpansion = (ratingId: number) => {
    setDashboardState({
      ...dashboardState,
      expandedConversations: {
        ...dashboardState.expandedConversations,
        [ratingId]: !dashboardState.expandedConversations[ratingId],
      },
    });
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardState,
        setSelectedCategory,
        setActiveTab,
        toggleFeedbackExpansion,
        toggleConversationExpansion,
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