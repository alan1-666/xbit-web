import { cn } from '@/lib/utils.ts'

export interface TimeframeSelectorProps {
  currentTimeframe: TimeframeOption
  onTimeframeChange: (currentTimeframe: TimeframeOption) => void
}

const options = ['1m', '5m', '1h', '6h', '24h'] as const

export type TimeframeOption = (typeof options)[number]

export const TimeframeSelector = (props: TimeframeSelectorProps) => {
  const { currentTimeframe, onTimeframeChange } = props
  return (
    <div className="flex rounded-[6px] bg-[#17171B]">
      {options.map((option) => (
        <button
          key={option}
          className={cn(
            'text-center text-[calc(11rem/16)] leading-[14px] transition-all px-[12px] py-[5px]',
            currentTimeframe === option ? 'bg-[#2B2B31] text-white rounded-[6px]' : 'text-[#FFFFFF80]',
          )}
          onClick={() => onTimeframeChange(option)}
        >
          <span>{option}</span>
        </button>
      ))}
    </div>
  )
}
