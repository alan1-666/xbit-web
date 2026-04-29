import { cn } from '@/lib/utils'
import eventBus from '@/lib/eventBus'
import { EVENT_OPEN_INDICATORS } from '@/components/futuresDetails/chart/indicatorEvents'
import { ArrowDownIcon1 } from '@/components/icon/ArrowDownIcon'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useTranslation } from 'react-i18next'

const ButtonIndicatorsPC = () => {
  const { t } = useTranslation()
  const onClick = () => {
    // 触发 TradingView 原生“指标”对话框
    eventBus.dispatch(EVENT_OPEN_INDICATORS)
  }

  return (
    <TooltipProvider disableHoverableContent={true}>
      <SimpleTooltip content={t('chart.indicator.tip')} side="bottom" align="center">
        <button
          type="button"
          onClick={onClick}
          className={cn('flex items-center no-wrap whitespace-nowrap gap-1.5 px-2 h-8 rounded-[8px] border-none text-xs leading-xs text-[#908E98]')}
        >
          {t('chart.toolbar.indicator')}
          <ArrowDownIcon1 fill="#6C6A74" size={16} />
        </button>
      </SimpleTooltip>
    </TooltipProvider>
  )
}

export default ButtonIndicatorsPC
