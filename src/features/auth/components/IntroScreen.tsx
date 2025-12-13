import { ListFilter } from 'lucide-react'
import { authorize } from '@/shared/api/spotify'
import { Button } from '@/shared/components/ui/button'

export function IntroScreen(): JSX.Element {
  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex items-center justify-center px-8 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-9">
          <div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 mb-6">
            <div className="w-full h-full bg-gradient-to-br from-spotify to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-900/30">
              <ListFilter className="w-12 h-12 md:w-16 md:h-16 text-black" />
            </div>
          </div>
          <h1 className="text-6xl font-black mt-4 mb-2">Sorta</h1>
          <p className="text-xl text-zinc-300">
            A web application for sorting your Spotify playlists using custom
            sort rules.
          </p>
        </div>

        <Button
          onClick={() => authorize()}
          className="bg-spotify hover:bg-spotify-hover text-black font-bold text-base px-8 py-3 h-12 rounded-lg shadow-lg shadow-green-900/20 transition-all active:scale-[0.98]"
        >
          Sign in to Spotify
        </Button>
      </div>
    </div>
  )
}
