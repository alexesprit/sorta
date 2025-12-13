export function PlaylistSkeleton(): JSX.Element {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-transparent mb-1">
      <div className="flex items-center gap-3 w-full">
        <div className="w-5 h-5 rounded bg-zinc-800 animate-pulse flex-shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 w-2/3 bg-zinc-800 animate-pulse rounded" />
          <div className="h-3 w-1/4 bg-zinc-800 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
