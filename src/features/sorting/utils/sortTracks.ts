import type { SortKey, SortRule } from '@/features/sorting/utils/sortRules'
import {
  getAlbumName,
  getArtistName,
  getReleaseDate,
  getTrackTitle,
} from '@/features/sorting/utils/trackTypeGuards'

type PlaylistTrack = SpotifyApi.PlaylistTrackObject

type CompareFunction = (trackA: PlaylistTrack, trackB: PlaylistTrack) => number

const rulesCompareFunctions: Record<SortKey, CompareFunction> = {
  artist: compareArtists,
  title: compareTitles,
  album: compareAlbums,
  release_date: compareReleaseDates,
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

function compareAlbums(trackA: PlaylistTrack, trackB: PlaylistTrack): number {
  return compareStrings(getAlbumName(trackA), getAlbumName(trackB))
}

function compareArtists(trackA: PlaylistTrack, trackB: PlaylistTrack): number {
  return compareStrings(getArtistName(trackA), getArtistName(trackB))
}

function compareReleaseDates(
  trackA: PlaylistTrack,
  trackB: PlaylistTrack,
): number {
  return compareStrings(getReleaseDate(trackA), getReleaseDate(trackB))
}

function compareTitles(trackA: PlaylistTrack, trackB: PlaylistTrack): number {
  return compareStrings(getTrackTitle(trackA), getTrackTitle(trackB))
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
