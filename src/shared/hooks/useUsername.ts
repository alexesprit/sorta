import { useEffect, useState } from 'react'

import { getUsername } from '@/shared/api/spotify'

/**
 * Fetch username asynchronously with localStorage caching.
 *
 * @param enabled - Whether to enable fetching the username
 * @return Username (display name)
 */
export function useUsername(enabled = true): string | null {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setUsername(null)
      return
    }

    async function fetchUsername() {
      try {
        setUsername(await getUsername())
      } catch {
        // If API call fails (e.g., no token), set username to null
        setUsername(null)
      }
    }

    fetchUsername()
  }, [enabled])

  return username
}
