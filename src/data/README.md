# Data Directory

## Deprecation Notice

The `mockData.ts` file is being phased out in favor of using the connector-based architecture. For new development:

- Use the `JsonFileConnector` to load data from a JSON file
- Use constants from `src/utils/constants.ts` for application constants like timePeriodOptions and ratingCategories
- Use date utility functions from `src/utils/dateUtils.ts` for date formatting and parsing

## JSON Data Format

The application now uses a JSON-based data format that can be loaded from the `public/sample-ratings.json` file. The JSON format follows this structure:

```typescript
{
  "users": User[],
  "ratings": Rating[],
  "categories": { id: string; name: string; range: [number, number] }[]
}
```

## Migration Path

If you need to add new data for testing, please consider:

1. Adding it to the `public/sample-ratings.json` file
2. Using the JsonFileConnector to load and work with the data
3. Updating environment variables in `.env` or `.env.local` to point to your JSON data file

The MockConnector is still available for backward compatibility, but may be removed in future versions.