import { Rating, User, FilterState } from "../models/types";
import { BaseConnector } from "./RatingServiceConnector";

/**
 * RESTful API implementation of the RatingServiceConnector
 * 
 * This implementation connects to a standard RESTful API backend.
 */
export class RestApiConnector extends BaseConnector {
  private authToken?: string;
  
  constructor(apiUrl: string, authToken?: string) {
    super(apiUrl);
    this.authToken = authToken;
  }
  
  // Helper method to create request headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }
  
  // Helper method to build query string from filters
  private buildQueryString(filters?: Partial<FilterState>): string {
    if (!filters) return "";
    
    const params = new URLSearchParams();
    
    if (filters.selectedUsers && filters.selectedUsers.length > 0) {
      params.append("users", filters.selectedUsers.join(","));
    }
    
    if (filters.fromDate) {
      params.append("fromDate", filters.fromDate);
    }
    
    if (filters.toDate) {
      params.append("toDate", filters.toDate);
    }
    
    if (filters.selectedRatingCategories && filters.selectedRatingCategories.length > 0) {
      params.append("categories", filters.selectedRatingCategories.join(","));
    }
    
    return params.toString() ? `?${params.toString()}` : "";
  }
  
  // User-related methods
  async getUsers(): Promise<User[]> {
    return this.handleRequest(
      fetch(`${this.apiUrl}/users`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  async getUserById(userId: number): Promise<User | null> {
    return this.handleRequest(
      fetch(`${this.apiUrl}/users/${userId}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  // Rating-related methods
  async getRatings(filters?: Partial<FilterState>): Promise<Rating[]> {
    const queryString = this.buildQueryString(filters);
    
    return this.handleRequest(
      fetch(`${this.apiUrl}/ratings${queryString}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  async getRatingById(ratingId: number): Promise<Rating | null> {
    return this.handleRequest(
      fetch(`${this.apiUrl}/ratings/${ratingId}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  async getRatingsByUserId(userId: number, filters?: Partial<FilterState>): Promise<Rating[]> {
    const queryString = this.buildQueryString(filters);
    
    return this.handleRequest(
      fetch(`${this.apiUrl}/users/${userId}/ratings${queryString}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  async getRatingsByDateRange(fromDate: string, toDate: string): Promise<Rating[]> {
    return this.handleRequest(
      fetch(`${this.apiUrl}/ratings?fromDate=${fromDate}&toDate=${toDate}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  async getRatingsByCategory(categoryId: string): Promise<Rating[]> {
    return this.handleRequest(
      fetch(`${this.apiUrl}/ratings?category=${categoryId}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  // Conversation-related methods
  async getRatingConversation(ratingId: number): Promise<Rating | null> {
    return this.handleRequest(
      fetch(`${this.apiUrl}/ratings/${ratingId}/conversation`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  // Statistics methods
  async getRatingSummary(filters?: Partial<FilterState>): Promise<Record<string, number>> {
    const queryString = this.buildQueryString(filters);
    
    return this.handleRequest(
      fetch(`${this.apiUrl}/statistics/summary${queryString}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  async getRatingDistribution(filters?: Partial<FilterState>): Promise<any> {
    const queryString = this.buildQueryString(filters);
    
    return this.handleRequest(
      fetch(`${this.apiUrl}/statistics/distribution${queryString}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
  
  async getUserDistribution(categoryId: string, filters?: Partial<FilterState>): Promise<Record<string, number>> {
    const queryString = this.buildQueryString(filters);
    
    return this.handleRequest(
      fetch(`${this.apiUrl}/statistics/users/${categoryId}${queryString}`, {
        method: "GET",
        headers: this.getHeaders(),
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
    );
  }
}