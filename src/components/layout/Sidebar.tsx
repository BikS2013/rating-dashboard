import React from 'react';
import { ChevronLeft, ChevronRight, Users, Clock, ChevronDown } from 'lucide-react';
import { useFilter } from '../../context/FilterContext';
import { mockUsers, timePeriodOptions, ratingCategories } from '../../data/mockData';
import DatePicker from '../shared/DatePicker';
import ResizableHandle from './ResizableHandle';

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
  const {
    filters,
    toggleUser,
    toggleExpandUsers,
    setSelectedTimePeriod,
    setFromDate,
    setToDate,
    toggleRatingCategory,
  } = useFilter();
  
  // Calculate fixed width when collapsed, or use the dynamic width when expanded
  const sidebarWidth = collapsed ? 48 : width; // 48px = w-12
  
  return (
    <div
      className={`bg-gray-800 text-white h-screen sidebar-transition relative flex flex-col`}
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Sidebar Header with Toggle Button */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        {!collapsed && <h1 className="text-xl font-bold">Filters</h1>}
        <button 
          className="p-1 rounded hover:bg-gray-700 ml-auto"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
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
      
      {/* Sidebar Content - Only show when not collapsed */}
      {!collapsed && (
        <div className="p-4 flex-1 overflow-y-auto">
          {/* User Selection Section */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Users size={18} className="mr-2" />
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
            
            {filters.expandUsers ? (
              // Expanded view - show as list of checkboxes
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="all-users"
                    checked={filters.selectedUsers.length === mockUsers.length}
                    onChange={() => toggleUser('all')}
                    className="mr-2"
                  />
                  <label htmlFor="all-users">All</label>
                </div>
                
                {mockUsers.map(user => (
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
                    disabled={filters.expandUsers}
                    value={filters.selectedUsers.map(String)}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      
                      // Check if "All" is selected
                      if (selectedOptions.includes(0)) {
                        toggleUser('all');
                      } else {
                        const selectedUsers = mockUsers
                          .filter(user => selectedOptions.includes(user.id))
                          .map(user => user.id);
                        
                        // Update the selected users
                        setSelectedTimePeriod(selectedUsers.length > 0 ? 'custom' : 'all');
                      }
                    }}
                    className="w-full p-2 bg-gray-700 rounded appearance-none"
                    size={6}
                  >
                    <option value="0">All</option>
                    {mockUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-2 top-3 pointer-events-none"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Time Period Section */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Clock size={18} className="mr-2" />
              <h2 className="font-medium">Time Period</h2>
            </div>
            
            <div className="relative mb-3">
              <select
                value={filters.selectedTimePeriod}
                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded appearance-none"
              >
                {timePeriodOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
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
            <h2 className="font-medium mb-2">Rating Categories</h2>
            <div className="space-y-1">
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