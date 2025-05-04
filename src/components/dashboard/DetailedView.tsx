import React from 'react';
import { Rating } from '../../models/types';
import { useDashboard } from '../../context/DashboardContext';
import { useTheme } from '../../context/ThemeContext';
import DetailedRatings from './DetailedRatings';
import UserDistribution from './UserDistribution';
import { ListFilter, Users } from 'lucide-react';

interface DetailedViewProps {
  categoryRatings: Rating[];
}

const DetailedView: React.FC<DetailedViewProps> = ({ categoryRatings }) => {
  const { theme } = useTheme();
  const { dashboardState, setActiveTab } = useDashboard();

  return (
    <div>
      <h2 className={`text-lg font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <ListFilter size={20} className="text-blue-500 mr-2" />
        Detailed Analysis
      </h2>

      {/* Tab Navigation */}
      <div className={`flex ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} border-b mb-4`}>
        <button
          className={`px-4 py-2 flex items-center ${
            dashboardState.activeTab === 'details'
              ? theme === 'dark'
                ? 'border-b-2 border-blue-500 font-medium text-blue-300'
                : 'border-b-2 border-blue-500 font-medium text-blue-600'
              : theme === 'dark'
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('details')}
        >
          <ListFilter size={16} className="mr-1" />
          Detailed Ratings
        </button>
        <button
          className={`px-4 py-2 flex items-center ${
            dashboardState.activeTab === 'distribution'
              ? theme === 'dark'
                ? 'border-b-2 border-blue-500 font-medium text-blue-300'
                : 'border-b-2 border-blue-500 font-medium text-blue-600'
              : theme === 'dark'
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('distribution')}
        >
          <Users size={16} className="mr-1" />
          User Distribution
        </button>
      </div>

      {/* Tab Content */}
      <div>
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