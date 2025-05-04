import React from 'react';
import { Rating } from '../../models/types';
import { getSummaryData } from '../../utils/filterUtils';
import { useDashboard } from '../../context/DashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface RatingSummaryProps {
  filteredRatings: Rating[];
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ filteredRatings }) => {
  const { theme } = useTheme();
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

  // Category colors and icons
  const categoryConfig: Record<string, {
    light: string,
    dark: string,
    icon: React.ReactNode
  }> = {
    'positive': {
      light: 'bg-green-100 border-green-500 text-green-700',
      dark: 'bg-green-900 bg-opacity-30 border-green-500 text-green-300',
      icon: <ThumbsUp size={18} className="mb-1" />
    },
    'negative': {
      light: 'bg-red-100 border-red-500 text-red-700',
      dark: 'bg-red-900 bg-opacity-30 border-red-500 text-red-300',
      icon: <ThumbsDown size={18} className="mb-1" />
    },
    'neutral': {
      light: 'bg-gray-100 border-gray-500 text-gray-700',
      dark: 'bg-gray-700 border-gray-500 text-gray-300',
      icon: <Minus size={18} className="mb-1" />
    },
    'heavily-positive': {
      light: 'bg-green-200 border-green-600 text-green-800',
      dark: 'bg-green-900 bg-opacity-50 border-green-600 text-green-200',
      icon: <ThumbsUp size={18} className="mb-1" />
    },
    'heavily-negative': {
      light: 'bg-red-200 border-red-600 text-red-800',
      dark: 'bg-red-900 bg-opacity-50 border-red-600 text-red-200',
      icon: <ThumbsDown size={18} className="mb-1" />
    },
  };

  return (
    <div className={`mt-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow`}>
      <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Rating Summary
      </h2>

      {Object.keys(summaryData).length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Object.entries(summaryData).map(([category, count]) => (
            <button
              key={category}
              className={`p-3 rounded-lg border-l-4 min-w-28 text-center cursor-pointer transition-all ${
                dashboardState.selectedCategory === category
                  ? theme === 'dark'
                    ? `bg-blue-900 bg-opacity-30 border-blue-500 text-blue-200 font-medium`
                    : `bg-blue-100 border-blue-500 text-blue-700 font-medium`
                  : theme === 'dark'
                    ? categoryConfig[category].dark
                    : categoryConfig[category].light
              }`}
              onClick={() => {
                if (dashboardState.selectedCategory === category) {
                  setSelectedCategory(null);
                } else {
                  setSelectedCategory(category);
                }
              }}
            >
              <div className="flex justify-center">
                {categoryConfig[category].icon}
              </div>
              <div className="text-2xl font-bold">{count}</div>
              <div className="mt-1">{categoryNames[category]}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-500'} p-4 rounded-lg text-center`}>
          No ratings found for the selected filters
        </div>
      )}
    </div>
  );
};

export default RatingSummary;