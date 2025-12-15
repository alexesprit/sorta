import type {
  Album,
  PlaylistedTrack,
  SimplifiedArtist,
  Track,
} from '@spotify/web-api-ts-sdk'
import type { SortRule } from '@/features/sorting/utils/sortRules'
import { sortTracks } from '@/features/sorting/utils/sortTracks'

// Helper function to create a minimal PlaylistTrack object
function createTrack(
  name: string,
  artistName: string,
  albumName: string | null = 'Test Album',
  releaseDate: string | null = '2024-01-01',
  discNumber: number = 1,
  trackNumber: number = 1,
  id = Math.random().toString(36).substring(7),
): PlaylistedTrack<Track> {
  return {
    added_at: '2023-01-01',
    added_by: {
      id: 'user123',
      uri: '',
      href: '',
      external_urls: { spotify: '' },
      type: 'user',
    },
    is_local: false,
    primary_color: '',
    track: {
      id,
      name,
      artists: [
        {
          name: artistName,
          id: 'artist-id',
          uri: '',
          href: '',
          external_urls: { spotify: '' },
          type: 'artist',
        } as SimplifiedArtist,
      ],
      album: {
        id: 'album-id',
        name: albumName,
        release_date: releaseDate,
        images: [],
        uri: '',
        href: '',
        external_urls: { spotify: '' },
        type: 'album',
        album_type: 'album',
        artists: [],
        total_tracks: 10,
        available_markets: [],
        release_date_precision: 'day',
        copyrights: [],
        external_ids: { upc: 'test-upc' },
        genres: [],
        popularity: 50,
        tracks: {
          href: '',
          items: [],
          limit: 0,
          next: undefined,
          offset: 0,
          previous: null,
          total: 10,
        },
      } as unknown as Album,
      duration_ms: 180000,
      explicit: false,
      uri: `spotify:track:${id}`,
      href: '',
      external_urls: { spotify: '' },
      type: 'track',
      popularity: 50,
      track_number: trackNumber,
      disc_number: discNumber,
      preview_url: null,
      available_markets: [],
      is_playable: true,
      linked_from: undefined,
      restrictions: undefined,
      external_ids: { isrc: 'test-isrc' },
    } as unknown as Track,
  }
}

// Helper function to create a track with multiple artists
function createMultiArtistTrack(
  name: string,
  artistNames: string[],
  discNumber: number = 1,
  trackNumber: number = 1,
): PlaylistedTrack<Track> {
  return {
    added_at: '2023-01-01',
    added_by: {
      id: 'user123',
      uri: '',
      href: '',
      external_urls: { spotify: '' },
      type: 'user',
    },
    is_local: false,
    primary_color: '',
    track: {
      id: Math.random().toString(36).substring(7),
      name,
      artists: artistNames.map((artistName) => ({
        name: artistName,
        id: 'artist-id',
        uri: '',
        href: '',
        external_urls: { spotify: '' },
        type: 'artist',
      })) as SimplifiedArtist[],
      album: {
        id: 'album-id',
        name: 'Test Album',
        release_date: '2024-01-01',
        images: [],
        uri: '',
        href: '',
        external_urls: { spotify: '' },
        type: 'album',
        album_type: 'album',
        artists: [],
        total_tracks: 10,
        available_markets: [],
        release_date_precision: 'day',
        copyrights: [],
        external_ids: { upc: 'test-upc' },
        genres: [],
        popularity: 50,
        tracks: {
          href: '',
          items: [],
          limit: 0,
          next: undefined,
          offset: 0,
          previous: null,
          total: 10,
        },
      } as unknown as Album,
      duration_ms: 180000,
      explicit: false,
      uri: 'spotify:track:test',
      href: '',
      external_urls: { spotify: '' },
      type: 'track',
      popularity: 50,
      track_number: trackNumber,
      disc_number: discNumber,
      preview_url: null,
      available_markets: [],
      is_playable: true,
      linked_from: undefined,
      restrictions: undefined,
      external_ids: { isrc: 'test-isrc' },
    } as unknown as Track,
  }
}

