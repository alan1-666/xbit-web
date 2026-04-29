import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useTranslation } from 'react-i18next'
import { formatDecimalLongValue } from '@/utils/helpers.ts'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { cn } from '@/lib/utils.ts'

type ProgressBarHolderProps = {
  percentage: number
  minWClass?: string
  maxWClass?: string
}

const ProgressBarHolder = ({ percentage, maxWClass, minWClass = 'w-[63px]' }: ProgressBarHolderProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'mt-1 bg-[#00FFB433] h-1 relative rounded-r-full',
              isDesktop ? minWClass : 'min-w-[60px] ',
              maxWClass,
            )}
          >
            <div
              className={cn('absolute h-full rounded-r-full', isDesktop ? 'bg-[#009C46] ' : 'bg-[#00FFB4] ')}
              style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
            ></div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {`${t('detail.tokenDetail.holdingRatio')}: ${formatDecimalLongValue(percentage, 2)}%`}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ProgressBarHolder
