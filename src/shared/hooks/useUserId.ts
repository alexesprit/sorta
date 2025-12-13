import { useEffect, useState } from 'react'

import { getMyId } from '@/shared/api/spotify'

/**
 * Fetch user ID asynchronously.
 *
 * @param enabled - Whether to enable fetching the user ID
 * @return User ID
 */
export function useUserId(enabled = true): string | null {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setUserId(null)
      return
    }

    async function fetchUserId() {
      try {
        setUserId(await getMyId())
      } catch {
        // If API call fails (e.g., no token), set userId to null
        setUserId(null)
      }
    }

    fetchUserId()
  }, [enabled])

  return userId
}
