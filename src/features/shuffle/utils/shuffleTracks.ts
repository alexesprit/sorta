import type {
  ShuffleConfig,
  ShuffleWeight,
  SmartSeparation,
} from '@/features/shuffle/types'
import {
  getAlbumName,
  getArtistName,
} from '@/features/sorting/utils/trackTypeGuards'

type PlaylistTrack = SpotifyApi.PlaylistTrackObject

// Fisher-Yates shuffle
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // In Fisher-Yates, i and j are guaranteed to be valid indices
    const temp = shuffled[i] as T
    shuffled[i] = shuffled[j] as T
    shuffled[j] = temp
  }
  return shuffled
}

// Get popularity score (0-100)
function getPopularity(track: PlaylistTrack): number {
  return (track.track as SpotifyApi.TrackObjectFull).popularity || 0
}

// Weighted shuffle based on popularity
function weightedShuffle(
  tracks: PlaylistTrack[],
  weight: ShuffleWeight,
): PlaylistTrack[] {
  if (weight === 'random') {
    return fisherYatesShuffle(tracks)
  }

  // Calculate weights based on popularity
  const itemsWithWeights = tracks.map((track) => {
    let score = getPopularity(track)
    // Add small random jitter to avoid identical sorting for same popularity
    score += Math.random() * 5

    if (weight === 'popularity-low') {
      // Invert popularity for "favor obscure"
      // Use 105 to ensure even 100 popularity has some positive weight
      score = 105 - score
    }
    // For popularity-high, we just use the score directly

    // Ensure score is positive
    return { track, weight: Math.max(1, score) }
  })

  // Weighted random selection
  const shuffled: PlaylistTrack[] = []
  const available = [...itemsWithWeights]

  while (available.length > 0) {
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0)
    let randomValue = Math.random() * totalWeight

    let selectedIndex = -1
    for (let i = 0; i < available.length; i++) {
      const item = available[i]
      if (!item) {
        continue
      }

      randomValue -= item.weight
      if (randomValue <= 0) {
        selectedIndex = i
        break
      }
    }

    // Fallback for floating point errors
    if (selectedIndex === -1) {
      selectedIndex = available.length - 1
    }

    const selectedItem = available[selectedIndex]
    if (!selectedItem) {
      break // Should not happen, but safety check
    }

    shuffled.push(selectedItem.track)
    available.splice(selectedIndex, 1)
  }

  return shuffled
}

// Apply smart separation rules
function applySmartSeparation(
  tracks: PlaylistTrack[],
  config: SmartSeparation,
): PlaylistTrack[] {
  if (!config.artist && !config.album) {
    return tracks
  }

  const result: PlaylistTrack[] = []
  const pool = [...tracks]

  // Track consecutive counts to detect impossible situations
  let consecutiveSkips = 0
  const MAX_SKIPS = pool.length * 2 // Breakout threshold

  while (pool.length > 0) {
    // If we've skipped too many times, just take the next available to prevent infinite loop
    if (consecutiveSkips > MAX_SKIPS) {
      result.push(...pool)
      break
    }

    let candidateIndex = 0
    let found = false

    // Try to find a track that doesn't violate rules
    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i]
      const lastTrack = result.length > 0 ? result[result.length - 1] : null

      if (!lastTrack) {
        candidateIndex = i
        found = true
        break
      }

      let violatesRule = false

      if (config.artist) {
        if (
          candidate &&
          lastTrack &&
          getArtistName(candidate) === getArtistName(lastTrack)
        ) {
          violatesRule = true
        }
      }

      if (!violatesRule && config.album) {
        if (
          candidate &&
          lastTrack &&
          getAlbumName(candidate) === getAlbumName(lastTrack)
        ) {
          violatesRule = true
        }
      }

      if (!violatesRule) {
        candidateIndex = i
        found = true
        break
      }
    }

    // If no valid track found, just take the first one (edge case: only one artist/album left)
    if (!found) {
      // If we can't find a good match, picking the first one is the best fallback
      // But let's try to pick one that violates FEWER rules if possible?
      // For now, simplicity: take the first available.
      // In a "smart" shuffle, if you have 10 songs by Artist A and 1 by Artist B,
      // eventually you HAVE to play Artist A back-to-back.
      candidateIndex = 0
    }

    const candidate = pool[candidateIndex]
    if (!candidate) {
      break // Should not happen, but safety check
    }

    result.push(candidate)
    pool.splice(candidateIndex, 1)

    if (found) {
      consecutiveSkips = 0
    } else {
      consecutiveSkips++
    }
  }

  return result
}

export function shuffleTracks(
  tracks: PlaylistTrack[],
  config: ShuffleConfig,
): PlaylistTrack[] {
  // 1. First apply weighted shuffle (or random)
  const initialShuffle = weightedShuffle(tracks, config.weighted)

  // 2. Then apply smart separation if enabled
  if (config.smart.artist || config.smart.album) {
    return applySmartSeparation(initialShuffle, config.smart)
  }

  return initialShuffle
}
