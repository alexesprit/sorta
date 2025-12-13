import { act, renderHook, waitFor } from '@testing-library/react'
import { usePlaylistSelection } from '@/features/playlists/hooks/usePlaylistSelection'
import type { Playlist } from '@/features/playlists/models/Playlist'

describe('usePlaylistSelection', () => {
  const createMockPlaylist = (
    id: string,
    name: string,
    selected = false,
  ): Playlist => ({
    id,
    name,
    href: `https://open.spotify.com/playlist/${id}`,
    status: 'ready',
    tracks: 10,
    selected,
  })

  const mockPlaylists: Playlist[] = [
    createMockPlaylist('1', 'Rock Classics'),
    createMockPlaylist('2', 'Jazz Favorites'),
    createMockPlaylist('3', 'Classical Music'),
    createMockPlaylist('4', 'Rock and Roll'),
    createMockPlaylist('5', 'Electronic Dance Music'),
  ]

  describe('filtering playlists', () => {
    test('should return all playlists when search term is empty', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      expect(result.current.filteredPlaylists).toEqual(mockPlaylists)
    })

    test('should filter playlists by search term', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Jazz')
      })

      expect(result.current.filteredPlaylists).toEqual([mockPlaylists[1]])
    })

    test('should filter playlists case-insensitively', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('jazz')
      })

      expect(result.current.filteredPlaylists).toEqual([mockPlaylists[1]])
    })

    test('should filter playlists with uppercase search term', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('ROCK')
      })

      expect(result.current.filteredPlaylists).toEqual([
        mockPlaylists[0],
        mockPlaylists[3],
      ])
    })

    test('should filter playlists with mixed case search term', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('RoCk')
      })

      expect(result.current.filteredPlaylists).toEqual([
        mockPlaylists[0],
        mockPlaylists[3],
      ])
    })

    test('should filter by partial match', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Music')
      })

      expect(result.current.filteredPlaylists).toEqual([
        mockPlaylists[2],
        mockPlaylists[4],
      ])
    })

    test('should return empty array when no playlists match', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Nonexistent Playlist')
      })

      expect(result.current.filteredPlaylists).toEqual([])
    })

    test('should handle single character search', async () => {
      const setPlaylists = vi.fn()
      const { result, rerender } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('R')
      })

      // Force a re-render to ensure state updates
      rerender()

      expect(result.current.searchTerm).toBe('R')
      expect(result.current.filteredPlaylists).toEqual([
        mockPlaylists[0], // Rock Classics (contains R)
        mockPlaylists[1], // Jazz Favorites (contains r in Favorites)
        mockPlaylists[3], // Rock and Roll (contains R)
        mockPlaylists[4], // Electronic Dance Music (contains r in Electronic)
      ])
    })

    test('should clear filter when search term is set to empty', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Jazz')
      })

      expect(result.current.filteredPlaylists).toEqual([mockPlaylists[1]])

      act(() => {
        result.current.setSearchTerm('')
      })

      expect(result.current.filteredPlaylists).toEqual(mockPlaylists)
    })
  })

  describe('search term management', () => {
    test('should initialize with empty search term', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      expect(result.current.searchTerm).toBe('')
    })

    test('should update search term', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Rock')
      })

      expect(result.current.searchTerm).toBe('Rock')
    })

    test('should handle multiple search term updates', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Jazz')
      })
      expect(result.current.searchTerm).toBe('Jazz')

      act(() => {
        result.current.setSearchTerm('Rock')
      })
      expect(result.current.searchTerm).toBe('Rock')

      act(() => {
        result.current.setSearchTerm('')
      })
      expect(result.current.searchTerm).toBe('')
    })
  })

  describe('individual playlist selection', () => {
    test('should toggle playlist selection from unselected to selected', () => {
      let playlists = [...mockPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.togglePlaylist('1')
      })

      expect(setPlaylists).toHaveBeenCalledTimes(1)
      const updatedPlaylists = setPlaylists.mock.calls[0]?.[0]?.(mockPlaylists)
      expect(updatedPlaylists[0].selected).toBe(true)
      expect(updatedPlaylists[1].selected).toBe(false)
    })

    test('should toggle playlist selection from selected to unselected', () => {
      const selectedPlaylists = mockPlaylists.map((p) =>
        p.id === '1' ? { ...p, selected: true } : p,
      )
      let playlists = [...selectedPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.togglePlaylist('1')
      })

      const updatedPlaylists =
        setPlaylists.mock.calls[0]?.[0]?.(selectedPlaylists)
      expect(updatedPlaylists[0].selected).toBe(false)
    })

    test('should only toggle the specified playlist', () => {
      let playlists = [...mockPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.togglePlaylist('2')
      })

      const updatedPlaylists = setPlaylists.mock.calls[0]?.[0]?.(mockPlaylists)
      expect(updatedPlaylists[0].selected).toBe(false)
      expect(updatedPlaylists[1].selected).toBe(true)
      expect(updatedPlaylists[2].selected).toBe(false)
      expect(updatedPlaylists[3].selected).toBe(false)
      expect(updatedPlaylists[4].selected).toBe(false)
    })

    test('should handle toggling non-existent playlist gracefully', () => {
      let playlists = [...mockPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.togglePlaylist('nonexistent')
      })

      const updatedPlaylists = setPlaylists.mock.calls[0]?.[0]?.(mockPlaylists)
      expect(updatedPlaylists).toEqual(mockPlaylists)
    })
  })

  describe('toggle all playlists', () => {
    test('should select all filtered playlists when none are selected', () => {
      let playlists = [...mockPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.toggleAll()
      })

      const updatedPlaylists = setPlaylists.mock.calls[0]?.[0]?.(mockPlaylists)
      expect(
        updatedPlaylists.every((p: (typeof mockPlaylists)[0]) => p.selected),
      ).toBe(true)
    })

    test('should deselect all filtered playlists when all are selected', () => {
      const allSelectedPlaylists = mockPlaylists.map((p) => ({
        ...p,
        selected: true,
      }))
      let playlists = [...allSelectedPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.toggleAll()
      })

      const updatedPlaylists =
        setPlaylists.mock.calls[0]?.[0]?.(allSelectedPlaylists)
      expect(
        updatedPlaylists.every((p: (typeof mockPlaylists)[0]) => !p.selected),
      ).toBe(true)
    })

    test('should select all when some but not all are selected', () => {
      const someSelectedPlaylists = mockPlaylists.map((p, index) => ({
        ...p,
        selected: index < 2,
      }))
      let playlists = [...someSelectedPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.toggleAll()
      })

      const updatedPlaylists = setPlaylists.mock.calls[0]?.[0]?.(
        someSelectedPlaylists,
      )
      expect(
        updatedPlaylists.every((p: (typeof mockPlaylists)[0]) => p.selected),
      ).toBe(true)
    })

    test('should only toggle filtered playlists when search is active', () => {
      let playlists = [...mockPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Rock')
      })

      act(() => {
        result.current.toggleAll()
      })

      const updatedPlaylists = setPlaylists.mock.calls[0]?.[0]?.(mockPlaylists)
      // Rock Classics and Rock and Roll should be selected
      expect(updatedPlaylists[0].selected).toBe(true)
      expect(updatedPlaylists[1].selected).toBe(false)
      expect(updatedPlaylists[2].selected).toBe(false)
      expect(updatedPlaylists[3].selected).toBe(true)
      expect(updatedPlaylists[4].selected).toBe(false)
    })

    test('should deselect filtered playlists while keeping others selected', () => {
      const allSelectedPlaylists = mockPlaylists.map((p) => ({
        ...p,
        selected: true,
      }))
      let playlists = [...allSelectedPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result } = renderHook(() =>
        usePlaylistSelection(playlists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Rock')
      })

      act(() => {
        result.current.toggleAll()
      })

      const updatedPlaylists =
        setPlaylists.mock.calls[0]?.[0]?.(allSelectedPlaylists)
      // Rock Classics and Rock and Roll should be deselected, others stay selected
      expect(updatedPlaylists[0].selected).toBe(false)
      expect(updatedPlaylists[1].selected).toBe(true)
      expect(updatedPlaylists[2].selected).toBe(true)
      expect(updatedPlaylists[3].selected).toBe(false)
      expect(updatedPlaylists[4].selected).toBe(true)
    })
  })

  describe('selected count', () => {
    test('should return 0 when no playlists are selected', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      expect(result.current.selectedCount).toBe(0)
    })

    test('should calculate selected count correctly with one selected', () => {
      const oneSelectedPlaylists = mockPlaylists.map((p, index) => ({
        ...p,
        selected: index === 0,
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(oneSelectedPlaylists, setPlaylists),
      )

      expect(result.current.selectedCount).toBe(1)
    })

    test('should calculate selected count correctly with multiple selected', () => {
      const multipleSelectedPlaylists = mockPlaylists.map((p, index) => ({
        ...p,
        selected: index < 3,
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(multipleSelectedPlaylists, setPlaylists),
      )

      expect(result.current.selectedCount).toBe(3)
    })

    test('should calculate selected count correctly when all are selected', () => {
      const allSelectedPlaylists = mockPlaylists.map((p) => ({
        ...p,
        selected: true,
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(allSelectedPlaylists, setPlaylists),
      )

      expect(result.current.selectedCount).toBe(5)
    })

    test('should update selected count after toggling', async () => {
      let playlists = [...mockPlaylists]
      const setPlaylists = vi.fn((updater) => {
        playlists = typeof updater === 'function' ? updater(playlists) : updater
      })

      const { result, rerender } = renderHook(
        ({ playlists, setPlaylists }) =>
          usePlaylistSelection(playlists, setPlaylists),
        {
          initialProps: { playlists, setPlaylists },
        },
      )

      expect(result.current.selectedCount).toBe(0)

      act(() => {
        result.current.togglePlaylist('1')
      })

      // Update the playlists prop and rerender
      rerender({ playlists, setPlaylists })

      await waitFor(() => {
        expect(result.current.selectedCount).toBe(1)
      })
    })
  })

  describe('isAllSelected', () => {
    test('should return false when no playlists are selected', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      expect(result.current.isAllSelected).toBe(false)
    })

    test('should return false when some playlists are selected', () => {
      const someSelectedPlaylists = mockPlaylists.map((p, index) => ({
        ...p,
        selected: index < 2,
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(someSelectedPlaylists, setPlaylists),
      )

      expect(result.current.isAllSelected).toBe(false)
    })

    test('should return true when all playlists are selected', () => {
      const allSelectedPlaylists = mockPlaylists.map((p) => ({
        ...p,
        selected: true,
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(allSelectedPlaylists, setPlaylists),
      )

      expect(result.current.isAllSelected).toBe(true)
    })

    test('should return false when filtered list is empty', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Nonexistent')
      })

      expect(result.current.isAllSelected).toBe(false)
    })

    test('should return true when all filtered playlists are selected', () => {
      const rockPlaylistsSelected = mockPlaylists.map((p) => ({
        ...p,
        selected: p.name.toLowerCase().includes('rock'),
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(rockPlaylistsSelected, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Rock')
      })

      expect(result.current.isAllSelected).toBe(true)
    })

    test('should return false when not all filtered playlists are selected', () => {
      const oneRockPlaylistSelected = mockPlaylists.map((p) => ({
        ...p,
        selected: p.id === '1',
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(oneRockPlaylistSelected, setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Rock')
      })

      expect(result.current.isAllSelected).toBe(false)
    })
  })

  describe('selectedPlaylists', () => {
    test('should return empty array when no playlists are selected', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      expect(result.current.selectedPlaylists).toEqual([])
    })

    test('should return only selected playlists', () => {
      const someSelectedPlaylists = mockPlaylists.map((p, index) => ({
        ...p,
        selected: index === 1 || index === 3,
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(someSelectedPlaylists, setPlaylists),
      )

      expect(result.current.selectedPlaylists).toEqual([
        someSelectedPlaylists[1],
        someSelectedPlaylists[3],
      ])
    })

    test('should return all playlists when all are selected', () => {
      const allSelectedPlaylists = mockPlaylists.map((p) => ({
        ...p,
        selected: true,
      }))
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection(allSelectedPlaylists, setPlaylists),
      )

      expect(result.current.selectedPlaylists).toEqual(allSelectedPlaylists)
    })
  })

  describe('empty playlists list', () => {
    test('should handle empty playlists array', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection([], setPlaylists),
      )

      expect(result.current.filteredPlaylists).toEqual([])
      expect(result.current.selectedPlaylists).toEqual([])
      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
    })

    test('should handle search on empty playlists array', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection([], setPlaylists),
      )

      act(() => {
        result.current.setSearchTerm('Test')
      })

      expect(result.current.filteredPlaylists).toEqual([])
    })

    test('should handle toggleAll on empty playlists array', () => {
      const setPlaylists = vi.fn()
      const { result } = renderHook(() =>
        usePlaylistSelection([], setPlaylists),
      )

      act(() => {
        result.current.toggleAll()
      })

      expect(setPlaylists).toHaveBeenCalled()
    })
  })

  describe('callback stability', () => {
    test('should maintain stable togglePlaylist callback', () => {
      const setPlaylists = vi.fn()
      const { result, rerender } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      const initialToggle = result.current.togglePlaylist
      rerender()
      const afterRerender = result.current.togglePlaylist

      expect(initialToggle).toBe(afterRerender)
    })

    test('should maintain stable toggleAll callback', () => {
      const setPlaylists = vi.fn()
      const { result, rerender } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      const initialToggleAll = result.current.toggleAll
      rerender()
      const afterRerender = result.current.toggleAll

      expect(initialToggleAll).toBe(afterRerender)
    })

    test('should maintain stable setSearchTerm callback', () => {
      const setPlaylists = vi.fn()
      const { result, rerender } = renderHook(() =>
        usePlaylistSelection(mockPlaylists, setPlaylists),
      )

      const initialSetSearchTerm = result.current.setSearchTerm
      rerender()
      const afterRerender = result.current.setSearchTerm

      expect(initialSetSearchTerm).toBe(afterRerender)
    })
  })
})
