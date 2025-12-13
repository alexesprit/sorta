const PlaylistStatuses = [
  'error',
  'ready',
  'sorting',
  'sorted',
  'unchanged',
] as const
export type PlaylistStatus = (typeof PlaylistStatuses)[number]

export interface Playlist {
  id: string
  href: string
  name: string
  status: PlaylistStatus
  tracks: number
  selected: boolean
}
