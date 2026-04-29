import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { cn } from '@/lib/utils.ts'

const IconTopTrader = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <img
            src="/images/icons/wallets/icon-holder.svg"
            className={cn('min-w-3 !pointer-events-auto', isDesktop ? 'size-4' : '')}
            alt="top 10"
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('listCoin.filters.topTraders')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default IconTopTrader
