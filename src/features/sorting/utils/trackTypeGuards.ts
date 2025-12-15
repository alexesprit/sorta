/**
 * Type guards and extractors for Spotify track types
 */

import type {
  Album,
  Episode,
  PlaylistedTrack,
  SimplifiedAlbum,
  SimplifiedTrack,
  Track,
  TrackItem,
} from '@spotify/web-api-ts-sdk'

/**
 * Type guard to check if a playlist track contains a Track (not an Episode)
 */
function isTrack(
  playlistTrack: PlaylistedTrack<TrackItem>,
): playlistTrack is PlaylistedTrack<Track> {
  return playlistTrack.track.type === 'track'
}

/**
 * Type guard to check if a track is a full track object (not simplified)
 */
function _isFullTrack(
  track: SimplifiedTrack | Track | Episode,
): track is Track {
  return 'album' in track && track.type === 'track'
}

/**
 * Type guard to check if album info includes release date
 * Note: In the new SDK, all Album types include release_date, so this is mainly for type narrowing
 */
function hasReleaseDate(album: SimplifiedAlbum | Album): album is Album {
  return 'release_date' in album
}

/**
 * Safely extract album name from a track
 * @returns Album name or empty string if not available
 */
export function getAlbumName(track: PlaylistedTrack<TrackItem>): string {
  if (isTrack(track)) {
    return track.track.album.name
  }
  return ''
}

/**
 * Safely extract release date from a track
 * @returns Release date string or empty string if not available
 */
export function getReleaseDate(track: PlaylistedTrack<TrackItem>): string {
  if (isTrack(track)) {
    const album = track.track.album
    if (hasReleaseDate(album)) {
      return album.release_date
    }
  }
  return ''
}

/**
 * Safely extract first artist name from a track
 * @returns Artist name or empty string if not available
 */
export function getArtistName(track: PlaylistedTrack<TrackItem>): string {
  if (isTrack(track)) {
    return track.track.artists?.[0]?.name ?? ''
  }
  return ''
}

/**
 * Safely extract track title
 * @returns Track name or empty string if not available
 */
export function getTrackTitle(track: PlaylistedTrack<TrackItem>): string {
  return track.track.name ?? ''
}

/**
 * Safely extract disc number from a track
 * @returns Disc number or 0 if not available
 */
export function getDiscNumber(track: PlaylistedTrack<TrackItem>): number {
  if (isTrack(track)) {
    return track.track.disc_number ?? 0
  }
  return 0
}

/**
 * Safely extract track number from a track
 * @returns Track number or 0 if not available
 */
export function getTrackNumber(track: PlaylistedTrack<TrackItem>): number {
  if (isTrack(track)) {
    return track.track.track_number ?? 0
  }
  return 0
}
