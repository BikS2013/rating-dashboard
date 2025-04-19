import React from 'react';
import FilterSummary from './FilterSummary';
import RatingBarChart from './RatingBarChart';
import RatingSummary from './RatingSummary';
import DetailedView from './DetailedView';
import { useFilter } from '../../context/FilterContext';
import { useDashboard } from '../../context/DashboardContext';
import { mockRatings } from '../../data/mockData';
import { getFilteredRatings, getCategoryRatings } from '../../utils/filterUtils';

interface DashboardProps {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarCollapsed, sidebarWidth }) => {
  const { filters } = useFilter();
  const { dashboardState } = useDashboard();
  
  // Get filtered ratings based on sidebar filters
  const filteredRatings = getFilteredRatings(mockRatings, filters);
  
  // Get ratings for the selected category (if any)
  const categoryRatings = getCategoryRatings(filteredRatings, dashboardState.selectedCategory);
  
  // Calculate the left margin based on sidebar state
  const leftMargin = sidebarCollapsed ? 48 : sidebarWidth; // 48px when collapsed
  
  return (
    <div 
      className="flex-1 overflow-y-auto transition-all duration-300"
      style={{ marginLeft: `${leftMargin}px` }}
    >
      {/* Filter Summary Bar */}
      <FilterSummary />
      
      {/* Rating Bar Chart */}
      <div className="mx-4 mt-4 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Rating Distribution Over Time</h2>
        <RatingBarChart ratings={filteredRatings} />
      </div>
      
      {/* Rating Summary Area */}
      <RatingSummary filteredRatings={filteredRatings} />
      
      {/* Detailed View (shows only when a category is selected) */}
      {dashboardState.selectedCategory && (
        <div className="mx-4 mt-4 mb-6 bg-white p-4 rounded-lg shadow">
          <DetailedView categoryRatings={categoryRatings} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;