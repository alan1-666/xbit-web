import { useMyPolymarketOpenOrders } from '@/modules/prediction/hooks/usePolymarketOpenOrders.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { CancelOrderDialog } from '@/modules/prediction/components/portfolio/OpenOrdersCellRender/CancelOrderDialog.tsx'
import { MobileOpenOrderItem } from '@/modules/prediction/components/portfolio/OpenOrdersCellRender/MobileOpenOrderItem.tsx'
import { IExtendedOpenOrder } from '@/modules/prediction/models/PortfolioModel.ts'
import { formatBalance } from '@/lib/format.ts'
import { useTranslation } from 'react-i18next'

export interface OpenOrdersProps {
  marketId?: string
  conditionId?: string
}

export const OpenOrders = (props: OpenOrdersProps) => {
  const { conditionId, marketId } = props
  const { data } = useMyPolymarketOpenOrders(conditionId, {
    enabled: !!conditionId,
  })
  const { t } = useTranslation()
  const { event } = useEventDetailsPageContext()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const market = useMemo(() => event?.markets?.[0], [event?.markets])

  const orders = useMemo<IExtendedOpenOrder[]>(() => {
    if (!data) return []
    const clobTokenIds = market?.clobTokenIds || []
    const outcomes = market?.outcomes || []
    return data.map((item) => {
      const priceVal = parseFloat(item.price || '0')
      const matchedVal = parseFloat(item.sizeFilled || '0')
      const sizeVal = parseFloat(item.size || '0')
      const totalVal = priceVal * sizeVal
      const outcomeIndex = clobTokenIds.indexOf(item.asset_id || '')
      return {
        ...item,
        id: item.orderID,
        outcome: outcomes[outcomeIndex],
        outcomeIndex: outcomeIndex,
        marketId: marketId,
        rawPrice: priceVal,
        rawSize: sizeVal,
        rawMatched: matchedVal,
        filled: `${matchedVal} / ${sizeVal}`,
        total: formatBalance(totalVal),
        canCancel: true,
        expiration:
          item.expiration === 0 || !item.expiration
            ? 'Until Cancelled'
            : new Date(item.expiration * 1000).toLocaleDateString(),
        side: item.side === 'BUY' ? 'Buy' : 'Sell',
      } as IExtendedOpenOrder
    })
  }, [data, marketId, market])

  const getGridCols = (_count: number) => {
    // if (count <= 1) return 'grid-cols-1'
    // if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
  }

  if (!orders || orders.length === 0) return null

  return (
    <div className="border-border bg-card">
      <div className="mb-2">{t('prediction.portfolio.tabs.openOrders')}</div>
      <div className={`grid gap-3 ${getGridCols(orders.length)}`}>
        {orders.map((order) => (
          <MobileOpenOrderItem item={order} showMarketHeader={false} tickSize={market?.orderPriceMinTickSize} />
        ))}
      </div>
      {selectedOrderId && (
        <CancelOrderDialog
          orderId={selectedOrderId}
          open={!!selectedOrderId}
          onOpenChange={() => setSelectedOrderId(null)}
        >
          <button
            onClick={() => setSelectedOrderId(null)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </CancelOrderDialog>
      )}
    </div>
  )
}
