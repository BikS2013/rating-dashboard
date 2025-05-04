import React, { useEffect, useState, useMemo } from 'react';
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
import { prepareBarChartData } from '../../utils/chartUtilsRecharts';
import { useTheme } from '../../context/ThemeContext';

interface RatingBarChartProps {
  ratings: Rating[];
}

const RatingBarChart: React.FC<RatingBarChartProps> = ({ ratings }) => {
  const { theme } = useTheme();
  
  // Create a hash of the ratings array to detect changes
  const ratingsHash = useMemo(() => {
    return ratings.length.toString() + '_' + 
      ratings.slice(0, 5).map(r => r.id).join('_') + '_' + 
      (ratings.length > 5 ? ratings[ratings.length - 1].id : '');
  }, [ratings]);
  
  // Compute chart data with memoization
  const chartData = useMemo(() => {
    console.log('Recalculating chart data', { 
      ratingsCount: ratings.length,
      timestamp: new Date().toISOString()
    });
    
    return prepareBarChartData(ratings);
  }, [ratings, ratingsHash]);
  
  // Determine chart title based on grouping mode
  const chartTitle = useMemo(() => {
    try {
      if (!chartData || !chartData.groupingMode) return 'Rating Distribution';
      
      switch (chartData.groupingMode) {
        case 'month':
          return 'Rating Distribution by Month';
        case 'week':
          return 'Rating Distribution by Week';
        default:
          return 'Rating Distribution by Day';
      }
    } catch (e) {
      console.warn('Error determining chart title:', e);
      return 'Rating Distribution';
    }
  }, [chartData]);
  
  // Calculate chart height based on data points
  const chartHeight = useMemo(() => {
    const baseHeight = 300; // Default height
    const dataPoints = chartData?.data?.length || 0;
    
    // Increase height for more data points
    if (dataPoints > 20) return `${baseHeight + 100}px`;
    if (dataPoints > 10) return `${baseHeight + 50}px`;
    return `${baseHeight}px`;
  }, [chartData]);
  
  // Render state: show loading while data is being processed
  const [isRendering, setIsRendering] = useState(false);
  
  useEffect(() => {
    // Mark as rendering when ratings change
    setIsRendering(true);
    
    // Prevent chart from disappearing by delaying state update
    const timer = setTimeout(() => {
      setIsRendering(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [ratings]);
  
  // Custom tooltip to show full date information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const originalKey = payload[0]?.payload?.originalKey;
      let displayDate = label;
      
      return (
        <div className={`p-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow rounded border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className="font-medium">Date: {displayDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} ratings
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="chart-container" style={{ height: chartHeight, position: 'relative' }}>
      {ratings.length > 0 ? (
        <>
          {isRendering && (
            <div className={`absolute inset-0 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800 bg-opacity-70' : 'bg-gray-50 bg-opacity-70'} z-10`}>
              <div className="text-blue-500">Loading chart...</div>
            </div>
          )}
          
          {/* Chart title */}
          <h3 className={`text-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {chartTitle}
          </h3>
          
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={chartData.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
              />
              <XAxis 
                dataKey="name" 
                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
                label={{ 
                  value: 'Date', 
                  position: 'insideBottom', 
                  offset: -5,
                  fill: theme === 'dark' ? '#9ca3af' : '#4b5563'
                }}
              />
              <YAxis 
                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
                label={{ 
                  value: 'Number of Ratings', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: theme === 'dark' ? '#9ca3af' : '#4b5563'
                }}
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
        </>
      ) : (
        <div className={`h-full flex items-center justify-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No data available for the selected filters
        </div>
      )}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(RatingBarChart);
