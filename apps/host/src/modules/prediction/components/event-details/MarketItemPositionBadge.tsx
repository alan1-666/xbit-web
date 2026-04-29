import { useMarketPositions } from '@/modules/prediction/hooks/useUserActivePositions.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { Badge } from '@components/ui/badge.tsx'
import { cn } from '@/lib/utils.ts'

export interface MarketItemPositionBadgeProps {
  market: MarketModel
}

export const MarketItemPositionBadge = (props: MarketItemPositionBadgeProps) => {
  const { market } = props
  const { data } = useMarketPositions(market)
  if (!data || data.length === 0) return null
  const position = data[0]
  return (
    <Badge className={cn('mt-1 text-white text-xs font-normal', position.outcomeIndex === 0 ? 'bg-rise' : 'bg-fall')}>
      {position.outcome} {position.size} • {Math.round(position.avgPrice * 100)}¢
    </Badge>
  )
}
