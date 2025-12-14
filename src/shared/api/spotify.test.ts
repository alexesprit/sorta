import { beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import {
  authorize,
  exchangeCodeForToken,
  getMyId,
  getMyPlaylists,
  getPlaylistTracks,
  getUsername,
  refreshAccessToken,
  setAccessToken,
  setPlaylistTracks,
} from './spotify'

// Mock spotify-web-api-js
// Use vi.hoisted to ensure these are available in the mock factory
const {
  mockSetAccessToken,
  mockGetUserPlaylists,
  mockGetPlaylistTracks,
  mockReplaceTracksInPlaylist,
  mockAddTracksToPlaylist,
  mockGetMe,
} = vi.hoisted(() => ({
  mockSetAccessToken: vi.fn(),
  mockGetUserPlaylists: vi.fn(),
  mockGetPlaylistTracks: vi.fn(),
  mockReplaceTracksInPlaylist: vi.fn(),
  mockAddTracksToPlaylist: vi.fn(),
  mockGetMe: vi.fn(),
}))

vi.mock('spotify-web-api-js', () => {
  // Create the mock implementation inside the factory
  const MockSpotifyWebApi = vi.fn(function SpotifyWebApi() {
    return {
      setAccessToken: mockSetAccessToken,
      getUserPlaylists: mockGetUserPlaylists,
      getPlaylistTracks: mockGetPlaylistTracks,
      replaceTracksInPlaylist: mockReplaceTracksInPlaylist,
      addTracksToPlaylist: mockAddTracksToPlaylist,
      getMe: mockGetMe,
    }
  })

  return {
    default: MockSpotifyWebApi,
  }
})

describe('spotify API', () => {
  let mockFetch: ReturnType<typeof vi.fn>
  let mockLocalStorage: Record<string, string>
  let mockSessionStorage: Record<string, string>

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()
    mockSetAccessToken.mockClear()
    mockGetUserPlaylists.mockClear()
    mockGetPlaylistTracks.mockClear()
    mockReplaceTracksInPlaylist.mockClear()
    mockAddTracksToPlaylist.mockClear()
    mockGetMe.mockClear()

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

    // Mock sessionStorage
    mockSessionStorage = {}
    global.sessionStorage = {
      getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockSessionStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockSessionStorage[key]
      }),
      clear: vi.fn(() => {
        mockSessionStorage = {}
      }),
      length: 0,
      key: vi.fn(),
    } as Storage

    // Mock crypto for PKCE
    Object.defineProperty(global, 'crypto', {
      value: {
        getRandomValues: vi.fn((arr: Uint8Array) => {
          // Fill with predictable values for testing
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i % 62 // Keep within valid range for generateRandomString
          }
          return arr
        }),
        subtle: {
          digest: vi.fn(async (_algorithm: string, _data: ArrayBuffer) => {
            // Return a predictable hash for testing
            const mockHash = new Uint8Array(32)
            for (let i = 0; i < 32; i++) {
              mockHash[i] = i
            }
            return mockHash.buffer
          }),
        },
      } as unknown as Crypto,
      writable: true,
      configurable: true,
    })

    // Mock btoa for base64 encoding
    global.btoa = vi.fn((str: string) => {
      // Simple mock that returns a predictable value
      return Buffer.from(str, 'binary').toString('base64')
    })

    // Mock document.location
    const mockLocation = {
      href: '',
      search: '',
      hash: '',
      pathname: '',
      origin: '',
      protocol: '',
      host: '',
      hostname: '',
      port: '',
    } as Location

    Object.defineProperty(global, 'document', {
      value: {
        location: mockLocation,
      },
      writable: true,
    })

    // Mock fetch
    mockFetch = vi.fn()
    global.fetch = mockFetch as typeof global.fetch
  })

  describe('PKCE Authentication Flow', () => {
    describe('authorize()', () => {
      test('should generate code verifier and store in sessionStorage', async () => {
        await authorize()

        const codeVerifier = sessionStorage.getItem(
          STORAGE_KEYS.OAUTH_CODE_VERIFIER,
        )
        expect(codeVerifier).toBeTruthy()
        expect(codeVerifier).toHaveLength(64)
      })

      test('should generate state parameter and store in sessionStorage', async () => {
        await authorize()

        const state = sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE)
        expect(state).toBeTruthy()
        expect(state).toHaveLength(16)
      })

      test('should redirect to Spotify with correct parameters', async () => {
        await authorize()

        expect(document.location.href).toContain(
          'https://accounts.spotify.com/authorize',
        )
        expect(document.location.href).toContain('response_type=code')
        expect(document.location.href).toContain('code_challenge_method=S256')
        expect(document.location.href).toContain('code_challenge=')
        expect(document.location.href).toContain('state=')
        expect(document.location.href).toContain('scope=')
      })

      test('should include client_id in redirect URL', async () => {
        await authorize()

        expect(document.location.href).toContain('client_id=')
      })

      test('should include redirect_uri in redirect URL', async () => {
        await authorize()

        expect(document.location.href).toContain('redirect_uri=')
      })

      test('should use code challenge generated from code verifier', async () => {
        await authorize()

        const codeVerifier = sessionStorage.getItem(
          STORAGE_KEYS.OAUTH_CODE_VERIFIER,
        )
        expect(codeVerifier).toBeTruthy()

        // Verify crypto.subtle.digest was called (code challenge generation)
        // Note: TextEncoder.encode returns Uint8Array
        expect(global.crypto.subtle.digest).toHaveBeenCalled()
        const digestCalls = vi.mocked(global.crypto.subtle.digest).mock.calls
        expect(digestCalls[0]?.[0]).toBe('SHA-256')
        // Check that the second argument is a Uint8Array (or array-like with buffer)
        const digestArg = digestCalls[0]?.[1]
        expect(digestArg).toBeTruthy()
        expect(digestArg).toHaveProperty('byteLength')
        expect(digestArg).toHaveProperty('length')
      })
    })

    describe('exchangeCodeForToken()', () => {
      test('should exchange code for token successfully', async () => {
        sessionStorage.setItem(
          STORAGE_KEYS.OAUTH_CODE_VERIFIER,
          'test-verifier',
        )

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
          }),
        })

        const result = await exchangeCodeForToken('test-code')

        expect(result).toEqual({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
        })
      })

      test('should send correct request to token endpoint', async () => {
        sessionStorage.setItem(
          STORAGE_KEYS.OAUTH_CODE_VERIFIER,
          'test-verifier',
        )

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
          }),
        })

        await exchangeCodeForToken('test-code')

        expect(mockFetch).toHaveBeenCalledWith(
          'https://accounts.spotify.com/api/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: expect.stringContaining('grant_type=authorization_code'),
          },
        )

        const callArgs = mockFetch.mock.calls[0]
        expect(callArgs).toBeDefined()
        const body = callArgs?.[1]?.body
        expect(body).toContain('code=test-code')
        expect(body).toContain('code_verifier=test-verifier')
      })

      test('should throw error if code verifier not found', async () => {
        // Don't set code_verifier in sessionStorage

        await expect(exchangeCodeForToken('test-code')).rejects.toThrow(
          'Code verifier not found',
        )
      })

      test('should throw error if token exchange fails', async () => {
        sessionStorage.setItem(
          STORAGE_KEYS.OAUTH_CODE_VERIFIER,
          'test-verifier',
        )

        mockFetch.mockResolvedValueOnce({
          ok: false,
          statusText: 'Bad Request',
        })

        await expect(exchangeCodeForToken('test-code')).rejects.toThrow(
          'Token exchange failed: Bad Request',
        )
      })

      test('should clear sessionStorage after successful exchange', async () => {
        sessionStorage.setItem(
          STORAGE_KEYS.OAUTH_CODE_VERIFIER,
          'test-verifier',
        )
        sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, 'test-state')

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
          }),
        })

        await exchangeCodeForToken('test-code')

        expect(
          sessionStorage.getItem(STORAGE_KEYS.OAUTH_CODE_VERIFIER),
        ).toBeNull()
        expect(sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE)).toBeNull()
      })
    })

    describe('refreshAccessToken()', () => {
      test('should refresh access token successfully', async () => {
        localStorage.setItem(
          STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
          'test-refresh-token',
        )

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
          }),
        })

        const result = await refreshAccessToken()

        expect(result).toEqual({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
        })
      })

      test('should send correct request to token endpoint', async () => {
        localStorage.setItem(
          STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
          'test-refresh-token',
        )

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'new-token',
            expires_in: 3600,
          }),
        })

        await refreshAccessToken()

        expect(mockFetch).toHaveBeenCalledWith(
          'https://accounts.spotify.com/api/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: expect.stringContaining('grant_type=refresh_token'),
          },
        )

        const callArgs = mockFetch.mock.calls[0]
        expect(callArgs).toBeDefined()
        const body = callArgs?.[1]?.body
        expect(body).toContain('refresh_token=test-refresh-token')
      })

      test('should throw error if refresh token not found', async () => {
        // Don't set refresh token in localStorage

        await expect(refreshAccessToken()).rejects.toThrow(
          'Refresh token not found',
        )
      })

      test('should throw error if token refresh fails', async () => {
        localStorage.setItem(
          STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
          'test-refresh-token',
        )

        mockFetch.mockResolvedValueOnce({
          ok: false,
          statusText: 'Unauthorized',
        })

        await expect(refreshAccessToken()).rejects.toThrow(
          'Token refresh failed: Unauthorized',
        )
      })

      test('should reuse existing refresh token if not returned', async () => {
        localStorage.setItem(
          STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
          'original-refresh-token',
        )

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'new-access-token',
            // No refresh_token in response
            expires_in: 3600,
          }),
        })

        const result = await refreshAccessToken()

        expect(result.refresh_token).toBe('original-refresh-token')
      })

      test('should use new refresh token if returned', async () => {
        localStorage.setItem(
          STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
          'original-refresh-token',
        )

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
          }),
        })

        const result = await refreshAccessToken()

        expect(result.refresh_token).toBe('new-refresh-token')
      })
    })
  })

  describe('setAccessToken()', () => {
    test('should set access token on Spotify client', () => {
      setAccessToken('test-token')

      expect(mockSetAccessToken).toHaveBeenCalledWith('test-token')
    })
  })

  describe('Spotify API Functions', () => {
    describe('getMyId()', () => {
      test('should fetch user ID', async () => {
        mockGetMe.mockResolvedValueOnce({
          id: 'test-user-id',
          display_name: 'Test User',
        })

        const result = await getMyId()

        expect(result).toBe('test-user-id')
        expect(mockGetMe).toHaveBeenCalled()
      })
    })

    describe('getUsername()', () => {
      test('should return cached username if available', async () => {
        localStorage.setItem(STORAGE_KEYS.SPOTIFY_USERNAME, 'Cached User')

        const result = await getUsername()

        expect(result).toBe('Cached User')
        expect(mockGetMe).not.toHaveBeenCalled()
      })

      test('should fetch and cache username from API if not cached', async () => {
        mockGetMe.mockResolvedValueOnce({
          id: 'test-user-id',
          display_name: 'New User',
        })

        const result = await getUsername()

        expect(result).toBe('New User')
        expect(mockGetMe).toHaveBeenCalled()
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.SPOTIFY_USERNAME,
          'New User',
        )
      })

      test('should use fallback username if display_name is null', async () => {
        mockGetMe.mockResolvedValueOnce({
          id: 'test-user-id',
          display_name: null,
        })

        const result = await getUsername()

        expect(result).toBe('User')
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.SPOTIFY_USERNAME,
          'User',
        )
      })

      test('should use fallback username if display_name is undefined', async () => {
        mockGetMe.mockResolvedValueOnce({
          id: 'test-user-id',
          display_name: undefined,
        })

        const result = await getUsername()

        expect(result).toBe('User')
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.SPOTIFY_USERNAME,
          'User',
        )
      })
    })

    describe('getMyPlaylists()', () => {
      test('should fetch playlists successfully', async () => {
        const mockPlaylists = [
          { id: 'playlist1', name: 'Playlist 1' },
          { id: 'playlist2', name: 'Playlist 2' },
        ]

        mockGetMe.mockResolvedValueOnce({ id: 'test-user-id' })
        mockGetUserPlaylists.mockResolvedValueOnce({
          items: mockPlaylists,
        })

        const result = await getMyPlaylists()

        expect(result).toEqual(mockPlaylists)
        expect(mockGetUserPlaylists).toHaveBeenCalledWith('test-user-id')
      })

      test('should return empty array when no playlists', async () => {
        mockGetMe.mockResolvedValueOnce({ id: 'test-user-id' })
        mockGetUserPlaylists.mockResolvedValueOnce({
          items: [],
        })

        const result = await getMyPlaylists()

        expect(result).toEqual([])
      })

      test('should handle API errors', async () => {
        mockGetMe.mockResolvedValueOnce({ id: 'test-user-id' })
        mockGetUserPlaylists.mockRejectedValueOnce(new Error('API Error'))

        await expect(getMyPlaylists()).rejects.toThrow('API Error')
      })
    })

    describe('getPlaylistTracks()', () => {
      test('should fetch single page of tracks', async () => {
        const mockTracks = [
          { track: { id: 'track1', name: 'Track 1' } },
          { track: { id: 'track2', name: 'Track 2' } },
        ]

        mockGetPlaylistTracks.mockResolvedValueOnce({
          items: mockTracks,
          limit: 100,
          offset: 0,
          total: 2,
        })

        const result = await getPlaylistTracks('playlist-id')

        expect(result).toEqual(mockTracks)
        expect(mockGetPlaylistTracks).toHaveBeenCalledWith('playlist-id', {
          offset: 0,
        })
      })

      test('should fetch multiple pages for playlists with more than 100 tracks', async () => {
        const mockTracksPage1 = Array.from({ length: 100 }, (_, i) => ({
          track: { id: `track${i}`, name: `Track ${i}` },
        }))
        const mockTracksPage2 = Array.from({ length: 100 }, (_, i) => ({
          track: { id: `track${i + 100}`, name: `Track ${i + 100}` },
        }))
        const mockTracksPage3 = Array.from({ length: 50 }, (_, i) => ({
          track: { id: `track${i + 200}`, name: `Track ${i + 200}` },
        }))

        mockGetPlaylistTracks
          .mockResolvedValueOnce({
            items: mockTracksPage1,
            limit: 100,
            offset: 0,
            total: 250,
          })
          .mockResolvedValueOnce({
            items: mockTracksPage2,
            limit: 100,
            offset: 100,
            total: 250,
          })
          .mockResolvedValueOnce({
            items: mockTracksPage3,
            limit: 100,
            offset: 200,
            total: 250,
          })

        const result = await getPlaylistTracks('playlist-id')

        expect(result).toHaveLength(250)
        expect(mockGetPlaylistTracks).toHaveBeenCalledTimes(3)
        expect(mockGetPlaylistTracks).toHaveBeenNthCalledWith(
          1,
          'playlist-id',
          {
            offset: 0,
          },
        )
        expect(mockGetPlaylistTracks).toHaveBeenNthCalledWith(
          2,
          'playlist-id',
          {
            offset: 100,
          },
        )
        expect(mockGetPlaylistTracks).toHaveBeenNthCalledWith(
          3,
          'playlist-id',
          {
            offset: 200,
          },
        )
      })

      test('should handle empty playlist', async () => {
        mockGetPlaylistTracks.mockResolvedValueOnce({
          items: [],
          limit: 100,
          offset: 0,
          total: 0,
        })

        const result = await getPlaylistTracks('playlist-id')

        expect(result).toEqual([])
        expect(mockGetPlaylistTracks).toHaveBeenCalledTimes(1)
      })

      test('should handle exactly 100 tracks', async () => {
        const mockTracks = Array.from({ length: 100 }, (_, i) => ({
          track: { id: `track${i}`, name: `Track ${i}` },
        }))

        mockGetPlaylistTracks.mockResolvedValueOnce({
          items: mockTracks,
          limit: 100,
          offset: 0,
          total: 100,
        })

        const result = await getPlaylistTracks('playlist-id')

        expect(result).toHaveLength(100)
        expect(mockGetPlaylistTracks).toHaveBeenCalledTimes(1)
      })
    })

    describe('setPlaylistTracks()', () => {
      test('should replace tracks for playlist with less than 100 tracks', async () => {
        const mockTracks = Array.from({ length: 50 }, (_, i) => ({
          track: { id: `track${i}` },
        })) as SpotifyApi.PlaylistTrackObject[]

        mockReplaceTracksInPlaylist.mockResolvedValueOnce({})

        await setPlaylistTracks('playlist-id', mockTracks)

        expect(mockReplaceTracksInPlaylist).toHaveBeenCalledTimes(1)
        expect(mockReplaceTracksInPlaylist).toHaveBeenCalledWith(
          'playlist-id',
          expect.arrayContaining([
            'spotify:track:track0',
            'spotify:track:track49',
          ]),
        )
        expect(mockAddTracksToPlaylist).not.toHaveBeenCalled()
      })

      test('should replace and add tracks for playlist with more than 100 tracks', async () => {
        const mockTracks = Array.from({ length: 150 }, (_, i) => ({
          track: { id: `track${i}` },
        })) as SpotifyApi.PlaylistTrackObject[]

        mockReplaceTracksInPlaylist.mockResolvedValueOnce({})
        mockAddTracksToPlaylist.mockResolvedValueOnce({})

        await setPlaylistTracks('playlist-id', mockTracks)

        expect(mockReplaceTracksInPlaylist).toHaveBeenCalledTimes(1)
        expect(mockAddTracksToPlaylist).toHaveBeenCalledTimes(1)

        // Verify first 100 were replaced
        const replaceCall = mockReplaceTracksInPlaylist.mock.calls[0]
        expect(replaceCall).toBeDefined()
        expect(replaceCall?.[1]).toHaveLength(100)

        // Verify next 50 were added
        const addCall = mockAddTracksToPlaylist.mock.calls[0]
        expect(addCall).toBeDefined()
        expect(addCall?.[1]).toHaveLength(50)
      })

      test('should handle exactly 100 tracks', async () => {
        const mockTracks = Array.from({ length: 100 }, (_, i) => ({
          track: { id: `track${i}` },
        })) as SpotifyApi.PlaylistTrackObject[]

        mockReplaceTracksInPlaylist.mockResolvedValueOnce({})

        await setPlaylistTracks('playlist-id', mockTracks)

        expect(mockReplaceTracksInPlaylist).toHaveBeenCalledTimes(1)
        expect(mockReplaceTracksInPlaylist).toHaveBeenCalledWith(
          'playlist-id',
          expect.any(Array),
        )
        expect(mockReplaceTracksInPlaylist.mock.calls[0]?.[1]).toHaveLength(100)
        expect(mockAddTracksToPlaylist).not.toHaveBeenCalled()
      })

      test('should handle exactly 200 tracks', async () => {
        const mockTracks = Array.from({ length: 200 }, (_, i) => ({
          track: { id: `track${i}` },
        })) as SpotifyApi.PlaylistTrackObject[]

        mockReplaceTracksInPlaylist.mockResolvedValueOnce({})
        mockAddTracksToPlaylist.mockResolvedValueOnce({})

        await setPlaylistTracks('playlist-id', mockTracks)

        expect(mockReplaceTracksInPlaylist).toHaveBeenCalledTimes(1)
        expect(mockAddTracksToPlaylist).toHaveBeenCalledTimes(1)

        // Verify first 100 were replaced
        expect(mockReplaceTracksInPlaylist.mock.calls[0]?.[1]).toHaveLength(100)

        // Verify next 100 were added
        expect(mockAddTracksToPlaylist.mock.calls[0]?.[1]).toHaveLength(100)
      })

      test('should handle 250 tracks with multiple add operations', async () => {
        const mockTracks = Array.from({ length: 250 }, (_, i) => ({
          track: { id: `track${i}` },
        })) as SpotifyApi.PlaylistTrackObject[]

        mockReplaceTracksInPlaylist.mockResolvedValueOnce({})
        mockAddTracksToPlaylist.mockResolvedValue({})

        await setPlaylistTracks('playlist-id', mockTracks)

        expect(mockReplaceTracksInPlaylist).toHaveBeenCalledTimes(1)
        expect(mockAddTracksToPlaylist).toHaveBeenCalledTimes(2)

        // Verify first 100 were replaced
        expect(mockReplaceTracksInPlaylist.mock.calls[0]?.[1]).toHaveLength(100)

        // Verify next 100 were added
        expect(mockAddTracksToPlaylist.mock.calls[0]?.[1]).toHaveLength(100)

        // Verify final 50 were added
        expect(mockAddTracksToPlaylist.mock.calls[1]?.[1]).toHaveLength(50)
      })

      test('should format track URIs correctly', async () => {
        const mockTracks = [
          { track: { id: 'abc123' } },
          { track: { id: 'def456' } },
        ] as SpotifyApi.PlaylistTrackObject[]

        mockReplaceTracksInPlaylist.mockResolvedValueOnce({})

        await setPlaylistTracks('playlist-id', mockTracks)

        expect(mockReplaceTracksInPlaylist).toHaveBeenCalledWith(
          'playlist-id',
          ['spotify:track:abc123', 'spotify:track:def456'],
        )
      })

      test('should handle empty tracks array', async () => {
        const mockTracks: SpotifyApi.PlaylistTrackObject[] = []

        await setPlaylistTracks('playlist-id', mockTracks)

        // When tracks array is empty, the for loop never executes
        // so neither replaceTracksInPlaylist nor addTracksToPlaylist should be called
        expect(mockReplaceTracksInPlaylist).not.toHaveBeenCalled()
        expect(mockAddTracksToPlaylist).not.toHaveBeenCalled()
      })
    })
  })
})
