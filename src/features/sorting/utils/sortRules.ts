/**
 * Sort key type.
 */
export type SortKey = 'artist' | 'title' | 'album' | 'release_date'

/**
 * Sort oder type.
 */
type SortOrder = 'asc' | 'desc'

/**
 * Sort rule type.
 */
export type SortRule = [SortKey, SortOrder]

/**
 * Display labels for sort keys.
 */
export const SORT_KEY_LABELS: Record<SortKey, string> = {
  artist: 'Artist',
  album: 'Album',
  release_date: 'Release Date',
  title: 'Track Title',
}

/**
 * Parse given raw sort rules and return an array of sort rules.
 *
 * Raw sort rules have the following format: `key/order key/order ...`.
 * All rules are separated by a space symbol.
 *
 * If the sort order is omitted, the `defaultOrder` will be used by default.
 *
 * @param rawSortRules Raw rules
 *
 * @return Array of parsed sort rules
 */
export function parseSortRules(rawSortRules: string): SortRule[] {
  if (rawSortRules.length === 0) {
    throw new TypeError('Empty sort rules')
  }

  return rawSortRules.split(sortRuleSeparator).map(parseSortRule)
}

export function convertToRawSortRules(sortRules: SortRule[]): string {
  return sortRules.map(convertToRawSortRule).join(sortRuleSeparator)
}

/**
 * Return a display name for the given sort key.
 *
 * @param sortKey Sort key
 *
 * @return Display name of the sort key
 */
export function getSortKeyName(sortKey: SortKey): string {
  return SORT_KEY_LABELS[sortKey]
}

/* Internal */

const sortRuleSeparator = ' '
const sortKeyOrderSeparator = '/'

const validSortKeys = ['artist', 'album', 'release_date', 'title'] as const
const validSortOrders: SortOrder[] = ['asc', 'desc']

const defaultSortOrder: SortOrder = 'asc'

/**
 * Parse a given raw rule and return a sort rule object.
 *
 * Raw rule is a string which have the following format: `key/order`.
 *
 * If the sort order is omitted, the `defaultOrder` will be used by default.
 *
 * @param rawSortRule Raw sort rule
 *
 * @return Sort rule
 */
function parseSortRule(rawSortRule: string): SortRule {
  const [sortKey, sortOrder] = rawSortRule.split(sortKeyOrderSeparator)

  if (!validSortKeys.includes(sortKey as SortKey)) {
    throw new TypeError(`Invalid sort key: ${sortKey}`)
  }

  if (sortOrder && !validSortOrders.includes(sortOrder as SortOrder)) {
    throw new TypeError(`Invalid sort order: ${sortOrder} ('${sortKey}' key)`)
  }

  return [sortKey, sortOrder || defaultSortOrder] as SortRule
}

function convertToRawSortRule(sortRule: SortRule) {
  const [sortKey, sortOrder] = sortRule

  if (sortOrder === defaultSortOrder) {
    return sortKey
  }

  return `${sortKey}${sortKeyOrderSeparator}${sortOrder}`
}
