import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm transition-colors transition-border transition-ring duration-200 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-spotify focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
