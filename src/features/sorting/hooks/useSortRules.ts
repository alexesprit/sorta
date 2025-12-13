import { useCallback, useState } from 'react'
import {
  convertToRawSortRules,
  parseSortRules,
  type SortRule,
} from '@/features/sorting/utils/sortRules'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'

export function useSortRules(
  defaultRawSortRules: string,
): [SortRule[], (value: SortRule[]) => void] {
  const [rawSortRules, setRawSortRules] = useLocalStorage(
    STORAGE_KEYS.SORT_RULES,
    defaultRawSortRules,
  )
  const [sortRules, setSortRules] = useState(() => {
    try {
      return parseSortRules(rawSortRules)
    } catch (_e) {
      return []
    }
  })

  const setSortRulesValue = useCallback(
    (value: SortRule[]) => {
      setSortRules(value)
      setRawSortRules(convertToRawSortRules(value))
    },
    [setRawSortRules],
  )

  return [sortRules, setSortRulesValue]
}
