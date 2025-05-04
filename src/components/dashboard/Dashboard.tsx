import React, { useState, useEffect } from 'react';
import FilterSummary from './FilterSummary';
import RatingBarChart from './RatingBarChart';
import SimpleBarChart from './SimpleBarChart';
import RatingSummary from './RatingSummary';
import DetailedView from './DetailedView';
import { useFilter } from '../../context/FilterContext';
import { useDashboard } from '../../context/DashboardContext';
import { useRatingService } from '../../context/RatingServiceContext';
import { useTheme } from '../../context/ThemeContext';
import { Rating } from '../../models/types';
import { getCategoryRatings } from '../../utils/filterUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

interface DashboardProps {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarCollapsed, sidebarWidth }) => {
  const { theme } = useTheme();
  const { filters } = useFilter();
  const { dashboardState } = useDashboard();
  const ratingService = useRatingService();

  // State for loading indicators and ratings data
  const [isLoading, setIsLoading] = useState(false);
  const [ratingsData, setRatingsData] = useState<Rating[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load ratings when filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data with filters:', JSON.stringify(filters));
        setIsLoading(true);

        // Don't clear previous data immediately - keep showing it while loading
        const ratings = await ratingService.getRatings(filters);

        // Only update if we received data
        if (ratings && ratings.length > 0) {
          console.log(`Loaded ${ratings.length} ratings successfully`);
          setRatingsData(ratings);
        } else {
          console.warn('Received empty ratings array from service');
        }
      } catch (error) {
        console.error('Error loading ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters, ratingService]);

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      console.log('Refreshing data from connector:', ratingService.getBaseUrl());

      // Force refresh the connector data if the method exists
      if (ratingService.forceRefresh) {
        await ratingService.forceRefresh();
        console.log('Forced connector refresh completed');
      }

      // Reload the users first
      const users = await ratingService.getUsers();
      console.log(`Reloaded ${users.length} users`);

      // Then reload the ratings data
      const ratings = await ratingService.getRatings(filters);
      console.log(`Reloaded ${ratings.length} ratings`);

      // Update state with new data
      if (ratings && ratings.length > 0) {
        setRatingsData(ratings);
        console.log('Updated ratings data in state');
      } else {
        console.warn('Received empty ratings array on refresh');
      }

      // Log connector info
      console.log('Using connector:', ratingService.getBaseUrl());

      // REMOVED: Don't force a page reload as it clears the state
      // This was likely causing the chart to disappear
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get ratings for the selected category (if any)
  const categoryRatings = getCategoryRatings(ratingsData, dashboardState.selectedCategory);

  return (
    <div
      className={`flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
      style={{
        position: 'absolute',
        left: `${sidebarCollapsed ? 48 : sidebarWidth}px`,
        right: 0,
        top: 0,
        bottom: 0,
        transition: 'left 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Fixed Header (A2) */}
      <div
        className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}
        style={{
          position: 'fixed',
          left: `${sidebarCollapsed ? 48 : sidebarWidth}px`,
          right: 0,
          top: '40px', // 40px = h-10 (height of the top nav)
          zIndex: 10,
          transition: 'left 0.3s ease-in-out',
          padding: '0.5rem 1rem' // Reduced vertical padding
        }}
      >
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ratings Dashboard</h1>
          <div className="flex items-center">
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mr-2`}>
              {ratingService.getBaseUrl()}
            </span>
            <button
              className={`px-2 py-1 text-xs ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded flex items-center ${refreshing ? 'opacity-75 cursor-wait' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faArrowsRotate} className="mr-1" size="xs" />
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Summary Bar */}
        <div className="mt-2">
          <FilterSummary />
        </div>
      </div>

      {/* Scrollable Content Area (B) */}
      <div
        className="overflow-y-auto flex-1 p-6"
        style={{
          marginTop: '85px', // Further reduced margin to account for more compact header
          paddingTop: '0.5rem' // Reduced padding
        }}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-blue-500">Loading data...</span>
          </div>
        )}

        {/* Rating Bar Chart */}
        <div className={`mt-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h2 className={`text-lg font-semibold mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FontAwesomeIcon icon={faChartColumn} className="text-blue-500 mr-2" />
            Rating Distribution Over Time
          </h2>
          {/* Use the simplified chart to ensure stability */}
          <SimpleBarChart ratings={ratingsData} />
        </div>

        {/* Rating Summary Area */}
        <RatingSummary filteredRatings={ratingsData} />

        {/* Detailed View (shows only when a category is selected) */}
        {dashboardState.selectedCategory && (
          <div className={`mt-3 mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow`}>
            <DetailedView categoryRatings={categoryRatings} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;