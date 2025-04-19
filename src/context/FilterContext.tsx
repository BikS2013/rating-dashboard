import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { FilterState } from '../models/types';
import { mockUsers, timePeriodOptions, formatDate } from '../data/mockData';

interface FilterContextType {
  filters: FilterState;
  setSelectedUsers: (users: number[]) => void;
  toggleExpandUsers: () => void;
  setSelectedTimePeriod: (periodId: string) => void;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setSelectedRatingCategories: (categories: string[]) => void;
  toggleUser: (userId: number | 'all') => void;
  toggleRatingCategory: (categoryId: string) => void;
}

const defaultFilterState: FilterState = {
  selectedUsers: mockUsers.map(user => user.id), // Select all users by default
  expandUsers: false,
  selectedTimePeriod: 'last-week',
  fromDate: '12/04/2025', // Default to a week ago from our fixed date
  toDate: '19/04/2025', // Default to our fixed date (for consistency)
  selectedRatingCategories: ['all'],
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  // Update from and to dates when time period changes
  useEffect(() => {
    if (filters.selectedTimePeriod === 'custom') return;
    
    const today = new Date('2025-04-19'); // Use fixed date for consistency
    const timePeriod = timePeriodOptions.find(tp => tp.id === filters.selectedTimePeriod);
    
    if (timePeriod && timePeriod.days !== null) {
      const fromDateObj = new Date(today);
      fromDateObj.setDate(today.getDate() - timePeriod.days + 1);
      
      setFilters({
        ...filters,
        fromDate: formatDate(fromDateObj),
        toDate: formatDate(today),
      });
    }
  }, [filters.selectedTimePeriod]);

  // Handler functions
  const setSelectedUsers = (users: number[]) => {
    setFilters({ ...filters, selectedUsers: users });
  };

  const toggleExpandUsers = () => {
    setFilters({ ...filters, expandUsers: !filters.expandUsers });
  };

  const setSelectedTimePeriod = (periodId: string) => {
    setFilters({ ...filters, selectedTimePeriod: periodId });
  };

  const setFromDate = (date: string) => {
    setFilters({ ...filters, fromDate: date });
  };

  const setToDate = (date: string) => {
    setFilters({ ...filters, toDate: date });
  };

  const setSelectedRatingCategories = (categories: string[]) => {
    setFilters({ ...filters, selectedRatingCategories: categories });
  };

  const toggleUser = (userId: number | 'all') => {
    if (userId === 'all') {
      if (filters.selectedUsers.length === mockUsers.length) {
        setFilters({ ...filters, selectedUsers: [] });
      } else {
        setFilters({ ...filters, selectedUsers: mockUsers.map(user => user.id) });
      }
    } else {
      if (filters.selectedUsers.includes(userId as number)) {
        setFilters({
          ...filters,
          selectedUsers: filters.selectedUsers.filter(id => id !== userId),
        });
      } else {
        setFilters({
          ...filters,
          selectedUsers: [...filters.selectedUsers, userId as number],
        });
      }
    }
  };

  const toggleRatingCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      if (filters.selectedRatingCategories.includes('all')) {
        setFilters({
          ...filters,
          selectedRatingCategories: filters.selectedRatingCategories.filter(id => id !== 'all'),
        });
      } else {
        setFilters({ ...filters, selectedRatingCategories: ['all'] });
      }
    } else {
      // Remove 'all' if it's selected and we're selecting a specific category
      const updatedCategories = filters.selectedRatingCategories.includes('all')
        ? filters.selectedRatingCategories.filter(cat => cat !== 'all')
        : [...filters.selectedRatingCategories];

      if (updatedCategories.includes(categoryId)) {
        setFilters({
          ...filters,
          selectedRatingCategories: updatedCategories.filter(id => id !== categoryId),
        });
      } else {
        setFilters({
          ...filters,
          selectedRatingCategories: [...updatedCategories, categoryId],
        });
      }
    }
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setSelectedUsers,
        toggleExpandUsers,
        setSelectedTimePeriod,
        setFromDate,
        setToDate,
        setSelectedRatingCategories,
        toggleUser,
        toggleRatingCategory,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};