import { memo } from 'react'
import { DayData } from '@/modules/prediction/types/earnings.types'
import { DayColumn } from './DayColumn'

interface EarningsBodyProps {
  days: DayData[]
}

export const EarningsBody = memo<EarningsBodyProps>(({ days }) => {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-300 grid-cols-5">
        {days.map((day, index) => (
          <DayColumn key={day.dayKey} day={day} isLastColumn={index === days.length - 1} />
        ))}
      </div>
    </div>
  )
})

EarningsBody.displayName = 'EarningsBody'
