import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'

const IconSameSource = () => {
  const { t } = useTranslation()
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <img
            src="/images/icons/wallets/icon-bundled.svg"
            className="min-w-3 !pointer-events-auto"
            alt="native wallet"
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('detail.filters.sameOrigin')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default IconSameSource
