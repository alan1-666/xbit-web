import { formatBalance } from '@/lib/format'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useMemo } from 'react'
import { useMyPolymarketOpenOrders } from '@/modules/prediction/hooks/usePolymarketOpenOrders'
import { IExtendedOpenOrder, IPolymarketOpenOrder } from '@/modules/prediction/models/PortfolioModel'
import { LoadingState } from '@/modules/prediction/components/portfolio/OpenOrdersCellRender/LoadingState'
// import { OpenOrdersHeader } from '@/modules/prediction/components/portfolio/OpenOrdersCellRender/OpenOrdersHeader'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { MobileOpenOrderItem } from '@/modules/prediction/components/portfolio/OpenOrdersCellRender/MobileOpenOrderItem.tsx'
import { useTranslation } from 'react-i18next'

export interface MarketOrdersProps {
  market: MarketModel
}

export const MarketOrders = (props: MarketOrdersProps) => {
  const { market } = props
  const { t } = useTranslation()

  const { data: rawOrders = [], isLoading } = useMyPolymarketOpenOrders(market.conditionId || undefined, {
    enabled: !!market.conditionId,
  })

  const data = useMemo<IExtendedOpenOrder[]>(() => {
    return rawOrders.map((item: IPolymarketOpenOrder) => {
      const priceVal = parseFloat(item.price || '0')
      const matchedVal = parseFloat(item.sizeFilled || '0')
      const sizeVal = parseFloat(item.size || '0')
      const totalVal = priceVal * sizeVal

      let outcome = (item.outcome as string) || 'Yes'

      if (market && market.clobTokenIds && market.outcomes && item.asset_id) {
        const tokenIds: string[] = market.clobTokenIds
        const outcomeLabels: string[] = market.outcomes

        const index = tokenIds.indexOf(item.asset_id || '')
        if (index !== -1 && outcomeLabels[index]) {
          outcome = outcomeLabels[index]
        }
      }

      const outcomeIndex = market.clobTokenIds?.indexOf(item.asset_id || '') || 0

      return {
        groupItemTitle: market?.groupItemTitle || t('prediction.orders.unknown'),
        id: item.orderID,
        marketId: item?.market || market.conditionId || '',
        marketTitle: market?.question || t('prediction.orders.unknownMarket'),
        marketIcon: market?.icon || item.marketIcon || '/images/icons/market-default.svg',
        marketSlug: market?.events?.[0].slug || '#',
        side: item.side === 'BUY' ? t('prediction.orders.buy') : t('prediction.orders.sell'),
        outcome,
        outcomeIndex: outcomeIndex,
        price: item.price,
        rawPrice: priceVal,
        rawSize: sizeVal,
        rawMatched: matchedVal,
        filled: `${matchedVal} / ${sizeVal}`,
        total: formatBalance(totalVal),
        expiration:
          item.expiration === 0 || !item.expiration
            ? t('prediction.orders.untilCancelled')
            : new Date(item.expiration * 1000).toLocaleDateString(),
        canCancel: item.status === 'LIVE' || item.status === 'OPEN',
      }
    })
  }, [rawOrders, market, t])

  return (
    <div className="flex w-full flex-col">
      {/* <OpenOrdersHeader /> */}

      {isLoading ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <div className="flex h-50 w-full items-center justify-center overflow-hidden">
          <EmptyList emptyText={t('prediction.orders.noOrders')} />
        </div>
      ) : (
        <div className="px-5 py-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {data.map((order) => (
            <MobileOpenOrderItem
              key={order.id}
              item={order}
              showMarketHeader={false}
              tickSize={market.orderPriceMinTickSize}
            />
          ))}
        </div>
      )}
    </div>
  )
}
