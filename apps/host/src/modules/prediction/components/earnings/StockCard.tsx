import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { StockItem } from '@/modules/prediction/types/earnings.types'
import { formatEPS, formatPercent } from '@/modules/prediction/utils/earnings.utils'
import { LogoAvatar } from './LogoAvatar'
import { NAVIGATIONS } from '@/lib/navigations'

interface StockCardProps {
  item: StockItem
}

export const StockCard = memo<StockCardProps>(({ item }) => {
  const { symbol, eps, probability, statusText, logoUrl, slug } = item
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(NAVIGATIONS.prediction.eventDetails(slug))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const dotColor =
    statusText === 'beats' ? 'bg-green-400' : statusText === 'misses' ? 'bg-red-400' : 'bg-gray-400'

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group relative flex cursor-pointer items-center justify-between gap-3 p-3 transition-all duration-200 hover:bg-slate-800/60"
      style={{ backgroundColor: 'transparent' }}
      role="button"
      tabIndex={0}
      aria-label={`${symbol} earnings: ${formatEPS(eps)}, ${formatPercent(probability)} probability, ${statusText}. Click to view details.`}
    >
      <div className="flex items-center gap-3">
        <LogoAvatar symbol={symbol} logoUrl={logoUrl} />
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-none font-semibold text-white">{symbol}</span>
          <span className="text-xs leading-none font-normal text-[#908E98]">{formatEPS(eps)}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', dotColor)} aria-hidden="true" />
          <span className="text-base leading-none font-semibold text-white">{formatPercent(probability)}</span>
        </div>
        <span className="text-sm leading-none font-normal text-[#908E98]">{statusText}</span>
      </div>
    </div>
  )
})

StockCard.displayName = 'StockCard'
