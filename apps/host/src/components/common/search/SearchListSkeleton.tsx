import { Skeleton } from '@components/ui/skeleton.tsx'

export const SearchListSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton key={i} className="h-[30px] border-b last:border-b-0 pb-3" />
      ))}
    </div>
  )
}
