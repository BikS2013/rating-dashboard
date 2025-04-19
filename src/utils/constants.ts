import { TimePeriodOption, RatingCategory } from '../models/types';

// Time Period Options
export const timePeriodOptions: TimePeriodOption[] = [
  { id: 'last-day', name: 'Last Day', days: 1 },
  { id: 'last-week', name: 'Last Week', days: 7 },
  { id: 'last-month', name: 'Last Month', days: 30 },
  { id: 'last-quarter', name: 'Last Quarter', days: 90 },
  { id: 'custom', name: 'Custom', days: null },
];

// Rating Categories
export const ratingCategories: RatingCategory[] = [
  { id: 'all', name: 'All', range: [-10, 10] },
  { id: 'positive', name: 'Positive', range: [1, 6] },
  { id: 'negative', name: 'Negative', range: [-6, -1] },
  { id: 'neutral', name: 'Relatively Neutral', range: [-3, 3] },
  { id: 'heavily-positive', name: 'Heavily Positive', range: [7, 10] },
  { id: 'heavily-negative', name: 'Heavily Negative', range: [-10, -7] },
];