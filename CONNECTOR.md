# Rating Dashboard Connector Layer

This document describes the connector layer used to connect the Rating Dashboard application to various data sources. The connector layer provides a standardized interface that abstracts away the details of the underlying data source, allowing the application to be reused with different databases or APIs.

## Overview

The Rating Dashboard uses a connector-based architecture to separate the application logic from the data access logic. This allows the application to be connected to different data sources (e.g., REST APIs, databases, mock data) without changing the application code.

The connector layer consists of:

1. **RatingServiceConnector Interface**: Defines the contract that all connectors must implement.
2. **BaseConnector**: An abstract base class that provides common functionality.
3. **Concrete Connector Implementations**: Implementations for specific data sources.
4. **RatingServiceFactory**: A factory for creating and configuring connector instances.
5. **RatingServiceContext**: A React context for providing the connector to the application.

## RatingServiceConnector Interface

The `RatingServiceConnector` interface defines the contract between the frontend application and any underlying data source. All connectors must implement this interface.

```typescript
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
```

## Implementing a New Connector

To implement a new connector, follow these steps:

1. Create a new connector class that extends the `BaseConnector` abstract class.
2. Implement all the required methods defined in the `RatingServiceConnector` interface.
3. Register the connector in the `RatingServiceFactory`.

### Example: SQL Database Connector

Here's a basic outline of how you might implement a connector for a SQL database:

```typescript
import { Rating, User, FilterState } from "../models/types";
import { BaseConnector } from "./RatingServiceConnector";
import { Pool } from 'pg'; // PostgreSQL client

export class SqlDatabaseConnector extends BaseConnector {
  private pool: Pool;
  
  constructor(connectionString: string) {
    super("sql");
    
    this.pool = new Pool({
      connectionString,
    });
  }
  
  // Implement all required methods using SQL queries
  async getUsers(): Promise<User[]> {
    return this.handleRequest(
      this.pool.query('SELECT id, name FROM users')
        .then(result => result.rows)
    );
  }
  
  // ... implement other methods
}
```

### Register the Connector in the Factory

Add your new connector to the `ConnectorType` enum and implement a case in the `createConnector` method:

```typescript
export enum ConnectorType {
  MOCK = 'mock',
  REST = 'rest',
  SQL = 'sql', // Add your new connector type
  // Add more connector types as needed
}

static createConnector(type: ConnectorType, config?: ConnectorConfig): RatingServiceConnector {
  switch (type) {
    case ConnectorType.REST:
      // ...
    case ConnectorType.SQL:
      if (!config?.connectionString) {
        throw new Error('Connection string is required for SQL connector');
      }
      return new SqlDatabaseConnector(config.connectionString);
    case ConnectorType.MOCK:
    default:
      return new MockConnector();
  }
}
```

## Using the Connector

The application uses the connector through the `RatingServiceContext` and several custom hooks:

- `useRatingsData`: For fetching ratings data.
- `useRatingSummary`: For fetching rating summary data.
- `useRatingDistribution`: For fetching rating distribution data.

Example usage:

```typescript
const MyComponent: React.FC = () => {
  const { ratings, loading, error } = useRatingsData({
    selectedUsers: [1, 2, 3],
    fromDate: '01/01/2025',
    toDate: '31/01/2025',
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {ratings.map(rating => (
        <div key={rating.id}>{rating.message}</div>
      ))}
    </div>
  );
};
```

## Environment Configuration

Connector configuration can be provided through environment variables. Use the `.env` file to configure the connector:

```
VITE_API_URL=https://api.example.com/v1
VITE_AUTH_TOKEN=your_auth_token_here
```

For database connections, you might use:

```
VITE_DB_CONNECTION_STRING=postgresql://username:password@localhost:5432/dbname
```

## Best Practices

1. **Error Handling**: Use the `handleRequest` method provided by the `BaseConnector` to ensure consistent error handling.
2. **Type Safety**: Ensure all methods return data that matches the expected types.
3. **Testing**: Create mock data that closely resembles your real data for testing.
4. **Performance**: Consider caching or pagination for large datasets.
5. **Security**: Never include sensitive credentials directly in the code. Use environment variables instead.

## Troubleshooting

If you encounter issues with your connector, check the following:

1. Ensure all methods are implemented correctly.
2. Check that your connector is properly registered in the factory.
3. Verify that the required configuration options are provided.
4. Look for errors in the browser console, which may indicate issues with data fetching.
5. Check network requests using browser developer tools to ensure requests are being made correctly.

## Conclusion

The connector layer provides a flexible way to connect the Rating Dashboard to various data sources. By implementing a new connector, you can adapt the application to work with your specific data source without changing the application code.