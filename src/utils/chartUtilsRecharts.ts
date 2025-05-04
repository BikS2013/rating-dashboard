import { Rating } from '../models/types';

// Helper to parse dd/mm/yyyy date string safely
const parseDate = (dateStr: string): Date => {
  try {
    // Handle case where dateStr might not have dd/mm/yyyy format
    if (!dateStr.includes('/') || dateStr.split('/').length !== 3) {
      console.error('Invalid date format:', dateStr);
      return new Date(); // Return current date as fallback
    }
    
    const [day, month, year] = dateStr.split('/').map(Number);
    
    // Validate parts
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error('Invalid date components:', { day, month, year });
      return new Date();
    }
    
    return new Date(year, month - 1, day); // Month is 0-indexed in JS Date
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return new Date();
  }
};

// Helper to format a date for display
const formatDateKey = (date: Date, groupBy: 'day' | 'week' | 'month'): string => {
  try {
    switch (groupBy) {
      case 'month':
        // Format as MM/YYYY
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      case 'week':
        // Get the week number (approximate)
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `W${weekNum}/${date.getFullYear()}`;
      case 'day':
      default:
        // Use original dd/mm/yyyy format
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return 'Invalid Date';
  }
};

// Helper function to group ratings by date with a specific grouping mode
const groupRatingsByDate = (ratings: Rating[], groupBy: 'day' | 'week' | 'month') => {
  // Group data
  const grouped: Record<string, { positive: number; neutral: number; negative: number }> = {};
  
  try {
    ratings.forEach(rating => {
      try {
        if (!rating.date || !rating.date.includes('/')) {
          console.warn('Skipping rating with invalid date format:', rating);
          return;
        }
        
        const date = parseDate(rating.date);
        if (isNaN(date.getTime())) {
          console.warn('Skipping rating with invalid date:', rating);
          return;
        }
        
        const key = formatDateKey(date, groupBy);
        
        if (!grouped[key]) {
          grouped[key] = { positive: 0, neutral: 0, negative: 0 };
        }
        
        // Categorize rating
        if (rating.rating > 3) {
          grouped[key].positive += 1;
        } else if (rating.rating < -3) {
          grouped[key].negative += 1;
        } else {
          grouped[key].neutral += 1;
        }
      } catch (error) {
        console.error('Error processing rating:', rating, error);
      }
    });
  } catch (error) {
    console.error('Error grouping ratings by date:', error);
  }
  
  return grouped;
};

// Format display labels for chart
const formatDisplayLabel = (dateStr: string): string => {
  try {
    if (dateStr.startsWith('W')) {
      // Format week display
      return `Week ${dateStr.substring(1, dateStr.indexOf('/'))}`;
    } else if (dateStr.split('/').length === 2) {
      // Format month display
      const [month, year] = dateStr.split('/');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(month) - 1;
      return `${monthNames[monthIndex]} ${year}`;
    } else {
      // Format day display (keep as is)
      return dateStr;
    }
  } catch (error) {
    console.error('Error formatting display label:', dateStr, error);
    return dateStr;
  }
};

// Prepare data for the Recharts bar chart
export const prepareBarChartData = (ratings: Rating[]) => {
  // Set a default grouping mode
  let groupBy: 'day' | 'week' | 'month' = 'day';
  
  try {
    if (ratings.length > 0) {
      // Get valid dates only
      const validRatings = ratings.filter(r => r.date && r.date.includes('/') && r.date.split('/').length === 3);
      
      if (validRatings.length > 0) {
        // Get date range
        const dates = validRatings.map(r => {
          try {
            return parseDate(r.date);
          } catch (e) {
            console.error('Error parsing date in rating:', r);
            return new Date(); // Fallback
          }
        }).filter(d => !isNaN(d.getTime())); // Filter out invalid dates
        
        if (dates.length > 0) {
          // Find min/max dates safely
          const timestamps = dates.map(d => d.getTime());
          const minDate = new Date(Math.min(...timestamps));
          const maxDate = new Date(Math.max(...timestamps));
          
          // Calculate date span in days
          const dateSpanDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
          console.log('Date span in days:', dateSpanDays, 'min:', minDate.toISOString(), 'max:', maxDate.toISOString());
          
          // Choose grouping based on span
          if (dateSpanDays > 60) {
            groupBy = 'month';
          } else if (dateSpanDays > 14) {
            groupBy = 'week';
          }
        }
      }
    }
  } catch (error) {
    console.error('Error determining group by mode:', error);
    // Keep default day grouping
  }
  
  console.log('Using grouping mode:', groupBy);
  
  try {
    // Group data with the determined mode
    const groupedByDate = groupRatingsByDate(ratings, groupBy);
    
    // No data case
    if (Object.keys(groupedByDate).length === 0) {
      return {
        data: [],
        groupingMode: groupBy
      };
    }
    
    // Sort dates
    let sortedDates: string[] = [];
    
    try {
      // Function to get a numeric sort key for a date string
      const getSortKey = (dateStr: string): number => {
        try {
          if (dateStr.startsWith('W')) {
            // Handle week format
            const [weekStr, yearStr] = dateStr.substring(1).split('/');
            const week = parseInt(weekStr);
            const year = parseInt(yearStr);
            
            if (isNaN(week) || isNaN(year)) {
              return 0; // Default sort value for invalid format
            }
            
            // Approximate week as days into year
            return year * 10000 + week * 7;
          } else if (dateStr.split('/').length === 2) {
            // Handle month format (MM/YYYY)
            const [monthStr, yearStr] = dateStr.split('/');
            const month = parseInt(monthStr);
            const year = parseInt(yearStr);
            
            if (isNaN(month) || isNaN(year)) {
              return 0; // Default sort value for invalid format
            }
            
            return year * 100 + month;
          } else if (dateStr.split('/').length === 3) {
            // Handle day format (DD/MM/YYYY)
            const [dayStr, monthStr, yearStr] = dateStr.split('/');
            const day = parseInt(dayStr);
            const month = parseInt(monthStr);
            const year = parseInt(yearStr);
            
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
              return 0; // Default sort value for invalid format
            }
            
            return year * 10000 + month * 100 + day;
          }
          
          return 0; // Default
        } catch (e) {
          console.error('Error getting sort key for:', dateStr, e);
          return 0;
        }
      };
      
      // Sort dates by numeric key
      sortedDates = Object.keys(groupedByDate).sort((a, b) => getSortKey(a) - getSortKey(b));
    } catch (error) {
      console.error('Error sorting dates:', error);
      sortedDates = Object.keys(groupedByDate);
    }
    
    // Format data for Recharts
    const chartData = sortedDates.map(dateKey => {
      const displayLabel = formatDisplayLabel(dateKey);
      return {
        name: displayLabel,
        positive: groupedByDate[dateKey].positive,
        neutral: groupedByDate[dateKey].neutral,
        negative: groupedByDate[dateKey].negative,
        originalKey: dateKey // Keep original key for tooltip
      };
    });
    
    return {
      data: chartData,
      groupingMode: groupBy
    };
  } catch (error) {
    console.error("Error preparing chart data:", error);
    // Return empty chart data on error
    return {
      data: [],
      groupingMode: 'day'
    };
  }
};

// Prepare data for the user distribution chart
export const prepareUserDistributionData = (distribution: Record<string, number>) => {
  try {
    // Sort users by count in descending order
    const sortedUsers = Object.keys(distribution).sort((a, b) => distribution[b] - distribution[a]);
    
    // Format data for Recharts
    const chartData = sortedUsers.map(user => ({
      name: user,
      value: distribution[user]
    }));
    
    return chartData;
  } catch (error) {
    console.error("Error preparing user distribution chart data:", error);
    // Return empty chart data on error
    return [];
  }
};
