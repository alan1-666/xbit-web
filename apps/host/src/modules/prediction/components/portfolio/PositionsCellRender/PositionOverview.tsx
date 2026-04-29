import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PositionModel } from '../../../models/PositionModel'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { formatBalance, formatPrice } from '@/lib/format'
import { roundByTickSize } from '@/utils/helpers'

interface PositionOverviewProps {
  position: PositionModel
}

const PositionOverview = ({ position }: PositionOverviewProps) => {
  return (
    <div className="flex items-center gap-3 pl-2 min-w-0 w-full">
      <Avatar className="h-11 w-11 min-w-[44px] rounded-sm border border-white/5 cursor-pointer">
        <AvatarImage src={position.icon} alt={position.title} className="object-cover" />
        <AvatarFallback className="rounded-sm text-xs">{position.title?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 min-w-0">
        <Link
          to={NAVIGATIONS.prediction.eventDetails(position.eventSlug || '')}
          className="text-text-primary font-medium line-clamp-1 text-ellipsis overflow-hidden hover:underline cursor-pointer break-all text-[13px] leading-[21px]"
          title={position.title}
        >
          {position.title}
        </Link>
        <div className="flex items-center gap-2 text-xs ">
          <div
            className="inline-flex w-fit items-center rounded-md border border-transparent px-1.5 py-0.5 text-xs font-semibold text-(--team-color) transition-colors bg-(--team-color)/15 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={
              {
                '--team-color': position.outcomeIndex === 0 ? '#00CE89' : '#EA3B4F',
              } as React.CSSProperties
            }
          >
            {position.outcome} {formatPrice(roundByTickSize(position.avgPrice, position.tickSize))}¢
          </div>
          <span className="text-neutral-400 text-xs">{formatBalance(position.size)} shares</span>
        </div>
      </div>
    </div>
  )
}

export default PositionOverview
