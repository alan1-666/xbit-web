import { useResponsive } from '@/hooks/useResponsive'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const ComparisonTooltip = () => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()

  const RenderContent = () => (
    <>
      <p className={cn('font-medium text-[#908E98]')}>{t('fundingRate.tooltip.ruleColor')}</p>
      {/* <p className="mt-4 text-[#CACACA]">{t('fundingRate.tooltip.exChange')}</p> */}
      <div className="flex flex-col gap-2.5 mt-3 text-[#CACACA]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#EA3B4F] shrink-0"></div>
          <p className="whitespace-nowrap">{`-∞ < ${t('fundingRate.tooltip.hourlyRate')} < 0%`}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#9AA3A4] shrink-0"></div>
          <p className="whitespace-nowrap">{`0% ≤ ${t('fundingRate.tooltip.hourlyRate')} ≤ 0.01%`}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00CE89] shrink-0"></div>
          <p className="whitespace-nowrap">{`0.01% < ${t('fundingRate.tooltip.hourlyRate')} < ∞`}</p>
        </div>
      </div>
    </>
  )

  const TriggerButton = (
    <button
      className={cn(
        'cursor-help outline-none text-[12px] font-medium leading-none text-[#908E98] hover:text-white transition-colors ml-auto',
        !isDesktop && 'text-white',
      )}
    >
      {t('fundingRate.tooltip.ruleColor')}
    </button>
  )

  if (isDesktop) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{TriggerButton}</TooltipTrigger>
          <TooltipContent
            side="top"
            align="end"
            className="bg-[#212127] border-zinc-800 shadow-xl p-4 text-xs rounded-md"
          >
            <RenderContent />
            <TooltipArrow className="fill-[#212127]" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent className="bg-[#212127] border-zinc-800 p-6 pb-10" isShowControlIcon={false}>
        <DrawerHeader className="p-0 mb-4 text-left">
          <DrawerTitle className="hidden">{t('fundingRate.tooltip.ruleColor')}</DrawerTitle>
        </DrawerHeader>
        <div className="text-sm">
          <RenderContent />
        </div>
        <div className="mt-8 w-full">
          <DrawerClose asChild>
            <Button variant="gradient" className="rounded-full w-full h-11">
              {t('fundingRate.tooltip.agree')}
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ComparisonTooltip
