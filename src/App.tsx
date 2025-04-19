import React from 'react';
import Layout from './components/layout/Layout';
import { FilterProvider } from './context/FilterContext';
import { DashboardProvider } from './context/DashboardContext';
import { RatingServiceProvider } from './context/RatingServiceContext';
import { RatingServiceFactory, ConnectorType } from './api/RatingServiceFactory';

const App: React.FC = () => {
  // Debug environment variables
  console.log('Environment variables:', {
    VITE_JSON_URL: import.meta.env.VITE_JSON_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_AUTH_TOKEN: import.meta.env.VITE_AUTH_TOKEN ? '[REDACTED]' : undefined,
    isProd: import.meta.env.PROD
  });
  
  // Determine connector type based on environment variables
  let connectorType = ConnectorType.MOCK;
  
  if (import.meta.env.VITE_JSON_URL) {
    connectorType = ConnectorType.JSON;
    console.log('Using JSON connector with URL:', import.meta.env.VITE_JSON_URL);
  } else if (import.meta.env.VITE_API_URL && import.meta.env.PROD) {
    connectorType = ConnectorType.REST;
    console.log('Using REST connector with URL:', import.meta.env.VITE_API_URL);
  } else {
    console.log('Using MOCK connector (default)');
  }
  
  // Initialize the rating service connector
  const connector = RatingServiceFactory.createConnector(
    connectorType,
    {
      apiUrl: import.meta.env.VITE_API_URL,
      authToken: import.meta.env.VITE_AUTH_TOKEN,
      jsonUrl: import.meta.env.VITE_JSON_URL
    }
  );
  
  console.log('Connector type:', connector.getBaseUrl());
  
  return (
    <RatingServiceProvider connector={connector}>
      <FilterProvider>
        <DashboardProvider>
          <Layout />
        </DashboardProvider>
      </FilterProvider>
    </RatingServiceProvider>
  );
};

export default App;