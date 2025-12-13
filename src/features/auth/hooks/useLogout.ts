import { useCallback } from 'react'
import { tokenStorage } from '@/features/auth/services/tokenStorage'
import { setAccessToken } from '@/shared/api/spotify'

/**
 * Hook for handling user logout
 * Clears all authentication tokens from localStorage
 */
export function useLogout() {
  const logout = useCallback(() => {
    // Clear tokens from storage
    tokenStorage.clear()

    // Clear token from Spotify API client
    setAccessToken(null)

    // Reload page to reset application state and show IntroScreen
    window.location.reload()
  }, [])

  return { logout }
}
