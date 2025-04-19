import React, { useEffect, useState, useMemo } from 'react';
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
  // Use state to track chart ID to force re-render
  const [chartId, setChartId] = useState(Date.now().toString());
  
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
      },
      title: {
        display: true,
        text: chartTitle,
        font: {
          size: 16,
        },
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
  }), [chartTitle]);
  
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
  
  return (
    <div className="chart-container" style={{ height: chartHeight, position: 'relative' }}>
      {ratings.length > 0 ? (
        <>
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-70 z-10">
              <div className="text-blue-500">Loading chart...</div>
            </div>
          )}
          <Bar 
            data={chartData}
            options={options}
            // Keep a stable ID to avoid recreation
            id="rating-chart"
          />
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(RatingBarChart);