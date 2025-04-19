import React, { createContext, useContext, ReactNode } from 'react';
import { RatingServiceConnector } from '../api/RatingServiceConnector';
import { RatingServiceFactory } from '../api/RatingServiceFactory';

// Create a context for the rating service
const RatingServiceContext = createContext<RatingServiceConnector | undefined>(undefined);

interface RatingServiceProviderProps {
  children: ReactNode;
  connector?: RatingServiceConnector;
}

/**
 * Provider component that makes the rating service available to all child components
 */
export const RatingServiceProvider: React.FC<RatingServiceProviderProps> = ({ 
  children,
  connector
}) => {
  // Use provided connector or get the default one
  const serviceConnector = connector || RatingServiceFactory.getDefaultConnector();
  
  return (
    <RatingServiceContext.Provider value={serviceConnector}>
      {children}
    </RatingServiceContext.Provider>
  );
};

/**
 * Hook to access the rating service
 * 
 * @returns The rating service connector instance
 */
export const useRatingService = (): RatingServiceConnector => {
  const context = useContext(RatingServiceContext);
  
  if (context === undefined) {
    throw new Error('useRatingService must be used within a RatingServiceProvider');
  }
  
  return context;
};