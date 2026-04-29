import { formatBalance, formatPrice } from '@/lib/format'
import { BasePositionCell } from '@/modules/prediction/components/portfolio/PositionsCellRender/BasePositionCell.tsx'
import { ClosedPositionModel } from '@/modules/prediction/models/ClosedPositionModel.ts'
import { roundByTickSize } from '@/utils/helpers'
import { Check, X } from 'lucide-react'

export interface ClosedPositionCellProps {
  position: ClosedPositionModel
}

export const ClosedPositionCell = (props: ClosedPositionCellProps) => {
  const { position } = props
  const isLost = Number(position.realizedPnl) < 0

  return (
    <BasePositionCell
      icon={position.icon}
      title={position.title}
      eventSlug={position.eventSlug}
      className="md:pl-2 pl-0"
    >
      <div className="flex items-center gap-2 text-xs">
        <div className="md:hidden flex">
          {isLost ? (
            <div className="flex items-center gap-1">
              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500">
                <X size={8} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-xs font-medium text-red-500">Lost</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500">
                <Check size={8} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-xs font-medium text-emerald-500">Won</span>
            </div>
          )}
        </div>
        <div className="text-neutral-400 text-xs">
          {formatBalance(position.totalBought)} {position.outcome} at{' '}
          {formatPrice(
            roundByTickSize(
              Number(position.avgPrice),
              position.outcomeIndex === 0 ? position.tokenYesTickSize : position.tokenNoTickSize,
            ),
          )}
          ¢
        </div>
      </div>
    </BasePositionCell>
  )
}
