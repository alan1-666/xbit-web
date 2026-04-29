import { Skeleton } from '@components/ui/skeleton.tsx'

export const EventsSkeleton = () => {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-9 w-20" />
      ))}
    </div>
  )
}
