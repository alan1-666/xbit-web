import { Skeleton } from '../ui/skeleton'

const SkeletonLoyalty = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto py-10 space-y-4">
      {/* User Header */}
      <div className="flex items-center justify-between mb-8">
        {/* <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-16" />
          </div>
        </div> */}
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Leaderboard Title */}
      {/* <Skeleton className="h-8 w-24 mb-6" /> */}

      {/* Top 3 Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default SkeletonLoyalty
