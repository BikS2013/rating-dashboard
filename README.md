# Chatbot Rating Dashboard

A React-based dashboard for visualizing and analyzing user ratings for a chatbot application.

## Features

- Collapsible sidebar for filtering data
- Filter by users, time period, and rating categories
- Stacked bar chart showing rating distribution over time
- Summary tiles for rating categories with counts
- Detailed view of individual ratings with expandable messages
- User distribution chart showing ratings by user

## Technology Stack

- React 18
- TypeScript
- Tailwind CSS for styling
- Chart.js with react-chartjs-2 for visualizations
- Font Awesome for icons
- Vite for build tooling

## Project Structure

```
/src
  /assets            # Images and static assets
  /components        # React components
    /layout          # Layout components (sidebar, etc.)
    /dashboard       # Dashboard components (charts, summary, etc.)
    /shared          # Shared/reusable components
  /context           # React context providers
  /hooks             # Custom React hooks
  /models            # TypeScript interfaces and types
  /data              # Mock data for testing
  /utils             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
# or
yarn install
```

### Development

Run the development server:

```bash
npm start
# or
yarn start
```

This will start the development server at [http://localhost:5173](http://localhost:5173).

### Build

To build the project for production:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Data Model

The dashboard works with the following data models:

- **User**: Information about users providing ratings
- **Rating**: Individual ratings with score, message, and metadata
- **Time Period**: Options for filtering by time range
- **Rating Category**: Categorization of ratings by score range

## Features in Detail

### Sidebar Filters

- User selection with expand/collapse functionality
- Time period dropdown with preset options
- Custom date range selection
- Rating category checkboxes

### Dashboard Views

- Bar chart showing rating distribution over time
- Summary tiles showing counts by category
- Detailed view of individual ratings
- User distribution chart

## Alternative Chart Implementation

This project includes backup implementations of the chart components using Recharts instead of Chart.js. To use Recharts:

1. Install Recharts:
```bash
npm install recharts
```

2. Use the Recharts implementations that are saved as backup files:
```
src/components/dashboard/SimpleBarChart.recharts.tsx
src/components/dashboard/RatingBarChart.recharts.tsx
src/components/dashboard/UserDistribution.recharts.tsx
src/utils/chartUtilsRecharts.ts
```

3. Update the imports in the components to use Recharts instead of Chart.js.

## License

MIT