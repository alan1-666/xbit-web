import { cn } from '@/lib/utils.ts'

export interface BreakingItemPriceChangeProps {
  oneDayPriceChange: number
  chance: string
}

export const BreakingItemPriceChange = (props: BreakingItemPriceChangeProps) => {
  const { oneDayPriceChange, chance } = props
  return (
    <div className="flex gap-2.5 items-center ml-4 xl:ml-0">
      <div className="text-right flex flex-col items-center gap-1 xl:flex-row">
        <div className="@max-[600px]:text-[18px] font-semibold text-white text-xl leading-none!">{Number(chance) < 0.01 ? '<1' : chance}%</div>
        <div
          className={cn(
            'flex items-center gap-0.5',
            oneDayPriceChange < 0 ? 'text-[#EA3B4F]' : 'text-[#00CE89]',
          )}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(oneDayPriceChange < 0 ? 'rotate-90' : '-rotate-90')}
          >
            <title>arrow right</title>
            <path
              d="M2 6L10 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M6.75 9.25L10 6L6.75 2.75"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <div className="text-sm flex items-center font-normal text-white leading-none!">
            {Math.round(Math.abs(oneDayPriceChange * 100))}%
          </div>
        </div>
      </div>
    </div>
  )
}
