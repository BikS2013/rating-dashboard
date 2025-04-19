import React, { useState, useEffect } from 'react';
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
import { Rating, User } from '../../models/types';
import { getUserDistributionData } from '../../utils/filterUtils';
import { useRatingService } from '../../context/RatingServiceContext';
import { prepareUserDistributionData } from '../../utils/chartUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UserDistributionProps {
  ratings: Rating[];
}

const UserDistribution: React.FC<UserDistributionProps> = ({ ratings }) => {
  const ratingService = useRatingService();
  const [users, setUsers] = useState<User[]>([]);
  const [distributionData, setDistributionData] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState(prepareUserDistributionData({}));
  
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
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Rating Distribution by User',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            return `User: ${tooltipItems[0].label}`;
          },
          label: (context: any) => {
            return `Ratings: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Users',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Ratings',
        },
      },
    },
    maintainAspectRatio: false,
  };
  
  return (
    <div>
      {Object.keys(distributionData).length > 0 ? (
        <div className="chart-container h-64">
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-center text-gray-500">No user distribution data available.</p>
      )}
    </div>
  );
};

export default UserDistribution;