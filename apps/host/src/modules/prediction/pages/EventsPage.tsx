import { RelatedTags } from '@/modules/prediction/components/events-list/RelatedTags.tsx'
import { EventsList } from '@/modules/prediction/components/shared/EventsList.tsx'
import { homepageCategories } from '@/modules/prediction/data/homepage-category.ts'
import { useEventsByCategoryId } from '@/modules/prediction/hooks/useEventsByCategoryId.ts'
import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CryptoHorizontalFilter, CryptoSidebar } from '../components/events-list/CryptoSidebar'
import { cn } from '@/lib/utils'
import { PredictionFilterProvider, usePredictionFilter } from '../contexts/PredictionFilterContext'

const EventsPageContent = ({ tag, title }: { tag?: string; title?: string }) => {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const categoryId = useMemo(() => {
    if (tag) return tag
    return params.categoryId || ''
  }, [params.categoryId, tag])
  const subTag = useMemo(() => searchParams.get('tag'), [searchParams])
  const category = useMemo(() => {
    if (subTag) return subTag
    if (!categoryId) return ''
    return homepageCategories.find((c) => c.value.toLowerCase() === categoryId.toLowerCase())?.value || categoryId
  }, [categoryId, subTag])

  const { filters } = usePredictionFilter()

  const activeFilters = useMemo(() => {
    // TODO: Add live filter
    // if (LIVE_FILTER_TAGS.includes(category)) {
    //   return { ...filters, live: true }
    // }
    return filters
  }, [filters, category])

  const { data, isLoading, loadMore, hasNextPage } = useEventsByCategoryId(
    category,
    activeFilters,
  )

  const isCrypto = categoryId?.toLowerCase() === 'crypto'

  return (
    <>
      {!isCrypto && categoryId && (
        <RelatedTags
          tagSlug={categoryId}
          hideSkeletonOnXl={false}
        />
      )}
      {isCrypto && <CryptoHorizontalFilter className="block xl:hidden" />}
      <div className="flex flex-row items-start w-full">
        {isCrypto && <CryptoSidebar className="hidden xl:block" />}
        <div className={cn('flex-1 min-w-0', isCrypto ? 'xl:mt-3' : 'mt-3')}>
          {title ? (
            <h1 className="mb-3 text-xl font-semibold leading-5 text-[#FAFAFA]">
              {title}
            </h1>
          ) : null}
          <EventsList
            isLoading={isLoading}
            data={data || []}
            loadMore={loadMore}
            hasNextPage={hasNextPage}
          />
        </div>
      </div>
    </>
  )
}

export const EventsPage = ({ tag, title }: { tag?: string; title?: string }) => {
  return (
    <PredictionFilterProvider>
      <EventsPageContent tag={tag} title={title} />
    </PredictionFilterProvider>
  )
}
