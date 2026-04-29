import { TimeframeOption, TimeframeSelector } from '@components/discover/TimeframeSelector.tsx'
import QuickBuy from '@/components/discover/QuickBuy'

export interface TimeframeAndQuickBuyProps {
  currentTimeframe: TimeframeOption
  onTimeframeChange: (currentTimeframe: TimeframeOption) => void
}

export const TimeframeAndQuickBuy = (props: TimeframeAndQuickBuyProps) => {
  const { currentTimeframe, onTimeframeChange } = props
  return (
    <div className="flex items-center justify-between">
      <TimeframeSelector currentTimeframe={currentTimeframe} onTimeframeChange={onTimeframeChange} />
      <QuickBuy />
    </div>
  )
}
