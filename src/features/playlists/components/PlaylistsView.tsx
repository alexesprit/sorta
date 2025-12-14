import { Check, Loader2, Music, Search } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { useId } from 'react'
import { PlaylistItem } from '@/features/playlists/components/PlaylistItem'
import { PlaylistSkeleton } from '@/features/playlists/components/PlaylistSkeleton'
import { usePlaylistSelection } from '@/features/playlists/hooks/usePlaylistSelection'
import type { Playlist } from '@/features/playlists/models/Playlist'
import type { ShuffleConfig, SortMode } from '@/features/shuffle/types'
import type { SortRule } from '@/features/sorting/utils/sortRules'
import * as m from '@/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { Input } from '@/shared/components/ui/input'

interface PlaylistsViewProps {
  playlists: Playlist[]
  setPlaylists: Dispatch<SetStateAction<Playlist[]>>
  sortRules: SortRule[]
  onSortPlaylists: () => void
  isProcessing: boolean
  isLoading?: boolean
  mode?: SortMode
  shuffleConfig?: ShuffleConfig
}

export function PlaylistsView({
  playlists,
  setPlaylists,
  sortRules,
  onSortPlaylists,
  isProcessing,
  isLoading = false,
  mode = 'sort',
  shuffleConfig,
}: PlaylistsViewProps): JSX.Element {
  const searchId = useId()
  const {
    filteredPlaylists,
    searchTerm,
    setSearchTerm,
    togglePlaylist,
    toggleAll,
    selectedCount,
    isAllSelected,
  } = usePlaylistSelection(playlists, setPlaylists)

  // Validation based on mode
  const canSortPlaylists =
    selectedCount > 0 &&
    (mode === 'sort' ? sortRules.length > 0 : !!shuffleConfig) // Ensure shuffle config exists for shuffle mode

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm flex flex-col lg:h-full overflow-hidden shadow-sm">
      {/* Header & Controls */}
      <div className="p-6 border-b border-zinc-800 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Music className="w-4 h-4 text-spotify" />
            {m.your_playlists()}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-xs font-semibold text-zinc-50 border border-zinc-700 whitespace-nowrap">
            {selectedCount} {m.selected()}
          </span>
        </div>

        {/* Search */}
        <div className="relative group">
          <label htmlFor={searchId} className="sr-only">
            {m.filter_playlists()}
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-spotify transition-colors z-10" />
          <Input
            id={searchId}
            type="text"
            placeholder={m.filter_playlists_placeholder()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Select All Toggle */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={toggleAll}
            disabled={isProcessing}
            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors disabled:opacity-50 ${
              isAllSelected
                ? 'bg-spotify border-spotify'
                : 'border-zinc-600 hover:border-zinc-500'
            }`}
          >
            {isAllSelected && <Check className="w-3.5 h-3.5 text-black" />}
          </button>
          <button
            type="button"
            onClick={toggleAll}
            disabled={isProcessing}
            className="text-sm text-zinc-400 cursor-pointer select-none hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {m.select_all()}
          </button>
        </div>
      </div>

      {/* Playlist List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800">
        {isLoading ? (
          // Show loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <PlaylistSkeleton key={index.toString()} />
          ))
        ) : playlists.length > 0 ? (
          filteredPlaylists.length > 0 ? (
            filteredPlaylists.map((playlist, index) => (
              <PlaylistItem
                key={playlist.id}
                playlist={playlist}
                onToggle={togglePlaylist}
                animationDelay={index * 50}
                mode={mode} // Pass mode to item if needed for visual feedback
              />
            ))
          ) : (
            <EmptyState
              icon={Search}
              title={m.no_playlists_match_search()}
              description={m.try_adjusting_search_terms()}
            />
          )
        ) : (
          <EmptyState
            icon={Music}
            title={m.no_playlists_loaded()}
            description={m.connect_spotify_account()}
          />
        )}
      </div>

      {/* Footer with sort button */}
      {playlists.length > 0 && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 shrink-0">
          <Button
            disabled={isProcessing || !canSortPlaylists}
            onClick={onSortPlaylists}
            className="w-full h-11 bg-spotify hover:bg-spotify-hover text-black font-bold rounded-md shadow-lg shadow-green-900/20"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                {m.processing()}
              </>
            ) : mode === 'sort' ? (
              m.sort_playlists({
                count: selectedCount,
                plural: selectedCount !== 1 ? 's' : '',
              })
            ) : (
              m.shuffle_playlists({
                count: selectedCount,
                plural: selectedCount !== 1 ? 's' : '',
              })
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
