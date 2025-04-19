import { User, Rating, TimePeriodOption, RatingCategory } from '../models/types';

// Mock Users
export const mockUsers: User[] = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Robert Johnson' },
  { id: 4, name: 'Lisa Anderson' },
  { id: 5, name: 'Michael Chen' },
  { id: 6, name: 'Sarah Williams' },
  { id: 7, name: 'David Brown' },
];

// Mock Time Period Options
export const timePeriodOptions: TimePeriodOption[] = [
  { id: 'last-day', name: 'Last Day', days: 1 },
  { id: 'last-week', name: 'Last Week', days: 7 },
  { id: 'last-month', name: 'Last Month', days: 30 },
  { id: 'last-quarter', name: 'Last Quarter', days: 90 },
  { id: 'custom', name: 'Custom', days: null },
];

// Mock Rating Categories
export const ratingCategories: RatingCategory[] = [
  { id: 'all', name: 'All', range: [-10, 10] },
  { id: 'positive', name: 'Positive', range: [1, 6] },
  { id: 'negative', name: 'Negative', range: [-6, -1] },
  { id: 'neutral', name: 'Relatively Neutral', range: [-3, 3] },
  { id: 'heavily-positive', name: 'Heavily Positive', range: [7, 10] },
  { id: 'heavily-negative', name: 'Heavily Negative', range: [-10, -7] },
];

// Generate random rating
const generateRandomRating = (id: number): Rating => {
  const userId = Math.floor(Math.random() * 7) + 1;
  const rating = Math.floor(Math.random() * 21) - 10; // -10 to 10
  
  // Generate a random date within the last 90 days
  const today = new Date('2025-04-19'); // Use fixed date for consistency
  const randomDaysAgo = Math.floor(Math.random() * 90);
  const date = new Date(today);
  date.setDate(today.getDate() - randomDaysAgo);
  
  // Format date as dd/mm/yyyy
  const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  
  // Generate random feedback message
  const feedbackMessages = [
    'The chatbot was very helpful in answering my question about account settings.',
    'I had trouble getting the bot to understand what I was asking about billing information.',
    'Great experience! The chatbot quickly resolved my issue with password reset.',
    'The responses were very slow today, and I had to repeat my question multiple times.',
    'Excellent support from the chatbot. It provided detailed information about the new features.',
    'The chatbot didn\'t seem to understand my question about refund policy.',
    'Very impressed with how the chatbot handled my complex query about API integration.',
    'Couldn\'t get a clear answer to my shipping question, had to contact support instead.',
    'The suggested solutions were spot on! Saved me a lot of time troubleshooting.',
    'I appreciate how the chatbot guided me through the setup process step by step.',
    'Extremely frustrating experience. The chatbot kept suggesting irrelevant solutions.',
    'Pleasantly surprised by how human-like and helpful the responses were.',
  ];
  
  const message = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
  
  return {
    id,
    userId,
    date: formattedDate,
    rating,
    message,
  };
};

// Generate 200 mock ratings
export const mockRatings: Rating[] = Array.from({ length: 200 }, (_, i) => generateRandomRating(i + 1));

// Helper function to format date
export const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};