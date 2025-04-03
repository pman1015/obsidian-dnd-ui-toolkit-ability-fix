# Development Guidelines for Obsidian Sample Plugin

## Build Commands
- `npm run dev` - Start compilation in watch mode
- `npm run build` - Build production version (with TypeScript checks)
- `npm version patch|minor|major` - Bump version
- `eslint main.ts` - Run ESLint on main.ts file
- `eslint ./lib/` - Run ESLint on all files in lib directory

## Code Style
- **TypeScript:** Use strict type checking with noImplicitAny and strictNullChecks
- **Imports:** Group by external packages, then local files
- **Components:** Use React functional components with explicit typing
- **Naming:** PascalCase for components, camelCase for functions/variables
- **Types:** Define types in lib/types.ts with explicit interfaces
- **Error Handling:** Use nullable types with default values or early returns
- **File Structure:** Keep related functionality in the same directory
- **Helpers:** Create utility functions for reusable logic
- **React:** Use JSX syntax with function components and explicit props types
- **Formatting:** Use consistent indentation and trailing commas

## Project Structure
- `main.ts` - Plugin entry point
- `lib/` - Shared components, types, and utilities
- `manifest.json` - Plugin metadata
- `styles.css` - Global styles