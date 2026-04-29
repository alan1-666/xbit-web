import { formatBalance, formatPrice } from '@/lib/format'
import { BasePositionCell } from '@/modules/prediction/components/portfolio/PositionsCellRender/BasePositionCell.tsx'
import { PositionModel } from '@/modules/prediction/models/PositionModel.ts'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { roundByTickSize } from '@/utils/helpers'

export interface ActivePositionCellProps {
  position: PositionModel
  teamColor?: string
}

export const ActivePositionCell = (props: ActivePositionCellProps) => {
  const { position, teamColor } = props
  const { t } = useTranslation()
  return (
    <BasePositionCell icon={position.icon} title={position.title} eventSlug={position.eventSlug} className="pl-0">
      <div
        className="inline-flex w-fit items-center rounded-md border border-transparent px-1.5 py-0.5 text-xs font-semibold text-(--team-color) transition-colors bg-(--team-color)/15 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        style={
          {
            '--team-color': teamColor ? teamColor : position.outcome === 'Yes' ? '#94A3B8' : '#F87171',
          } as React.CSSProperties
        }
      >
        <span className="flex lg:hidden pr-1">
          {position.outcome.length > 15 ? `${position.outcome.slice(0, 15)}...` : position.outcome}
        </span>{' '}
        <span className="hidden lg:flex">{position.outcome}</span>
        <span className="pl-1">{formatPrice(roundByTickSize(Number(position.avgPrice), position.tickSize))}¢</span>
      </div>
      <span className="text-neutral-400 text-xs">
        {formatBalance(position.size)} {t('prediction.profile.shares')}
      </span>
    </BasePositionCell>
  )
}
