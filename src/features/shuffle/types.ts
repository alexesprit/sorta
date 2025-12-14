export type ShuffleWeight = 'popularity-high' | 'random' | 'popularity-low'

export interface SmartSeparation {
  artist: boolean
  album: boolean
}

export interface ShuffleConfig {
  weighted: ShuffleWeight
  smart: SmartSeparation
}

export type SortMode = 'sort' | 'shuffle'
