import { Skeleton } from '@components/ui/skeleton.tsx'
import { cn } from '@/lib/utils.ts'

export interface ListTokenSkeletonProps {
  itemCount?: number
  className?: string
}

export const ListTokenSkeleton = (props: ListTokenSkeletonProps) => {
  const { itemCount = 10, className } = props
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <Skeleton key={index} className="h-[82px]" />
      ))}
    </div>
  )
}