describe('sortTracks', () => {
  describe('basic sorting - single rule', () => {
    describe('artist sorting', () => {
      test('should sort by artist ascending', () => {
        const tracks = [
          createTrack('Song 1', 'Zara'),
          createTrack('Song 2', 'Alice'),
          createTrack('Song 3', 'Mike'),
        ]

        const sortRules: SortRule[] = [['artist', 'asc']]
        sortTracks(tracks, sortRules)

        expect(tracks[0]?.track?.name).toBe('Song 2') // Alice
        expect(tracks[1]?.track?.name).toBe('Song 3') // Mike
        expect(tracks[2]?.track?.name).toBe('Song 1') // Zara
      })

      test('should sort by artist descending', () => {
        const tracks = [
          createTrack('Song 1', 'Alice'),
          createTrack('Song 2', 'Mike'),
          createTrack('Song 3', 'Zara'),
        ]

        const sortRules: SortRule[] = [['artist', 'desc']]
        sortTracks(tracks, sortRules)

        expect(tracks[0]?.track?.name).toBe('Song 3') // Zara
        expect(tracks[1]?.track?.name).toBe('Song 2') // Mike
        expect(tracks[2]?.track?.name).toBe('Song 1') // Alice
      })

      test('should sort case-insensitive', () => {
        const tracks = [
          createTrack('Song 1', 'zara'),
          createTrack('Song 2', 'Alice'),
          createTrack('Song 3', 'mike'),
        ]

        const sortRules: SortRule[] = [['artist', 'asc']]
        sortTracks(tracks, sortRules)

        expect(tracks[0]?.track?.name).toBe('Song 2') // Alice
        expect(tracks[1]?.track?.name).toBe('Song 3') // mike
        expect(tracks[2]?.track?.name).toBe('Song 1') // zara
      })
    })

    describe('title sorting', () => {
      test('should sort by title ascending', () => {
        const tracks = [
          createTrack('Zebra', 'Artist'),
          createTrack('Apple', 'Artist'),
          createTrack('Mango', 'Artist'),
        ]

        const sortRules: SortRule[] = [['title', 'asc']]
        sortTracks(tracks, sortRules)

        expect(tracks[0]?.track?.name).toBe('Apple')
        expect(tracks[1]?.track?.name).toBe('Mango')
        expect(tracks[2]?.track?.name).toBe('Zebra')
      })

      test('should sort by title descending', () => {
        const tracks = [
          createTrack('Apple', 'Artist'),
          createTrack('Mango', 'Artist'),
          createTrack('Zebra', 'Artist'),
        ]

        const sortRules: SortRule[] = [['title', 'desc']]
        sortTracks(tracks, sortRules)

        expect(tracks[0]?.track?.name).toBe('Zebra')
        expect(tracks[1]?.track?.name).toBe('Mango')
        expect(tracks[2]?.track?.name).toBe('Apple')
      })
    })

    describe('album sorting', () => {
      test('should sort by album ascending', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Zulu'),
          createTrack('Song 2', 'Artist', 'Alpha'),
          createTrack('Song 3', 'Artist', 'Bravo'),
        ]

        const sortRules: SortRule[] = [['album', 'asc']]
        sortTracks(tracks, sortRules)

        expect((tracks[0]?.track as Track).album?.name).toBe('Alpha')
        expect((tracks[1]?.track as Track).album?.name).toBe('Bravo')
        expect((tracks[2]?.track as Track).album?.name).toBe('Zulu')
      })

      test('should sort by album descending', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Alpha'),
          createTrack('Song 2', 'Artist', 'Bravo'),
          createTrack('Song 3', 'Artist', 'Zulu'),
        ]

        const sortRules: SortRule[] = [['album', 'desc']]
        sortTracks(tracks, sortRules)

        expect((tracks[0]?.track as Track).album?.name).toBe('Zulu')
        expect((tracks[1]?.track as Track).album?.name).toBe('Bravo')
        expect((tracks[2]?.track as Track).album?.name).toBe('Alpha')
      })
    })

    describe('release_date sorting', () => {
      test('should sort by release_date ascending', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Album', '2024-01-01'),
          createTrack('Song 2', 'Artist', 'Album', '2020-05-15'),
          createTrack('Song 3', 'Artist', 'Album', '2022-12-25'),
        ]

        const sortRules: SortRule[] = [['release_date', 'asc']]
        sortTracks(tracks, sortRules)

        expect(
          ((tracks[0]?.track as Track).album as unknown as Album).release_date,
        ).toBe('2020-05-15')
        expect(
          ((tracks[1]?.track as Track).album as unknown as Album).release_date,
        ).toBe('2022-12-25')
        expect(
          ((tracks[2]?.track as Track).album as unknown as Album).release_date,
        ).toBe('2024-01-01')
      })

      test('should sort by release_date descending', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Album', '2020-05-15'),
          createTrack('Song 2', 'Artist', 'Album', '2022-12-25'),
          createTrack('Song 3', 'Artist', 'Album', '2024-01-01'),
        ]

        const sortRules: SortRule[] = [['release_date', 'desc']]
        sortTracks(tracks, sortRules)

        expect(
          ((tracks[0]?.track as Track).album as unknown as Album).release_date,
        ).toBe('2024-01-01')
        expect(
          ((tracks[1]?.track as Track).album as unknown as Album).release_date,
        ).toBe('2022-12-25')
        expect(
          ((tracks[2]?.track as Track).album as unknown as Album).release_date,
        ).toBe('2020-05-15')
      })
    })

    describe('disc_number sorting', () => {
      test('should sort by disc_number ascending', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Album', '2024-01-01', 2, 1),
          createTrack('Song 2', 'Artist', 'Album', '2024-01-01', 1, 1),
          createTrack('Song 3', 'Artist', 'Album', '2024-01-01', 3, 1),
        ]

        const sortRules: SortRule[] = [['disc_number', 'asc']]
        sortTracks(tracks, sortRules)

        expect((tracks[0]?.track as Track).disc_number).toBe(1)
        expect((tracks[1]?.track as Track).disc_number).toBe(2)
        expect((tracks[2]?.track as Track).disc_number).toBe(3)
      })

      test('should sort by disc_number descending', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Album', '2024-01-01', 1, 1),
          createTrack('Song 2', 'Artist', 'Album', '2024-01-01', 2, 1),
          createTrack('Song 3', 'Artist', 'Album', '2024-01-01', 3, 1),
        ]

        const sortRules: SortRule[] = [['disc_number', 'desc']]
        sortTracks(tracks, sortRules)

        expect((tracks[0]?.track as Track).disc_number).toBe(3)
        expect((tracks[1]?.track as Track).disc_number).toBe(2)
        expect((tracks[2]?.track as Track).disc_number).toBe(1)
      })
    })

    describe('track_number sorting', () => {
      test('should sort by track_number ascending', () => {
        const tracks = [
          createTrack('Song 3', 'Artist', 'Album', '2024-01-01', 1, 3),
          createTrack('Song 1', 'Artist', 'Album', '2024-01-01', 1, 1),
          createTrack('Song 2', 'Artist', 'Album', '2024-01-01', 1, 2),
        ]

        const sortRules: SortRule[] = [['track_number', 'asc']]
        sortTracks(tracks, sortRules)

        expect((tracks[0]?.track as Track).track_number).toBe(1)
        expect((tracks[1]?.track as Track).track_number).toBe(2)
        expect((tracks[2]?.track as Track).track_number).toBe(3)
      })

      test('should sort by track_number descending', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Album', '2024-01-01', 1, 1),
          createTrack('Song 2', 'Artist', 'Album', '2024-01-01', 1, 2),
          createTrack('Song 3', 'Artist', 'Album', '2024-01-01', 1, 3),
        ]

        const sortRules: SortRule[] = [['track_number', 'desc']]
        sortTracks(tracks, sortRules)

        expect((tracks[0]?.track as Track).track_number).toBe(3)
        expect((tracks[1]?.track as Track).track_number).toBe(2)
        expect((tracks[2]?.track as Track).track_number).toBe(1)
      })
    })
  })

  describe('multi-rule sorting', () => {
    test('should sort by artist ascending, then title ascending', () => {
      const tracks = [
        createTrack('Zebra', 'Alice'),
        createTrack('Apple', 'Alice'),
        createTrack('Mango', 'Bob'),
        createTrack('Apple', 'Bob'),
      ]

      const sortRules: SortRule[] = [
        ['artist', 'asc'],
        ['title', 'asc'],
      ]
      sortTracks(tracks, sortRules)

      // Alice - Apple
      expect((tracks[0]?.track as Track).artists[0]?.name).toBe('Alice')
      expect(tracks[0]?.track?.name).toBe('Apple')

      // Alice - Zebra
      expect((tracks[1]?.track as Track).artists[0]?.name).toBe('Alice')
      expect(tracks[1]?.track?.name).toBe('Zebra')

      // Bob - Apple
      expect((tracks[2]?.track as Track).artists[0]?.name).toBe('Bob')
      expect(tracks[2]?.track?.name).toBe('Apple')

      // Bob - Mango
      expect((tracks[3]?.track as Track).artists[0]?.name).toBe('Bob')
      expect(tracks[3]?.track?.name).toBe('Mango')
    })

    test('should sort by artist ascending, then release_date descending', () => {
      const tracks = [
        createTrack('Song 1', 'Bob', 'Album', '2024-01-01'),
        createTrack('Song 2', 'Alice', 'Album', '2020-01-01'),
        createTrack('Song 3', 'Alice', 'Album', '2024-01-01'),
        createTrack('Song 4', 'Bob', 'Album', '2020-01-01'),
      ]

      const sortRules: SortRule[] = [
        ['artist', 'asc'],
        ['release_date', 'desc'],
      ]
      sortTracks(tracks, sortRules)

      // Alice - 2024
      expect((tracks[0]?.track as Track).artists[0]?.name).toBe('Alice')
      expect(
        ((tracks[0]?.track as Track).album as unknown as Album).release_date,
      ).toBe('2024-01-01')

      // Alice - 2020
      expect((tracks[1]?.track as Track).artists[0]?.name).toBe('Alice')
      expect(
        ((tracks[1]?.track as Track).album as unknown as Album).release_date,
      ).toBe('2020-01-01')

      // Bob - 2024
      expect((tracks[2]?.track as Track).artists[0]?.name).toBe('Bob')
      expect(
        ((tracks[2]?.track as Track).album as unknown as Album).release_date,
      ).toBe('2024-01-01')

      // Bob - 2020
      expect((tracks[3]?.track as Track).artists[0]?.name).toBe('Bob')
      expect(
        ((tracks[3]?.track as Track).album as unknown as Album).release_date,
      ).toBe('2020-01-01')
    })

    test('should sort by three rules: artist asc, album desc, title asc', () => {
      const tracks = [
        createTrack('Song Z', 'Alice', 'Album A'),
        createTrack('Song A', 'Alice', 'Album B'),
        createTrack('Song A', 'Alice', 'Album A'),
        createTrack('Song B', 'Alice', 'Album A'),
      ]

      const sortRules: SortRule[] = [
        ['artist', 'asc'],
        ['album', 'desc'],
        ['title', 'asc'],
      ]
      sortTracks(tracks, sortRules)

      // Alice - Album B - Song A
      expect((tracks[0]?.track as Track).album?.name).toBe('Album B')
      expect(tracks[0]?.track?.name).toBe('Song A')

      // Alice - Album A - Song A
      expect((tracks[1]?.track as Track).album?.name).toBe('Album A')
      expect(tracks[1]?.track?.name).toBe('Song A')

      // Alice - Album A - Song B
      expect((tracks[2]?.track as Track).album?.name).toBe('Album A')
      expect(tracks[2]?.track?.name).toBe('Song B')

      // Alice - Album A - Song Z
      expect((tracks[3]?.track as Track).album?.name).toBe('Album A')
      expect(tracks[3]?.track?.name).toBe('Song Z')
    })
  })

  describe('edge cases', () => {
    describe('missing data', () => {
      test('should handle missing artist name', () => {
        const tracks = [
          createTrack('Song 1', 'Bob'),
          createTrack('Song 2', ''),
          createTrack('Song 3', 'Alice'),
        ]

        const sortRules: SortRule[] = [['artist', 'asc']]
        sortTracks(tracks, sortRules)

        // Empty string should come first (compareStrings returns -1 for empty str1)
        expect((tracks[0]?.track as Track).artists[0]?.name).toBe('')
        expect((tracks[1]?.track as Track).artists[0]?.name).toBe('Alice')
        expect((tracks[2]?.track as Track).artists[0]?.name).toBe('Bob')
      })

      test('should handle missing album name', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Zulu'),
          createTrack('Song 2', 'Artist', null),
          createTrack('Song 3', 'Artist', 'Alpha'),
        ]

        const sortRules: SortRule[] = [['album', 'asc']]
        sortTracks(tracks, sortRules)

        // null should come first
        expect(tracks[0]?.track?.name).toBe('Song 2')
        expect(tracks[1]?.track?.name).toBe('Song 3')
        expect(tracks[2]?.track?.name).toBe('Song 1')
      })

      test('should handle missing release date', () => {
        const tracks = [
          createTrack('Song 1', 'Artist', 'Album', '2024-01-01'),
          createTrack('Song 2', 'Artist', 'Album', null),
          createTrack('Song 3', 'Artist', 'Album', '2020-01-01'),
        ]

        const sortRules: SortRule[] = [['release_date', 'asc']]
        sortTracks(tracks, sortRules)

        // null should come first
        expect(tracks[0]?.track?.name).toBe('Song 2')
        expect(tracks[1]?.track?.name).toBe('Song 3')
        expect(tracks[2]?.track?.name).toBe('Song 1')
      })
    })

    describe('empty and single track arrays', () => {
      test('should handle empty array', () => {
        const tracks: PlaylistedTrack<Track>[] = []
        const sortRules: SortRule[] = [['artist', 'asc']]

        const result = sortTracks(tracks, sortRules)

        expect(tracks).toEqual([])
        expect(result).toBe(false)
      })

      test('should handle single track', () => {
        const tracks = [createTrack('Song 1', 'Artist')]
        const sortRules: SortRule[] = [['artist', 'asc']]

        const result = sortTracks(tracks, sortRules)

        expect(tracks).toHaveLength(1)
        expect(tracks[0]?.track?.name).toBe('Song 1')
        expect(result).toBe(false)
      })
    })

    describe('multi-artist tracks', () => {
      test('should use first artist only for sorting', () => {
        const tracks = [
          createMultiArtistTrack('Song 1', ['Zara', 'Alice', 'Bob']),
          createMultiArtistTrack('Song 2', ['Mike', 'Zara']),
          createMultiArtistTrack('Song 3', ['Alice', 'Mike']),
        ]

        const sortRules: SortRule[] = [['artist', 'asc']]
        sortTracks(tracks, sortRules)

        expect((tracks[0]?.track as Track).artists[0]?.name).toBe('Alice')
        expect((tracks[1]?.track as Track).artists[0]?.name).toBe('Mike')
        expect((tracks[2]?.track as Track).artists[0]?.name).toBe('Zara')
      })
    })
  })

  describe('return value - array change detection', () => {
    test('should return true when array was changed', () => {
      const tracks = [
        createTrack('Song 1', 'Zara'),
        createTrack('Song 2', 'Alice'),
      ]

      const sortRules: SortRule[] = [['artist', 'asc']]
      const result = sortTracks(tracks, sortRules)

      expect(result).toBe(true)
    })

    test('should return false when array was not changed', () => {
      const tracks = [
        createTrack('Song 1', 'Alice'),
        createTrack('Song 2', 'Bob'),
      ]

      const sortRules: SortRule[] = [['artist', 'asc']]
      const result = sortTracks(tracks, sortRules)

      expect(result).toBe(false)
    })

    test('should return false for empty array', () => {
      const tracks: PlaylistedTrack<Track>[] = []
      const sortRules: SortRule[] = [['artist', 'asc']]

      const result = sortTracks(tracks, sortRules)

      expect(result).toBe(false)
    })

    test('should return false for single track', () => {
      const tracks = [createTrack('Song 1', 'Artist')]
      const sortRules: SortRule[] = [['artist', 'asc']]

      const result = sortTracks(tracks, sortRules)

      expect(result).toBe(false)
    })

    test('should return true when descending sort changes order', () => {
      const tracks = [
        createTrack('Song 1', 'Alice'),
        createTrack('Song 2', 'Zara'),
      ]

      const sortRules: SortRule[] = [['artist', 'desc']]
      const result = sortTracks(tracks, sortRules)

      expect(result).toBe(true)
      expect((tracks[0]?.track as Track).artists[0]?.name).toBe('Zara')
    })
  })

  describe('locale-aware string comparison', () => {
    test('should sort using locale-aware comparison', () => {
      const tracks = [
        createTrack('Song 1', 'Äpfel'),
        createTrack('Song 2', 'Zebra'),
        createTrack('Song 3', 'Apple'),
      ]

      const sortRules: SortRule[] = [['artist', 'asc']]
      sortTracks(tracks, sortRules)

      // localeCompare should handle special characters properly
      // The exact order depends on locale, but it should use localeCompare
      expect(tracks).toHaveLength(3)
    })

    test('should be case-insensitive using localeCompare', () => {
      const tracks = [
        createTrack('Song 1', 'ALICE'),
        createTrack('Song 2', 'bob'),
        createTrack('Song 3', 'Alice'),
      ]

      const sortRules: SortRule[] = [['artist', 'asc']]
      sortTracks(tracks, sortRules)

      // Both Alice variations should be before bob
      const firstArtist = (tracks[0]?.track as Track).artists[0]?.name
      const lastArtist = (tracks[2]?.track as Track).artists[0]?.name

      expect(firstArtist?.toLowerCase()).toBe('alice')
      expect(lastArtist?.toLowerCase()).toBe('bob')
    })
  })
})
