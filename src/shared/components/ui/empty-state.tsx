import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center gap-3 py-8 animate-in fade-in-0 duration-300',
        className,
      )}
    >
      <Icon className="w-12 h-12 text-zinc-500 opacity-50 transition-all duration-300 hover:scale-110 hover:opacity-70" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-300 transition-colors duration-200">
          {title}
        </p>
        {description && (
          <p className="text-xs text-zinc-500 transition-colors duration-200">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
