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
import { prepareBarChartData } from '../../utils/chartUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RatingBarChartProps {
  ratings: Rating[];
}

const RatingBarChart: React.FC<RatingBarChartProps> = ({ ratings }) => {
  const chartData = prepareBarChartData(ratings);
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            return `Date: ${tooltipItems[0].label}`;
          },
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y} ratings`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of Ratings',
        },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };
  
  return (
    <div className="chart-container">
      {ratings.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
};

export default RatingBarChart;