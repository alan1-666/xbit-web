import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'

const NativeWalletIconLatest = () => {
  const {t} = useTranslation()
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <img src="/images/tokenDetail/ic-money-change.svg" alt="native wallet" className="w-3 h-3" />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('detail.filters.bundlers')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default NativeWalletIconLatest
