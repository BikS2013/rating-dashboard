# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Install: `npm install`
- Start dev server: `npm start`
- Build for production: `npm run build`
- Run tests: `npm test`
- Run a single test: `npm test -- -t "test name"`
- Lint code: `npm run lint`
- Type check: `npm run typecheck`

## Code Style Guidelines
- **Framework**: React functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Imports**: Group by category (React, third-party, local)
- **Typing**: Use TypeScript with explicit types (React.FC<Props>)
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Error Handling**: Use try/catch for API calls, provide fallback UI

## Component Structure
- Break UI into modular, single-responsibility components
- Follow Tailwind conventions for styling
- Use interfaces for data models (Rating, User, etc.)
- Maintain accessibility by including proper labels and ARIA attributes
- Optimize component rendering for performance