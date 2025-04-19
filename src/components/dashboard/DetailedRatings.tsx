import React from 'react';
import { Rating } from '../../models/types';
import { useDashboard } from '../../context/DashboardContext';
import { mockUsers } from '../../data/mockData';

interface DetailedRatingsProps {
  ratings: Rating[];
}

const DetailedRatings: React.FC<DetailedRatingsProps> = ({ ratings }) => {
  const { dashboardState, toggleMessageExpansion } = useDashboard();
  
  return (
    <div className="space-y-4">
      {ratings.length > 0 ? (
        ratings.map(rating => (
          <div key={rating.id} className="border rounded p-3">
            <div className="flex justify-between mb-2">
              <span className="font-medium flex items-center">
                Rating: 
                <span className={`ml-2 px-2 py-1 rounded text-white ${
                  rating.rating > 6 ? 'bg-green-600' :
                  rating.rating > 0 ? 'bg-green-500' :
                  rating.rating < -6 ? 'bg-red-600' :
                  rating.rating < 0 ? 'bg-red-500' :
                  'bg-gray-500'
                }`}>
                  {rating.rating > 0 ? `+${rating.rating}` : rating.rating}
                </span>
              </span>
              <span className="text-gray-500 text-sm">
                {rating.date} - {mockUsers.find(u => u.id === rating.userId)?.name || `User ${rating.userId}`}
              </span>
            </div>
            <div>
              <p>
                {dashboardState.expandedMessages[rating.id]
                  ? rating.message
                  : `${rating.message.substring(0, 100)}${
                      rating.message.length > 100 ? '...' : ''
                    }`}
              </p>
              {rating.message.length > 100 && (
                <button
                  className="text-blue-500 text-sm mt-1"
                  onClick={() => toggleMessageExpansion(rating.id)}
                >
                  {dashboardState.expandedMessages[rating.id] ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No ratings found for this category.</p>
      )}
    </div>
  );
};

export default DetailedRatings;