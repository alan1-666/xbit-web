import { useTranslation } from 'react-i18next'
import { MarketHistory } from '@/modules/prediction/components/event-details/MarketHistory.tsx'
import { useEventTradeActivities } from '@/modules/prediction/hooks/useTrades.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'

export interface UserActivitiesProps {
  conditionId?: string
}

export const UserActivities = ({ conditionId }: UserActivitiesProps) => {
  const { t } = useTranslation()
  const proxyWallet = useProxyWallet()

  const {
    data: activities,
    loadMore,
    canLoadMore,
    isFetchingNextPage,
  } = useEventTradeActivities({
    conditionId: conditionId,
    user: proxyWallet || undefined,
    enabled: !!proxyWallet,
  })

  if (!activities || activities.length === 0) return null

  return (
    <div>
      <h3 className="text-base font-semibold mb-2">{t('prediction.marketItem.tabs.history')}</h3>
      <MarketHistory
        activities={activities}
        className="px-0 pt-0"
        loadMore={loadMore}
        canLoadMore={canLoadMore}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  )
}

