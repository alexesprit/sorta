import type { ShuffleConfig } from '@/features/shuffle/types'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'

const defaultShuffleConfig: ShuffleConfig = {
  weighted: 'random',
  smart: {
    artist: true,
    album: false,
  },
}

export function useShuffleConfig(): [
  ShuffleConfig,
  (value: ShuffleConfig) => void,
] {
  const [config, setConfig] = useLocalStorage(
    STORAGE_KEYS.SHUFFLE_CONFIG,
    defaultShuffleConfig,
  )

  return [config, setConfig]
}
