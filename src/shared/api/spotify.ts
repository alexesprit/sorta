import SpotifyWebApi from 'spotify-web-api-js'
import { generatePKCEData } from '@/features/auth/utils/pkce'
import { STORAGE_KEYS } from '@/shared/constants/storage'

const spotifyClient = new SpotifyWebApi()

// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures
const spotifyClientId = import.meta.env['VITE_SPOTIFY_CLIENT_ID']
const scopes =
  'playlist-read-private playlist-modify-private playlist-modify-public'
// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures
const redirectUri = import.meta.env['VITE_SPOTIFY_REDIRECT_URI']

/**
 * Maximum number of tracks that can be saved in a single API call
 * Limit imposed by Spotify API
 */
const maxTracksToSave = 100

export async function authorize(): Promise<void> {
  // Generate code verifier and challenge for PKCE
  const { codeVerifier, codeChallenge, state } = await generatePKCEData()

  // Store code verifier and state in sessionStorage for later use
  sessionStorage.setItem(STORAGE_KEYS.OAUTH_CODE_VERIFIER, codeVerifier)
  sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state)

  const params = new URLSearchParams({
    client_id: spotifyClientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: state,
    scope: scopes,
  })

  const url = `https://accounts.spotify.com/authorize?${params.toString()}`
  document.location.href = url
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export async function exchangeCodeForToken(
  code: string,
): Promise<TokenResponse> {
  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.OAUTH_CODE_VERIFIER)

  if (!codeVerifier) {
    throw new Error('Code verifier not found')
  }

  const params = new URLSearchParams({
    client_id: spotifyClientId,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`)
  }

  const data = await response.json()

  // Clear stored values after successful exchange
  sessionStorage.removeItem(STORAGE_KEYS.OAUTH_CODE_VERIFIER)
  sessionStorage.removeItem(STORAGE_KEYS.OAUTH_STATE)

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  }
}

export async function refreshAccessToken(): Promise<TokenResponse> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN)

  if (!refreshToken) {
    throw new Error('Refresh token not found')
  }

  const params = new URLSearchParams({
    client_id: spotifyClientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // Use existing if not returned
    expires_in: data.expires_in,
  }
}

export function setAccessToken(token: string | null): void {
  spotifyClient.setAccessToken(token)
}

export async function getMyPlaylists(): Promise<
  SpotifyApi.PlaylistObjectSimplified[]
> {
  const myId = await getMyId()
  const { items } = await spotifyClient.getUserPlaylists(myId)

  return items
}

export async function getPlaylistTracks(
  playlistId: string,
): Promise<SpotifyApi.PlaylistTrackObject[]> {
  const tracks: SpotifyApi.PlaylistTrackObject[] = []

  let limit = 0
  let offset = 0
  let total = 0

  do {
    const response = await spotifyClient.getPlaylistTracks(playlistId, {
      offset: offset + limit,
    })
    ;({ limit, offset, total } = response)

    tracks.push(...response.items)
  } while (total > limit + offset)

  return tracks
}

export async function setPlaylistTracks(
  playlistId: string,
  tracks: SpotifyApi.PlaylistTrackObject[],
): Promise<void> {
  const trackIds = tracks.map((track) => `spotify:track:${track.track.id}`)

  for (let offset = 0; offset < trackIds.length; offset += maxTracksToSave) {
    const tracksSlice = trackIds.slice(offset, offset + maxTracksToSave)

    if (offset === 0) {
      await spotifyClient.replaceTracksInPlaylist(playlistId, tracksSlice)
    } else {
      await spotifyClient.addTracksToPlaylist(playlistId, tracksSlice)
    }
  }
}

export async function getMyId(): Promise<string> {
  const { id } = await spotifyClient.getMe()

  return id
}
