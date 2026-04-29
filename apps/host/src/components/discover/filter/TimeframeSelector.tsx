import { Control, useController, useWatch } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { clsx } from 'clsx'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'

const timeframes = ['1m', '5m', '1h', '6h', '24h']

export interface TimeframeSelectorProps {
  control: Control<FilterFormData>
}

export const TimeframeSelector = (props: TimeframeSelectorProps) => {
  const { control } = props
  const { t } = useTranslation()
  const selectedPeriod = useWatch({ control, name: 'timeframe' })
  const {
    field: { onChange },
  } = useController({ control, name: 'timeframe' })
  return (
    <div className="flex items-center justify-between">
      <div className="text-[calc(1rem*(13/16))] text-[#FFFFFFCC] flex items-center gap-1.5">
        <span>{t('chart.period.title')}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <img src="/images/icons/info.svg" alt="info" className="h-4 w-4 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs text-[#FFFFFFB2]">{t('filter.timeframeDescription')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex bg-[#ECECED0A] rounded-sm p-0.5">
        {timeframes.map((period) => (
          <button
            key={period}
            className={clsx(
              'flex-1 px-2.5 py-[4px] min-w-[33px] text-[11px] cursor-pointer transition duration-500',
              selectedPeriod === period
                ? 'rounded-[3px] bg-[#6A2AE0] text-white'
                : 'text-[#FFFFFFB2]',
            )}
            onClick={() => onChange(period)}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  )
}
