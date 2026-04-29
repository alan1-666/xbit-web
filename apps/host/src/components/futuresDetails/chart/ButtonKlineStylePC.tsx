import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { TradingViewChartTypeItem } from '@/datafeeds/resolution-map'
import { cn } from '@/lib/utils'
import { ArrowDownIcon1} from '@/components/icon/ArrowDownIcon'

export type ButtonKlineStylePCProps = {
  currentChartType: number
  chartTypeList: TradingViewChartTypeItem[]
  handleChartTypeChange: (value: number) => any
}

const ButtonKlineStylePC = ({ currentChartType, chartTypeList, handleChartTypeChange }: ButtonKlineStylePCProps) => {
  const { t } = useTranslation()

  const currentItem = useMemo(() => {
    return (
      chartTypeList?.find((i) => i.value === currentChartType) ||
      chartTypeList?.find((i) => i.value === 1) // 默认蜡烛图
    ) as TradingViewChartTypeItem | undefined
  }, [chartTypeList, currentChartType])

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent={true}>
        <SimpleTooltip content={currentItem?.label ? t(currentItem.label) : ''} side="bottom" align="center">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-1.5 px-2 h-8 rounded-[8px] border-none', 
              )}
            >
              {currentItem?.selectedIcon ? (
                <img className="size-4" src={currentItem.selectedIcon} alt="selected-icon" />
              ) : (
                <img className="size-4" src={currentItem?.icon} alt="icon" />
              )}
              <ArrowDownIcon1 fill="#6C6A74" size={16} />
            </button>
          </DropdownMenuTrigger>
        </SimpleTooltip>
      </TooltipProvider>
      <DropdownMenuContent
        align="start"
        className={cn(
          'min-w-[160px] bg-[#232329] border-[#ECECED0A] text-(--text-primary) z-[10000]'
        )}
      >
        {chartTypeList?.map((item) => {
          const active = item.value === (currentItem?.value ?? 1)
          return (
            <DropdownMenuItem
              key={item.value}
              className={cn(
                'flex items-center gap-2 py-2 text-[13px] leading-[13px] cursor-pointer',
                active && 'text-(--text-primary) bg-[#ECECED1A]'
              )}
              onClick={() => handleChartTypeChange(item.value)}
            >
              <img className="size-4" src={active ? item.selectedIcon || item.icon : item.icon} alt="icon" />
              <span>{t(item.label)}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ButtonKlineStylePC
