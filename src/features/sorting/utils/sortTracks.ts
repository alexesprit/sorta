import type { PlaylistedTrack, TrackItem } from '@spotify/web-api-ts-sdk'
import type { SortKey, SortRule } from '@/features/sorting/utils/sortRules'
import {
  getAlbumName,
  getArtistName,
  getDiscNumber,
  getReleaseDate,
  getTrackNumber,
  getTrackTitle,
} from '@/features/sorting/utils/trackTypeGuards'

type PlaylistTrack = PlaylistedTrack<TrackItem>

type CompareFunction = (trackA: PlaylistTrack, trackB: PlaylistTrack) => number

function createStringCompare(
  getter: (track: PlaylistTrack) => string,
): CompareFunction {
  return (trackA, trackB) => compareStrings(getter(trackA), getter(trackB))
}

function createNumberCompare(
  getter: (track: PlaylistTrack) => number,
): CompareFunction {
  return (trackA, trackB) => getter(trackA) - getter(trackB)
}

const rulesCompareFunctions: Record<SortKey, CompareFunction> = {
  artist: createStringCompare(getArtistName),
  title: createStringCompare(getTrackTitle),
  album: createStringCompare(getAlbumName),
  release_date: createStringCompare(getReleaseDate),
  disc_number: createNumberCompare(getDiscNumber),
  track_number: createNumberCompare(getTrackNumber),
}

export function sortTracks(
  tracks: PlaylistTrack[],
  sortRules: SortRule[],
): boolean {
  let isArrayChanged = false

  tracks.sort((trackA, trackB) => {
    for (const [sortRule, sortOrder] of sortRules) {
      const compareFn = rulesCompareFunctions[sortRule]

      const compareResult = compareFn(trackA, trackB)
      if (compareResult !== 0) {
        const compareResultValue =
          sortOrder === 'asc' ? compareResult : -compareResult
        if (compareResultValue < 0) {
          isArrayChanged = true
        }

        return compareResultValue
      }
    }

    return 0
  })

  return isArrayChanged
}

function compareStrings(str1: string, str2: string): number {
  if (!str1) {
    return -1
  }

  if (!str2) {
    return 1
  }

  return str1.localeCompare(str2)
}
