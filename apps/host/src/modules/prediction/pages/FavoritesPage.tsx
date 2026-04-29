import { EventsList } from '@/modules/prediction/components/shared/EventsList.tsx'
import { PredictionFilterProvider } from '@/modules/prediction/contexts/PredictionFilterContext.tsx'
import { useFavoriteEvents } from '@/modules/prediction/hooks/useFavoriteEventsQuery.ts'
import { useTranslation } from 'react-i18next'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { BlankState } from '@components/v2/ui-shared/components/BlankState.tsx'
import { ConnectWalletCTA } from '@components/v2/ui-shared/components/ConnectWalletCTA.tsx'

export const FavoritesPageContent = () => {
  const { t } = useTranslation()
  const { data, isLoading, loadMore, hasNextPage } = useFavoriteEvents()

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">{t('prediction.favorites.noData')}</h3>
          <p className="text-sm text-gray-400">{t('prediction.favorites.noDataText')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <EventsList isLoading={isLoading} data={data || []} loadMore={loadMore} hasNextPage={hasNextPage} />
    </div>
  )
}

export const FavoritesPage = () => {
  const activeWallet = useActiveWallet()
  const { t } = useTranslation()

  if (!activeWallet.isConnected) {
    return (
      <BlankState
        text={t('login.notLogined', {
          name: 'XBIT',
        })}
        cta={<ConnectWalletCTA />}
        className="py-20"
      />
    )
  }

  return (
    <PredictionFilterProvider>
      <FavoritesPageContent />
    </PredictionFilterProvider>
  )
}
