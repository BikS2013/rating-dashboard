import { RatingServiceConnector } from './RatingServiceConnector';
import { RestApiConnector } from './RestApiConnector';
import { MockConnector } from './MockConnector';

/**
 * Enum of available connector types
 */
export enum ConnectorType {
  MOCK = 'mock',
  REST = 'rest',
  // Add more connector types as needed
}

/**
 * Configuration options for connectors
 */
export interface ConnectorConfig {
  apiUrl?: string;
  authToken?: string;
  // Add more configuration options as needed
}

/**
 * Factory class for creating RatingServiceConnector instances
 */
export class RatingServiceFactory {
  /**
   * Creates a connector of the specified type with the given configuration
   * 
   * @param type Type of connector to create
   * @param config Configuration options for the connector
   * @returns A connector instance
   */
  static createConnector(type: ConnectorType, config?: ConnectorConfig): RatingServiceConnector {
    switch (type) {
      case ConnectorType.REST:
        if (!config?.apiUrl) {
          throw new Error('API URL is required for REST connector');
        }
        return new RestApiConnector(config.apiUrl, config.authToken);
        
      case ConnectorType.MOCK:
      default:
        return new MockConnector();
    }
  }
  
  /**
   * Get the default connector based on the environment
   * 
   * In development, this returns the mock connector.
   * In production, it returns a REST connector configured with environment variables.
   * 
   * @returns A connector instance
   */
  static getDefaultConnector(): RatingServiceConnector {
    // Use Vite environment variables
    const isProduction = import.meta.env.PROD;
    
    if (isProduction) {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.example.com';
      const authToken = import.meta.env.VITE_AUTH_TOKEN as string || undefined;
      
      return new RestApiConnector(apiUrl, authToken);
    }
    
    return new MockConnector();
  }
}