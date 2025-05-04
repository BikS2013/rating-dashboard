import React, { useState, useEffect } from 'react';
import { useFilter } from '../../context/FilterContext';
import { User } from '../../models/types';
import { timePeriodOptions, ratingCategories } from '../../utils/constants';
import { useRatingService } from '../../context/RatingServiceContext';
import { useTheme } from '../../context/ThemeContext';
import { Users, Calendar, Tag } from 'lucide-react';

const FilterSummary: React.FC = () => {
  const { theme } = useTheme();
  const { filters } = useFilter();
  const ratingService = useRatingService();
  const [users, setUsers] = useState<User[]>([]);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await ratingService.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error loading users for filter summary:', error);
      }
    };

    loadUsers();
  }, [ratingService]);

  // Get selected users
  const selectedUserNames = filters.selectedUsers.length === users.length && users.length > 0
    ? ['All Users']
    : users
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
    <div className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} py-3 px-4 rounded-lg shadow-sm mb-4`}>
      <h2 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Active Filters</h2>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          <Users size={16} className="mr-1 text-blue-500" />
          <span className="font-medium mr-1">Users:</span>
          {selectedUserNames.length > 0
            ? selectedUserNames.length > 3
              ? `${selectedUserNames.slice(0, 3).join(', ')} +${selectedUserNames.length - 3} more`
              : selectedUserNames.join(', ')
            : 'None selected'}
        </div>

        <div className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          <Calendar size={16} className="mr-1 text-green-500" />
          <span className="font-medium mr-1">Period:</span>
          {selectedTimePeriod === 'Custom'
            ? `${filters.fromDate} to ${filters.toDate}`
            : selectedTimePeriod}
        </div>

        <div className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          <Tag size={16} className="mr-1 text-purple-500" />
          <span className="font-medium mr-1">Categories:</span>
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