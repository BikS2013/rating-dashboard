import { Rating, FilterState } from '../models/types';
import { ratingCategories } from '../utils/constants';

// Filter ratings based on filter state
export const getFilteredRatings = (ratings: Rating[], filters: FilterState): Rating[] => {
  let filtered = [...ratings];
  
  // Filter by users
  if (filters.selectedUsers.length > 0) {
    filtered = filtered.filter(rating => filters.selectedUsers.includes(rating.userId));
  }
  
  // Filter by date
  const fromDateParts = filters.fromDate.split('/');
  const fromDateObj = new Date(`${fromDateParts[2]}-${fromDateParts[1]}-${fromDateParts[0]}`);
  
  const toDateParts = filters.toDate.split('/');
  const toDateObj = new Date(`${toDateParts[2]}-${toDateParts[1]}-${toDateParts[0]}`);
  toDateObj.setHours(23, 59, 59);
  
  filtered = filtered.filter(rating => {
    const dateParts = rating.date.split('/');
    const ratingDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    return ratingDate >= fromDateObj && ratingDate <= toDateObj;
  });
  
  // Filter by rating categories
  if (!filters.selectedRatingCategories.includes('all')) {
    const ranges = filters.selectedRatingCategories
      .map(catId => {
        const category = ratingCategories.find(cat => cat.id === catId);
        return category ? category.range : null;
      })
      .filter((range): range is [number, number] => range !== null);
    
    if (ranges.length > 0) {
      filtered = filtered.filter(rating => {
        return ranges.some(range => rating.rating >= range[0] && rating.rating <= range[1]);
      });
    }
  }
  
  return filtered;
};

// Get summary data for the rating categories
export const getSummaryData = (filteredRatings: Rating[]) => {
  const summary: Record<string, number> = {
    positive: filteredRatings.filter(r => r.rating > 0 && r.rating <= 6).length,
    negative: filteredRatings.filter(r => r.rating < 0 && r.rating >= -6).length,
    neutral: filteredRatings.filter(r => r.rating >= -3 && r.rating <= 3).length,
    'heavily-positive': filteredRatings.filter(r => r.rating > 6).length,
    'heavily-negative': filteredRatings.filter(r => r.rating < -6).length,
  };
  
  // Remove empty categories
  Object.keys(summary).forEach(key => {
    if (summary[key] === 0) {
      delete summary[key];
    }
  });
  
  return summary;
};

// Get ratings for a specific category
export const getCategoryRatings = (filteredRatings: Rating[], category: string | null): Rating[] => {
  if (!category) return [];
  
  switch(category) {
    case 'positive':
      return filteredRatings.filter(r => r.rating > 0 && r.rating <= 6);
    case 'negative':
      return filteredRatings.filter(r => r.rating < 0 && r.rating >= -6);
    case 'neutral':
      return filteredRatings.filter(r => r.rating >= -3 && r.rating <= 3);
    case 'heavily-positive':
      return filteredRatings.filter(r => r.rating > 6);
    case 'heavily-negative':
      return filteredRatings.filter(r => r.rating < -6);
    default:
      return [];
  }
};

// Get user distribution data for a category
export const getUserDistributionData = (categoryRatings: Rating[], users: { id: number, name: string }[]) => {
  const distribution: Record<string, number> = {};
  
  categoryRatings.forEach(rating => {
    const user = users.find(u => u.id === rating.userId)?.name || `User ${rating.userId}`;
    if (!distribution[user]) {
      distribution[user] = 0;
    }
    distribution[user] += 1;
  });
  
  return distribution;
};