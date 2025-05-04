import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Rating, User } from '../../models/types';
import { getUserDistributionData } from '../../utils/filterUtils';
import { useRatingService } from '../../context/RatingServiceContext';
import { prepareUserDistributionData } from '../../utils/chartUtils';
import { useTheme } from '../../context/ThemeContext';
import { BarChart, LineChart, AreaChart } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UserDistributionProps {
  ratings: Rating[];
}

type ChartType = 'bar' | 'line' | 'area';

const UserDistribution: React.FC<UserDistributionProps> = ({ ratings }) => {
  const { theme } = useTheme();
  const ratingService = useRatingService();
  const [users, setUsers] = useState<User[]>([]);
  const [distributionData, setDistributionData] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState(prepareUserDistributionData({}));
  // State for chart type
  const [chartType, setChartType] = useState<ChartType>('bar');

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

  // Enhance chart data for different chart types
  const enhancedChartData = useMemo(() => {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return chartData;

    // Define colors based on theme
    const barColor = theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.8)';
    const borderColor = theme === 'dark' ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)';

    // Enhance dataset with properties for different chart types
    const enhancedDatasets = chartData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: barColor,
      borderColor: chartType !== 'bar' ? borderColor : barColor,
      borderWidth: chartType !== 'bar' ? 2 : 0,
      pointBackgroundColor: borderColor,
      pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      pointRadius: chartType !== 'bar' ? 4 : 0,
      pointHoverRadius: chartType !== 'bar' ? 6 : 0,
      fill: chartType === 'area',
      tension: chartType !== 'bar' ? 0.1 : 0, // Add slight curve to lines
    }));

    return {
      ...chartData,
      datasets: enhancedDatasets
    };
  }, [chartData, theme, chartType]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        }
      },
      title: {
        display: false,
        text: 'Rating Distribution by User',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: theme === 'dark' ? '#e5e7eb' : '#111827'
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
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#e5e7eb' : '#111827',
        bodyColor: theme === 'dark' ? '#e5e7eb' : '#111827',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Users',
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Ratings',
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        }
      },
    },
    elements: {
      line: {
        tension: 0.1 // Slightly curved lines
      },
      point: {
        radius: chartType !== 'bar' ? 4 : 0,
        hoverRadius: chartType !== 'bar' ? 6 : 0
      }
    },
    maintainAspectRatio: false,
  }), [theme, chartType]);

  // Render the appropriate chart based on the selected chart type
  const renderChart = () => {
    if (Object.keys(distributionData).length === 0) {
      return (
        <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No user distribution data available.
        </p>
      );
    }

    switch (chartType) {
      case 'line':
        return <Line data={enhancedChartData} options={options} />;
      case 'area':
        // For area charts, we use Line with fill=true (already set in the dataset)
        return <Line data={enhancedChartData} options={options} />;
      case 'bar':
      default:
        return <Bar data={enhancedChartData} options={options} />;
    }
  };

  return (
    <div>
      {/* Chart controls */}
      {Object.keys(distributionData).length > 0 && (
        <div className="flex justify-end mb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 text-xs rounded flex items-center ${chartType === 'bar'
                ? 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Bar Chart"
            >
              <BarChart size={14} className="mr-1" />
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-1 text-xs rounded flex items-center ${chartType === 'line'
                ? 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Line Chart"
            >
              <LineChart size={14} className="mr-1" />
              Line
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2 py-1 text-xs rounded flex items-center ${chartType === 'area'
                ? 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Area Chart"
            >
              <AreaChart size={14} className="mr-1" />
              Area
            </button>
          </div>
        </div>
      )}

      {/* Chart title */}
      <h3 className={`text-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        Rating Distribution by User {Object.keys(distributionData).length > 0 && `- ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
      </h3>

      {Object.keys(distributionData).length > 0 ? (
        <div className="chart-container h-64">
          {renderChart()}
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