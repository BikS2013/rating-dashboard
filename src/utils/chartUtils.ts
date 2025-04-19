import { Rating, ChartData } from '../models/types';

// Helper function to group ratings by date
const groupRatingsByDate = (ratings: Rating[]) => {
  const grouped: Record<string, { positive: number; neutral: number; negative: number }> = {};
  
  ratings.forEach(rating => {
    const date = rating.date;
    if (!grouped[date]) {
      grouped[date] = { positive: 0, neutral: 0, negative: 0 };
    }
    
    // Categorize rating
    if (rating.rating > 3) {
      grouped[date].positive += 1;
    } else if (rating.rating < -3) {
      grouped[date].negative += 1;
    } else {
      grouped[date].neutral += 1;
    }
  });
  
  return grouped;
};

// Prepare data for the bar chart
export const prepareBarChartData = (ratings: Rating[]): ChartData => {
  const groupedByDate = groupRatingsByDate(ratings);
  
  // Sort dates in ascending order
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const datePartsA = a.split('/').map(Number);
    const datePartsB = b.split('/').map(Number);
    
    // Compare years
    if (datePartsA[2] !== datePartsB[2]) return datePartsA[2] - datePartsB[2];
    // Compare months (subtract 1 as they are 1-indexed)
    if (datePartsA[1] !== datePartsB[1]) return datePartsA[1] - datePartsB[1];
    // Compare days
    return datePartsA[0] - datePartsB[0];
  });
  
  const chartData: ChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Positive',
        data: sortedDates.map(date => groupedByDate[date].positive),
        backgroundColor: 'rgb(75, 192, 192)',
      },
      {
        label: 'Neutral',
        data: sortedDates.map(date => groupedByDate[date].neutral),
        backgroundColor: 'rgb(201, 203, 207)',
      },
      {
        label: 'Negative',
        data: sortedDates.map(date => groupedByDate[date].negative),
        backgroundColor: 'rgb(255, 99, 132)',
      },
    ],
  };
  
  return chartData;
};

// Prepare data for the user distribution chart
export const prepareUserDistributionData = (distribution: Record<string, number>): ChartData => {
  // Sort users by count in descending order
  const sortedUsers = Object.keys(distribution).sort((a, b) => distribution[b] - distribution[a]);
  
  const chartData: ChartData = {
    labels: sortedUsers,
    datasets: [
      {
        label: 'Ratings',
        data: sortedUsers.map(user => distribution[user]),
        backgroundColor: 'rgb(54, 162, 235)',
      },
    ],
  };
  
  return chartData;
};