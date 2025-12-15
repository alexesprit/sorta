import { useCallback } from 'react'
import { logout as sdkLogout } from '@/shared/api/spotifyClient'

/**
 * Hook for handling user logout
 * Uses SDK's logout functionality which clears tokens and reloads the page
 */
export function useLogout() {
  const logout = useCallback(() => {
    // SDK's logout function handles:
    // 1. Clearing SDK's stored tokens
    // 2. Clearing old custom tokens (migration)
    // 3. Reloading the page
    sdkLogout()
  }, [])

  return { logout }
}
