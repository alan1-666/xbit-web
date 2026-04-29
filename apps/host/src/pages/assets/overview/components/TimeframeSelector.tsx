import { cn } from '@/lib/utils.ts'

export type Timeframe = '1D' | '1W' | '1M' | '1Y'

export interface TimeframeSelectorProps {
  value: Timeframe
  onValueChange: (value: Timeframe) => void
}

const timeframeOptions = ['1D', '1W', '1M', '1Y'] as Timeframe[]

export const TimeframeSelector = (props: TimeframeSelectorProps) => {
  const { value, onValueChange } = props
  return (
    <div className="grid grid-cols-4 border border-[#2A2839] rounded-[4px] overflow-hidden relative text-[calc(14rem/16)]">
      <div
        className="absolute top-0 left-0 h-full w-1/4 transition bg-[#2A2839]"
        style={{
          transform: `translateX(${timeframeOptions.indexOf(value) * 100}%)`,
        }}
      />
      {timeframeOptions.map((option) => (
        <button
          key={option}
          className={cn(
            'w-[42px] h-[30px] flex items-center justify-center',
            value === option ? 'text-[#FBFBFB]' : 'text-[#6C6A74]',
          )}
          onClick={() => onValueChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
