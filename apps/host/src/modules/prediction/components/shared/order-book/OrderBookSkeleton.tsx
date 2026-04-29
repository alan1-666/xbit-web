import { Skeleton } from '@components/ui/skeleton.tsx'

export const OrderBookSkeleton = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="h-9" />
      ))}
    </div>
  )
}
