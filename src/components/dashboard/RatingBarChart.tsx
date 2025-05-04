import React, { useEffect, useState, useMemo } from 'react';
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
import { prepareBarChartData } from '../../utils/chartUtils';
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

interface RatingBarChartProps {
  ratings: Rating[];
}

type ChartType = 'bar' | 'line' | 'area';

const RatingBarChart: React.FC<RatingBarChartProps> = ({ ratings }) => {
  const { theme } = useTheme();
  // Use state to track chart ID to force re-render
  const [chartId, setChartId] = useState(Date.now().toString());
  // State for chart type
  const [chartType, setChartType] = useState<ChartType>('bar');

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

  // Force chart re-render on data changes
  useEffect(() => {
    // On ratings change, force re-render by changing chart ID
    setChartId(Date.now().toString());

    // DON'T destroy Chart.js instances here - only do it when component unmounts
  }, [ratingsHash]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      try {
        Object.values(ChartJS.instances).forEach(chart => {
          try {
            chart.destroy();
          } catch (e) {
            console.warn('Error destroying chart instance:', e);
          }
        });
      } catch (e) {
        console.warn('Error cleaning up chart instances:', e);
      }
    };
  }, []);

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

  // Modify chart data for different chart types
  const enhancedChartData = useMemo(() => {
    if (!chartData || !chartData.datasets) return chartData;

    // Define colors based on theme
    const positiveColor = theme === 'dark' ? 'rgba(74, 222, 128, 0.8)' : 'rgb(75, 192, 192)';
    const neutralColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.8)' : 'rgb(201, 203, 207)';
    const negativeColor = theme === 'dark' ? 'rgba(248, 113, 113, 0.8)' : 'rgb(255, 99, 132)';

    // Define border colors for line and area charts
    const positiveBorderColor = theme === 'dark' ? 'rgb(74, 222, 128)' : 'rgb(20, 184, 166)';
    const neutralBorderColor = theme === 'dark' ? 'rgb(148, 163, 184)' : 'rgb(148, 163, 184)';
    const negativeBorderColor = theme === 'dark' ? 'rgb(248, 113, 113)' : 'rgb(244, 63, 94)';

    // Enhance datasets with properties for different chart types
    const enhancedDatasets = chartData.datasets.map((dataset, index) => {
      let color;
      let borderColor;
      let order;

      // Assign colors based on dataset index
      if (index === 0) { // Positive
        color = positiveColor;
        borderColor = positiveBorderColor;
        order = 1; // Draw positive on top for area charts
      } else if (index === 1) { // Neutral
        color = neutralColor;
        borderColor = neutralBorderColor;
        order = 2; // Draw neutral in the middle for area charts
      } else { // Negative
        color = negativeColor;
        borderColor = negativeBorderColor;
        order = 3; // Draw negative at the bottom for area charts
      }

      return {
        ...dataset,
        backgroundColor: color,
        borderColor: chartType !== 'bar' ? borderColor : color,
        borderWidth: chartType !== 'bar' ? 2 : 0,
        pointBackgroundColor: borderColor,
        pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        pointRadius: chartType !== 'bar' ? 3 : 0,
        pointHoverRadius: chartType !== 'bar' ? 5 : 0,
        fill: chartType === 'area',
        tension: chartType !== 'bar' ? 0.1 : 0, // Add slight curve to lines
        order: order, // Control stacking order for area charts
      };
    });

    return {
      ...chartData,
      datasets: enhancedDatasets
    };
  }, [chartData, theme, chartType]);

  // Chart options
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500 // Faster animations
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        }
      },
      title: {
        display: false,
        text: chartTitle,
        font: {
          size: 16,
        },
        color: theme === 'dark' ? '#e5e7eb' : '#111827'
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
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#e5e7eb' : '#111827',
        bodyColor: theme === 'dark' ? '#e5e7eb' : '#111827',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1
      },
    },
    scales: {
      x: {
        stacked: chartType === 'bar' || chartType === 'area', // Stack for bar and area charts
        title: {
          display: true,
          text: 'Date',
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
        stacked: chartType === 'bar' || chartType === 'area', // Stack for bar and area charts
        title: {
          display: true,
          text: 'Number of Ratings',
          color: theme === 'dark' ? '#9ca3af' : '#4b5563'
        },
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
  }), [chartTitle, theme, chartType]);

  // Calculate chart height based on data points
  const chartHeight = useMemo(() => {
    const baseHeight = 300; // Default height
    const dataPoints = chartData?.labels?.length || 0;

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

  // Render the appropriate chart based on the selected chart type
  const renderChart = () => {
    if (ratings.length === 0) {
      return (
        <div className={`h-full flex items-center justify-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No data available for the selected filters
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return <Line data={enhancedChartData} options={options} id="rating-chart" />;
      case 'area':
        // For area charts, we use Line with fill=true (already set in the dataset)
        return <Line data={enhancedChartData} options={options} id="rating-chart" />;
      case 'bar':
      default:
        return <Bar data={enhancedChartData} options={options} id="rating-chart" />;
    }
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

          {/* Chart controls */}
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

          {/* Chart title */}
          <h3 className={`text-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {chartTitle} - {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </h3>

          {renderChart()}
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