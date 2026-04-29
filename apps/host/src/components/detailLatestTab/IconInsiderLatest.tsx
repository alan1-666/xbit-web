import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useTranslation } from 'react-i18next'

const IconInsiderLatest = () => {
  const { t } = useTranslation()
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <img src="/images/icons/wallets/icon-insider.svg" alt="insider" className="w-3 h-3 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('detail.filters.ratWarehouse')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default IconInsiderLatest
