import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { cn } from '@/lib/utils.ts'

export interface HotTokenTooltipProps {
  className?: string
}

export const HotTokenTooltip = (props: HotTokenTooltipProps) => {
  const { className } = props
  const { t } = useTranslation()
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <img
            src="/images/tokenDetail/ic-hot2.svg"
            className={cn('size-3 ml-1.5 cursor-pointer', className)}
            alt=""
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('detail.tooltip.hotToken')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
