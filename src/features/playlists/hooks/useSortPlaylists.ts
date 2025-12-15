import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useState,
  useTransition,
} from 'react'
import type {
  Playlist,
  PlaylistStatus,
} from '@/features/playlists/models/Playlist'
import type { ShuffleConfig, SortMode } from '@/features/shuffle/types'
import { shuffleTracks } from '@/features/shuffle/utils/shuffleTracks'
import type { SortRule } from '@/features/sorting/utils/sortRules'
import { sortTracks } from '@/features/sorting/utils/sortTracks'
import {
  getMyId,
  getMyPlaylists,
  getPlaylistTracks,
  setPlaylistTracks,
} from '@/shared/api/spotify'

/**
 * Update the status of a specific playlist
 */
function updatePlaylistStatus(
  playlists: Playlist[],
  playlistId: string,
  status: PlaylistStatus,
): Playlist[] {
  return playlists.map((playlist) =>
    playlist.id === playlistId ? { ...playlist, status } : playlist,
  )
}

/**
 * Reset all playlists to 'ready' status
 */
function resetAllPlaylists(playlists: Playlist[]): Playlist[] {
  return playlists.map((playlist) => ({ ...playlist, status: 'ready' }))
}

/**
 * Process a single playlist: fetch tracks, sort/shuffle them, and update on Spotify
 */
async function processSinglePlaylist(
  playlistId: string,
  sortRules: SortRule[],
  mode: SortMode,
  shuffleConfig: ShuffleConfig,
): Promise<PlaylistStatus> {
  const tracks = await getPlaylistTracks(playlistId)
  let areTracksSorted = false

  if (mode === 'sort') {
    areTracksSorted = sortTracks(tracks, sortRules)
  } else {
    const shuffledTracks = shuffleTracks(tracks, shuffleConfig)

    // Check if order actually changed
    // Simple check: compare IDs
    const currentIds = tracks.map((t) => t.track?.id).join(',')
    const newIds = shuffledTracks.map((t) => t.track?.id).join(',')

    if (currentIds !== newIds) {
      // In-place update of the tracks array to match what sortTracks does
      // sortTracks modifies the array in-place, shuffleTracks returns a new one
      tracks.splice(0, tracks.length, ...shuffledTracks)
      areTracksSorted = true
    }
  }

  if (!areTracksSorted) {
    return 'unchanged'
  }

  try {
    await setPlaylistTracks(playlistId, tracks)
    return mode === 'sort' ? 'sorted' : 'shuffled'
  } catch (_e) {
    return 'error'
  }
}

export function useSortPlaylists(
  sortRules: SortRule[],
  mode: SortMode = 'sort',
  shuffleConfig: ShuffleConfig = {
    weighted: 'random',
    smart: { artist: false, album: false },
  },
): [
  Playlist[],
  Dispatch<SetStateAction<Playlist[]>>,
  () => Promise<void>,
  boolean,
  boolean,
  boolean,
] {
  const [isFirstSortRun, setIsFirstSortRun] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [playlists, setPlaylists, isLoading] = usePlaylists()
  const [isPending, startTransition] = useTransition()

  async function sortPlaylists() {
    startTransition(() => {
      setIsProcessing(true)
    })

    if (isFirstSortRun) {
      setIsFirstSortRun(false)
    } else {
      startTransition(() => {
        setPlaylists((prev) => resetAllPlaylists(prev))
      })
    }

    // Only sort selected playlists
    const playlistsToSort = playlists.filter((p) => p.selected)

    for (const { id: playlistId } of playlistsToSort) {
      // Set status to 'sorting' before processing
      startTransition(() => {
        setPlaylists((prev) =>
          updatePlaylistStatus(prev, playlistId, 'sorting'),
        )
      })

      // Process the playlist
      const finalStatus = await processSinglePlaylist(
        playlistId,
        sortRules,
        mode,
        shuffleConfig,
      )

      // Set final status after processing
      startTransition(() => {
        setPlaylists((prev) =>
          updatePlaylistStatus(prev, playlistId, finalStatus),
        )
      })
    }

    startTransition(() => {
      setIsProcessing(false)
    })
  }

  return [
    playlists,
    setPlaylists,
    sortPlaylists,
    isProcessing,
    isLoading,
    isPending,
  ]
}

function usePlaylists(): [
  Playlist[],
  Dispatch<SetStateAction<Playlist[]>>,
  boolean,
] {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPlaylists() {
      try {
        setIsLoading(true)
        setPlaylists(await fetchPlaylists(controller.signal))
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to load playlists:', error)
          setPlaylists([]) // Set empty array on error
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadPlaylists()

    return () => {
      controller.abort()
    }
  }, [])

  return [playlists, setPlaylists, isLoading]
}

async function fetchPlaylists(signal?: AbortSignal): Promise<Playlist[]> {
  const myId = await getMyId()
  if (signal?.aborted) {
    throw new Error('Aborted')
  }

  const spotifyPlaylists = await getMyPlaylists()
  if (signal?.aborted) {
    throw new Error('Aborted')
  }

  return spotifyPlaylists
    .filter(({ owner }) => owner.id === myId)
    .map((playlist) => {
      const { id, name, external_urls, tracks } = playlist

      return {
        id,
        name,
        href: external_urls.spotify,
        status: 'ready',
        tracks: tracks?.total ?? 0,
        selected: false,
      }
    })
}
