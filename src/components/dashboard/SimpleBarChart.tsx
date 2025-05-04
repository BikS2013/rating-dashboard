import React, { useState, useMemo, useCallback } from 'react';
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
import { Rating } from '../../models/types';
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

interface SimpleBarChartProps {
  ratings: Rating[];
}

type GroupBy = 'day' | 'week' | 'month';
type ChartType = 'bar' | 'line' | 'area';

// A simplified version of the chart component focused on reliability
const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ ratings }) => {
  const { theme } = useTheme();
  // State for grouping mode
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  // State for chart type
  const [chartType, setChartType] = useState<ChartType>('bar');

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

    // Define colors based on theme and chart type
    const positiveColor = theme === 'dark'
      ? 'rgba(74, 222, 128, 0.8)' // Green in dark mode
      : 'rgba(75, 192, 192, 0.8)'; // Teal in light mode

    const neutralColor = theme === 'dark'
      ? 'rgba(148, 163, 184, 0.8)' // Gray in dark mode
      : 'rgba(201, 203, 207, 0.8)'; // Light gray in light mode

    const negativeColor = theme === 'dark'
      ? 'rgba(248, 113, 113, 0.8)' // Red in dark mode
      : 'rgba(255, 99, 132, 0.8)'; // Pink in light mode

    // Define border colors for line and area charts
    const positiveBorderColor = theme === 'dark' ? 'rgb(74, 222, 128)' : 'rgb(20, 184, 166)';
    const neutralBorderColor = theme === 'dark' ? 'rgb(148, 163, 184)' : 'rgb(148, 163, 184)';
    const negativeBorderColor = theme === 'dark' ? 'rgb(248, 113, 113)' : 'rgb(244, 63, 94)';

    // For stacked area charts, we need to adjust the opacity
    const areaOpacity = chartType === 'area' ? 0.7 : 1;

    // Common dataset properties
    const datasets = [
      {
        label: 'Positive',
        data: sortedKeys.map(key => groupedData[key].positive),
        backgroundColor: positiveColor,
        borderColor: positiveBorderColor,
        borderWidth: chartType !== 'bar' ? 2 : 0,
        pointBackgroundColor: positiveBorderColor,
        pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        pointRadius: chartType !== 'bar' ? 3 : 0,
        pointHoverRadius: chartType !== 'bar' ? 5 : 0,
        fill: chartType === 'area' ? true : false,
        tension: chartType !== 'bar' ? 0.1 : 0, // Add slight curve to lines
        order: 1, // Draw positive on top for area charts
      },
      {
        label: 'Neutral',
        data: sortedKeys.map(key => groupedData[key].neutral),
        backgroundColor: neutralColor,
        borderColor: neutralBorderColor,
        borderWidth: chartType !== 'bar' ? 2 : 0,
        pointBackgroundColor: neutralBorderColor,
        pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        pointRadius: chartType !== 'bar' ? 3 : 0,
        pointHoverRadius: chartType !== 'bar' ? 5 : 0,
        fill: chartType === 'area' ? true : false,
        tension: chartType !== 'bar' ? 0.1 : 0,
        order: 2, // Draw neutral in the middle for area charts
      },
      {
        label: 'Negative',
        data: sortedKeys.map(key => groupedData[key].negative),
        backgroundColor: negativeColor,
        borderColor: negativeBorderColor,
        borderWidth: chartType !== 'bar' ? 2 : 0,
        pointBackgroundColor: negativeBorderColor,
        pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        pointRadius: chartType !== 'bar' ? 3 : 0,
        pointHoverRadius: chartType !== 'bar' ? 5 : 0,
        fill: chartType === 'area' ? true : false,
        tension: chartType !== 'bar' ? 0.1 : 0,
        order: 3, // Draw negative at the bottom for area charts
      },
    ];

    return {
      labels: formattedLabels,
      datasets: datasets,
    };
  }, [groupData, groupBy, formatDateForDisplay, theme, chartType]);

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

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        }
      },
      title: {
        display: false,
        text: getChartTitle(),
        font: {
          size: 16,
        },
        color: theme === 'dark' ? '#e5e7eb' : '#111827'
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
        },
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#e5e7eb' : '#111827',
        bodyColor: theme === 'dark' ? '#e5e7eb' : '#111827',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        stacked: chartType === 'bar' || chartType === 'area', // Stack for bar and area charts
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        }
      },
      y: {
        stacked: chartType === 'bar' || chartType === 'area', // Stack for bar and area charts
        beginAtZero: true,
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
        radius: chartType !== 'bar' ? 3 : 0,
        hoverRadius: chartType !== 'bar' ? 5 : 0
      }
    }
  }), [theme, getChartTitle, groupBy, groupData, chartType]);

  // Render the appropriate chart based on the selected chart type
  const renderChart = () => {
    if (ratings.length === 0) {
      return (
        <div className={`h-full flex items-center justify-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No data available
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'area':
        // For area charts, we use Line with fill=true (already set in the dataset)
        return <Line data={chartData} options={options} />;
      case 'bar':
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div>
      {/* Control buttons row */}
      <div className="flex flex-wrap justify-between gap-2 mb-3">
        {/* Grouping buttons */}
        <div className="flex gap-2">
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

        {/* Chart type buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm rounded flex items-center ${chartType === 'bar'
              ? 'bg-blue-500 text-white'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            title="Bar Chart"
          >
            <BarChart size={16} className="mr-1" />
            Bar
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded flex items-center ${chartType === 'line'
              ? 'bg-blue-500 text-white'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            title="Line Chart"
          >
            <LineChart size={16} className="mr-1" />
            Line
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 text-sm rounded flex items-center ${chartType === 'area'
              ? 'bg-blue-500 text-white'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            title="Area Chart"
          >
            <AreaChart size={16} className="mr-1" />
            Area
          </button>
        </div>
      </div>

      {/* Chart title */}
      <h3 className={`text-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {getChartTitle()} - {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
      </h3>

      {/* Chart display */}
      <div style={{ height: '300px', position: 'relative' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default SimpleBarChart;