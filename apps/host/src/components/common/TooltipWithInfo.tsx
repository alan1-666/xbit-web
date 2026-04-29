import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { IconInfoSvg } from '../icon/stroke'
import { cn } from '@/lib/utils'

const TooltipWithInfo = ({
  tooltipKey,
  isWarning = false,
  iconClassName,
  tooltipContentClassName,
  icon,
}: {
  tooltipKey: string
  isWarning?: boolean
  iconClassName?: string
  tooltipContentClassName?: string
  icon?: string
}) => {
  const { t } = useTranslation()
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger type="button">
          <IconInfoSvg
            className={cn(`h-4 w-4 cursor-pointer text-[#52525b] ${iconClassName}`, {
              'text-[#EA963A]': isWarning,
            })}
          />
        </TooltipTrigger>
        <TooltipContent className={cn('max-w-[240px] bg-[#212127] text-[#a9a9b3] rounded-[6px] p-2', tooltipContentClassName)}>
          <p className="text-xs leading-[1.5]">{tooltipKey}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default TooltipWithInfo
