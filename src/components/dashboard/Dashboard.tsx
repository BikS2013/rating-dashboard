import React, { useState, useEffect } from 'react';
import FilterSummary from './FilterSummary';
import RatingBarChart from './RatingBarChart';
import RatingSummary from './RatingSummary';
import DetailedView from './DetailedView';
import { useFilter } from '../../context/FilterContext';
import { useDashboard } from '../../context/DashboardContext';
import { useRatingService } from '../../context/RatingServiceContext';
import { Rating } from '../../models/types';
import { getCategoryRatings } from '../../utils/filterUtils';

interface DashboardProps {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarCollapsed, sidebarWidth }) => {
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
        setIsLoading(true);
        const ratings = await ratingService.getRatings(filters);
        setRatingsData(ratings);
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
      // Force refresh the connector data if the method exists
      if (ratingService.forceRefresh) {
        await ratingService.forceRefresh();
      }
      
      // Reload the users first
      await ratingService.getUsers();
      
      // Then reload the ratings data
      const ratings = await ratingService.getRatings(filters);
      setRatingsData(ratings);
      
      // Log connector info
      console.log('Using connector:', ratingService.getBaseUrl());
      
      // Force a page reload to refresh all components
      window.location.reload();
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
      className="flex-1 overflow-y-auto"
      style={{ 
        position: 'absolute',
        left: `${sidebarCollapsed ? 48 : sidebarWidth}px`,
        right: 0,
        top: 0,
        bottom: 0,
        transition: 'left 0.3s ease-in-out'
      }}
    >
      <div className="p-2 h-full">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">Ratings Dashboard</h1>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">
              {ratingService.getBaseUrl()}
            </span>
            <button 
              className={`px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${refreshing ? 'opacity-75 cursor-wait' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>
        
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
        
        {/* Filter Summary Bar */}
        <FilterSummary />
        
        {/* Rating Bar Chart */}
        <div className="mt-3 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Rating Distribution Over Time</h2>
          <RatingBarChart ratings={ratingsData} />
        </div>
        
        {/* Rating Summary Area */}
        <RatingSummary filteredRatings={ratingsData} />
        
        {/* Detailed View (shows only when a category is selected) */}
        {dashboardState.selectedCategory && (
          <div className="mt-3 mb-4 bg-white p-4 rounded-lg shadow">
            <DetailedView categoryRatings={categoryRatings} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;