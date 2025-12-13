# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sorta is a web application for sorting Spotify playlists using custom sort rules. Built with React, TypeScript, Vite, and Tailwind CSS.

## Development Commands

```bash
# Start dev server (runs on http://127.0.0.1:5173)
npm start

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Check for unused dependencies/exports
npm run knip
npm run knip:fix

# Full CI check (lint + typecheck + knip + test + build)
npm run ci

# Preview production build
npm run preview
```

## Architecture

### Feature-Based Structure

The codebase uses a feature-based architecture under `src/features/`:

- **auth**: Spotify OAuth 2.0 PKCE authentication flow with token refresh
- **playlists**: Playlist loading, display, and selection
- **sorting**: Sort rule parsing, track sorting logic, and UI
- **layout**: Header and main content layout components

### Shared Resources (`src/shared/`)

- **api/spotify.ts**: Spotify API client wrapper using `spotify-web-api-js`
- **components/ui/**: Reusable UI components (built with Radix UI + Tailwind)
- **hooks/**: Shared React hooks

### Path Aliases

TypeScript path alias `@/*` maps to `src/*` (configured in tsconfig.json and vite.config.ts).

## Authentication Flow

The app uses Spotify's OAuth 2.0 PKCE flow (not the legacy implicit grant):

1. **authorize()** generates code verifier/challenge and redirects to Spotify
2. **exchangeCodeForToken()** exchanges authorization code for access/refresh tokens
3. **refreshAccessToken()** automatically refreshes tokens before expiry
4. Tokens stored in localStorage, OAuth state in sessionStorage
5. App.tsx handles the full auth lifecycle including token refresh scheduling

## Sort Rules System

### Format

Sort rules use the format: `key/order key/order ...` (space-separated)

- **Keys**: `artist`, `album`, `release_date`, `title`
- **Orders**: `asc` (default), `desc`
- Example: `artist release_date/desc` (sort by artist ascending, then release date descending)

### Implementation

- **parseSortRules()**: Parses string format into typed SortRule tuples
- **sortTracks()**: Applies multiple sort rules in order (features/sorting/utils/sortTracks.ts)
- Sorting uses `localeCompare()` for string comparison with proper locale handling

## Environment Variables

Required environment variables (prefix with `VITE_`):

- `VITE_SPOTIFY_CLIENT_ID`: Spotify application client ID
- `VITE_SPOTIFY_REDIRECT_URI`: OAuth callback URL

## Testing

- Framework: Vitest with globals enabled
- Test files: `*.test.ts` co-located with source files
- Run with `npm test` or `npm run ci` for full validation

## Tooling

- **Biome**: Linting and formatting (replaces ESLint + Prettier)
- **Knip**: Detects unused dependencies and exports
- **TypeScript**: Strict mode with path aliases
- **Vite**: Build tool with React plugin
- **Tailwind CSS**: Styling (PostCSS v4)
