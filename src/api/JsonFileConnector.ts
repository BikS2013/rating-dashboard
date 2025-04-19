import { Rating, User, FilterState } from "../models/types";
import { BaseConnector } from "./RatingServiceConnector";
import { getFilteredRatings, getSummaryData, getUserDistributionData } from "../utils/filterUtils";
import { prepareBarChartData } from "../utils/chartUtils";

/**
 * JSON File implementation of the RatingServiceConnector
 * 
 * This connector works with a JSON file containing ratings data.
 * It can handle both local file loading and remote JSON file fetching.
 */
export class JsonFileConnector extends BaseConnector {
  private data: {
    users: User[];
    ratings: Rating[];
    categories: { id: string; name: string; range: [number, number] }[];
  } | null = null;
  private dataUrl: string;
  private isLoading = false;
  private lastLoaded = 0;
  private cacheExpiry = 5 * 1000; // 5 seconds cache for testing
  
  constructor(jsonUrl: string) {
    super(jsonUrl);
    this.dataUrl = jsonUrl;
    console.log(`JsonFileConnector initialized with URL: ${jsonUrl}`);
  }
  
  // Helper method to load data from the JSON source
  private async loadData(force = false): Promise<void> {
    console.log(`JsonFileConnector: loadData called with URL: ${this.dataUrl} (force: ${force})`);
    
    // Always force refresh when explicitly requested
    if (force) {
      console.log('JsonFileConnector: Force refresh requested, bypassing cache');
    } else {
      // Return cached data if available and not expired
      const now = Date.now();
      if (
        this.data !== null && 
        now - this.lastLoaded < this.cacheExpiry
      ) {
        console.log('JsonFileConnector: Using cached data');
        return;
      }
    }
    
    // Prevent multiple concurrent loads
    if (this.isLoading) {
      console.log('JsonFileConnector: Already loading, waiting for completion');
      // Wait for the current loading to finish
      await new Promise<void>(resolve => {
        const checkInterval = setInterval(() => {
          if (!this.isLoading) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
      return;
    }
    
    this.isLoading = true;
    console.log('JsonFileConnector: Starting to fetch data from:', this.dataUrl);
    
    try {
      // Add cache-busting query parameter to avoid browser caching
      const cacheBuster = `?_=${Date.now()}`;
      const url = this.dataUrl + (force ? cacheBuster : '');
      
      console.log('JsonFileConnector: Fetching from URL:', url);
      
      const response = await fetch(url, {
        // Disable caching with fetch headers
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        console.error(`JsonFileConnector: Fetch failed with status: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to load JSON data: ${response.statusText}`);
      }
      
      console.log('JsonFileConnector: Fetch successful, parsing JSON');
      this.data = await response.json();
      this.lastLoaded = Date.now();
      
      // Log first user to verify data
      if (this.data?.users?.length > 0) {
        console.log('JsonFileConnector: First user:', this.data.users[0]);
      }
      
      console.log('JsonFileConnector: Data loaded successfully', {
        usersCount: this.data?.users?.length || 0,
        ratingsCount: this.data?.ratings?.length || 0,
        categoriesCount: this.data?.categories?.length || 0
      });
    } catch (error) {
      console.error("JsonFileConnector: Error loading JSON data:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  // Helper to simulate API latency (for consistency with other connectors)
  private async simulateNetworkDelay<T>(data: T): Promise<T> {
    // Simulate network delay between 50-150ms
    const delay = Math.floor(Math.random() * 100) + 50;
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  }
  
  // User-related methods
  async getUsers(): Promise<User[]> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    return this.simulateNetworkDelay([...this.data.users]);
  }
  
  async getUserById(userId: number): Promise<User | null> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    const user = this.data.users.find(u => u.id === userId);
    return this.simulateNetworkDelay(user || null);
  }
  
  // Rating-related methods
  async getRatings(filters?: Partial<FilterState>): Promise<Rating[]> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    if (!filters) {
      return this.simulateNetworkDelay([...this.data.ratings]);
    }
    
    // Convert partial filters to full filters
    const fullFilters: FilterState = {
      selectedUsers: filters.selectedUsers || this.data.users.map(u => u.id),
      expandUsers: filters.expandUsers || false,
      selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
      fromDate: filters.fromDate || '12/04/2025',
      toDate: filters.toDate || '19/04/2025',
      selectedRatingCategories: filters.selectedRatingCategories || ['all'],
    };
    
    const filteredRatings = getFilteredRatings(this.data.ratings, fullFilters);
    return this.simulateNetworkDelay(filteredRatings);
  }
  
  async getRatingById(ratingId: number): Promise<Rating | null> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    const rating = this.data.ratings.find(r => r.id === ratingId);
    return this.simulateNetworkDelay(rating || null);
  }
  
  async getRatingsByUserId(userId: number, filters?: Partial<FilterState>): Promise<Rating[]> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    const userRatings = this.data.ratings.filter(r => r.userId === userId);
    
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
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    const filters: FilterState = {
      selectedUsers: this.data.users.map(u => u.id),
      expandUsers: false,
      selectedTimePeriod: 'custom',
      fromDate: fromDate,
      toDate: toDate,
      selectedRatingCategories: ['all'],
    };
    
    const filteredRatings = getFilteredRatings(this.data.ratings, filters);
    return this.simulateNetworkDelay(filteredRatings);
  }
  
  async getRatingsByCategory(categoryId: string): Promise<Rating[]> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    const filters: FilterState = {
      selectedUsers: this.data.users.map(u => u.id),
      expandUsers: false,
      selectedTimePeriod: 'last-week',
      fromDate: '12/04/2025',
      toDate: '19/04/2025',
      selectedRatingCategories: [categoryId],
    };
    
    const filteredRatings = getFilteredRatings(this.data.ratings, filters);
    return this.simulateNetworkDelay(filteredRatings);
  }
  
  // Conversation-related methods
  async getRatingConversation(ratingId: number): Promise<Rating | null> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    const rating = this.data.ratings.find(r => r.id === ratingId);
    
    if (!rating || !rating.conversation) {
      return this.simulateNetworkDelay(null);
    }
    
    return this.simulateNetworkDelay({
      ...rating
    });
  }
  
  // Statistics methods
  async getRatingSummary(filters?: Partial<FilterState>): Promise<Record<string, number>> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    if (!filters) {
      const summary = getSummaryData(this.data.ratings);
      return this.simulateNetworkDelay(summary);
    }
    
    // Convert partial filters to full filters
    const fullFilters: FilterState = {
      selectedUsers: filters.selectedUsers || this.data.users.map(u => u.id),
      expandUsers: filters.expandUsers || false,
      selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
      fromDate: filters.fromDate || '12/04/2025',
      toDate: filters.toDate || '19/04/2025',
      selectedRatingCategories: filters.selectedRatingCategories || ['all'],
    };
    
    const filteredRatings = getFilteredRatings(this.data.ratings, fullFilters);
    const summary = getSummaryData(filteredRatings);
    return this.simulateNetworkDelay(summary);
  }
  
