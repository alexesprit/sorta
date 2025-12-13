import { act, renderHook, waitFor } from '@testing-library/react'
import { useSortPlaylists } from '@/features/playlists/hooks/useSortPlaylists'
import type { SortRule } from '@/features/sorting/utils/sortRules'
import {
  getMyId,
  getMyPlaylists,
  getPlaylistTracks,
  setPlaylistTracks,
} from '@/shared/api/spotify'

// Mock the Spotify API module
vi.mock('@/shared/api/spotify', () => ({
  getMyId: vi.fn(),
  getMyPlaylists: vi.fn(),
  getPlaylistTracks: vi.fn(),
  setPlaylistTracks: vi.fn(),
}))

// Mock sortTracks utility
vi.mock('@/features/sorting/utils/sortTracks', () => ({
  sortTracks: vi.fn(),
}))

import { sortTracks } from '@/features/sorting/utils/sortTracks'

describe('useSortPlaylists', () => {
  const mockSortRules: SortRule[] = [
    ['artist', 'asc'],
    ['album', 'desc'],
  ]

  const mockSpotifyPlaylists: SpotifyApi.PlaylistObjectSimplified[] = [
    {
      id: '1',
      name: 'My Playlist 1',
      description: 'A test playlist',
      external_urls: { spotify: 'https://open.spotify.com/playlist/1' },
      tracks: { total: 10, href: '' },
      owner: {
        id: 'user123',
        display_name: 'User',
        uri: '',
        href: '',
        external_urls: { spotify: '' },
        type: 'user',
      },
      collaborative: false,
      public: true,
      snapshot_id: 'snapshot1',
      href: '',
      images: [],
      type: 'playlist',
      uri: 'spotify:playlist:1',
    },
    {
      id: '2',
      name: 'My Playlist 2',
      description: 'Another test playlist',
      external_urls: { spotify: 'https://open.spotify.com/playlist/2' },
      tracks: { total: 5, href: '' },
      owner: {
        id: 'user123',
        display_name: 'User',
        uri: '',
        href: '',
        external_urls: { spotify: '' },
        type: 'user',
      },
      collaborative: false,
      public: false,
      snapshot_id: 'snapshot2',
      href: '',
      images: [],
      type: 'playlist',
      uri: 'spotify:playlist:2',
    },
    {
      id: '3',
      name: 'Someone Else Playlist',
      description: 'A playlist owned by someone else',
      external_urls: { spotify: 'https://open.spotify.com/playlist/3' },
      tracks: { total: 20, href: '' },
      owner: {
        id: 'other456',
        display_name: 'Other User',
        uri: '',
        href: '',
        external_urls: { spotify: '' },
        type: 'user',
      },
      collaborative: false,
      public: true,
      snapshot_id: 'snapshot3',
      href: '',
      images: [],
      type: 'playlist',
      uri: 'spotify:playlist:3',
    },
  ]

  const mockTrack = (id: string): SpotifyApi.PlaylistTrackObject => ({
    added_at: '2023-01-01',
    added_by: {
      id: 'user123',
      uri: '',
      href: '',
      external_urls: { spotify: '' },
      type: 'user',
    },
    is_local: false,
    track: {
      id,
      name: `Track ${id}`,
      artists: [
        {
          name: 'Artist',
          id: 'artist1',
          uri: '',
          href: '',
          external_urls: { spotify: '' },
          type: 'artist',
        },
      ],
      album: {
        id: 'album1',
        name: 'Album',
        images: [],
        uri: '',
        href: '',
        external_urls: { spotify: '' },
        type: 'album',
        album_type: 'album',
      },
      duration_ms: 180000,
      explicit: false,
      external_ids: { isrc: 'test-isrc' },
      uri: `spotify:track:${id}`,
      href: '',
      external_urls: { spotify: '' },
      type: 'track',
      popularity: 50,
      track_number: 1,
      disc_number: 1,
      preview_url: '',
      available_markets: [],
      is_playable: true,
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getMyId).mockResolvedValue('user123')
    vi.mocked(getMyPlaylists).mockResolvedValue(mockSpotifyPlaylists)
    vi.mocked(getPlaylistTracks).mockResolvedValue([
      mockTrack('1'),
      mockTrack('2'),
    ])
    vi.mocked(setPlaylistTracks).mockResolvedValue(undefined)
    vi.mocked(sortTracks).mockReturnValue(false)
  })

  describe('initialization', () => {
    test('should load playlists on mount', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      const [, , , , isLoading] = result.current
      expect(isLoading).toBe(true)

      await waitFor(() => {
        const [, , , , isLoading] = result.current
        expect(isLoading).toBe(false)
      })

      expect(getMyId).toHaveBeenCalledTimes(1)
      expect(getMyPlaylists).toHaveBeenCalledTimes(1)
    })

    test('should filter to only user-owned playlists', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [, , , , isLoading] = result.current
        expect(isLoading).toBe(false)
      })

      const [playlists] = result.current
      expect(playlists).toHaveLength(2)
      expect(playlists[0]?.id).toBe('1')
      expect(playlists[1]?.id).toBe('2')
      expect(playlists.every((p) => p.status === 'ready')).toBe(true)
      expect(playlists.every((p) => !p.selected)).toBe(true)
    })

    test('should initialize all playlists with ready status', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      const [playlists] = result.current
      expect(playlists.every((p) => p.status === 'ready')).toBe(true)
    })

    test('should initialize all playlists as unselected', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      const [playlists] = result.current
      expect(playlists.every((p) => !p.selected)).toBe(true)
    })

    test('should set correct playlist properties from Spotify data', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      const [playlists] = result.current
      expect(playlists[0]).toMatchObject({
        id: '1',
        name: 'My Playlist 1',
        href: 'https://open.spotify.com/playlist/1',
        tracks: 10,
      })
      expect(playlists[1]).toMatchObject({
        id: '2',
        name: 'My Playlist 2',
        href: 'https://open.spotify.com/playlist/2',
        tracks: 5,
      })
    })
  })

  describe('abort handling', () => {
    test('should abort loading when unmounted', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      let _capturedSignal: AbortSignal | undefined

      vi.mocked(getMyId).mockImplementation(async (signal?: AbortSignal) => {
        _capturedSignal = signal
        await new Promise((resolve) => setTimeout(resolve, 100))
        // Check if aborted after delay
        if (signal?.aborted) {
          throw new Error('Aborted')
        }
        return 'user123'
      })

      vi.mocked(getMyPlaylists).mockImplementation(
        async (signal?: AbortSignal) => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          if (signal?.aborted) {
            throw new Error('Aborted')
          }
          return mockSpotifyPlaylists
        },
      )

      const { unmount } = renderHook(() => useSortPlaylists(mockSortRules))

      // Wait a bit to let the async operation start
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Unmount before loading completes
      unmount()

      // Give it a moment to process the abort
      await new Promise((resolve) => setTimeout(resolve, 150))

      // The hook should have been aborted, so console.error should not be called
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    test('should not update state after abort', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.mocked(getMyId).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 'user123'
      })

      const { result, unmount } = renderHook(() =>
        useSortPlaylists(mockSortRules),
      )

      const [initialPlaylists] = result.current
      expect(initialPlaylists).toEqual([])

      unmount()

      await new Promise((resolve) => setTimeout(resolve, 150))

      // Should not have logged an error for aborted request
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    test('should handle abort during getMyId call', async () => {
      vi.mocked(getMyId).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return 'user123'
      })

      const { unmount } = renderHook(() => useSortPlaylists(mockSortRules))

      await new Promise((resolve) => setTimeout(resolve, 50))
      unmount()

      await new Promise((resolve) => setTimeout(resolve, 200))

      // Should not call getMyPlaylists if aborted during getMyId
      expect(getMyPlaylists).not.toHaveBeenCalled()
    })

    test('should handle abort during getMyPlaylists call', async () => {
      vi.mocked(getMyPlaylists).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return mockSpotifyPlaylists
      })

      const { result, unmount } = renderHook(() =>
        useSortPlaylists(mockSortRules),
      )

      await waitFor(() => {
        expect(getMyId).toHaveBeenCalled()
      })

      unmount()

      await new Promise((resolve) => setTimeout(resolve, 250))

      // Playlists should remain empty due to abort
      const [playlists] = result.current
      expect(playlists).toEqual([])
    })
  })

  describe('error handling', () => {
    test('should handle getMyId error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      vi.mocked(getMyId).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [, , , , isLoading] = result.current
        expect(isLoading).toBe(false)
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load playlists:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })

    test('should handle getMyPlaylists error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      vi.mocked(getMyPlaylists).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [, , , , isLoading] = result.current
        expect(isLoading).toBe(false)
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load playlists:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('sorting playlists', () => {
    test('should only sort selected playlists', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      // Select first playlist
      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      // Only the selected playlist should have been processed
      expect(getPlaylistTracks).toHaveBeenCalledTimes(1)
      expect(getPlaylistTracks).toHaveBeenCalledWith('1')
    })

    test('should update playlist status to sorting then unchanged when tracks are not sorted', async () => {
      vi.mocked(sortTracks).mockReturnValue(false)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      const [playlists] = result.current
      expect(playlists[0]?.status).toBe('unchanged')
      expect(setPlaylistTracks).not.toHaveBeenCalled()
    })

    test('should update playlist status to sorting then sorted when tracks are sorted', async () => {
      vi.mocked(sortTracks).mockReturnValue(true)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      const [playlists] = result.current
      expect(playlists[0]?.status).toBe('sorted')
      expect(setPlaylistTracks).toHaveBeenCalledTimes(1)
    })

    test('should handle sorting errors gracefully', async () => {
      vi.mocked(sortTracks).mockReturnValue(true)
      vi.mocked(setPlaylistTracks).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      const [playlists] = result.current
      expect(playlists[0]?.status).toBe('error')
    })

    test('should process multiple selected playlists in sequence', async () => {
      vi.mocked(sortTracks).mockReturnValue(true)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(playlists.map((p) => ({ ...p, selected: true })))
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      expect(getPlaylistTracks).toHaveBeenCalledTimes(2)
      expect(getPlaylistTracks).toHaveBeenCalledWith('1')
      expect(getPlaylistTracks).toHaveBeenCalledWith('2')
      expect(setPlaylistTracks).toHaveBeenCalledTimes(2)

      const [playlists] = result.current
      expect(playlists[0]?.status).toBe('sorted')
      expect(playlists[1]?.status).toBe('sorted')
    })

    test('should reset playlists on second sort', async () => {
      vi.mocked(sortTracks).mockReturnValue(true)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      // First sort
      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      const [playlistsAfterFirst] = result.current
      expect(playlistsAfterFirst[0]?.status).toBe('sorted')

      // Second sort - should reset status first
      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      expect(getPlaylistTracks).toHaveBeenCalledTimes(2)
    })

    test('should not reset playlists on first sort', async () => {
      vi.mocked(sortTracks).mockReturnValue(false)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      // Manually set a status to test it's not reset
      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) =>
            i === 0 ? { ...p, selected: true, status: 'ready' } : p,
          ),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      // Status should have changed from ready to unchanged (via sorting)
      const [playlists] = result.current
      expect(playlists[0]?.status).toBe('unchanged')
    })

    test('should call sortTracks with correct arguments', async () => {
      const mockTracks = [mockTrack('1'), mockTrack('2')]
      vi.mocked(getPlaylistTracks).mockResolvedValue(mockTracks)
      vi.mocked(sortTracks).mockReturnValue(true)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      expect(sortTracks).toHaveBeenCalledWith(mockTracks, mockSortRules)
    })

    test('should not sort any playlists when none are selected', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      expect(getPlaylistTracks).not.toHaveBeenCalled()
      expect(sortTracks).not.toHaveBeenCalled()
      expect(setPlaylistTracks).not.toHaveBeenCalled()
    })
  })

  describe('processing state', () => {
    test('should set isProcessing to true during sorting', async () => {
      vi.mocked(sortTracks).mockReturnValue(false)
      vi.mocked(getPlaylistTracks).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return [mockTrack('1')]
      })

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      let isProcessingDuringSort = false

      act(() => {
        const [, , sortPlaylists] = result.current
        sortPlaylists().then(() => {
          // Will complete after we check
        })
      })

      await waitFor(() => {
        const [, , , isProcessing] = result.current
        if (isProcessing) {
          isProcessingDuringSort = true
        }
      })

      await waitFor(() => {
        const [, , , isProcessing] = result.current
        expect(isProcessing).toBe(false)
      })

      expect(isProcessingDuringSort).toBe(true)
    })

    test('should set isProcessing to false after sorting completes', async () => {
      vi.mocked(sortTracks).mockReturnValue(false)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      const [, , , isProcessing] = result.current
      expect(isProcessing).toBe(false)
    })
  })

  describe('setPlaylists function', () => {
    test('should allow updating playlists state', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [, setPlaylists] = result.current
        setPlaylists((prev) => prev.map((p) => ({ ...p, selected: true })))
      })

      const [playlists] = result.current
      expect(playlists.every((p) => p.selected)).toBe(true)
    })

    test('should allow setting playlists directly', async () => {
      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [, setPlaylists] = result.current
        setPlaylists([])
      })

      const [playlists] = result.current
      expect(playlists).toEqual([])
    })
  })

  describe('edge cases', () => {
    test('should handle empty playlists from API', async () => {
      vi.mocked(getMyPlaylists).mockResolvedValue([])

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [, , , , isLoading] = result.current
        expect(isLoading).toBe(false)
      })

      const [playlists] = result.current
      expect(playlists).toEqual([])
    })

    test('should handle playlists with zero tracks', async () => {
      const playlistsWithZeroTracks = [
        {
          ...mockSpotifyPlaylists[0],
          tracks: { total: 0, href: '' },
          collaborative: false,
          description: null,
          external_urls: { spotify: 'https://open.spotify.com/playlist/test' },
          href: 'https://open.spotify.com/playlist/test',
          id: 'test-playlist-id',
          images: [],
          name: 'Test Playlist',
        } as SpotifyApi.PlaylistObjectSimplified,
      ]

      vi.mocked(getMyPlaylists).mockResolvedValue(playlistsWithZeroTracks)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(1)
      })

      const [playlists] = result.current
      expect(playlists[0]?.tracks).toBe(0)
    })

    test('should handle all playlists owned by others', async () => {
      const otherUserPlaylists = mockSpotifyPlaylists.map((p) => ({
        ...p,
        owner: { ...p.owner, id: 'other456' },
      }))

      vi.mocked(getMyPlaylists).mockResolvedValue(otherUserPlaylists)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [, , , , isLoading] = result.current
        expect(isLoading).toBe(false)
      })

      const [playlists] = result.current
      expect(playlists).toEqual([])
    })

    test('should handle empty tracks from getPlaylistTracks', async () => {
      vi.mocked(getPlaylistTracks).mockResolvedValue([])
      vi.mocked(sortTracks).mockReturnValue(false)

      const { result } = renderHook(() => useSortPlaylists(mockSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      expect(sortTracks).toHaveBeenCalledWith([], mockSortRules)
    })
  })

  describe('integration with sort rules', () => {
    test('should use provided sort rules', async () => {
      const customSortRules: SortRule[] = [
        ['release_date', 'desc'],
        ['title', 'asc'],
      ]

      vi.mocked(sortTracks).mockReturnValue(false)

      const { result } = renderHook(() => useSortPlaylists(customSortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      expect(sortTracks).toHaveBeenCalledWith(
        expect.any(Array),
        customSortRules,
      )
    })

    test('should work with empty sort rules', async () => {
      const emptySortRules: SortRule[] = []

      vi.mocked(sortTracks).mockReturnValue(false)

      const { result } = renderHook(() => useSortPlaylists(emptySortRules))

      await waitFor(() => {
        const [playlists] = result.current
        expect(playlists.length).toBe(2)
      })

      act(() => {
        const [playlists, setPlaylists] = result.current
        setPlaylists(
          playlists.map((p, i) => (i === 0 ? { ...p, selected: true } : p)),
        )
      })

      await act(async () => {
        const [, , sortPlaylists] = result.current
        await sortPlaylists()
      })

      expect(sortTracks).toHaveBeenCalledWith(expect.any(Array), emptySortRules)
    })
  })
})
