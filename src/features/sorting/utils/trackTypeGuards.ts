/**
 * Type guards and extractors for Spotify track types
 */

type PlaylistTrack = SpotifyApi.PlaylistTrackObject

/**
 * Type guard to check if a track is a full track object (not an episode)
 */
function isFullTrack(
  track:
    | SpotifyApi.TrackObjectSimplified
    | SpotifyApi.TrackObjectFull
    | SpotifyApi.EpisodeObjectFull,
): track is SpotifyApi.TrackObjectFull {
  return 'album' in track && track.type === 'track'
}

/**
 * Type guard to check if album info includes release date
 */
function hasReleaseDate(
  album: SpotifyApi.AlbumObjectSimplified,
): album is SpotifyApi.AlbumObjectFull {
  return 'release_date' in album
}

/**
 * Safely extract album name from a track
 * @returns Album name or empty string if not available
 */
export function getAlbumName(track: PlaylistTrack): string {
  if (isFullTrack(track.track)) {
    return track.track.album.name
  }
  return ''
}

/**
 * Safely extract release date from a track
 * @returns Release date string or empty string if not available
 */
export function getReleaseDate(track: PlaylistTrack): string {
  if (isFullTrack(track.track)) {
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
export function getArtistName(track: PlaylistTrack): string {
  const trackInfo = track.track as SpotifyApi.TrackObjectFull
  return trackInfo.artists?.[0]?.name ?? ''
}

/**
 * Safely extract track title
 * @returns Track name or empty string if not available
 */
export function getTrackTitle(track: PlaylistTrack): string {
  return track.track?.name ?? ''
}

/**
 * Safely extract disc number from a track
 * @returns Disc number or 0 if not available
 */
export function getDiscNumber(track: PlaylistTrack): number {
  const trackInfo = track.track as SpotifyApi.TrackObjectFull
  return trackInfo.disc_number ?? 0
}

/**
 * Safely extract track number from a track
 * @returns Track number or 0 if not available
 */
export function getTrackNumber(track: PlaylistTrack): number {
  const trackInfo = track.track as SpotifyApi.TrackObjectFull
  return trackInfo.track_number ?? 0
}
