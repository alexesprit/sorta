import { useEffect, useState } from 'react'
import { IntroScreen } from '@/features/auth/components/IntroScreen'
import { Header } from '@/features/layout/components/Header'
import { MainContent } from '@/features/layout/components/MainContent'
import * as m from '@/paraglide/messages'
import { isAuthenticated, spotifyClient } from '@/shared/api/spotifyClient'
import { Button } from '@/shared/components/ui/button'
import { useUsername } from '@/shared/hooks/useUsername'
import '@/features/layout/styles.css'

export function App(): JSX.Element {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const username = useUsername(isSignedIn)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for OAuth errors in URL
        const urlParams = new URLSearchParams(window.location.search)
        const hasAuthError = urlParams.has('error')

        if (hasAuthError) {
          const error = urlParams.get('error') || 'authentication_failed'
          setAuthError(error)
          // Clean up URL
          window.history.replaceState({}, document.title, '/')
          setIsLoading(false)
          return
        }

        // Check if we're handling an OAuth callback
        const hasAuthCode = urlParams.has('code')

        if (hasAuthCode) {
          // The URL has an auth code - the SDK needs to complete the token exchange
          // Call authenticate() which will detect the code in the URL and complete the flow
          try {
            await spotifyClient.authenticate()
            // Success! Authentication completed
            // Clean up URL after SDK processes it
            window.history.replaceState({}, document.title, '/')
            setIsSignedIn(true)
            setIsLoading(false)
            return
          } catch (err) {
            // Authentication failed
            console.error('OAuth callback processing failed:', err)
            // Clean up URL
            window.history.replaceState({}, document.title, '/')
            const errorMessage =
              err instanceof Error ? err.message : String(err)
            // If it's a verifier error, maybe authentication actually succeeded
            // Check if we have tokens in storage
            if (errorMessage.includes('verifier')) {
              console.warn('Verifier error, but checking if tokens exist...')
              // Fall through to check authentication status below
            } else {
              // Real error - show it to the user
              throw err
            }
          }
        }

        // Check authentication status
        // The SDK will automatically refresh tokens if needed
        const authenticated = await isAuthenticated()
        setIsSignedIn(authenticated)
      } catch (error) {
        console.error('Authentication error:', error)
        setAuthError(
          error instanceof Error ? error.message : 'authentication_failed',
        )
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

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
          <Header username={username} />
          <MainContent />
        </>
      )}
      {!isSignedIn && <IntroScreen />}
    </div>
  )
}
