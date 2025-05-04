import React, { useState, useEffect } from 'react';
import { Rating, User } from '../../models/types';
import { useDashboard } from '../../context/DashboardContext';
import { useRatingService } from '../../context/RatingServiceContext';
import { useTheme } from '../../context/ThemeContext';
import { User as UserIcon, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface DetailedRatingsProps {
  ratings: Rating[];
}

const DetailedRatings: React.FC<DetailedRatingsProps> = ({ ratings }) => {
  const { theme } = useTheme();
  const { dashboardState, toggleFeedbackExpansion, toggleConversationExpansion } = useDashboard();
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
    if (theme === 'dark') {
      if (rating > 6) return 'bg-green-700 text-green-100';
      if (rating > 0) return 'bg-green-600 text-green-100';
      if (rating < -6) return 'bg-red-700 text-red-100';
      if (rating < 0) return 'bg-red-600 text-red-100';
      return 'bg-gray-600 text-gray-100';
    } else {
      if (rating > 6) return 'bg-green-600 text-white';
      if (rating > 0) return 'bg-green-500 text-white';
      if (rating < -6) return 'bg-red-600 text-white';
      if (rating < 0) return 'bg-red-500 text-white';
      return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {ratings.length > 0 ? (
        ratings.map(rating => {
          const user = users[rating.userId];
          const userName = user ? user.name : `User ${rating.userId}`;
          const isConversationExpanded = dashboardState.expandedConversations[rating.id];

          return (
            <div
              key={rating.id}
              className={`${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'} border rounded-lg p-5 shadow-sm`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-lg font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <UserIcon size={18} className="mr-2 text-blue-500" />
                  {userName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-md ${getRatingBadgeClass(rating.rating)}`}
                >
                  Rating: {rating.rating > 0 ? `+${rating.rating}` : rating.rating}
                </span>
              </div>

              <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-3`}>{rating.date}</div>

              <p className={`mb-2 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {dashboardState.expandedFeedbacks[rating.id]
                  ? rating.feedback
                  : `${rating.feedback.substring(0, 100)}${
                      rating.feedback.length > 100 ? '...' : ''
                    }`}
              </p>

              {rating.feedback.length > 100 && (
                <button
                  className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'} transition-colors mb-3 flex items-center`}
                  onClick={() => toggleFeedbackExpansion(rating.id)}
                >
                  {dashboardState.expandedFeedbacks[rating.id]
                    ? <>Show less <ChevronUp size={16} className="ml-1" /></>
                    : <>Show more <ChevronDown size={16} className="ml-1" /></>}
                </button>
              )}

              {/* Conversation History Section */}
              {isConversationExpanded && rating.conversation && (
                <div className="mt-4">
                  <h4 className={`font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <MessageSquare size={16} className="mr-2 text-blue-500" />
                    Conversation History:
                  </h4>
                  <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    {rating.conversation.map(message => {
                      const isUser = message.userId !== null;
                      const feedbackSender = isUser
                        ? `User ${message.userId}`
                        : 'Chatbot';

                      return (
                        <div key={message.id} className="mb-3 last:mb-0">
                          <div className={`font-medium ${
                            isUser
                              ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                              : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {feedbackSender}
                          </div>
                          <div className={`mt-1 ${
                            isUser
                              ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                              : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'} transition-colors mt-2 flex items-center`}
                    onClick={() => toggleConversationExpansion(rating.id)}
                  >
                    Hide conversation <ChevronUp size={16} className="ml-1" />
                  </button>
                </div>
              )}

              {/* View Conversation Button - only show when conversation is not expanded */}
              {!isConversationExpanded && (
                <div className="mt-2">
                  <button
                    className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'} transition-colors flex items-center`}
                    onClick={() => toggleConversationExpansion(rating.id)}
                  >
                    <MessageSquare size={16} className="mr-1" />
                    View full conversation <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No ratings found for this category.
        </p>
      )}
    </div>
  );
};

export default DetailedRatings;