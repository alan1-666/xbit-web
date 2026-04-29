import { Skeleton } from '@/components/ui/skeleton'

interface HoldersColumnSkeletonProps {
  side: 'left' | 'right'
}

export const HoldersColumnSkeleton = ({ side }: HoldersColumnSkeletonProps) => {
  const paddingClass = side === 'left' ? 'pr-2.5' : 'pl-2.5'

  return (
    <div className={`flex-1 flex flex-col w-full lg:border-r border-white/5 last:border-r-0 ${paddingClass}`}>
      <div className="flex w-full justify-between items-center h-[42px] border-b border-white/5 bg-background px-3">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-2 pt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 h-[60px] lg:h-[56px] px-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 lg:hidden" />
            </div>
            <Skeleton className="h-4 w-16 hidden lg:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
