import { Rating, User, FilterState } from "../models/types";
import { BaseConnector } from "./RatingServiceConnector";
import { mockUsers, mockRatings } from "../data/mockData";
import { ratingCategories } from "../utils/constants";
import { getFilteredRatings, getSummaryData, getUserDistributionData } from "../utils/filterUtils";
import { prepareBarChartData } from "../utils/chartUtils";

/**
 * Mock implementation of the RatingServiceConnector
 * 
 * This implementation uses the mock data that's already defined in the application,
 * making it perfect for development and testing.
 */
export class MockConnector extends BaseConnector {
  constructor() {
    super("mock://api");
  }
  
  // Helper to simulate API latency
  private async simulateNetworkDelay<T>(data: T): Promise<T> {
    // Simulate network delay between 100-300ms
    const delay = Math.floor(Math.random() * 200) + 100;
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  }
  
  // User-related methods
  async getUsers(): Promise<User[]> {
    return this.simulateNetworkDelay([...mockUsers]);
  }
  
  async getUserById(userId: number): Promise<User | null> {
    const user = mockUsers.find(u => u.id === userId);
    return this.simulateNetworkDelay(user || null);
  }
  
  // Rating-related methods
  async getRatings(filters?: Partial<FilterState>): Promise<Rating[]> {
    if (!filters) {
      return this.simulateNetworkDelay([...mockRatings]);
    }
    
    // Convert partial filters to full filters for compatibility with existing utility
    const fullFilters: FilterState = {
      selectedUsers: filters.selectedUsers || mockUsers.map(u => u.id),
      expandUsers: filters.expandUsers || false,
      selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
      fromDate: filters.fromDate || '12/04/2025',
      toDate: filters.toDate || '19/04/2025',
      selectedRatingCategories: filters.selectedRatingCategories || ['all'],
    };
    
    const filteredRatings = getFilteredRatings(mockRatings, fullFilters);
    return this.simulateNetworkDelay(filteredRatings);
  }
  
  async getRatingById(ratingId: number): Promise<Rating | null> {
    const rating = mockRatings.find(r => r.id === ratingId);
    return this.simulateNetworkDelay(rating || null);
  }
  
  async getRatingsByUserId(userId: number, filters?: Partial<FilterState>): Promise<Rating[]> {
    const userRatings = mockRatings.filter(r => r.userId === userId);
    
    if (!filters) {
      return this.simulateNetworkDelay(userRatings);
    }
    
    // Apply any additional filters
    const fullFilters: FilterState = {
      selectedUsers: [userId],
      expandUsers: filters.expandUsers || false,
      selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
      fromDate: filters.fromDate || '12/04/2025',
      toDate: filters.toDate || '19/04/2025',
      selectedRatingCategories: filters.selectedRatingCategories || ['all'],
    };
    
    const filteredRatings = getFilteredRatings(userRatings, fullFilters);
    return this.simulateNetworkDelay(filteredRatings);
  }
  
  async getRatingsByDateRange(fromDate: string, toDate: string): Promise<Rating[]> {
    const filters: FilterState = {
      selectedUsers: mockUsers.map(u => u.id),
      expandUsers: false,
      selectedTimePeriod: 'custom',
      fromDate: fromDate,
      toDate: toDate,
      selectedRatingCategories: ['all'],
    };
    
    const filteredRatings = getFilteredRatings(mockRatings, filters);
    return this.simulateNetworkDelay(filteredRatings);
  }
  
  async getRatingsByCategory(categoryId: string): Promise<Rating[]> {
    const filters: FilterState = {
      selectedUsers: mockUsers.map(u => u.id),
      expandUsers: false,
      selectedTimePeriod: 'last-week',
      fromDate: '12/04/2025',
      toDate: '19/04/2025',
      selectedRatingCategories: [categoryId],
    };
    
    const filteredRatings = getFilteredRatings(mockRatings, filters);
    return this.simulateNetworkDelay(filteredRatings);
  }
  
  // Conversation-related methods
  async getRatingConversation(ratingId: number): Promise<Rating | null> {
    const rating = mockRatings.find(r => r.id === ratingId);
    
    if (!rating || !rating.conversation) {
      return this.simulateNetworkDelay(null);
    }
    
    // Return a new object with just the ID and conversation to mimic
    // a targeted API response
    return this.simulateNetworkDelay({
      ...rating
    });
  }
  
  // Statistics methods
  async getRatingSummary(filters?: Partial<FilterState>): Promise<Record<string, number>> {
    if (!filters) {
      const summary = getSummaryData(mockRatings);
      return this.simulateNetworkDelay(summary);
    }
    
    // Convert partial filters to full filters for compatibility
    const fullFilters: FilterState = {
      selectedUsers: filters.selectedUsers || mockUsers.map(u => u.id),
      expandUsers: filters.expandUsers || false,
      selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
      fromDate: filters.fromDate || '12/04/2025',
      toDate: filters.toDate || '19/04/2025',
      selectedRatingCategories: filters.selectedRatingCategories || ['all'],
    };
    
    const filteredRatings = getFilteredRatings(mockRatings, fullFilters);
    const summary = getSummaryData(filteredRatings);
    return this.simulateNetworkDelay(summary);
  }
  
  async getRatingDistribution(filters?: Partial<FilterState>): Promise<any> {
    if (!filters) {
      const chartData = prepareBarChartData(mockRatings);
      return this.simulateNetworkDelay(chartData);
    }
    
    // Convert partial filters to full filters for compatibility
    const fullFilters: FilterState = {
      selectedUsers: filters.selectedUsers || mockUsers.map(u => u.id),
      expandUsers: filters.expandUsers || false,
      selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
      fromDate: filters.fromDate || '12/04/2025',
      toDate: filters.toDate || '19/04/2025',
      selectedRatingCategories: filters.selectedRatingCategories || ['all'],
    };
    
    const filteredRatings = getFilteredRatings(mockRatings, fullFilters);
    const chartData = prepareBarChartData(filteredRatings);
    return this.simulateNetworkDelay(chartData);
  }
  
  async getUserDistribution(categoryId: string, filters?: Partial<FilterState>): Promise<Record<string, number>> {
    // First get the filtered ratings for the category
    let categoryRatings: Rating[];
    
    if (categoryId === 'all') {
      categoryRatings = [...mockRatings];
    } else {
      // Find the category range
      const category = ratingCategories.find(cat => cat.id === categoryId);
      
      if (!category) {
        return this.simulateNetworkDelay({});
      }
      
      // Filter by the category range
      categoryRatings = mockRatings.filter(rating => 
        rating.rating >= category.range[0] && rating.rating <= category.range[1]
      );
    }
    
    // Apply any additional filters
    if (filters) {
      const fullFilters: FilterState = {
        selectedUsers: filters.selectedUsers || mockUsers.map(u => u.id),
        expandUsers: filters.expandUsers || false,
        selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
        fromDate: filters.fromDate || '12/04/2025',
        toDate: filters.toDate || '19/04/2025',
        selectedRatingCategories: [categoryId],
      };
      
      categoryRatings = getFilteredRatings(categoryRatings, fullFilters);
    }
    
    // Get user distribution
    const distribution = getUserDistributionData(categoryRatings, mockUsers);
    return this.simulateNetworkDelay(distribution);
  }
}