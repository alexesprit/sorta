/**
 * Sort key type.
 */
export type SortKey =
  | 'artist'
  | 'title'
  | 'album'
  | 'release_date'
  | 'disc_number'
  | 'track_number'

/**
 * Sort oder type.
 */
type SortOrder = 'asc' | 'desc'

/**
 * Sort rule type.
 */
export type SortRule = [SortKey, SortOrder]

import * as m from '@/paraglide/messages'

/**
 * Display labels for sort keys.
 */
export const SORT_KEY_LABELS: Record<SortKey, string> = {
  artist: m.artist(),
  album: m.album(),
  release_date: m.release_date(),
  title: m.track_title(),
  disc_number: m.disc_number(),
  track_number: m.track_number(),
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
 * Get the display label for a sort key using Paraglide messages.
 */
function getSortKeyLabel(sortKey: SortKey): string {
  switch (sortKey) {
    case 'artist':
      return m.artist()
    case 'album':
      return m.album()
    case 'release_date':
      return m.release_date()
    case 'title':
      return m.track_title()
    case 'disc_number':
      return m.disc_number()
    case 'track_number':
      return m.track_number()
    default:
      return sortKey
  }
}

/**
 * Return a display name for the given sort key.
 *
 * @param sortKey Sort key
 *
 * @return Display name of the sort key
 */
export function getSortKeyName(sortKey: SortKey): string {
  return getSortKeyLabel(sortKey)
}

/* Internal */

const sortRuleSeparator = ' '
const sortKeyOrderSeparator = '/'

const validSortKeys = [
  'artist',
  'album',
  'release_date',
  'title',
  'disc_number',
  'track_number',
] as const
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
