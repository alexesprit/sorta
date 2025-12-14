import { PlaylistsView } from '@/features/playlists'
import { useSortPlaylists } from '@/features/playlists/hooks/useSortPlaylists'
import { useShuffleConfig } from '@/features/shuffle/hooks/useShuffleConfig'
import type { SortMode } from '@/features/shuffle/types'
import { SortRulesView } from '@/features/sorting'
import { useSortRules } from '@/features/sorting/hooks/useSortRules'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'

const defaultRawSortRules = 'artist date album title'

export function MainContent(): JSX.Element {
  const [sortRules, setSortRules] = useSortRules(defaultRawSortRules)
  const [mode, setMode] = useLocalStorage<SortMode>(
    STORAGE_KEYS.SORT_MODE,
    'sort',
  )
  const [shuffleConfig, setShuffleConfig] = useShuffleConfig()

  const [
    playlists,
    setPlaylists,
    sortPlaylists,
    isProcessing,
    isLoading,
    _isPending,
  ] = useSortPlaylists(sortRules, mode, shuffleConfig)

  return (
    <main className="flex-1 container mx-auto px-4 py-8 lg:grid lg:grid-cols-12 gap-8 lg:h-content lg:overflow-hidden">
      {/* Left Column: Playlists */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col lg:h-full lg:max-h-full mb-8 lg:mb-0">
        <PlaylistsView
          playlists={playlists}
          setPlaylists={setPlaylists}
          sortRules={sortRules}
          onSortPlaylists={sortPlaylists}
          isProcessing={isProcessing}
          isLoading={isLoading}
          mode={mode}
          shuffleConfig={shuffleConfig}
        />
      </div>

      {/* Right Column: Sort Rules */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col lg:h-full lg:max-h-full lg:overflow-y-auto scrollbar-thin lg:pr-1 lg:pb-20">
        <SortRulesView
          sortRules={sortRules}
          onSortRulesChange={setSortRules}
          mode={mode}
          onModeChange={setMode}
          shuffleConfig={shuffleConfig}
          onShuffleConfigChange={setShuffleConfig}
        />
      </div>
    </main>
  )
}
