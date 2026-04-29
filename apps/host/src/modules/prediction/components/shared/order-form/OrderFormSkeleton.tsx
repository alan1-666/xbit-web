import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export const OrderFormSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-4 text-sm', className)}>
      {/* MarketInfo */}
      <div className="flex items-center gap-2 min-h-10">
        <Skeleton className="size-10 shrink-0 rounded-[6px]" />
        <Skeleton className="h-4 w-48 max-w-full rounded flex-1" />
      </div>

      {/* SideSelector + OrderTypeSelector */}
      <div className="flex items-center gap-2">
        <Skeleton className="flex-1 h-10 rounded-[8px]" />
        <Skeleton className="h-10 w-24 rounded-[8px]" />
      </div>

      {/* OutcomeSelector */}
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-10.5 rounded-[6px]" />
        <Skeleton className="h-10.5 rounded-[6px]" />
      </div>

      {/* AvailableBalance */}
      <div className="w-full flex items-baseline justify-between">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      {/* Order inputs */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-[8px]" />
        <Skeleton className="h-10 w-full rounded-[8px]" />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>

      {/* OrderButton */}
      <Skeleton className="h-12 w-full rounded-[8px]" />
    </div>
  )
}
