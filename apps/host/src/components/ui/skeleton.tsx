import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />
}

type SkeletonListProps = {
  count?: number // Number of skeleton items to render
  className?: string // Additional class names for styling container
  classNameItem?: string // Additional class names for styling each skeleton item
  renderItem?: (index: number) => React.ReactNode
}

function SkeletonList({ count = 5, className = '', classNameItem = '', renderItem }: SkeletonListProps) {
  return (
    <div className={cn('flex flex-wrap gap-2.5', className)}>
      {renderItem
        ? Array.from({ length: count }).map((_, index) => (
            <div key={index} className={cn('w-full', classNameItem)}>
              {renderItem(index)}
            </div>
          ))
        : Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} className={cn('w-full h-[30px]', classNameItem)} />
          ))}
    </div>
  )
}

export { Skeleton, SkeletonList }
