import { useCallback, useEffect, useRef } from 'react'
import {
  type TokenData,
  tokenStorage,
} from '@/features/auth/services/tokenStorage'
import { refreshAccessToken } from '@/shared/api/spotify'
import { TOKEN_EXPIRY_BUFFER_SECONDS } from '@/shared/constants/auth'

interface UseTokenRefreshOptions {
  onTokenUpdate: (token: TokenData) => void
  onRefreshError: () => void
}

/**
 * Hook to manage automatic token refresh
 * Schedules refresh before token expiry and handles refresh logic
 */
export function useTokenRefresh({
  onTokenUpdate,
  onRefreshError,
}: UseTokenRefreshOptions) {
  const refreshTimerRef = useRef<number | null>(null)

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const handleTokenRefresh = useCallback(async () => {
    try {
      const tokenResponse = await refreshAccessToken()
      const tokenData = tokenStorage.saveFromResponse(
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.expires_in,
      )

      onTokenUpdate(tokenData)

      // Schedule next refresh (calculated inline to avoid circular dep)
      const refreshTime =
        (tokenResponse.expires_in - TOKEN_EXPIRY_BUFFER_SECONDS) * 1000
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
      refreshTimerRef.current = window.setTimeout(() => {
        handleTokenRefresh().catch(() => {
          // Error already handled in handleTokenRefresh
        })
      }, refreshTime)
    } catch (_error) {
      clearRefreshTimer()
      onRefreshError()
      throw _error
    }
  }, [onTokenUpdate, onRefreshError, clearRefreshTimer])

  const scheduleRefresh = useCallback(
    (expiresIn: number) => {
      clearRefreshTimer()

      // Schedule refresh 5 minutes before expiry
      const refreshTime = (expiresIn - TOKEN_EXPIRY_BUFFER_SECONDS) * 1000
      refreshTimerRef.current = window.setTimeout(() => {
        handleTokenRefresh().catch(() => {
          // Error already handled in handleTokenRefresh
        })
      }, refreshTime)
    },
    [clearRefreshTimer, handleTokenRefresh],
  )

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearRefreshTimer()
    }
  }, [clearRefreshTimer])

  return {
    scheduleRefresh,
    handleTokenRefresh,
    clearRefreshTimer,
  }
}
