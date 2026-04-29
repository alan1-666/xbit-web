import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { OrderBook } from '@/modules/prediction/components/shared/OrderBook.tsx'
import { MarketChart } from '@/modules/prediction/components/event-details/MarketChart.tsx'
import { MarketPositions } from '@/modules/prediction/components/event-details/MarketPositions.tsx'
import { MarketOrders } from '@/modules/prediction/components/event-details/MarketOrders.tsx'
import { MarketHistory } from '@/modules/prediction/components/event-details/MarketHistory.tsx'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useEventTradeActivities } from '@/modules/prediction/hooks/useTrades.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { MarketResolution } from '@/modules/prediction/components/event-details/MarketResolution.tsx'
import { OrderBookOutcomeSelector } from '@/modules/prediction/components/event-details/OrderBookOutcomeSelector.tsx'

type TabType = 'orderBook' | 'graph' | 'resolution' | 'positions' | 'orders' | 'history'

type Option = {
  label: string
  value: TabType
}

export interface MarketItemContentProps {
  market: MarketModel
}

export const MarketItemContent = (props: MarketItemContentProps) => {
  const { market } = props
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabType>('orderBook')
  const { selectedOutcome } = useEventDetailsPageContext()
  const proxyWallet = useProxyWallet()

  const {
    data: activities,
    loadMore,
    canLoadMore,
    isFetchingNextPage,
  } = useEventTradeActivities({
    conditionId: market.conditionId || undefined,
    user: proxyWallet || undefined,
    enabled: !!proxyWallet,
  })

  const tabs: Option[] = [
    { label: t('prediction.marketItem.tabs.orderBook'), value: 'orderBook' },
    { label: t('prediction.marketItem.tabs.graph'), value: 'graph' },
    { label: t('prediction.marketItem.tabs.resolution'), value: 'resolution' },
    { label: t('prediction.marketItem.tabs.positions'), value: 'positions' },
    { label: t('prediction.marketItem.tabs.orders'), value: 'orders' },
    { label: t('prediction.marketItem.tabs.history'), value: 'history' },
  ]

  // const filteredTabs = useMemo(() => {
  //   if (activities && activities.length > 0) return tabs
  //   return tabs.filter((t) => t.value !== 'history')
  // }, [activities, tabs])

  const clobTokenId = useMemo(() => {
    if (selectedOutcome === 'yes') return market.clobTokenIds?.[0]
    if (selectedOutcome === 'no') return market.clobTokenIds?.[1]
    return undefined
  }, [selectedOutcome, market.clobTokenIds])

  return (
    <div>
      <MovingLineTabs
        tabs={tabs}
        defaultTab="orderBook"
        onTabChange={(newTab: string) => setTab(newTab as TabType)}
        containerClassName="justify-start bg-transparent px-0 pb-[6.33px] after:!bg-[#FFFFFF1A] after:!h-[1px]"
        tabsListClassName="px-2"
        itemClassName="px-1 mr-4 font-[400] text-sm"
        tabLineClassName="before:!h-[1.33px] before:!bg-[#843BEA]"
      />
      <div className="">
        {tab === 'orderBook' && clobTokenId && (
          <>
            <OrderBookOutcomeSelector />
            <OrderBook
              tokenId={clobTokenId}
              marketId={market.id}
              minTickSize={market.orderPriceMinTickSize ? +market.orderPriceMinTickSize : 0.01}
              conditionId={market.conditionId ?? undefined}
            />
          </>
        )}
        {tab === 'graph' && <MarketChart market={market} />}
        {tab === 'resolution' && <MarketResolution market={market} />}
        {tab === 'positions' && <MarketPositions market={market} />}
        {tab === 'orders' && <MarketOrders market={market} />}
        {tab === 'history' && (
          <MarketHistory
            activities={activities || []}
            className="px-2 my-2"
            loadMore={loadMore}
            canLoadMore={canLoadMore}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>
    </div>
  )
}
