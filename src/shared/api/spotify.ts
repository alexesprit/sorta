import type {
  PlaylistedTrack,
  SimplifiedPlaylist,
} from '@spotify/web-api-ts-sdk'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { spotifyClient } from './spotifyClient'

/**
 * Maximum number of tracks that can be saved in a single API call
 * Limit imposed by Spotify API
 */
const maxTracksToSave = 100

export async function getMyPlaylists(): Promise<SimplifiedPlaylist[]> {
  const response = await spotifyClient.currentUser.playlists.playlists()
  return response.items
}

interface PlaylistTracksProgress {
  loaded: number
  total: number
}

type PlaylistTracksProgressCallback = (progress: PlaylistTracksProgress) => void

export async function getPlaylistTracks(
  playlistId: string,
  onProgress?: PlaylistTracksProgressCallback,
): Promise<PlaylistedTrack[]> {
  const tracks: PlaylistedTrack[] = []

  const limit = 50
  let offset = 0
  let response = await spotifyClient.playlists.getPlaylistItems(
    playlistId,
    undefined,
    undefined,
    limit,
    offset,
  )

  tracks.push(...response.items)
  onProgress?.({ loaded: tracks.length, total: response.total })

  while (response.next) {
    offset += limit
    response = await spotifyClient.playlists.getPlaylistItems(
      playlistId,
      undefined,
      undefined,
      limit,
      offset,
    )
    tracks.push(...response.items)
    onProgress?.({ loaded: tracks.length, total: response.total })
  }

  return tracks
}

interface PlaylistTracksSaveProgress {
  saved: number
  total: number
}

type PlaylistTracksSaveProgressCallback = (
  progress: PlaylistTracksSaveProgress,
) => void

export async function setPlaylistTracks(
  playlistId: string,
  tracks: PlaylistedTrack[],
  onProgress?: PlaylistTracksSaveProgressCallback,
): Promise<void> {
  const trackIds = tracks.map((track) => `spotify:track:${track.track.id}`)

  // Handle empty playlist case - clear all tracks
  if (trackIds.length === 0) {
    await spotifyClient.playlists.updatePlaylistItems(playlistId, {
      uris: [],
    })
    return
  }

  for (let offset = 0; offset < trackIds.length; offset += maxTracksToSave) {
    const tracksSlice = trackIds.slice(offset, offset + maxTracksToSave)

    if (offset === 0) {
      await spotifyClient.playlists.updatePlaylistItems(playlistId, {
        uris: tracksSlice,
      })
    } else {
      await spotifyClient.playlists.addItemsToPlaylist(playlistId, tracksSlice)
    }

    const saved = Math.min(offset + maxTracksToSave, trackIds.length)
    onProgress?.({ saved, total: trackIds.length })
  }
}

export async function getMyId(): Promise<string> {
  const profile = await spotifyClient.currentUser.profile()
  return profile.id
}

export async function getUsername(): Promise<string> {
  const cachedUsername = localStorage.getItem(STORAGE_KEYS.SPOTIFY_USERNAME)

  if (cachedUsername) {
    return cachedUsername
  }

  const profile = await spotifyClient.currentUser.profile()
  const username = profile.display_name || 'User'

  localStorage.setItem(STORAGE_KEYS.SPOTIFY_USERNAME, username)

  return username
}
