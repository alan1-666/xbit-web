import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'

export interface TopTrendingTooltipProps {
  top?: number | string
}

export const TopTrendingTooltip = (props: TopTrendingTooltipProps) => {
  const { top } = props
  const { t } = useTranslation()
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="app-font-regular text-[10px] leading-[1] text-[#FACC14] cursor-pointer mt-[0.5px]">#{top}</span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('detail.tooltip.topTrending', { top: top })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
