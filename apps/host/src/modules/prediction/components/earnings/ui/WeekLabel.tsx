import { memo } from 'react'
import { DayData } from '@/modules/prediction/types/earnings.types'

interface WeekLabelProps {
  days: DayData[]
  className?: string
}

export const WeekLabel = memo<WeekLabelProps>(({ days, className }) => {
  if (!days || days.length === 0) return null

  return (
    <div className={className}>
      <span className="text-sm font-medium text-[#908E98]">
        {new Date(days[0].fullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        {' - '}
        {new Date(days[4].fullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>
  )
})

WeekLabel.displayName = 'WeekLabel'
