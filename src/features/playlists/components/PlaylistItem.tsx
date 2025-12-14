import {
  Check,
  CheckCircle2,
  Loader2,
  MinusCircle,
  XCircle,
} from 'lucide-react'
import type {
  Playlist,
  PlaylistStatus,
} from '@/features/playlists/models/Playlist'
import type { SortMode } from '@/features/shuffle/types'
import * as m from '@/paraglide/messages'

interface PlaylistItemProps {
  playlist: Playlist
  onToggle: (playlistId: string) => void
  animationDelay?: number
  mode?: SortMode
}

export function PlaylistItem({
  playlist,
  onToggle,
  animationDelay = 0,
  mode = 'sort',
}: PlaylistItemProps): JSX.Element {
  const isSorting = playlist.status === 'sorting'
  const isDisabled = isSorting

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !isDisabled) {
      event.preventDefault()
      onToggle(playlist.id)
    }
  }

  return (
    <button
      type="button"
      className={`group flex items-center justify-between p-3 rounded-lg mb-1 border transition-all duration-200 w-full text-left animate-in slide-in-from-left-2 fade-in-0 ${
        playlist.selected
          ? 'bg-spotify-dim border-spotify-dim'
          : 'bg-transparent border-transparent hover:bg-zinc-800/50 hover:border-zinc-700/50 hover:scale-[1.01]'
      } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      disabled={isDisabled}
      onClick={() => onToggle(playlist.id)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
            playlist.selected
              ? 'bg-spotify border-spotify'
              : 'border-zinc-600 group-hover:border-zinc-500'
          }`}
        >
          {playlist.selected && <Check className="w-3.5 h-3.5 text-black" />}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span
            className={`text-sm font-medium truncate ${
              playlist.selected ? 'text-spotify' : 'text-zinc-200'
            }`}
          >
            {playlist.name}
          </span>
          <span className="text-xs text-zinc-500">
            {m.track_count({
              count: playlist.tracks,
              plural: playlist.tracks !== 1 ? 's' : '',
            })}
          </span>
        </div>
      </div>
      <div className="flex items-center">
        {getStatusIndicator(playlist.status, mode)}
      </div>
    </button>
  )
}

function getStatusIndicator(
  status: PlaylistStatus,
  mode: SortMode,
): JSX.Element | null {
  switch (status) {
    case 'sorting':
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-spotify" />
          <span className="text-xs text-zinc-400 hidden sm:inline">
            {mode === 'sort' ? m.sorting() : m.processing()}
          </span>
        </div>
      )
    case 'sorted':
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-spotify" />
          <span className="text-xs text-spotify font-medium hidden sm:inline">
            {m.sorted()}
          </span>
        </div>
      )
    case 'shuffled':
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-spotify" />
          <span className="text-xs text-spotify font-medium hidden sm:inline">
            {m.shuffled()}
          </span>
        </div>
      )
    case 'unchanged':
      return (
        <div className="flex items-center gap-2">
          <MinusCircle className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500 hidden sm:inline">
            {m.unchanged()}
          </span>
        </div>
      )
    case 'error':
      return (
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-500 hidden sm:inline">
            {m.error()}
          </span>
        </div>
      )
    default:
      return null
  }
}
