import { SpotifyApi } from '@spotify/web-api-ts-sdk'

// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures
const clientId = import.meta.env['VITE_SPOTIFY_CLIENT_ID']
// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures
const redirectUri = import.meta.env['VITE_SPOTIFY_REDIRECT_URI']

const scopes = [
  'playlist-read-private',
  'playlist-modify-private',
  'playlist-modify-public',
]

// Initialize SDK with user authorization
// This enables automatic token refresh when access token expires
// The SDK manages token storage in localStorage automatically
export const spotifyClient: SpotifyApi = SpotifyApi.withUserAuthorization(
  clientId,
  redirectUri,
  scopes,
)

/**
 * Check if user is authenticated
 * Returns true if access token exists, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await spotifyClient.getAccessToken()
    return token !== null
  } catch {
    return false
  }
}

/**
 * Trigger authentication flow
 * Redirects to Spotify login using PKCE or completes OAuth callback
 */
export async function authenticate(): Promise<void> {
  await spotifyClient.authenticate()
}

/**
 * Logout and clear all authentication data
 * SDK's logOut() clears stored tokens automatically
 */
export function logout(): void {
  spotifyClient.logOut()
  window.location.reload()
}
