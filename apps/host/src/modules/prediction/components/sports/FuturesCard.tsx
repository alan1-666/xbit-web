import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { Link } from 'react-router-dom'

interface FuturesOutcome {
  id: string
  name: string
  probability: number
  yesPrice: number
  noPrice: number
  yesPriceDisplay: string // e.g. "76%" or "76¢" depending on preference, screenshot shows buttons with "Yes" text and "76%" overlay on hover or similar.
  noPriceDisplay: string
}

import { Event } from '@/@generated/gql/graphql-prediction'
import { NAVIGATIONS } from '@/lib/navigations'

interface FuturesCardProps {
  event: Event
}

export const FuturesCard = ({ event }: FuturesCardProps) => {
  const { title, slug, volume, image, markets } = event

  let outcomes: FuturesOutcome[] = []

  if (markets && markets.length > 0) {
    const market = markets[0]
    if (market && market.outcomes && market.outcomePrices) {
      outcomes = market.outcomes.map((outcomeName: string, i: number) => {
        const priceVal = market.outcomePrices?.[i]
        const price = priceVal ? Number(priceVal) : 0
        const probability = Math.round(price * 100)
        return {
          id: `${market.slug || market.conditionId}-${i}`,
          name: outcomeName,
          probability,
          yesPrice: probability,
          noPrice: 100 - probability,
          yesPriceDisplay: `${probability}%`,
          noPriceDisplay: `${100 - probability}%`,
        }
      })
    }
  }

  outcomes.sort((a, b) => b.probability - a.probability)

  return (
    <div className="flex flex-col w-full h-full bg-[#1C1F26] rounded-xl border border-white/5 overflow-hidden transition-all hover:-translate-y-px hover:shadow-black/20 hover:shadow-md group">
      {/* Header */}
      <div className="flex w-full items-start relative gap-3 px-3 py-3 h-[60px]">
        {/* Icon */}
        <div className="overflow-hidden rounded-md relative shrink-0 w-[10%] max-w-[38px] aspect-square bg-[#2C3038]">
          <Avatar className="w-full h-full rounded-[inherit]">
            <AvatarImage src={image || ''} alt={title || ''} className="object-cover w-full h-full" />
            <AvatarFallback className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400 bg-[#2C3038] rounded-[inherit] select-none">
              {title?.slice(0, 2).toUpperCase() || 'NA'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Title */}
        <div className="flex flex-1 min-w-0 justify-between items-center h-full">
          <Link
            to={NAVIGATIONS.prediction.sports.event(slug || '')}
            className="block w-full group-hover:underline decoration-2"
          >
            <p className="text-sm font-semibold text-white line-clamp-2 leading-tight">{title}</p>
          </Link>
        </div>
      </div>

      {/* Content: Outcome List */}
      <div className="flex flex-col w-full flex-1 overflow-hidden relative border-t border-white/5">
        <div className="w-full px-3 py-2 overflow-y-auto custom-scrollbar max-h-[300px]">
          <div className="space-y-1">
            {outcomes.map((outcome) => (
              <div key={outcome.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center w-full h-8">
                {/* Outcome Name */}
                <div className="flex items-center min-w-0 overflow-hidden">
                  <span className="line-clamp-1 text-[13px] font-medium text-gray-200 truncate" title={outcome.name}>
                    {outcome.name}
                  </span>
                </div>

                {/* Probability */}
                <div className="flex items-center justify-end min-w-[32px]">
                  <span className="text-[13px] font-medium text-white">{outcome.probability}%</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-1 items-center">
                  {/* Yes Button */}
                  <button className="flex items-center justify-center w-[44px] h-[26px] rounded-[4px] bg-[#0E3B28] hover:bg-[#134D35] text-[#24B876] transition-colors cursor-pointer border border-[#134D35]">
                    <span className="text-[11px] font-bold">Yes</span>
                  </button>

                  {/* No Button */}
                  <button className="flex items-center justify-center w-[44px] h-[26px] rounded-[4px] bg-[#3B1215] hover:bg-[#4D181C] text-[#E53E3E] transition-colors cursor-pointer border border-[#4D181C]">
                    <span className="text-[11px] font-bold">No</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Volume */}
      <div className="flex w-full items-center px-3 py-2 border-t border-white/5 bg-[#1C1F26]">
        <div className="flex flex-1 gap-2 justify-between items-center w-full">
          <div className="flex flex-row gap-1 items-center text-gray-500">
            <p className="text-xs font-medium">{volume || '$0'} Vol.</p>
          </div>
          <div className="flex justify-center items-center">
            <button className="text-gray-600 hover:text-gray-400 transition-colors">
              {/* Bookmark Icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
