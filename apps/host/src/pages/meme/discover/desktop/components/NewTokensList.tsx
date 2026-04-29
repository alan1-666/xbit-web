import { TokenList } from '@pages/meme/discover/desktop/components/TokenList.tsx'
import { useNewMemeTokens } from '@pages/meme/discover/desktop/hooks/useNewMemeTokens.ts'
import { IconSprout } from '@components/v2/ui-shared/icons/IconSprout.tsx'
import { useMemeTokenFilter } from '@pages/meme/discover/desktop/hooks/useMemeTokenFilter.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'
import { useTranslation } from 'react-i18next'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'

export const NewTokensList = () => {
  const { data, isPending, hasNextPage, paused, setPaused, loadMore } = useNewMemeTokens()
  const { currentFilter, onFiltersChanged, onResetFilter } = useMemeTokenFilter(
    `TAB_MEME_${LifecycleStates.NewCreation}`,
  )
  const { t } = useTranslation()

  return (
    <TokenList
      type="new"
      title={t('listCoin.filters.newListingPC')}
      icon={<IconSprout />}
      tokens={data ?? []}
      isLoading={isPending}
      useFallbackLogo={false}
      timeframe={(currentFilter.timeframe as TimeframeOption) || '1h'}
      hasNextPage={hasNextPage}
      showProgress={true}
      paused={paused}
      setPaused={setPaused}
      filter={currentFilter}
      onFilterChange={onFiltersChanged}
      allowSorting={false}
      onResetAll={onResetFilter}
      onLoadMore={loadMore}
    />
  )
}
