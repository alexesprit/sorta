import { act, renderHook } from '@testing-library/react'
import { useSortRules } from '@/features/sorting/hooks/useSortRules'
import type { SortRule } from '@/features/sorting/utils/sortRules'
import { STORAGE_KEYS } from '@/shared/constants/storage'

describe('useSortRules', () => {
  const sortRulesStorageKey = STORAGE_KEYS.SORT_RULES

  beforeEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    test('should initialize with default rules when localStorage is empty', () => {
      const defaultRules = 'artist album/desc'
      const { result } = renderHook(() => useSortRules(defaultRules))

      const [sortRules] = result.current
      expect(sortRules).toEqual([
        ['artist', 'asc'],
        ['album', 'desc'],
      ])
    })

    test('should initialize with parsed default rules', () => {
      const defaultRules = 'release_date/desc title'
      const { result } = renderHook(() => useSortRules(defaultRules))

      const [sortRules] = result.current
      expect(sortRules).toEqual([
        ['release_date', 'desc'],
        ['title', 'asc'],
      ])
    })

    test('should load rules from localStorage when available', () => {
      const storedRules = 'title/desc album'
      localStorage.setItem(sortRulesStorageKey, JSON.stringify(storedRules))

      const { result } = renderHook(() => useSortRules('artist'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([
        ['title', 'desc'],
        ['album', 'asc'],
      ])
    })

    test('should prioritize localStorage over default rules', () => {
      const storedRules = 'album/desc'
      const defaultRules = 'artist title'
      localStorage.setItem(sortRulesStorageKey, JSON.stringify(storedRules))

      const { result } = renderHook(() => useSortRules(defaultRules))

      const [sortRules] = result.current
      expect(sortRules).toEqual([['album', 'desc']])
    })
  })

  describe('localStorage integration', () => {
    test('should save rules to localStorage when updated', () => {
      const defaultRules = 'artist'
      const { result } = renderHook(() => useSortRules(defaultRules))

      const newRules: SortRule[] = [
        ['release_date', 'desc'],
        ['title', 'asc'],
      ]

      act(() => {
        const [, setSortRules] = result.current
        setSortRules(newRules)
      })

      const stored = localStorage.getItem(sortRulesStorageKey)
      expect(stored).toBe(JSON.stringify('release_date/desc title'))
    })

    test('should update state and localStorage together', () => {
      const { result } = renderHook(() => useSortRules('artist'))

      const newRules: SortRule[] = [['album', 'desc']]

      act(() => {
        const [, setSortRules] = result.current
        setSortRules(newRules)
      })

      const [sortRules] = result.current
      expect(sortRules).toEqual([['album', 'desc']])
      expect(localStorage.getItem(sortRulesStorageKey)).toBe(
        JSON.stringify('album/desc'),
      )
    })

    test('should persist multiple rules to localStorage', () => {
      const { result } = renderHook(() => useSortRules('artist'))

      const newRules: SortRule[] = [
        ['artist', 'asc'],
        ['album', 'desc'],
        ['release_date', 'asc'],
        ['title', 'desc'],
      ]

      act(() => {
        const [, setSortRules] = result.current
        setSortRules(newRules)
      })

      const stored = localStorage.getItem(sortRulesStorageKey)
      expect(stored).toBe(
        JSON.stringify('artist album/desc release_date title/desc'),
      )
    })

    test('should save empty rules to localStorage', () => {
      const { result } = renderHook(() => useSortRules('artist'))

      act(() => {
        const [, setSortRules] = result.current
        setSortRules([])
      })

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
      expect(localStorage.getItem(sortRulesStorageKey)).toBe(JSON.stringify(''))
    })
  })

  describe('invalid stored rules handling', () => {
    test('should fallback to empty array when stored rules are invalid', () => {
      localStorage.setItem(
        sortRulesStorageKey,
        JSON.stringify('invalid/invalid'),
      )

      const { result } = renderHook(() => useSortRules('artist'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })

    test('should handle invalid sort key gracefully', () => {
      localStorage.setItem(
        sortRulesStorageKey,
        JSON.stringify('invalidkey/asc'),
      )

      const { result } = renderHook(() => useSortRules('artist'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })

    test('should handle invalid sort order gracefully', () => {
      localStorage.setItem(
        sortRulesStorageKey,
        JSON.stringify('artist/invalidorder'),
      )

      const { result } = renderHook(() => useSortRules('artist'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })

    test('should handle empty string in localStorage gracefully', () => {
      localStorage.setItem(sortRulesStorageKey, JSON.stringify(''))

      const { result } = renderHook(() => useSortRules('artist'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })
  })

  describe('corrupted localStorage handling', () => {
    test('should fallback to default rules when localStorage contains invalid JSON', () => {
      localStorage.setItem(sortRulesStorageKey, 'not valid JSON {[}')

      const { result } = renderHook(() => useSortRules('artist album'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([
        ['artist', 'asc'],
        ['album', 'asc'],
      ])
    })

    test('should handle malformed JSON gracefully', () => {
      localStorage.setItem(sortRulesStorageKey, '{incomplete')

      const { result } = renderHook(() => useSortRules('release_date/desc'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([['release_date', 'desc']])
    })

    test('should handle null value in localStorage', () => {
      localStorage.setItem(sortRulesStorageKey, 'null')

      const { result } = renderHook(() => useSortRules('title'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })

    test('should handle number value in localStorage', () => {
      localStorage.setItem(sortRulesStorageKey, '123')

      const { result } = renderHook(() => useSortRules('artist'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })

    test('should handle boolean value in localStorage', () => {
      localStorage.setItem(sortRulesStorageKey, 'true')

      const { result } = renderHook(() => useSortRules('album'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })

    test('should handle object value in localStorage', () => {
      localStorage.setItem(
        sortRulesStorageKey,
        JSON.stringify({ key: 'value' }),
      )

      const { result } = renderHook(() => useSortRules('release_date'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })

    test('should handle array value in localStorage', () => {
      localStorage.setItem(
        sortRulesStorageKey,
        JSON.stringify(['artist', 'album']),
      )

      const { result } = renderHook(() => useSortRules('title'))

      const [sortRules] = result.current
      expect(sortRules).toEqual([])
    })
  })

  describe('setter function stability', () => {
    test('should maintain setter function reference across renders', () => {
      const { result, rerender } = renderHook(() => useSortRules('artist'))

      const [, initialSetter] = result.current
      rerender()
      const [, afterRerender] = result.current

      expect(initialSetter).toBe(afterRerender)
    })
  })

  describe('complex scenarios', () => {
    test('should handle multiple updates in sequence', () => {
      const { result } = renderHook(() => useSortRules('artist'))

      act(() => {
        const [, setSortRules] = result.current
        setSortRules([['album', 'desc']])
      })

      act(() => {
        const [, setSortRules] = result.current
        setSortRules([['release_date', 'asc']])
      })

      act(() => {
        const [, setSortRules] = result.current
        setSortRules([['title', 'desc']])
      })

      const [sortRules] = result.current
      expect(sortRules).toEqual([['title', 'desc']])
      expect(localStorage.getItem(sortRulesStorageKey)).toBe(
        JSON.stringify('title/desc'),
      )
    })

    test('should work across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useSortRules('artist'))

      act(() => {
        const [, setSortRules] = result1.current
        setSortRules([['album', 'desc']])
      })

      // Second instance should read updated value from localStorage
      const { result: result2 } = renderHook(() => useSortRules('title'))

      const [sortRules] = result2.current
      expect(sortRules).toEqual([['album', 'desc']])
    })
  })
})
