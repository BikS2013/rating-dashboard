import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Rating } from '../../models/types';
import { useTheme } from '../../context/ThemeContext';

interface SimpleBarChartProps {
  ratings: Rating[];
}

type GroupBy = 'day' | 'week' | 'month';

// A simplified version of the chart component using Recharts
const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ ratings }) => {
  const { theme } = useTheme();
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
    
    // Format data for Recharts
    return sortedKeys.map(key => ({
      name: formatDateForDisplay(key),
      positive: groupedData[key].positive,
      neutral: groupedData[key].neutral,
      negative: groupedData[key].negative,
      // Store original key for tooltip
      originalKey: key
    }));
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
  
  // Custom tooltip to show full date information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const originalKey = payload[0]?.payload?.originalKey;
      let displayDate = label;
      
      // For days, add year info in tooltip for clarity
      if (groupBy === 'day' && originalKey) {
        const [day, month, year] = originalKey.split('/');
        displayDate = `${day}/${month}/${year}`;
      }
      
      return (
        <div className={`p-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow rounded border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className="font-medium">{displayDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      {/* Grouping buttons */}
      <div className="flex gap-2 mb-3">
        <button 
          onClick={() => setGroupBy('day')}
          className={`px-3 py-1 text-sm rounded ${groupBy === 'day' 
            ? 'bg-blue-500 text-white' 
            : theme === 'dark' 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Daily
        </button>
        <button 
          onClick={() => setGroupBy('week')}
          className={`px-3 py-1 text-sm rounded ${groupBy === 'week' 
            ? 'bg-blue-500 text-white' 
            : theme === 'dark' 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Weekly
        </button>
        <button 
          onClick={() => setGroupBy('month')}
          className={`px-3 py-1 text-sm rounded ${groupBy === 'month' 
            ? 'bg-blue-500 text-white' 
            : theme === 'dark' 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Monthly
        </button>
      </div>
      
      {/* Chart title */}
      <h3 className={`text-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {getChartTitle()}
      </h3>
      
      {/* Chart display */}
      <div style={{ height: '300px', position: 'relative' }}>
        {ratings.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
              />
              <XAxis 
                dataKey="name" 
                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
              />
              <YAxis 
                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="positive" 
                stackId="a" 
                name="Positive" 
                fill="#4ade80" 
                radius={[0, 0, 0, 0]} 
              />
              <Bar 
                dataKey="neutral" 
                stackId="a" 
                name="Neutral" 
                fill="#94a3b8" 
                radius={[0, 0, 0, 0]} 
              />
              <Bar 
                dataKey="negative" 
                stackId="a" 
                name="Negative" 
                fill="#f87171" 
                radius={[0, 0, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={`h-full flex items-center justify-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleBarChart;
