import React from 'react';
import Layout from './components/layout/Layout';
import { FilterProvider } from './context/FilterContext';
import { DashboardProvider } from './context/DashboardContext';

const App: React.FC = () => {
  return (
    <FilterProvider>
      <DashboardProvider>
        <Layout />
      </DashboardProvider>
    </FilterProvider>
  );
};

export default App;
