import {
  convertToRawSortRules,
  getSortKeyName,
  parseSortRules,
  type SortKey,
} from '@/features/sorting/utils/sortRules'

describe('parseSortRules', () => {
  test('should parse a single sort rule', () => {
    const result = parseSortRules('artist/asc')

    expect(result).toEqual([['artist', 'asc']])
  })

  test('should parse multiple sort rules', () => {
    const result = parseSortRules('artist/asc title/desc')

    expect(result).toEqual([
      ['artist', 'asc'],
      ['title', 'desc'],
    ])
  })

  test('should parse sort rules with order omitted', () => {
    const result = parseSortRules('artist/asc title')

    expect(result).toEqual([
      ['artist', 'asc'],
      ['title', 'asc'],
    ])
  })

  test('should throw an error if empty input is received', () => {
    expect(() => {
      parseSortRules('')
    }).toThrow('Empty sort rules')
  })

  test('should throw an error if invalid sort key is found', () => {
    expect(() => {
      parseSortRules('artist/asc invalid')
    }).toThrow('Invalid sort key: invalid')
  })

  test('should throw an error if invalid sort order is found', () => {
    expect(() => {
      parseSortRules('artist/invalid')
    }).toThrow('Invalid sort order: invalid')
  })

  test('should handle all four sort keys', () => {
    const result = parseSortRules('artist album release_date title')

    expect(result).toEqual([
      ['artist', 'asc'],
      ['album', 'asc'],
      ['release_date', 'asc'],
      ['title', 'asc'],
    ])
  })

  test('should handle all four sort keys with different orders', () => {
    const result = parseSortRules(
      'artist/asc album/desc release_date/asc title/desc',
    )

    expect(result).toEqual([
      ['artist', 'asc'],
      ['album', 'desc'],
      ['release_date', 'asc'],
      ['title', 'desc'],
    ])
  })

  test('should not trim leading/trailing whitespace', () => {
    // Note: The current implementation doesn't trim, so leading/trailing spaces
    // will be included in the first/last rule and cause parsing errors
    expect(() => {
      parseSortRules('  artist/asc')
    }).toThrow('Invalid sort key:')
  })

  test('should throw error on multiple spaces between rules', () => {
    // Note: Multiple spaces create empty strings when split, which fail parsing
    expect(() => {
      parseSortRules('artist/asc  title/desc')
    }).toThrow('Invalid sort key:')
  })
})

describe('convertToRawSortRules', () => {
  test('should convert rules to raw format', () => {
    const result = convertToRawSortRules([
      ['artist', 'asc'],
      ['title', 'desc'],
    ])

    expect(result).toBe('artist title/desc')
  })

  test('should omit default order (asc)', () => {
    const result = convertToRawSortRules([
      ['artist', 'asc'],
      ['album', 'asc'],
    ])

    expect(result).toBe('artist album')
  })

  test('should include explicit desc order', () => {
    const result = convertToRawSortRules([
      ['artist', 'desc'],
      ['title', 'desc'],
    ])

    expect(result).toBe('artist/desc title/desc')
  })

  test('should handle empty array', () => {
    const result = convertToRawSortRules([])

    expect(result).toBe('')
  })

  test('should handle single rule with asc order', () => {
    const result = convertToRawSortRules([['artist', 'asc']])

    expect(result).toBe('artist')
  })

  test('should handle single rule with desc order', () => {
    const result = convertToRawSortRules([['artist', 'desc']])

    expect(result).toBe('artist/desc')
  })

  test('should handle all four sort keys', () => {
    const result = convertToRawSortRules([
      ['artist', 'asc'],
      ['album', 'desc'],
      ['release_date', 'asc'],
      ['title', 'desc'],
    ])

    expect(result).toBe('artist album/desc release_date title/desc')
  })

  test('should be reversible with parseSortRules', () => {
    const original = 'artist album/desc release_date title/desc'
    const parsed = parseSortRules(original)
    const converted = convertToRawSortRules(parsed)

    expect(converted).toBe(original)
  })
})

describe('getSortKeyName', () => {
  test('should format artist key correctly', () => {
    const result = getSortKeyName('artist')

    expect(result).toBe('Artist')
  })

  test('should format album key correctly', () => {
    const result = getSortKeyName('album')

    expect(result).toBe('Album')
  })

  test('should format release_date key correctly', () => {
    const result = getSortKeyName('release_date')

    expect(result).toBe('Release Date')
  })

  test('should format title key correctly', () => {
    const result = getSortKeyName('title')

    expect(result).toBe('Track Title')
  })

  test('should handle all sort keys', () => {
    const sortKeys: SortKey[] = ['artist', 'album', 'release_date', 'title']
    const expectedNames: Record<SortKey, string> = {
      artist: 'Artist',
      album: 'Album',
      release_date: 'Release Date',
      title: 'Track Title',
    }

    sortKeys.forEach((key) => {
      const result = getSortKeyName(key)
      expect(result).toBe(expectedNames[key])
    })
  })
})
