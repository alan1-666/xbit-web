import { fShortenNumber } from '@/lib/number'
import { ReactNode } from 'react'
import { TooltipProvider } from '../ui/tooltip'
import { SimpleTooltip } from '../v2/ui-shared/components/SimpleTooltip'
import MoneyFormatted from '../common/MoneyFormatted'

export interface PointCardProps {
  title: string
  points: number
  icon?: ReactNode
  tooltipContent?: string
}

export const PointCard = (props: PointCardProps) => {
  const { title, points, icon, tooltipContent } = props
  return (
    <TooltipProvider>
      <div className="bg-[#1F1F26] rounded-[16px] p-4 flex flex-col items-center justify-center relative h-[100px] xl:h-auto overflow-hidden">
        <div className="text-[calc(20rem/16)] xl:text-[calc(36rem/16)] font-[450]">
          <MoneyFormatted value={points} unit="" />
        </div>
        <SimpleTooltip
          content={tooltipContent}
          contentClassName="max-w-[300px] bg-[#141418] text-[14px] text-[#605E68]"
        >
          <div className="text-[calc(13rem/16)] xl:text-[calc(20rem/16)] text-[#A9A9B9] font-[305] underline underline-offset-4 decoration-dotted cursor-pointer">
            {title}
          </div>
        </SimpleTooltip>
        <div className="absolute bottom-0 right-0">{icon}</div>
      </div>
    </TooltipProvider>
  )
}
