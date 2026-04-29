import { cn } from '@/lib/utils.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { formatDecimalLongValue } from '@/utils/helpers.ts'

type IconHolderPercentageProps = {
  percentage: number,
  label?: string,
  imgClassName?: string
  spanClassName?: string
}
const IconHolderPercentage = ({
  percentage,
  imgClassName,
  spanClassName,
  label = '%'
}: IconHolderPercentageProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <img src="/images/icons/profile-remove.svg" alt="icon" className={cn(imgClassName)} />
            <span className={cn(
              "app-font-regular text-[4.29px] leading-[1] text-gradient-icon-percentage",
              "absolute top-[calc(100%-3px)] right-0 text-white",
              spanClassName
            )}>
              {Math.round(Number(percentage))}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {`Top: ${formatDecimalLongValue(Number(percentage), 3)}${label}`}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default IconHolderPercentage
