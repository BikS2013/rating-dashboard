import React, { useState, useEffect } from 'react';
import { Rating, User } from '../../models/types';
import { useDashboard } from '../../context/DashboardContext';
import { useRatingService } from '../../context/RatingServiceContext';

interface DetailedRatingsProps {
  ratings: Rating[];
}

const DetailedRatings: React.FC<DetailedRatingsProps> = ({ ratings }) => {
  const { dashboardState, toggleMessageExpansion, toggleConversationExpansion } = useDashboard();
  const ratingService = useRatingService();
  const [users, setUsers] = useState<Record<number, User>>({});
  
  // Load users for displaying names
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await ratingService.getUsers();
        // Create a map for quick lookup
        const userMap = fetchedUsers.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<number, User>);
        setUsers(userMap);
      } catch (error) {
        console.error('Error loading users for detailed ratings:', error);
      }
    };
    
    loadUsers();
  }, [ratingService]);
  
  // Function to get rating badge color based on rating value
  const getRatingBadgeClass = (rating: number): string => {
    if (rating > 6) return 'bg-green-600 text-white';
    if (rating > 0) return 'bg-green-500 text-white';
    if (rating < -6) return 'bg-red-600 text-white';
    if (rating < 0) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };
  
  return (
    <div className="space-y-6">
      {ratings.length > 0 ? (
        ratings.map(rating => {
          const user = users[rating.userId];
          const userName = user ? user.name : `User ${rating.userId}`;
          const isConversationExpanded = dashboardState.expandedConversations[rating.id];
          
          return (
            <div key={rating.id} className="border rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{userName}</h3>
                <span 
                  className={`px-3 py-1 rounded-md ${getRatingBadgeClass(rating.rating)}`}
                >
                  Rating: {rating.rating > 0 ? `+${rating.rating}` : rating.rating}
                </span>
              </div>
              
              <div className="text-gray-500 mb-3">{rating.date}</div>
              
              <p className="mb-2 text-base">
                {dashboardState.expandedMessages[rating.id]
                  ? rating.message
                  : `${rating.message.substring(0, 100)}${
                      rating.message.length > 100 ? '...' : ''
                    }`}
              </p>
              
              {rating.message.length > 100 && (
                <button
                  className="text-blue-500 hover:text-blue-700 transition-colors mb-3"
                  onClick={() => toggleMessageExpansion(rating.id)}
                >
                  {dashboardState.expandedMessages[rating.id] 
                    ? 'Show less' 
                    : 'Show more'}
                </button>
              )}
              
              {/* Conversation History Section */}
              {isConversationExpanded && rating.conversation && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-3">Conversation History:</h4>
                  <div className="border rounded-md p-4 bg-gray-50">
                    {rating.conversation.map(message => {
                      const isUser = message.userId !== null;
                      const messageSender = isUser 
                        ? `User ${message.userId}` 
                        : 'Chatbot';
                      
                      return (
                        <div key={message.id} className="mb-3 last:mb-0">
                          <div className={`font-medium ${isUser ? 'text-blue-600' : 'text-gray-700'}`}>
                            {messageSender}
                          </div>
                          <div className={`mt-1 ${isUser ? 'text-blue-600' : 'text-gray-700'}`}>
                            {message.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="text-blue-500 hover:text-blue-700 transition-colors mt-2"
                    onClick={() => toggleConversationExpansion(rating.id)}
                  >
                    Hide conversation
                  </button>
                </div>
              )}
              
              {/* View Conversation Button - only show when conversation is not expanded */}
              {!isConversationExpanded && (
                <div className="mt-2">
                  <button 
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    onClick={() => toggleConversationExpansion(rating.id)}
                  >
                    View full conversation
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-500">No ratings found for this category.</p>
      )}
    </div>
  );
};

export default DetailedRatings;