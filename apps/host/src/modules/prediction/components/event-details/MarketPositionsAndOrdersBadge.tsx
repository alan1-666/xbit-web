import { UserPosition } from '@/@generated/gql/graphql-prediction.ts'
import { OpenOrderDto } from '@/@generated/gql/graphql-xpUser.ts'
import { Badge } from '@components/ui/badge.tsx'
import { cn } from '@/lib/utils.ts'
import { formatAmount } from '@/lib/format.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { useTranslation } from 'react-i18next'

export interface MarketPositionsAndOrdersBadgeProps {
  positions: UserPosition[]
  orders: OpenOrderDto[]
  market: MarketModel
}

const PositionsBadge = (props: { positions: UserPosition[] }) => {
  const { positions } = props
  if (positions.length === 0) return null
  return (
    <>
      {positions.map((position) => (
        <Badge
          key={position.outcome}
          className={cn('mt-1 text-white text-xs font-normal', position.outcomeIndex === 0 ? 'bg-rise' : 'bg-fall')}
        >
          {position.outcome} {formatAmount(position.size)} • {Math.round(position.avgPrice * 100)}¢
        </Badge>
      ))}
    </>
  )
}

const OrdersBadge = (props: { orders: OpenOrderDto[]; market: MarketModel }) => {
  const { orders } = props
  const { t } = useTranslation()
  if (orders.length === 0) return null
  return (
    <>
      <Badge className="mt-1 text-white text-xs font-normal bg-impartal">
        {orders.length} {t('prediction.marketItem.badge.open')}{' '}
        {orders.length > 1 ? t('prediction.marketItem.badge.orders') : t('prediction.marketItem.badge.order')}
      </Badge>
    </>
  )
}

export const MarketPositionsAndOrdersBadge = (props: MarketPositionsAndOrdersBadgeProps) => {
  const { positions, orders, market } = props
  const totalOrders = orders.length + positions.length
  if (totalOrders === 0) return null
  return (
    <div className="space-x-1">
      <PositionsBadge positions={positions} />
      <OrdersBadge orders={orders} market={market} />
    </div>
  )
}
