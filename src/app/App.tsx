import { useCallback } from 'react'
import { IntroScreen } from '@/features/auth/components/IntroScreen'
import { useAuthCallback } from '@/features/auth/hooks/useAuthCallback'
import { useTokenRefresh } from '@/features/auth/hooks/useTokenRefresh'
import type { TokenData } from '@/features/auth/services/tokenStorage'
import { tokenStorage } from '@/features/auth/services/tokenStorage'
import { Header } from '@/features/layout/components/Header'
import { MainContent } from '@/features/layout/components/MainContent'
import * as m from '@/paraglide/messages'
import { setAccessToken } from '@/shared/api/spotify'
import { Button } from '@/shared/components/ui/button'
import { useUserId } from '@/shared/hooks/useUserId'
import '@/features/layout/styles.css'

export function App(): JSX.Element {
  // Token update callback
  const handleTokenUpdate = useCallback((tokenData: TokenData) => {
    setAccessToken(tokenData.accessToken)
  }, [])

  // Token refresh error callback
  const handleRefreshError = useCallback(() => {
    // Clear token when refresh fails
    tokenStorage.clear()
    setAccessToken(null)
  }, [])

  // Setup token refresh management
  const { scheduleRefresh, handleTokenRefresh } = useTokenRefresh({
    onTokenUpdate: handleTokenUpdate,
    onRefreshError: handleRefreshError,
  })

  // Handle OAuth callback and token restoration
  const { accessToken, authError, isLoading } = useAuthCallback({
    onTokenUpdate: handleTokenUpdate,
    onTokenRefresh: handleTokenRefresh,
    scheduleRefresh,
  })

  const isSignedIn = accessToken !== null
  const userId = useUserId(isSignedIn)

  if (isLoading) {
    return <div>{m.loading()}</div>
  }

  if (authError) {
    return (
      <div>
        {m.authentication_error()} {authError}
        <br />
        <Button onClick={() => window.location.reload()}>
          {m.try_again()}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-spotify selection:text-black flex flex-col">
      {isSignedIn && (
        <>
          <Header userId={userId} />
          <MainContent />
        </>
      )}
      {!isSignedIn && <IntroScreen />}
    </div>
  )
}
