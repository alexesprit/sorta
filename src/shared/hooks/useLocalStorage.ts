import { useCallback, useState } from 'react'

/**
 * Custom hook for localStorage with proper type safety
 *
 * @param key The localStorage key
 * @param initialValue The initial value if key doesn't exist
 * @returns Tuple of [value, setValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  function getStoredValue(): T {
    try {
      const item = localStorage.getItem(key)
      if (!item) {
        return initialValue
      }

      return JSON.parse(item) as T
    } catch (_error) {
      // If JSON parsing fails or localStorage is unavailable, return initial value
      return initialValue
    }
  }

  const [storedValueState, setStoredValueState] = useState<T>(getStoredValue)

  const setStoredValue = useCallback(
    (value: T): void => {
      try {
        setStoredValueState(value)
        localStorage.setItem(key, JSON.stringify(value))
      } catch (_error) {
        // Silently fail if localStorage is unavailable
        // The state will still update, just won't persist
      }
    },
    [key],
  )

  return [storedValueState, setStoredValue]
}
