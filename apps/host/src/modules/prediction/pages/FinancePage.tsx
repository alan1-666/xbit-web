import {
  FinanceHorizontalFilter,
  FinanceSidebar,
  FILTERS,
  CATEGORIES,
  FINANCE_TAG_PARAM,
} from '@/modules/prediction/components/events-list/FinanceSidebar.tsx'
import { cn } from '@/lib/utils.ts'
import { EventsList } from '@/modules/prediction/components/shared/EventsList.tsx'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useFinanceEvents } from '@/modules/prediction/hooks/useFinanceEvents.ts'

const DEFAULT_TAG = 'finance'

const VALID_FINANCE_TAGS = new Set([
  ...FILTERS.map((f) => f.value),
  ...CATEGORIES.map((c) => c.value),
])

type FinancePageProps = {
  /** Which query param key to use for filters. Defaults to `financeTag` (desktop),
   *  but on MarketPrediction mobile we can pass `tag`.
   */
  tagParamKey?: string
}

const FinancePage = ({ tagParamKey = FINANCE_TAG_PARAM }: FinancePageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tag = useMemo(() => {
    const urlFinanceTag = searchParams.get(tagParamKey)
    if (urlFinanceTag && VALID_FINANCE_TAGS.has(urlFinanceTag)) return urlFinanceTag
    const legacyTag = searchParams.get('tag')
    if (legacyTag && VALID_FINANCE_TAGS.has(legacyTag)) return legacyTag
    return DEFAULT_TAG
  }, [searchParams, tagParamKey])

  const { data, isLoading, loadMore, hasNextPage } = useFinanceEvents(tag)

  return (
    <>
      <FinanceHorizontalFilter className="block xl:hidden" tagParamKey={tagParamKey} />
      <div className="flex flex-row items-start w-full">
        <FinanceSidebar className="hidden xl:block" />
        <div className={cn('flex-1 min-w-0', '')}>
          <EventsList
            isLoading={isLoading}
            data={data || []}
            loadMore={loadMore}
            hasNextPage={hasNextPage}
            categoryId="finance"
            classNameList="grid-cols-1 lg:grid-cols-2 pc:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6"
          />
        </div>
      </div>
    </>
  )
}

export default FinancePage
