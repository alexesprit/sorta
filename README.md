# sorta

> Web application for sorting your Spotify playlists using custom sort rules

Sorta is a web application that allows you to select and sort your Spotify playlists using customizable sort rules. For more complex cases, consider using other applications like [Sortify][sortify].

An online instance is available at [sorta.alexesprit.com][usesorta].

## Features

- **Playlist Selection**: Choose from your Spotify playlists to sort
- **Custom Sort Rules**: Define sorting criteria with keys like `artist`, `album`, `release_date`, and `title`
- **Flexible Ordering**: Sort in ascending or descending order
- **Spotify Integration**: Uses Spotify's OAuth 2.0 PKCE flow for secure authentication

## Sort Rules Format

Sort rules use the format: `key/order key/order ...` (space-separated)

- **Keys**: `artist`, `album`, `release_date`, `title`
- **Orders**: `asc` (default), `desc`
- **Example**: `artist release_date/desc` (sort by artist ascending, then release date descending)

## Development

```bash
# Install dependencies
npm install

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

## Environment Setup

Create a `.env` file with the following variables:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

## License

Licensed under the [MIT License](./LICENSE).

[sortify]: https://sortspotifyplaylists.com/
[usesorta]: https://sorta.alexesprit.com/
