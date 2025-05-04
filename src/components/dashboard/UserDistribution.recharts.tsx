import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Rating, User } from '../../models/types';
import { getUserDistributionData } from '../../utils/filterUtils';
import { useRatingService } from '../../context/RatingServiceContext';
import { prepareUserDistributionData } from '../../utils/chartUtilsRecharts';
import { useTheme } from '../../context/ThemeContext';

interface UserDistributionProps {
  ratings: Rating[];
}

const UserDistribution: React.FC<UserDistributionProps> = ({ ratings }) => {
  const { theme } = useTheme();
  const ratingService = useRatingService();
  const [users, setUsers] = useState<User[]>([]);
  const [distributionData, setDistributionData] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Load users and compute distribution
  useEffect(() => {
    const loadUsersAndComputeDistribution = async () => {
      try {
        const fetchedUsers = await ratingService.getUsers();
        setUsers(fetchedUsers);
        
        const distribution = getUserDistributionData(ratings, fetchedUsers);
        setDistributionData(distribution);
        setChartData(prepareUserDistributionData(distribution));
      } catch (error) {
        console.error('Error loading users for distribution chart:', error);
      }
    };
    
    loadUsersAndComputeDistribution();
  }, [ratings, ratingService]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow rounded border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className="font-medium">User: {label}</p>
          <p>Ratings: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      {/* Chart title */}
      <h3 className={`text-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        Rating Distribution by User
      </h3>
      
      {chartData.length > 0 ? (
        <div className="chart-container h-64">
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
                label={{ 
                  value: 'Users', 
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
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No user distribution data available.
        </p>
      )}
    </div>
  );
};

export default UserDistribution;
