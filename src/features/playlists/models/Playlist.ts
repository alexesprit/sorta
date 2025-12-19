const PlaylistStatuses = [
  'error',
  'ready',
  'sorting',
  'sorted',
  'shuffled',
  'unchanged',
] as const
export type PlaylistStatus = (typeof PlaylistStatuses)[number]

type PlaylistProgressPhase = 'loading' | 'saving'

export interface PlaylistProgress {
  phase: PlaylistProgressPhase
  current: number
  total: number
}

export interface Playlist {
  id: string
  href: string
  name: string
  status: PlaylistStatus
  tracks: number
  selected: boolean
  progress?: PlaylistProgress
}
