import type {
  Page,
  PlaylistedTrack,
  SimplifiedPlaylist,
  UserProfile,
} from '@spotify/web-api-ts-sdk'
import { beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import {
  getMyId,
  getMyPlaylists,
  getPlaylistTracks,
  getUsername,
  setPlaylistTracks,
} from './spotify'
import { spotifyClient } from './spotifyClient'

// Mock the spotifyClient
vi.mock('./spotifyClient', () => ({
  spotifyClient: {
    currentUser: {
      playlists: {
        playlists: vi.fn(),
      },
      profile: vi.fn(),
    },
    playlists: {
      getPlaylistItems: vi.fn(),
      updatePlaylistItems: vi.fn(),
      addItemsToPlaylist: vi.fn(),
    },
  },
}))

describe('spotify API', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()

    // Mock localStorage
    mockLocalStorage = {}
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key]
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {}
      }),
      length: 0,
      key: vi.fn(),
    } as Storage
  })

  describe('getMyPlaylists', () => {
    test('should fetch user playlists', async () => {
      const mockPlaylists: SimplifiedPlaylist[] = [
        {
          id: 'playlist1',
          name: 'My Playlist 1',
          owner: { id: 'user1', display_name: 'User 1' },
          external_urls: { spotify: 'https://spotify.com/playlist1' },
        } as SimplifiedPlaylist,
        {
          id: 'playlist2',
          name: 'My Playlist 2',
          owner: { id: 'user1', display_name: 'User 1' },
          external_urls: { spotify: 'https://spotify.com/playlist2' },
        } as SimplifiedPlaylist,
      ]

      const mockResponse: Page<SimplifiedPlaylist> = {
        items: mockPlaylists,
        limit: 20,
        offset: 0,
        total: 2,
        href: 'https://api.spotify.com/v1/me/playlists',
        next: null,
        previous: null,
      }

      vi.mocked(
        spotifyClient.currentUser.playlists.playlists,
      ).mockResolvedValue(mockResponse)

      const playlists = await getMyPlaylists()

      expect(playlists).toEqual(mockPlaylists)
      expect(
        spotifyClient.currentUser.playlists.playlists,
      ).toHaveBeenCalledTimes(1)
    })

    test('should return empty array if no playlists', async () => {
      const mockResponse: Page<SimplifiedPlaylist> = {
        items: [],
        limit: 20,
        offset: 0,
        total: 0,
        href: 'https://api.spotify.com/v1/me/playlists',
        next: null,
        previous: null,
      }

      vi.mocked(
        spotifyClient.currentUser.playlists.playlists,
      ).mockResolvedValue(mockResponse)

      const playlists = await getMyPlaylists()

      expect(playlists).toEqual([])
    })
  })

  describe('getPlaylistTracks', () => {
    test('should fetch all tracks from a playlist with single page', async () => {
      const mockTracks: PlaylistedTrack[] = [
        {
          track: { id: 'track1', name: 'Track 1', type: 'track' },
        } as PlaylistedTrack,
        {
          track: { id: 'track2', name: 'Track 2', type: 'track' },
        } as PlaylistedTrack,
      ]

      const mockResponse: Page<PlaylistedTrack> = {
        items: mockTracks,
        limit: 50,
        offset: 0,
        total: 2,
        href: 'https://api.spotify.com/v1/playlists/playlist1/tracks',
        next: null,
        previous: null,
      }

      vi.mocked(spotifyClient.playlists.getPlaylistItems).mockResolvedValue(
        mockResponse,
      )

      const tracks = await getPlaylistTracks('playlist1')

      expect(tracks).toEqual(mockTracks)
      expect(spotifyClient.playlists.getPlaylistItems).toHaveBeenCalledWith(
        'playlist1',
        undefined,
        undefined,
        50,
        0,
      )
    })

    test('should fetch all tracks from a playlist with pagination', async () => {
      const mockTracksPage1: PlaylistedTrack[] = Array.from(
        { length: 50 },
        (_, i) => ({
          track: { id: `track${i}`, name: `Track ${i}`, type: 'track' },
        }),
      ) as PlaylistedTrack[]

      const mockTracksPage2: PlaylistedTrack[] = Array.from(
        { length: 30 },
        (_, i) => ({
          track: {
            id: `track${i + 50}`,
            name: `Track ${i + 50}`,
            type: 'track',
          },
        }),
      ) as PlaylistedTrack[]

      const mockResponsePage1: Page<PlaylistedTrack> = {
        items: mockTracksPage1,
        limit: 50,
        offset: 0,
        total: 80,
        href: 'https://api.spotify.com/v1/playlists/playlist1/tracks',
        next: 'https://api.spotify.com/v1/playlists/playlist1/tracks?offset=50',
        previous: null,
      }

      const mockResponsePage2: Page<PlaylistedTrack> = {
        items: mockTracksPage2,
        limit: 50,
        offset: 50,
        total: 80,
        href: 'https://api.spotify.com/v1/playlists/playlist1/tracks?offset=50',
        next: null,
        previous: 'https://api.spotify.com/v1/playlists/playlist1/tracks',
      }

      vi.mocked(spotifyClient.playlists.getPlaylistItems)
        .mockResolvedValueOnce(mockResponsePage1)
        .mockResolvedValueOnce(mockResponsePage2)

      const tracks = await getPlaylistTracks('playlist1')

      expect(tracks).toHaveLength(80)
      expect(tracks).toEqual([...mockTracksPage1, ...mockTracksPage2])
      expect(spotifyClient.playlists.getPlaylistItems).toHaveBeenCalledTimes(2)
    })

    test('should return empty array for playlist with no tracks', async () => {
      const mockResponse: Page<PlaylistedTrack> = {
        items: [],
        limit: 50,
        offset: 0,
        total: 0,
        href: 'https://api.spotify.com/v1/playlists/playlist1/tracks',
        next: null,
        previous: null,
      }

      vi.mocked(spotifyClient.playlists.getPlaylistItems).mockResolvedValue(
        mockResponse,
      )

      const tracks = await getPlaylistTracks('playlist1')

      expect(tracks).toEqual([])
    })
  })

  describe('setPlaylistTracks', () => {
    test('should update playlist with tracks under limit', async () => {
      const mockTracks: PlaylistedTrack[] = Array.from(
        { length: 50 },
        (_, i) => ({
          track: { id: `track${i}`, name: `Track ${i}`, type: 'track' },
        }),
      ) as PlaylistedTrack[]

      vi.mocked(spotifyClient.playlists.updatePlaylistItems).mockResolvedValue({
        snapshot_id: 'snapshot1',
      })

      await setPlaylistTracks('playlist1', mockTracks)

      expect(spotifyClient.playlists.updatePlaylistItems).toHaveBeenCalledWith(
        'playlist1',
        {
          uris: mockTracks.map((t) => `spotify:track:${t.track.id}`),
        },
      )
      expect(spotifyClient.playlists.addItemsToPlaylist).not.toHaveBeenCalled()
    })

    test('should split tracks over 100 into multiple requests', async () => {
      const mockTracks: PlaylistedTrack[] = Array.from(
        { length: 150 },
        (_, i) => ({
          track: { id: `track${i}`, name: `Track ${i}`, type: 'track' },
        }),
      ) as PlaylistedTrack[]

      vi.mocked(spotifyClient.playlists.updatePlaylistItems).mockResolvedValue({
        snapshot_id: 'snapshot1',
      })
      vi.mocked(spotifyClient.playlists.addItemsToPlaylist).mockResolvedValue(
        undefined as unknown as undefined,
      )

      await setPlaylistTracks('playlist1', mockTracks)

      // First 100 tracks should be replaced
      expect(spotifyClient.playlists.updatePlaylistItems).toHaveBeenCalledTimes(
        1,
      )
      expect(spotifyClient.playlists.updatePlaylistItems).toHaveBeenCalledWith(
        'playlist1',
        {
          uris: mockTracks
            .slice(0, 100)
            .map((t) => `spotify:track:${t.track.id}`),
        },
      )

      // Remaining 50 tracks should be added
      expect(spotifyClient.playlists.addItemsToPlaylist).toHaveBeenCalledTimes(
        1,
      )
      expect(spotifyClient.playlists.addItemsToPlaylist).toHaveBeenCalledWith(
        'playlist1',
        mockTracks.slice(100).map((t) => `spotify:track:${t.track.id}`),
      )
    })

    test('should handle empty track list', async () => {
      vi.mocked(spotifyClient.playlists.updatePlaylistItems).mockResolvedValue({
        snapshot_id: 'snapshot1',
      })

      await setPlaylistTracks('playlist1', [])

      expect(spotifyClient.playlists.updatePlaylistItems).toHaveBeenCalledWith(
        'playlist1',
        { uris: [] },
      )
      expect(spotifyClient.playlists.addItemsToPlaylist).not.toHaveBeenCalled()
    })
  })

  describe('getMyId', () => {
    test('should fetch current user ID', async () => {
      const mockProfile = {
        id: 'user123',
        display_name: 'Test User',
        type: 'user',
        uri: 'spotify:user:user123',
        href: 'https://api.spotify.com/v1/users/user123',
        external_urls: { spotify: 'https://spotify.com/user/user123' },
        followers: { href: null, total: 100 },
      } as UserProfile

      vi.mocked(spotifyClient.currentUser.profile).mockResolvedValue(
        mockProfile,
      )

      const userId = await getMyId()

      expect(userId).toBe('user123')
      expect(spotifyClient.currentUser.profile).toHaveBeenCalledTimes(1)
    })
  })

  describe('getUsername', () => {
    test('should return cached username if available', async () => {
      mockLocalStorage[STORAGE_KEYS.SPOTIFY_USERNAME] = 'Cached User'

      const username = await getUsername()

      expect(username).toBe('Cached User')
      expect(spotifyClient.currentUser.profile).not.toHaveBeenCalled()
    })

    test('should fetch username from API if not cached', async () => {
      const mockProfile = {
        id: 'user123',
        display_name: 'API User',
        type: 'user',
        uri: 'spotify:user:user123',
        href: 'https://api.spotify.com/v1/users/user123',
        external_urls: { spotify: 'https://spotify.com/user/user123' },
        followers: { href: null, total: 100 },
      } as UserProfile

      vi.mocked(spotifyClient.currentUser.profile).mockResolvedValue(
        mockProfile,
      )

      const username = await getUsername()

      expect(username).toBe('API User')
      expect(spotifyClient.currentUser.profile).toHaveBeenCalledTimes(1)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SPOTIFY_USERNAME,
        'API User',
      )
    })

    test('should use fallback "User" if display_name is null', async () => {
      const mockProfile = {
        id: 'user123',
        display_name: null as string | null,
        type: 'user',
        uri: 'spotify:user:user123',
        href: 'https://api.spotify.com/v1/users/user123',
        external_urls: { spotify: 'https://spotify.com/user/user123' },
        followers: { href: null, total: 100 },
      } as UserProfile

      vi.mocked(spotifyClient.currentUser.profile).mockResolvedValue(
        mockProfile,
      )

      const username = await getUsername()

      expect(username).toBe('User')
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SPOTIFY_USERNAME,
        'User',
      )
    })
  })
})
