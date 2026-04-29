import { memo } from 'react'
import { cn } from '@/lib/utils'
import { DayData } from '@/modules/prediction/types/earnings.types'
import { MarketSection } from './MarketSection'
import { EmptyState } from './ui'

interface DayColumnProps {
  day: DayData
  isLastColumn?: boolean
}

export const DayColumn = memo<DayColumnProps>(({ day, isLastColumn }) => {
  const { preMarket, postMarket, isPast } = day
  const hasNoData = preMarket.length === 0 && postMarket.length === 0

  return (
    <div
      className={cn(
        'flex min-w-65 flex-1 flex-col gap-6 overflow-y-auto px-4 py-4 transition-all',
        !isLastColumn && 'border-r border-slate-700/50',
        isPast && 'opacity-50',
      )}
      style={{
        height: 'calc(100vh - 320px)',
        backgroundColor: 'transparent',
      }}
    >
      {hasNoData ? (
        <EmptyState className="flex flex-1 flex-col items-center justify-center" />
      ) : (
        <>
          <MarketSection title="Pre Market" items={preMarket} />
          {preMarket.length > 0 && postMarket.length > 0 && <div className="h-px bg-slate-700/50" aria-hidden="true" />}
          <MarketSection title="Post Market" items={postMarket} />
        </>
      )}
    </div>
  )
})

DayColumn.displayName = 'DayColumn'
