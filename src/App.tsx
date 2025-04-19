import React from 'react';
import Layout from './components/layout/Layout';
import { FilterProvider } from './context/FilterContext';
import { DashboardProvider } from './context/DashboardContext';
import { RatingServiceProvider } from './context/RatingServiceContext';
import { RatingServiceFactory, ConnectorType } from './api/RatingServiceFactory';

const App: React.FC = () => {
  // Initialize the rating service connector based on environment
  // For development, use the mock connector
  // For production, this would use the REST connector with real API endpoints
  const connector = RatingServiceFactory.createConnector(
    import.meta.env.PROD ? ConnectorType.REST : ConnectorType.MOCK,
    {
      apiUrl: import.meta.env.VITE_API_URL as string || 'https://api.example.com',
      authToken: import.meta.env.VITE_AUTH_TOKEN as string
    }
  );
  
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