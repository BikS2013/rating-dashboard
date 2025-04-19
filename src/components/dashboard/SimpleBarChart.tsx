import React, { useState, useMemo, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Rating } from '../../models/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SimpleBarChartProps {
  ratings: Rating[];
}

type GroupBy = 'day' | 'week' | 'month';

// A simplified version of the chart component focused on reliability
const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ ratings }) => {
  // State for grouping mode
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  
  // Format date for display
  const formatDateForDisplay = useCallback((dateKey: string): string => {
    try {
      const [day, month, year] = dateKey.split('/').map(Number);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return dateKey;
      }
      
      if (groupBy === 'day') {
        // Create a more readable format for day: "DD/MM"
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
      } else if (groupBy === 'week') {
        // Calculate week number (approximate)
        const date = new Date(year, month - 1, day);
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `W${weekNum}`;
      } else {
        // Month format
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[month - 1]} ${year}`;
      }
    } catch (error) {
      console.warn('Error formatting date:', dateKey, error);
      return dateKey;
    }
  }, [groupBy]);
  
  // Group data by the selected time unit
  const groupData = useCallback(() => {
    const groupedData: Record<string, { positive: number, neutral: number, negative: number }> = {};
    
    // Process each rating
    ratings.forEach(rating => {
      try {
        // Get the date as is (already in DD/MM/YYYY format)
        const dateStr = rating.date;
        
        // Validate date format
        const [day, month, year] = dateStr.split('/').map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
          console.warn('Invalid date format:', dateStr);
          return;
        }
        
        // Generate key based on grouping mode
        let dateKey = dateStr;
        
        if (groupBy === 'week') {
          const date = new Date(year, month - 1, day);
          const firstDayOfYear = new Date(year, 0, 1);
          const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
          const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          dateKey = `W${weekNum}/${year}`;
        } else if (groupBy === 'month') {
          dateKey = `${month}/${year}`;
        }
        
        // Initialize date data if needed
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { positive: 0, neutral: 0, negative: 0 };
        }
        
        // Categorize rating
        if (rating.rating > 3) {
          groupedData[dateKey].positive += 1;
        } else if (rating.rating < -3) {
          groupedData[dateKey].negative += 1;
        } else {
          groupedData[dateKey].neutral += 1;
        }
      } catch (error) {
        console.warn('Error processing rating:', rating);
      }
    });
    
    return groupedData;
  }, [ratings, groupBy]);
  
  // Prepare chart data with memoization
  const chartData = useMemo(() => {
    const groupedData = groupData();
    
    // Sort keys based on their date values
    const sortKeys = (a: string, b: string): number => {
      // Handle different key formats
      if (groupBy === 'day') {
        // Parse DD/MM/YYYY format
        const [dayA, monthA, yearA] = a.split('/').map(Number);
        const [dayB, monthB, yearB] = b.split('/').map(Number);
        
        // Compare years, then months, then days
        if (yearA !== yearB) return yearA - yearB;
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      } else if (groupBy === 'week') {
        // Parse W##/YYYY format
        const [weekPartA, yearA] = a.split('/');
        const [weekPartB, yearB] = b.split('/');
        
        const weekA = parseInt(weekPartA.substring(1));
        const weekB = parseInt(weekPartB.substring(1));
        
        if (parseInt(yearA) !== parseInt(yearB)) return parseInt(yearA) - parseInt(yearB);
        return weekA - weekB;
      } else {
        // Parse MM/YYYY format
        const [monthA, yearA] = a.split('/').map(Number);
        const [monthB, yearB] = b.split('/').map(Number);
        
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      }
    };
    
    const sortedKeys = Object.keys(groupedData).sort(sortKeys);
    
    // Format keys for display
    const formattedLabels = sortedKeys.map(formatDateForDisplay);
    
    return {
      labels: formattedLabels,
      datasets: [
        {
          label: 'Positive',
          data: sortedKeys.map(key => groupedData[key].positive),
          backgroundColor: 'rgb(75, 192, 192)',
        },
        {
          label: 'Neutral',
          data: sortedKeys.map(key => groupedData[key].neutral),
          backgroundColor: 'rgb(201, 203, 207)',
        },
        {
          label: 'Negative',
          data: sortedKeys.map(key => groupedData[key].negative),
          backgroundColor: 'rgb(255, 99, 132)',
        },
      ],
    };
  }, [groupData, groupBy, formatDateForDisplay]);
  
  // Get title based on grouping mode
  const getChartTitle = () => {
    switch(groupBy) {
      case 'day': return 'Daily Rating Distribution';
      case 'week': return 'Weekly Rating Distribution';
      case 'month': return 'Monthly Rating Distribution';
      default: return 'Rating Distribution';
    }
  };
  
  // Determine if we have a lot of data points that might need scrolling
  const needsScroll = chartData.labels.length > 7;
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: getChartTitle(),
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            // For days, add year info in tooltip for clarity
            if (groupBy === 'day' && tooltipItems.length > 0) {
              const index = tooltipItems[0].dataIndex;
              const dateKey = Object.keys(groupData()).sort()[index];
              
              if (dateKey.split('/').length === 3) {
                const [day, month, year] = dateKey.split('/');
                return `${day}/${month}/${year}`;
              }
            }
            return tooltipItems[0].label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };
  
  return (
    <div>
      {/* Grouping buttons */}
      <div className="flex gap-2 mb-3">
        <button 
          onClick={() => setGroupBy('day')}
          className={`px-3 py-1 text-sm rounded ${groupBy === 'day' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Daily
        </button>
        <button 
          onClick={() => setGroupBy('week')}
          className={`px-3 py-1 text-sm rounded ${groupBy === 'week' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Weekly
        </button>
        <button 
          onClick={() => setGroupBy('month')}
          className={`px-3 py-1 text-sm rounded ${groupBy === 'month' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Monthly
        </button>
      </div>
      
      {/* Chart display */}
      <div style={{ height: '300px', position: 'relative' }}>
        {ratings.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleBarChart;