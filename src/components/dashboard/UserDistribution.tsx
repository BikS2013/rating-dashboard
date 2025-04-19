import React from 'react';
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
import { getUserDistributionData } from '../../utils/filterUtils';
import { mockUsers } from '../../data/mockData';
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
  const userDistribution = getUserDistributionData(ratings, mockUsers);
  const chartData = prepareUserDistributionData(userDistribution);
  
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
      {Object.keys(userDistribution).length > 0 ? (
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