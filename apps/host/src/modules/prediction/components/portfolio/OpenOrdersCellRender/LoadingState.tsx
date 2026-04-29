import { Skeleton } from '@/components/ui/skeleton'

export const LoadingState = () => {
  return (
    <div className="flex flex-col w-full">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="w-full">
          {/* Desktop Skeleton */}
          <div className="hidden h-[60px] w-full items-center xl:border-b xl:border-white/5 bg-transparent xl:px-4 xl:flex">
            <div className="pr-2" style={{ flex: '5 1 0%' }}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-sm bg-white/10 shrink-0" />
                <div className="flex w-full max-w-[200px] flex-col gap-2">
                  <Skeleton className="h-4 w-3/4 bg-white/10" />
                </div>
              </div>
            </div>
            <div className="px-2" style={{ flex: '0.5 1 0%' }}>
              <Skeleton className="h-4 w-8 bg-white/10" />
            </div>
            <div className="px-2" style={{ flex: '1 1 0%' }}>
              <Skeleton className="h-5 w-12 rounded bg-white/10" />
            </div>
            <div className="px-2" style={{ flex: '0.5 1 0%' }}>
              <Skeleton className="h-4 w-12 bg-white/10" />
            </div>
            <div className="px-2" style={{ flex: '1 1 0%' }}>
              <Skeleton className="h-4 w-12 bg-white/10" />
            </div>
            <div className="px-2" style={{ flex: '1 1 0%' }}>
              <Skeleton className="h-4 w-16 bg-white/10" />
            </div>
            <div className="px-2" style={{ flex: '1.75 1 0%' }}>
              <Skeleton className="h-4 w-24 bg-white/10" />
            </div>
            <div className="flex justify-end pl-2" style={{ flex: '2 1 0%' }}>
              <Skeleton className="h-8 w-8 rounded-sm bg-white/10" />
            </div>
          </div>

          {/* Mobile Skeleton */}
          <div className="flex w-full flex-col xl:hidden px-3 pb-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="flex items-center gap-2 overflow-hidden w-full">
                <Skeleton className="h-6 w-6 shrink-0 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-2/3 bg-white/10" />
              </div>
            </div>
            <div className="border border-[#79778C29] rounded-[8px] bg-[#101114]">
              {/* Top Row */}
              <div className="flex items-center justify-between p-2 bg-[#18181B]">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 bg-white/10" />
                  <Skeleton className="h-5 w-8 rounded-sm bg-white/10" />
                  <Skeleton className="h-3 w-8 bg-white/10" />
                </div>
                <Skeleton className="h-7 w-16 rounded-md bg-white/10" />
              </div>

              {/* Details Matrix */}
              <div className="mt-2 grid grid-cols-3 gap-2 px-2">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-10 bg-white/10" />
                  <Skeleton className="h-4 w-16 bg-white/10" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="h-3 w-10 bg-white/10" />
                  <Skeleton className="h-4 w-12 bg-white/10" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-3 w-16 bg-white/10" />
                  <Skeleton className="h-4 w-12 bg-white/10" />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 flex justify-between items-center p-2 border-t border-[#79778C29]">
                <Skeleton className="h-3 w-24 bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
