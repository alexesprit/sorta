import { useEffect, useState } from 'react'
import {
  type TokenData,
  tokenStorage,
} from '@/features/auth/services/tokenStorage'
import { getCallbackParams } from '@/features/auth/utils/callback'
import { exchangeCodeForToken } from '@/shared/api/spotify'
import { STORAGE_KEYS } from '@/shared/constants/storage'

interface UseAuthCallbackOptions {
  onTokenUpdate: (token: TokenData) => void
  onTokenRefresh: () => Promise<void>
  scheduleRefresh: (expiresIn: number) => void
}

interface UseAuthCallbackResult {
  accessToken: string | null
  authError: string | null
  isLoading: boolean
}

/**
 * Hook to handle OAuth callback and token restoration
 * Manages the entire authentication lifecycle on app load
 */
export function useAuthCallback({
  onTokenUpdate,
  onTokenRefresh,
  scheduleRefresh,
}: UseAuthCallbackOptions): UseAuthCallbackResult {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      const params = getCallbackParams()

      // Handle authorization errors
      if (params.error) {
        setAuthError(params.error)
        tokenStorage.clear()
        setIsLoading(false)
        // Clean up URL immediately to prevent re-processing
        window.history.replaceState({}, document.title, '/')
        return
      }

      // Handle authorization code (PKCE flow)
      if (params.code) {
        // Clean up URL immediately to prevent double-exchange
        window.history.replaceState({}, document.title, '/')

        const storedState = sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE)

        // Validate state to prevent CSRF attacks
        if (params.state !== storedState) {
          setAuthError('state_mismatch')
          setIsLoading(false)
          return
        }

        try {
          const tokenResponse = await exchangeCodeForToken(params.code)
          const tokenData = tokenStorage.saveFromResponse(
            tokenResponse.access_token,
            tokenResponse.refresh_token,
            tokenResponse.expires_in,
          )

          setAccessToken(tokenData.accessToken)
          onTokenUpdate(tokenData)

          // Schedule token refresh
          scheduleRefresh(tokenResponse.expires_in)
        } catch (error) {
          setAuthError(
            error instanceof Error ? error.message : 'token_exchange_failed',
          )
          tokenStorage.clear()
        }
      }
      // No callback params - try to restore from localStorage
      else {
        const savedToken = tokenStorage.getAccessToken()
        if (savedToken) {
          // Check if token is expired or will expire soon
          if (tokenStorage.isExpiringSoon()) {
            // Try to refresh the token
            try {
              await onTokenRefresh()
              const tokenData = tokenStorage.get()
              if (tokenData) {
                setAccessToken(tokenData.accessToken)
                onTokenUpdate(tokenData)
              }
            } catch {
              // If refresh fails, clear everything and show intro
              tokenStorage.clear()
              setAccessToken(null)
            }
          } else {
            // Token is valid, restore it
            const tokenData = tokenStorage.get()
            if (tokenData) {
              setAccessToken(tokenData.accessToken)
              onTokenUpdate(tokenData)

              // Schedule refresh for when token will expire
              const timeUntilRefresh = tokenStorage.getTimeUntilRefresh()
              if (timeUntilRefresh > 0) {
                scheduleRefresh(timeUntilRefresh / 1000)
              }
            }
          }
        }
      }

      setIsLoading(false)
    }

    handleCallback()
  }, [onTokenUpdate, onTokenRefresh, scheduleRefresh])

  return { accessToken, authError, isLoading }
}
