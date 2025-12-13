import { useCallback, useMemo, useState } from 'react'
import type { Playlist } from '@/features/playlists/models/Playlist'

interface UsePlaylistSelectionResult {
  selectedPlaylists: Playlist[]
  searchTerm: string
  filteredPlaylists: Playlist[]
  togglePlaylist: (playlistId: string) => void
  toggleAll: () => void
  setSearchTerm: (term: string) => void
  selectedCount: number
  isAllSelected: boolean
}

export function usePlaylistSelection(
  playlists: Playlist[],
  setPlaylists: (
    playlists: Playlist[] | ((prev: Playlist[]) => Playlist[]),
  ) => void,
): UsePlaylistSelectionResult {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter playlists based on search term
  const filteredPlaylists = useMemo(() => {
    if (!searchTerm) {
      return playlists
    }
    const lowerTerm = searchTerm.toLowerCase()
    return playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(lowerTerm),
    )
  }, [playlists, searchTerm])

  // Get selected playlists
  const selectedPlaylists = useMemo(() => {
    return playlists.filter((p) => p.selected)
  }, [playlists])

  const selectedCount = selectedPlaylists.length

  // Check if all filtered playlists are selected
  const isAllSelected = useMemo(() => {
    return (
      filteredPlaylists.length > 0 && filteredPlaylists.every((p) => p.selected)
    )
  }, [filteredPlaylists])

  // Toggle individual playlist selection
  const togglePlaylist = useCallback(
    (playlistId: string) => {
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId ? { ...p, selected: !p.selected } : p,
        ),
      )
    },
    [setPlaylists],
  )

  // Toggle all filtered playlists
  const toggleAll = useCallback(() => {
    const shouldSelectAll = !isAllSelected
    const filteredIds = new Set(filteredPlaylists.map((p) => p.id))

    setPlaylists((prev) =>
      prev.map((p) =>
        filteredIds.has(p.id) ? { ...p, selected: shouldSelectAll } : p,
      ),
    )
  }, [isAllSelected, filteredPlaylists, setPlaylists])

  return {
    selectedPlaylists,
    searchTerm,
    filteredPlaylists,
    togglePlaylist,
    toggleAll,
    setSearchTerm,
    selectedCount,
    isAllSelected,
  }
}
