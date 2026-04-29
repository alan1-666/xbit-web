import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { cn } from '@/lib/utils.ts'

const IconNewWallet = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <img
            src="/images/icons/wallets/icon-new-wallet.svg"
            className={cn('min-w-3 !pointer-events-auto', isDesktop ? 'size-4' : '')}
            alt="new wallet"
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('detail.filters.newWallet')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default IconNewWallet
