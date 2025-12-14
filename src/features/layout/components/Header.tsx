import { ListFilter, LogOut } from 'lucide-react'
import { useLogout } from '@/features/auth/hooks/useLogout'
import * as m from '@/paraglide/messages'
import { getLocale, locales, setLocale } from '@/paraglide/runtime'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

interface HeaderProps {
  userId: string | null
}

export function Header({ userId }: HeaderProps): JSX.Element {
  const { logout } = useLogout()
  const currentLocale = getLocale()

  // Extract initials from userId for avatar
  const getInitials = (userId: string | null): string => {
    if (!userId) {
      return ''
    }
    return userId.charAt(0).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-spotify to-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-green-900/20">
            <ListFilter className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            {m.app_name()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1">
            {locales.map((locale) => (
              <button
                type="button"
                key={locale}
                onClick={() => setLocale(locale)}
                className={`px-2 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                  currentLocale === locale
                    ? 'bg-spotify text-black'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-zinc-900 transition-colors group outline-none focus:outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600">
                  <span className="font-bold text-xs text-zinc-400">
                    {getInitials(userId)}
                  </span>
                </div>
                <span className="text-sm font-medium text-zinc-300 hidden sm:block group-hover:text-zinc-100">
                  {userId || m.loading()}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-400 focus:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span>{m.log_out()}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
