import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { ElectionEventCard } from '@/modules/prediction/components/shared/ElectionEventCard'
import { LoadMoreTrigger } from '@/modules/prediction/components/shared/LoadMoreTrigger'
import { useElectionEvents } from '@/modules/prediction/hooks/useElectionEvents'

const ElectionListSkeleton = () => {
  return (
    <div className="rounded-[8px] bg-[#060606] shadow-none border border-[#79778C29] p-3 xl:p-3.5 flex-1 flex flex-col h-full">
      <div className="flex items-center gap-5">
        <div className="flex flex-col justify-center gap-px h-9.5 xl:h-10.5 p-0 w-7">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-3 w-8 mt-1" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="size-9 rounded-md" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-9 rounded-[6px] bg-[#18181B] px-3 flex items-center gap-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const ElectionsTabContent = () => {
  const { t } = useTranslation()
  const { data, isLoading, loadMore, hasNextPage } = useElectionEvents()

  return (
    <div className="space-y-3 pb-8">
      <h1 className="text-xl font-semibold leading-5 text-[#FAFAFA]">
        {t('prediction.electionsPage.title')}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 pc:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 gap-3">
        {isLoading
          ? Array.from({ length: 24 }).map((_, index) => <ElectionListSkeleton key={index} />)
          : data?.map((event) => <ElectionEventCard key={event.id || event.slug} event={event} />)}
      </div>
      <LoadMoreTrigger onLoadMore={loadMore} hasMore={hasNextPage} />
    </div>
  )
}

