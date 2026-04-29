import { Skeleton } from '@components/ui/skeleton.tsx'

export const PositionsLoadingSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-[76px] w-full bg-[#1a1a1f]" />
    ))}
  </div>
)
