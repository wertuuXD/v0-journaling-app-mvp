export function EntrySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full rounded-2xl p-6 bg-card/20 border border-border/20">
        <div className="flex items-start justify-between mb-3">
          <div className="h-3 w-12 bg-muted/50 rounded-full" />
          <div className="h-6 w-6 bg-muted/50 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted/50 rounded w-full" />
          <div className="h-4 bg-muted/50 rounded w-4/5" />
          <div className="h-4 bg-muted/50 rounded w-3/4" />
        </div>
      </div>
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="group relative">
        <div className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 bg-muted/50 rounded-full" />
        <div className="w-full h-14 rounded-2xl bg-muted/20 border border-border/20 pl-11 pr-11" />
      </div>
      <div className="space-y-4">
        <EntrySkeleton />
        <EntrySkeleton />
        <EntrySkeleton />
      </div>
    </div>
  )
}

export function ButtonSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-14 rounded-2xl bg-muted/20" />
    </div>
  )
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <SearchSkeleton />
      <div className="space-y-6">
        <div className="h-4 w-24 bg-muted/50 rounded" />
        <div className="flex flex-col gap-4">
          <EntrySkeleton />
          <EntrySkeleton />
          <EntrySkeleton />
        </div>
      </div>
    </div>
  )
}
