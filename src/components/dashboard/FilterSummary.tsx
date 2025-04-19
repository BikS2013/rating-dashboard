import React from 'react';
import { useFilter } from '../../context/FilterContext';
import { mockUsers, timePeriodOptions, ratingCategories } from '../../data/mockData';

const FilterSummary: React.FC = () => {
  const { filters } = useFilter();
  
  // Get selected users
  const selectedUserNames = filters.selectedUsers.length === mockUsers.length
    ? ['All Users']
    : mockUsers
        .filter(user => filters.selectedUsers.includes(user.id))
        .map(user => user.name);
  
  // Get selected time period
  const selectedTimePeriod = timePeriodOptions.find(tp => tp.id === filters.selectedTimePeriod)?.name || 'Custom';
  
  // Get selected rating categories
  const selectedCategories = filters.selectedRatingCategories.includes('all')
    ? ['All Categories']
    : filters.selectedRatingCategories.map(catId => {
        const category = ratingCategories.find(cat => cat.id === catId);
        return category ? category.name : '';
      }).filter(Boolean);
  
  return (
    <div className="bg-gray-100 p-4 border-b border-gray-200">
      <h1 className="text-xl font-bold mb-2">Chatbot Rating Dashboard</h1>
      
      <div className="flex flex-wrap gap-4">
        <div>
          <span className="font-medium">Users:</span>{' '}
          {selectedUserNames.length > 0
            ? selectedUserNames.length > 3
              ? `${selectedUserNames.slice(0, 3).join(', ')} +${selectedUserNames.length - 3} more`
              : selectedUserNames.join(', ')
            : 'None selected'}
        </div>
        
        <div>
          <span className="font-medium">Period:</span>{' '}
          {selectedTimePeriod === 'Custom'
            ? `${filters.fromDate} to ${filters.toDate}`
            : selectedTimePeriod}
        </div>
        
        <div>
          <span className="font-medium">Categories:</span>{' '}
          {selectedCategories.length > 0
            ? selectedCategories.length > 2
              ? `${selectedCategories.slice(0, 2).join(', ')} +${selectedCategories.length - 2} more`
              : selectedCategories.join(', ')
            : 'None selected'}
        </div>
      </div>
    </div>
  );
};

export default FilterSummary;