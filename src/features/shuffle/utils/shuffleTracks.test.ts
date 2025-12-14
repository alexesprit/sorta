import { describe, expect, it } from 'vitest'
import { shuffleTracks } from '@/features/shuffle/utils/shuffleTracks'
import { getArtistName } from '@/features/sorting/utils/trackTypeGuards'

// Mock helper to create track objects
function createTrack(
  id: string,
  artist: string,
  album: string,
  popularity: number,
): SpotifyApi.PlaylistTrackObject {
  return {
    added_at: '2023-01-01T00:00:00Z',
    added_by: {
      href: '',
      id: 'user',
      type: 'user',
      uri: 'spotify:user:user',
      external_urls: { spotify: '' },
    },
    is_local: false,
    track: {
      id,
      name: `Track ${id}`,
      type: 'track',
      popularity,
      album: {
        id: `album-${album}`,
        name: album,
        album_type: 'album',
        external_urls: { spotify: '' },
        href: '',
        images: [],
        type: 'album',
        uri: `spotify:album:${album}`,
      },
      artists: [
        {
          id: `artist-${artist}`,
          name: artist,
          type: 'artist',
          uri: `spotify:artist:${artist}`,
          external_urls: { spotify: '' },
          href: '',
        },
      ],
      available_markets: [],
      disc_number: 1,
      duration_ms: 180000,
      explicit: false,
      external_ids: {},
      external_urls: { spotify: '' },
      href: '',
      preview_url: undefined,
      track_number: 1,
      uri: `spotify:track:${id}`,
    } as unknown as SpotifyApi.TrackObjectFull,
  }
}

describe('shuffleTracks', () => {
  it('should handle empty list', () => {
    const result = shuffleTracks([], {
      weighted: 'random',
      smart: { artist: true, album: true },
    })
    expect(result).toEqual([])
  })

  it('should handle single track', () => {
    const track = createTrack('1', 'Artist A', 'Album X', 50)
    const result = shuffleTracks([track], {
      weighted: 'random',
      smart: { artist: true, album: true },
    })
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(track)
  })

  it('should separate artists when possible', () => {
    const tracks = [
      createTrack('1', 'Artist A', 'Album X', 50),
      createTrack('2', 'Artist A', 'Album X', 50),
      createTrack('3', 'Artist B', 'Album Y', 50),
      createTrack('4', 'Artist B', 'Album Y', 50),
    ]

    const result = shuffleTracks(tracks, {
      weighted: 'random',
      smart: { artist: true, album: false },
    })

    // Check for separation
    let separationCount = 0
    for (let i = 0; i < result.length - 1; i++) {
      const currentTrack = result[i]
      const nextTrack = result[i + 1]
      if (currentTrack && nextTrack) {
        const currentArtist = getArtistName(currentTrack)
        const nextArtist = getArtistName(nextTrack)
        if (currentArtist !== nextArtist) {
          separationCount++
        }
      }
    }

    // In a 4 track list with 2 artists (2 tracks each), optimal shuffle is A-B-A-B or B-A-B-A
    // This gives 3 separations. A-A-B-B gives 1 separation.
    // The algorithm tries its best.
    expect(result).toHaveLength(4)
    expect(separationCount).toBeGreaterThanOrEqual(2)
  })

  it('should handle impossible separation gracefully', () => {
    // 3 tracks by Artist A, 1 track by Artist B
    // Impossible to fully separate: A-B-A-A is best case
    const tracks = [
      createTrack('1', 'Artist A', 'Album X', 50),
      createTrack('2', 'Artist A', 'Album X', 50),
      createTrack('3', 'Artist A', 'Album X', 50),
      createTrack('4', 'Artist B', 'Album Y', 50),
    ]

    const result = shuffleTracks(tracks, {
      weighted: 'random',
      smart: { artist: true, album: false },
    })

    expect(result).toHaveLength(4)
    // Should contain all original tracks
    const ids = result.map((t) => t.track?.id).sort()
    expect(ids).toEqual(['1', '2', '3', '4'])
  })

  it('should prioritize high popularity', () => {
    // 100 tracks: 50 popular (100), 50 unpopular (0)
    // Run multiple times to get statistical significance?
    // Or just check that popular tracks appear earlier on average?
    // Let's create a small set with extreme difference
    const popular = createTrack('p', 'Pop', 'Pop', 100)
    const obscure = createTrack('o', 'Obs', 'Obs', 0)

    // Create 100 of each
    const tracks: SpotifyApi.PlaylistTrackObject[] = []
    for (let i = 0; i < 50; i++) {
      tracks.push({
        ...popular,
        track: { ...popular.track, id: `p${i}` } as SpotifyApi.TrackObjectFull,
      })
    }
    for (let i = 0; i < 50; i++) {
      tracks.push({
        ...obscure,
        track: { ...obscure.track, id: `o${i}` } as SpotifyApi.TrackObjectFull,
      })
    }

    const result = shuffleTracks(tracks, {
      weighted: 'popularity-high',
      smart: { artist: false, album: false },
    })

    // Check first 20 tracks
    const first20 = result.slice(0, 20)
    const popularCount = first20.filter(
      (t) => (t.track as SpotifyApi.TrackObjectFull).popularity === 100,
    ).length

    // With weighted shuffle, popular tracks should be overrepresented at the start
    // In random shuffle, expected is 10. With high weight, should be significantly more.
    expect(popularCount).toBeGreaterThan(10)
  })

  it('should prioritize low popularity', () => {
    const popular = createTrack('p', 'Pop', 'Pop', 100)
    const obscure = createTrack('o', 'Obs', 'Obs', 0)

    const tracks: SpotifyApi.PlaylistTrackObject[] = []
    for (let i = 0; i < 50; i++) {
      tracks.push({
        ...popular,
        track: { ...popular.track, id: `p${i}` } as SpotifyApi.TrackObjectFull,
      })
    }
    for (let i = 0; i < 50; i++) {
      tracks.push({
        ...obscure,
        track: { ...obscure.track, id: `o${i}` } as SpotifyApi.TrackObjectFull,
      })
    }

    const result = shuffleTracks(tracks, {
      weighted: 'popularity-low',
      smart: { artist: false, album: false },
    })

    const first20 = result.slice(0, 20)
    const obscureCount = first20.filter(
      (t) => (t.track as SpotifyApi.TrackObjectFull).popularity === 0,
    ).length

    expect(obscureCount).toBeGreaterThan(10)
  })
})
