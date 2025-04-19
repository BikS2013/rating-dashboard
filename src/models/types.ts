// User Model
export interface User {
  id: number;
  name: string;
}

// Rating Model
export interface Rating {
  id: number;
  userId: number;
  date: string; // Format: 'dd/mm/yyyy'
  rating: number; // Range: -10 to 10
  message: string; // User feedback message
}

// Time Period Option
export interface TimePeriodOption {
  id: string;
  name: string;
  days: number | null; // null for custom
}

// Rating Category
export interface RatingCategory {
  id: string;
  name: string;
  range: [number, number]; // Min and max values
}

// Chart Data
export interface ChartData {
  labels: string[]; // X-axis labels (dates)
  datasets: {
    label: string; // Dataset name (e.g., "Positive", "Neutral", "Negative")
    data: number[]; // Values for each label
    backgroundColor: string; // Color for this dataset's bars
  }[];
}

// Filter State
export interface FilterState {
  selectedUsers: number[];
  expandUsers: boolean;
  selectedTimePeriod: string;
  fromDate: string;
  toDate: string;
  selectedRatingCategories: string[];
}

// Dashboard State
export interface DashboardState {
  selectedCategory: string | null;
  activeTab: 'details' | 'distribution';
  expandedMessages: Record<number, boolean>;
}
