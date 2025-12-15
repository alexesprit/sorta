import type { AccessToken } from '@spotify/web-api-ts-sdk'
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

// Storage keys for tokens
const TOKEN_STORAGE_KEY = 'spotify_sdk:AuthorizationCodeWithPKCEStrategy:token'

// Check if we have stored tokens
function getStoredToken(): AccessToken | null {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as AccessToken
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

// Initialize SDK with access token if we have one, otherwise create unauthenticated instance
const storedToken = getStoredToken()
export let spotifyClient: SpotifyApi

if (storedToken) {
  // We have a stored token - use it
  spotifyClient = SpotifyApi.withAccessToken(clientId, storedToken)
} else {
  // No stored token - create SDK with user authorization (will be used for login)
  spotifyClient = SpotifyApi.withUserAuthorization(
    clientId,
    redirectUri,
    scopes,
  )
}

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
 * Redirects to Spotify login using PKCE
 */
export async function authenticate(): Promise<void> {
  // If we don't have an authenticating client, create one
  if (!(await isAuthenticated())) {
    spotifyClient = SpotifyApi.withUserAuthorization(
      clientId,
      redirectUri,
      scopes,
    )
  }
  await spotifyClient.authenticate()
}

/**
 * Logout and clear all authentication data
 * Clears SDK's stored tokens and reloads the page
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  spotifyClient.logOut()
  window.location.reload()
}
