import { BrainCircuit, Dices, Sparkles, TrendingUp } from 'lucide-react'
import * as m from '@/paraglide/messages'
import type { ShuffleConfig, ShuffleWeight } from '../types'

interface ShuffleViewProps {
  config: ShuffleConfig
  onConfigChange: (config: ShuffleConfig) => void
}

export function ShuffleView({
  config,
  onConfigChange,
}: ShuffleViewProps): JSX.Element {
  const updateWeight = (weighted: ShuffleWeight) => {
    onConfigChange({ ...config, weighted })
  }

  const toggleSmart = (key: keyof typeof config.smart) => {
    onConfigChange({
      ...config,
      smart: {
        ...config.smart,
        [key]: !config.smart[key],
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Weighted Bias */}
      <div className="space-y-3">
        <span className="text-sm font-semibold text-zinc-200 block">
          {m.weighted_bias()}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Popularity High */}
          <button
            type="button"
            onClick={() => updateWeight('popularity-high')}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center group ${
              config.weighted === 'popularity-high'
                ? 'bg-spotify-dim border-spotify ring-1 ring-spotify'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
            }`}
          >
            <TrendingUp
              className={`w-6 h-6 mb-1 group-hover:scale-110 transition-transform ${
                config.weighted === 'popularity-high'
                  ? 'text-spotify'
                  : 'text-spotify'
              }`}
            />
            <span className="text-sm font-medium text-zinc-200">
              {m.favor_popular()}
            </span>
            <span className="text-xs text-zinc-500">
              {m.play_hits_more_often()}
            </span>
          </button>

          {/* Random */}
          <button
            type="button"
            onClick={() => updateWeight('random')}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center group ${
              config.weighted === 'random'
                ? 'bg-spotify-dim border-spotify ring-1 ring-spotify'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
            }`}
          >
            <Dices
              className={`w-6 h-6 mb-1 group-hover:rotate-12 transition-transform ${
                config.weighted === 'random' ? 'text-white' : 'text-white'
              }`}
            />
            <span className="text-sm font-medium text-zinc-200">
              {m.true_random()}
            </span>
            <span className="text-xs text-zinc-400">{m.pure_chaos()}</span>
          </button>

          {/* Popularity Low */}
          <button
            type="button"
            onClick={() => updateWeight('popularity-low')}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center group ${
              config.weighted === 'popularity-low'
                ? 'bg-spotify-dim border-spotify ring-1 ring-spotify'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
            }`}
          >
            <Sparkles
              className={`w-6 h-6 mb-1 group-hover:scale-110 transition-transform ${
                config.weighted === 'popularity-low'
                  ? 'text-purple-400'
                  : 'text-purple-400'
              }`}
            />
            <span className="text-sm font-medium text-zinc-200">
              {m.favor_obscure()}
            </span>
            <span className="text-xs text-zinc-500">{m.deep_cuts_first()}</span>
          </button>
        </div>
      </div>

      {/* Smart Separation */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold text-zinc-200">
            {m.intelligent_separation()}
          </span>
        </div>

        {/* Avoid Artist Siblings */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-300">
              {m.avoid_artist_siblings()}
            </span>
            <span className="text-xs text-zinc-500">
              {m.dont_play_same_artist()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => toggleSmart('artist')}
            className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none ${
              config.smart.artist ? 'bg-spotify' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${
                config.smart.artist ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Avoid Album Siblings */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-300">
              {m.avoid_album_siblings()}
            </span>
            <span className="text-xs text-zinc-500">
              {m.dont_play_same_album()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => toggleSmart('album')}
            className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none ${
              config.smart.album ? 'bg-spotify' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${
                config.smart.album ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
