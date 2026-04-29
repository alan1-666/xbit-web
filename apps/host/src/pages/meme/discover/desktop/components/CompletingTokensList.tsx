import { TokenList } from '@pages/meme/discover/desktop/components/TokenList.tsx'
import { useCompletingTokens } from '@pages/meme/discover/desktop/hooks/useCompletingTokens.ts'
import { IconAlarm } from '@components/v2/ui-shared/icons/IconAlarm.tsx'
import { useMemeTokenFilter } from '@pages/meme/discover/desktop/hooks/useMemeTokenFilter.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'
import { useTranslation } from 'react-i18next'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { useMemo } from 'react'

const FILTER_KEY = `TAB_MEME_${LifecycleStates.Completing}`

export const CompletingTokensList = () => {
  const { data, isPending, hasNextPage, paused, setPaused, loadMore } = useCompletingTokens()
  const { currentFilter, onFiltersChanged, onResetFilter } = useMemeTokenFilter(FILTER_KEY)
  const { t } = useTranslation()

  const tokens = useMemo(() => data || [], [data])

  return (
    <TokenList
      type="completing"
      title={t('listCoin.filters.almostFull')}
      icon={<IconAlarm />}
      tokens={tokens}
      isLoading={isPending}
      useFallbackLogo={false}
      timeframe={(currentFilter.timeframe as TimeframeOption) || '1h'}
      hasNextPage={hasNextPage && !isPending && data && data.length > 0}
      showProgress={true}
      paused={paused}
      setPaused={setPaused}
      filter={currentFilter}
      onFilterChange={onFiltersChanged}
      onResetAll={onResetFilter}
      onLoadMore={loadMore}
    />
  )
}
