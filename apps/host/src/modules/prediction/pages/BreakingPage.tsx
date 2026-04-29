import { useBreakingMarkets } from '@/modules/prediction/hooks/useBreakingMarkets.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { BreakingItem } from '@/modules/prediction/components/breaking/BreakingItem.tsx'
import { TwitterPostsList } from '@/modules/prediction/components/breaking/TwitterPostsList.tsx'

export const BreakingPage = () => {
  const { data, isPending } = useBreakingMarkets()
  if (isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-10" />
        ))}
      </div>
    )
  }
  return (
    <div className="grid xl:grid-cols-4 gap-8 max-w-360 mx-auto pb-10">
      <div className="xl:col-span-3">
        <div className="flex flex-col gap-3">
          {data?.map((market, index) => (
            <BreakingItem key={market.questionID} market={market} index={index} />
          ))}
        </div>
      </div>
      <div className="hidden xl:block max-h-[calc(100vh-146px)] sticky top-12 overflow-y-auto no-scrollbar">
        <TwitterPostsList />
      </div>
    </div>
  )
}
