import { formatBalance } from '@/lib/format'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { useMyPolymarketOpenOrders } from '../../hooks/usePolymarketOpenOrders'
import { Button } from '@/components/ui/button'
import { IExtendedOpenOrder } from '../../models/PortfolioModel'
import { LoadingState } from './OpenOrdersCellRender/LoadingState'
import { OpenOrderGroup } from './OpenOrdersCellRender/OpenOrderGroup'
import { OpenOrderRow } from './OpenOrdersCellRender/OpenOrderRow'
import { OpenOrdersHeader } from './OpenOrdersCellRender/OpenOrdersHeader'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'
import { OpenOrderDto } from '@/@generated/gql/graphql-xpUser.ts'

type GroupedOrders = {
  marketId: string
  marketTitle: string
  marketIcon: string
  orders: IExtendedOpenOrder[]
}

export const PortfolioOpenOrders = () => {
  const { t } = useTranslation()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const proxyWallet = useProxyWallet()
  const navigate = useNavigate()

  const { data: rawOrders = [], isLoading: isLoadingOrders } = useMyPolymarketOpenOrders('', {
    enabled: !!proxyWallet,
  })

  const isLoading = isLoadingOrders

  const data = useMemo<IExtendedOpenOrder[]>(() => {

    return rawOrders.map((item: OpenOrderDto) => {
      const market = item.marketInfo
      const priceVal = parseFloat(item.price || '0')
      const matchedVal = parseFloat(item.sizeFilled || '0')
      const sizeVal = parseFloat(item.size || '0')
      const totalVal = priceVal * sizeVal
      const outcomeIndex = market?.clobTokenIds?.indexOf(item.asset_id || '') || 0
      const outcomeLabels = market?.outcomes || []
      const outcome = outcomeLabels[outcomeIndex] || ''

      return {
        groupItemTitle: market?.groupItemTitle || t('prediction.table.unknown'),
        id: item.orderID,
        marketId: item?.market || '',
        marketTitle: market?.question || '',
        marketIcon: market?.icon || '/images/icons/market-default.svg',
        marketSlug: market?.eventSlug || '',
        side: item.side === 'BUY' ? t('prediction.table.buy') : t('prediction.table.sellSide'),
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
            ? t('prediction.table.untilCancelled')
            : new Date(item.expiration * 1000).toLocaleDateString(),
        canCancel: item.status === 'LIVE' || item.status === 'OPEN',
      }
    })
  }, [rawOrders, t])

  const groups = useMemo<GroupedOrders[]>(() => {
    if (isLoading || data.length === 0) return []
    const grouped = data.reduce<Record<string, IExtendedOpenOrder[]>>((acc, order) => {
      if (!acc[order.marketId]) {
        acc[order.marketId] = []
      }
      acc[order.marketId].push(order)
      return acc
    }, {})

    return Object.values(grouped).map((orders) => ({
      marketId: orders[0].marketId,
      orders,
      marketTitle: orders[0].marketTitle,
      marketIcon: orders[0].marketIcon,
    }))
  }, [data, isLoading])

  const toggleGroup = (marketId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [marketId]: !prev[marketId],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex w-full flex-col mt-3 xl:mt-0">
        <OpenOrdersHeader />
        <LoadingState />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col h-[300px] w-full items-center justify-center">
        <EmptyList containerClassName="h-auto" emptyText={t('prediction.table.noOpenOrders')} />
        <Button
          className="mt-4 rounded-full h-10 px-6 flex-none"
          variant="gradient"
          onClick={() => navigate(NAVIGATIONS.prediction.home())}
        >
          {t('prediction.history.goToPrediction')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col mt-3 xl:mt-0">
      <OpenOrdersHeader />
      {groups.map((group) => {
        const isMultiple = group.orders.length > 1
        const isExpanded = expandedGroups[group.marketId]

        if (!isMultiple) {
          return <OpenOrderRow key={group.orders[0].id} order={group.orders[0]} />
        } else {
          return <OpenOrderGroup key={group.marketId} group={group} isExpanded={!!isExpanded} onToggle={toggleGroup} />
        }
      })}
    </div>
  )
}