  async getRatingDistribution(filters?: Partial<FilterState>): Promise<any> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    if (!filters) {
      const chartData = prepareBarChartData(this.data.ratings);
      return this.simulateNetworkDelay(chartData);
    }
    
    // Convert partial filters to full filters
    const fullFilters: FilterState = {
      selectedUsers: filters.selectedUsers || this.data.users.map(u => u.id),
      expandUsers: filters.expandUsers || false,
      selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
      fromDate: filters.fromDate || '12/04/2025',
      toDate: filters.toDate || '19/04/2025',
      selectedRatingCategories: filters.selectedRatingCategories || ['all'],
    };
    
    const filteredRatings = getFilteredRatings(this.data.ratings, fullFilters);
    const chartData = prepareBarChartData(filteredRatings);
    return this.simulateNetworkDelay(chartData);
  }
  
  async getUserDistribution(categoryId: string, filters?: Partial<FilterState>): Promise<Record<string, number>> {
    await this.loadData();
    if (!this.data) throw new Error("Failed to load data");
    
    // First get the filtered ratings for the category
    let categoryRatings: Rating[];
    
    if (categoryId === 'all') {
      categoryRatings = [...this.data.ratings];
    } else {
      // Find the category range
      const category = this.data.categories.find(cat => cat.id === categoryId);
      
      if (!category) {
        return this.simulateNetworkDelay({});
      }
      
      // Filter by the category range
      categoryRatings = this.data.ratings.filter(rating => 
        rating.rating >= category.range[0] && rating.rating <= category.range[1]
      );
    }
    
    // Apply any additional filters
    if (filters) {
      const fullFilters: FilterState = {
        selectedUsers: filters.selectedUsers || this.data.users.map(u => u.id),
        expandUsers: filters.expandUsers || false,
        selectedTimePeriod: filters.selectedTimePeriod || 'last-week',
        fromDate: filters.fromDate || '12/04/2025',
        toDate: filters.toDate || '19/04/2025',
        selectedRatingCategories: [categoryId],
      };
      
      categoryRatings = getFilteredRatings(categoryRatings, fullFilters);
    }
    
    // Get user distribution
    const distribution = getUserDistributionData(categoryRatings, this.data.users);
    return this.simulateNetworkDelay(distribution);
  }
  
  /**
   * Force refresh the data from the source
   * This can be useful when testing or when you know the data has changed
   */
  async forceRefresh(): Promise<void> {
    console.log('JsonFileConnector: Force refreshing data');
    
    // Clear the cache completely
    this.data = null;
    this.lastLoaded = 0;
    
    // Load fresh data with cache-busting
    await this.loadData(true);
    
    console.log('JsonFileConnector: Force refresh complete');
  }
}