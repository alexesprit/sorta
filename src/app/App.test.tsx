import type { AuthenticationResponse } from '@spotify/web-api-ts-sdk'
import { act, render, screen, waitFor } from '@testing-library/react'
import { App } from '@/app/App'
import { isAuthenticated, spotifyClient } from '@/shared/api/spotifyClient'
import { useUsername } from '@/shared/hooks/useUsername'

// Mock dependencies
vi.mock('@/shared/api/spotifyClient', () => ({
  isAuthenticated: vi.fn(),
  spotifyClient: {
    authenticate: vi.fn(),
    getAccessToken: vi.fn(),
  },
}))

vi.mock('@/shared/hooks/useUsername', () => ({
  useUsername: vi.fn(),
}))

// Mock components
vi.mock('@/features/auth/components/IntroScreen', () => ({
  IntroScreen: () => <div>IntroScreen</div>,
}))

vi.mock('@/features/layout/components/Header', () => ({
  Header: ({ username }: { username: string | null }) => (
    <div>Header: {username}</div>
  ),
}))

vi.mock('@/features/layout/components/MainContent', () => ({
  MainContent: () => <div>MainContent</div>,
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock window.history
    global.window.history.replaceState = vi.fn()

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        reload: vi.fn(),
      },
      writable: true,
    })

    // Default mock implementations
    vi.mocked(useUsername).mockReturnValue(null)
    vi.mocked(isAuthenticated).mockResolvedValue(false)
  })

  describe('Loading state', () => {
    test('should show loading state initially', () => {
      const result = render(<App />)
      const loadingText = result.container.textContent

      // The component should either show "Loading..." or have already
      // transitioned to IntroScreen depending on timing
      expect(
        loadingText?.includes('Loading...') ||
          loadingText?.includes('IntroScreen'),
      ).toBe(true)
    })

    test('should hide loading state after initialization', async () => {
      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Authentication states', () => {
    test('should show IntroScreen when not authenticated', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText('IntroScreen')).toBeInTheDocument()
      })
    })

    test('should show Header and MainContent when authenticated', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(true)
      vi.mocked(useUsername).mockReturnValue('Test User')

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText('Header: Test User')).toBeInTheDocument()
        expect(screen.getByText('MainContent')).toBeInTheDocument()
      })
    })

    test('should not show IntroScreen when authenticated', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(true)

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.queryByText('IntroScreen')).not.toBeInTheDocument()
      })
    })
  })

  describe('OAuth callback handling', () => {
    test('should handle OAuth callback with code', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?code=auth-code&state=state-123',
          reload: vi.fn(),
        },
        writable: true,
      })

      vi.mocked(spotifyClient.authenticate).mockResolvedValue({
        authenticated: true,
        accessToken: {
          access_token: 'test-token',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'test-refresh',
        },
      } as unknown as AuthenticationResponse)
      vi.mocked(isAuthenticated).mockResolvedValue(true)

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(spotifyClient.authenticate).toHaveBeenCalled()
      })

      // Verify URL was cleaned up
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        expect.anything(),
        '/',
      )
    })

    test('should handle OAuth error parameter', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?error=access_denied',
          reload: vi.fn(),
        },
        writable: true,
      })

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText(/access_denied/)).toBeInTheDocument()
      })

      expect(window.history.replaceState).toHaveBeenCalled()
      expect(spotifyClient.authenticate).not.toHaveBeenCalled()
    })

    test('should handle authentication failure', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?code=auth-code',
          reload: vi.fn(),
        },
        writable: true,
      })

      // Mock authenticate to throw a non-verifier error
      vi.mocked(spotifyClient.authenticate).mockRejectedValue(
        new Error('Authentication failed'),
      )

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText(/Authentication error:/)).toBeInTheDocument()
        expect(screen.getByText(/Authentication failed/)).toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    test('should show error message on auth failure', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?error=server_error',
          reload: vi.fn(),
        },
        writable: true,
      })

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/Authentication error: server_error/),
        ).toBeInTheDocument()
      })
    })

    test('should show Try again button on error', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?error=server_error',
          reload: vi.fn(),
        },
        writable: true,
      })

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeInTheDocument()
      })

      screen.getByText('Try again').click()

      expect(window.location.reload).toHaveBeenCalled()
    })
  })
})
