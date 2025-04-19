import React from 'react';
import { Rating } from '../../models/types';
import { getSummaryData } from '../../utils/filterUtils';
import { useDashboard } from '../../context/DashboardContext';

interface RatingSummaryProps {
  filteredRatings: Rating[];
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ filteredRatings }) => {
  const { dashboardState, setSelectedCategory } = useDashboard();
  
  // Get summary data for categories
  const summaryData = getSummaryData(filteredRatings);
  
  // Category display names
  const categoryNames: Record<string, string> = {
    'positive': 'Positive',
    'negative': 'Negative',
    'neutral': 'Neutral',
    'heavily-positive': 'Heavily Positive',
    'heavily-negative': 'Heavily Negative',
  };
  
  // Category colors
  const categoryColors: Record<string, string> = {
    'positive': 'bg-green-100 border-green-500 text-green-700',
    'negative': 'bg-red-100 border-red-500 text-red-700',
    'neutral': 'bg-gray-100 border-gray-500 text-gray-700',
    'heavily-positive': 'bg-green-200 border-green-600 text-green-800',
    'heavily-negative': 'bg-red-200 border-red-600 text-red-800',
  };
  
  return (
    <div className="mx-4 mt-4">
      <h2 className="text-lg font-semibold mb-2">Rating Summary</h2>
      
      {Object.keys(summaryData).length > 0 ? (
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {Object.entries(summaryData).map(([category, count]) => (
            <button
              key={category}
              className={`p-4 rounded-lg border-l-4 min-w-32 text-center cursor-pointer transition-all ${
                dashboardState.selectedCategory === category
                  ? `bg-gray-200 border-blue-500 font-medium`
                  : `${categoryColors[category]} hover:bg-opacity-80`
              }`}
              onClick={() => {
                if (dashboardState.selectedCategory === category) {
                  setSelectedCategory(null);
                } else {
                  setSelectedCategory(category);
                }
              }}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="mt-1">{categoryNames[category]}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
          No ratings found for the selected filters
        </div>
      )}
    </div>
  );
};

export default RatingSummary;