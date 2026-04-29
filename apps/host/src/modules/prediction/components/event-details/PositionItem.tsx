import type { PositionModel } from '@/modules/prediction/models/PositionModel.ts'
import { formatPercent, formatPrice } from '@/lib/format.ts'
import { cn } from '@/lib/utils.ts'
import { Card } from '@components/ui/card.tsx'
import { Badge } from '@components/ui/badge.tsx'

export interface PositionItemProps {
  position: PositionModel
}

export const PositionItem = ({ position }: PositionItemProps) => {
  const isProfitable = position.cashPnl >= 0

  return (
    <Card className="flex items-center justify-between gap-3 p-3 bg-[#1a1a1f] border-transparent hover:bg-[#202025] transition-colors">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={position.outcome === 'Yes' ? 'success' : 'danger'}>{position.outcome}</Badge>
          <span className="text-xs text-[#838385]">
            {Number(position.size).toFixed(1)} shares @ {formatPrice(Math.round(position.avgPrice * 100))}¢
          </span>
        </div>
        <p className="text-sm text-white font-medium truncate">{position.title}</p>
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-sm font-medium text-white">
          {formatPrice(position.currentValue, { showCurrency: true })}
        </span>
        <span className={cn('text-xs font-medium', isProfitable ? 'text-[#00ce89]' : 'text-[#EA3B4F]')}>
          {isProfitable ? '+' : ''}
          {formatPrice(position.cashPnl, { showCurrency: true })} ({formatPercent(position.percentPnl)})
        </span>
      </div>
    </Card>
  )
}
