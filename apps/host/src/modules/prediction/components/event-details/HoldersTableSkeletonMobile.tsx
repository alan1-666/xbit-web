import { Skeleton } from '@/components/ui/skeleton'

export const HoldersTableSkeletonMobile = () => {
  return (
    <>
      <div className="flex h-[42px] w-full items-center border-b border-white/5 bg-background">
        <div className="flex flex-1 items-center gap-2 px-3">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="h-5 w-px shrink-0 bg-white/5" />
        <div className="flex flex-1 items-center gap-2 px-3">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid w-full grid-cols-2">
        <div className="space-y-2 border-r border-white/5 p-2 pt-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="space-y-2 p-2 pt-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
