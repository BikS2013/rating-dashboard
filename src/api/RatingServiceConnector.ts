import { Rating, User, FilterState } from "../models/types";

/**
 * RatingServiceConnector Interface
 * 
 * This connector defines the contract between the frontend application
 * and any underlying data source. Implement this interface to support
 * various backends (e.g., REST API, GraphQL, Firebase, etc.)
 */
export interface RatingServiceConnector {
  // User-related methods
  getUsers(): Promise<User[]>;
  getUserById(userId: number): Promise<User | null>;
  
  // Rating-related methods
  getRatings(filters?: Partial<FilterState>): Promise<Rating[]>;
  getRatingById(ratingId: number): Promise<Rating | null>;
  getRatingsByUserId(userId: number, filters?: Partial<FilterState>): Promise<Rating[]>;
  getRatingsByDateRange(fromDate: string, toDate: string): Promise<Rating[]>;
  getRatingsByCategory(categoryId: string): Promise<Rating[]>;
  
  // Conversation-related methods
  getRatingConversation(ratingId: number): Promise<Rating | null>;
  
  // Statistics methods
  getRatingSummary(filters?: Partial<FilterState>): Promise<Record<string, number>>;
  getRatingDistribution(filters?: Partial<FilterState>): Promise<any>;
  getUserDistribution(categoryId: string, filters?: Partial<FilterState>): Promise<Record<string, number>>;
}

/**
 * Abstract BaseConnector class
 * 
 * Provides some common functionality and error handling that
 * all connector implementations can leverage
 */
export abstract class BaseConnector implements RatingServiceConnector {
  protected apiUrl: string;
  
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }
  
  // Common error handling method
  protected async handleRequest<T>(request: Promise<T>): Promise<T> {
    try {
      return await request;
    } catch (error) {
      console.error("API request failed:", error);
      throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // These methods must be implemented by each specific connector
  abstract getUsers(): Promise<User[]>;
  abstract getUserById(userId: number): Promise<User | null>;
  abstract getRatings(filters?: Partial<FilterState>): Promise<Rating[]>;
  abstract getRatingById(ratingId: number): Promise<Rating | null>;
  abstract getRatingsByUserId(userId: number, filters?: Partial<FilterState>): Promise<Rating[]>;
  abstract getRatingsByDateRange(fromDate: string, toDate: string): Promise<Rating[]>;
  abstract getRatingsByCategory(categoryId: string): Promise<Rating[]>;
  abstract getRatingConversation(ratingId: number): Promise<Rating | null>;
  abstract getRatingSummary(filters?: Partial<FilterState>): Promise<Record<string, number>>;
  abstract getRatingDistribution(filters?: Partial<FilterState>): Promise<any>;
  abstract getUserDistribution(categoryId: string, filters?: Partial<FilterState>): Promise<Record<string, number>>;
}