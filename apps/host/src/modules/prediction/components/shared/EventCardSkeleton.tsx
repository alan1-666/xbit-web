import { Skeleton } from '@components/ui/skeleton.tsx'

export const EventCardSkeleton = () => {
  return (
    <div className="px-[14px] py-3 rounded-[8px] h-full bg-[#101114] space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="rounded-[6px] size-10" />
        <div className="flex-1 line-clamp-2">
          <div className="text-[calc(14rem/16)] font-medium text-white hover:underline">
            <Skeleton className="h-3.5 w-full" />
          </div>
        </div>
      </div>
      <div className="h-[92px] overflow-y-auto no-scrollbar space-y-1">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}
