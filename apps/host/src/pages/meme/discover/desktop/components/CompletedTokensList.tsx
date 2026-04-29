import { TokenList } from '@pages/meme/discover/desktop/components/TokenList.tsx'
import { useCompletedTokens } from '@pages/meme/discover/desktop/hooks/useCompletedTokens.ts'
import { useMemeTokenFilter } from '@pages/meme/discover/desktop/hooks/useMemeTokenFilter.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'

export const CompletedTokensList = () => {
  const { data, isPending, hasNextPage, paused, setPaused, loadMore } = useCompletedTokens()
  const { currentFilter, onFiltersChanged, onResetFilter } = useMemeTokenFilter(`TAB_MEME_${LifecycleStates.Completed}`)
  const { t } = useTranslation()

  return (
    <TokenList
      type="completed"
      title={t('listCoin.filters.launched')}
      icon={<div className="size-3.5 text-[14px] leading-3.5 mr-1">🐣</div>}
      tokens={data ?? []}
      isLoading={isPending}
      useFallbackLogo={false}
      timeframe={(currentFilter.timeframe as TimeframeOption) || '1h'}
      hasNextPage={hasNextPage}
      onLoadMore={loadMore}
      showProgress={true}
      paused={paused}
      setPaused={setPaused}
      filter={currentFilter}
      onFilterChange={onFiltersChanged}
      onResetAll={onResetFilter}
      getTooltipContent={(token) =>
        t('listCoin.tooltip.migratedAtWithTime', { time: dayjs(token.migratedAt).format('MM/DD HH:mm') })
      }
    />
  )
}
