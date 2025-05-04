import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faUsers, faClock, faChevronDown, faFilter, faStar } from '@fortawesome/free-solid-svg-icons';
import { useFilter } from '../../context/FilterContext';
import { User } from '../../models/types';
import { timePeriodOptions, ratingCategories } from '../../utils/constants';
import DatePicker from '../shared/DatePicker';
import ResizableHandle from './ResizableHandle';
import { useRatingService } from '../../context/RatingServiceContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  width: number;
  onResize: (width: number) => void;
  minWidth: number;
  maxWidth: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  toggleSidebar,
  width,
  onResize,
  minWidth,
  maxWidth
}) => {
  const { theme } = useTheme();
  const {
    filters,
    toggleUser,
    toggleExpandUsers,
    setSelectedTimePeriod,
    setFromDate,
    setToDate,
    toggleRatingCategory,
  } = useFilter();

  const ratingService = useRatingService();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await ratingService.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error loading users for sidebar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [ratingService]);

  // Calculate fixed width when collapsed, or use the dynamic width when expanded
  const sidebarWidth = collapsed ? 48 : width; // 48px = w-12

  return (
    <div
      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-800'} text-white h-full relative flex flex-col`}
      style={{
        width: `${sidebarWidth}px`,
        position: 'fixed',
        left: 0,
        top: '40px', // 40px = h-10 (height of the top nav)
        bottom: 0,
        zIndex: 20,
        transition: 'width 0.3s ease-in-out'
      }}
    >
      {/* Sidebar Header with Toggle Button */}
      <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-600'}`}>
        {!collapsed && (
          <div className="flex items-center">
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            <h1 className="text-xl font-bold">Filters</h1>
          </div>
        )}
        <button
          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-700'} ml-auto`}
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>

      {/* Resizable Handle - Only show when not collapsed */}
      {!collapsed && (
        <ResizableHandle
          onResize={onResize}
          minWidth={minWidth}
          maxWidth={maxWidth}
          currentWidth={width}
        />
      )}

      {/* Collapsed Icons - Only show when sidebar is collapsed */}
      {collapsed && (
        <div className="flex flex-col items-center pt-4 space-y-6">
          <div
            className="cursor-pointer hover:text-blue-400 transition-colors duration-200"
            title="Users"
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon icon={faUsers} size="lg" />
          </div>
          <div
            className="cursor-pointer hover:text-green-400 transition-colors duration-200"
            title="Time Period"
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon icon={faClock} size="lg" />
          </div>
          <div
            className="cursor-pointer hover:text-yellow-300 transition-colors duration-200"
            title="Rating Categories"
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon icon={faStar} size="lg" className="text-yellow-400" />
          </div>
        </div>
      )}

      {/* Sidebar Content - Only show when not collapsed */}
      {!collapsed && (
        <div className="p-4 flex-1 overflow-y-auto">
          {/* User Selection Section */}
          <div className="mb-6">
            <div className={`flex items-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              <h2 className="font-medium">Users</h2>
            </div>

            <div className="flex items-center mb-2">
              <label htmlFor="expandUsers" className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="expandUsers"
                  checked={filters.expandUsers}
                  onChange={toggleExpandUsers}
                  className="mr-2"
                />
                <span>Expand</span>
              </label>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Loading users...</span>
              </div>
            ) : filters.expandUsers ? (
              // Expanded view - show as list of checkboxes
              <div className={`space-y-1 max-h-48 overflow-y-auto ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-700'} rounded p-2`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="all-users"
                    checked={filters.selectedUsers.length === users.length && users.length > 0}
                    onChange={() => toggleUser('all')}
                    className="mr-2"
                  />
                  <label htmlFor="all-users">All</label>
                </div>

                {users.map(user => (
                  <div key={user.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={filters.selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`user-${user.id}`}>{user.name}</label>
                  </div>
                ))}
              </div>
            ) : (
              // Collapsed view - show as multi-select dropdown
              <div className="relative">
                <div className="flex items-center">
                  <select
                    multiple
                    disabled={filters.expandUsers || isLoading}
                    value={filters.selectedUsers.map(String)}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));

                      // Check if "All" is selected
                      if (selectedOptions.includes(0)) {
                        toggleUser('all');
                      } else {
                        const selectedUsers = users
                          .filter(user => selectedOptions.includes(user.id))
                          .map(user => user.id);

                        // Update the selected users
                        setSelectedTimePeriod(selectedUsers.length > 0 ? 'custom' : 'all');
                      }
                    }}
                    className={`w-full p-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-700'} rounded appearance-none`}
                    size={6}
                  >
                    <option value="0">All</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="absolute right-2 top-3 pointer-events-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Time Period Section */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faClock} className="mr-2" />
              <h2 className="font-medium">Time Period</h2>
            </div>

            <div className="relative mb-3">
              <select
                value={filters.selectedTimePeriod}
                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                className={`w-full p-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-700'} rounded appearance-none`}
              >
                {timePeriodOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="absolute right-2 top-3 pointer-events-none"
              />
            </div>

            <div className="space-y-2">
              <DatePicker
                id="fromDate"
                label="From Date"
                value={filters.fromDate}
                onChange={setFromDate}
              />

              <DatePicker
                id="toDate"
                label="To Date"
                value={filters.toDate}
                onChange={setToDate}
              />
            </div>
          </div>

          {/* Rating Categories Section */}
          <div>
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-400" />
              <h2 className="font-medium">Rating Categories</h2>
            </div>
            <div className={`space-y-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-700'} rounded p-2`}>
              {ratingCategories.map(category => (
                <div key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={
                      filters.selectedRatingCategories.includes('all')
                        ? category.id === 'all'
                        : filters.selectedRatingCategories.includes(category.id)
                    }
                    onChange={() => toggleRatingCategory(category.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`category-${category.id}`}>{category.name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;