import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'

export interface IconXStockProps {
  className?: string
}

export const IconXStock = (props: IconXStockProps) => {
  const { className } = props
  const { t } = useTranslation()
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <img
            src="/images/icons/brands/xstock.svg"
            className={cn('size-2.5 cursor-pointer', className)}
            alt="icon xstock"
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('xstocks.tooltip.powerByXStocks')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
