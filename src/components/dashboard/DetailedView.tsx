import React from 'react';
import { Rating } from '../../models/types';
import { useDashboard } from '../../context/DashboardContext';
import DetailedRatings from './DetailedRatings';
import UserDistribution from './UserDistribution';

interface DetailedViewProps {
  categoryRatings: Rating[];
}

const DetailedView: React.FC<DetailedViewProps> = ({ categoryRatings }) => {
  const { dashboardState, setActiveTab } = useDashboard();
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Detailed Analysis</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${
            dashboardState.activeTab === 'details'
              ? 'border-b-2 border-blue-500 font-medium'
              : ''
          }`}
          onClick={() => setActiveTab('details')}
        >
          Detailed Ratings
        </button>
        <button
          className={`px-4 py-2 ${
            dashboardState.activeTab === 'distribution'
              ? 'border-b-2 border-blue-500 font-medium'
              : ''
          }`}
          onClick={() => setActiveTab('distribution')}
        >
          User Distribution
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {dashboardState.activeTab === 'details' ? (
          <DetailedRatings ratings={categoryRatings} />
        ) : (
          <UserDistribution ratings={categoryRatings} />
        )}
      </div>
    </div>
  );
};

export default DetailedView;