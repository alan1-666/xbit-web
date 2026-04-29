import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useTranslation } from 'react-i18next'

interface PIconOfficial {
  className?: string
}

const IconOfficial = ({ className }: PIconOfficial) => {
  const { t } = useTranslation()
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <img src="/images/icons/icon-official.svg" className={cn("w-4 h-4 ml-1.5", className)} alt="icon official" />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {t('detail.tags.official')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default IconOfficial
