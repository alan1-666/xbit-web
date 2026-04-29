import { memo } from 'react'
import { StockItem } from '@/modules/prediction/types/earnings.types'
import { StockCard } from './StockCard'

interface MarketSectionProps {
  title: string
  items: StockItem[]
}

export const MarketSection = memo<MarketSectionProps>(({ title, items }) => {
  if (items.length === 0) return null

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 border-t border-t-white/10 border-dashed" />
        <span className="text-xs font-normal capitalize text-[#908E98]!">{title}</span>
        <div className="h-px flex-1 border-t border-t-white/10 border-dashed" />
      </div>

      <div className="rounded-lg border border-slate-700/50">
        {items.map((item, index) => (
          <div key={item.id}>
            <StockCard item={item} />
            {index < items.length - 1 && <div className="mx-3 h-px bg-slate-700/50" />}
          </div>
        ))}
      </div>
    </div>
  )
})

MarketSection.displayName = 'MarketSection'
