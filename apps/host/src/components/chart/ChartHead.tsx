import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import ButtonKlineStyle from '@/components/chart/ButtonKlineStyle'
import { useTranslation } from 'react-i18next'
import { IntervalItem, TradingViewChartTypeItem } from '@/datafeeds/index'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import BubbleMap from '../detailInfo/BubbleMap'
import { KlineStickerUserType } from '@/@generated/gql/graphql-meme2'
import MarkersPopover from './MarkersPopover'
interface showValueOption {
  label: string
  value: string
}

const showValueList: showValueOption[] = [
  {
    label: 'chart.toolbar.price',
    value: 'price',
  },
  {
    label: 'chart.toolbar.marketCap',
    value: 'marketCap',
  },
]
type ChartHeadProps = {
  defaultPeriod: string
  showPeriodList: IntervalItem[]
  onPeriodChange?: (value: string) => any
  onShowPeriodListChange: (value: IntervalItem[]) => any
  defaultChartType: number
  typeOHLC: 'price' | 'marketCap'
  setTypeOHLC: Dispatch<SetStateAction<'price' | 'marketCap'>>
  chartTypeList: TradingViewChartTypeItem[]
  onChartTypeChange?: (value: number) => any
  onIndictorClick?: () => any
  onSettingClick?: () => any
  // onClickFullScreen?: () => any
  // onClickSave?: () => any
  selectedUserTypes?: Set<KlineStickerUserType | 'all'>
  onToggleUserType?: (userType: KlineStickerUserType | 'all') => any
}

function ChartHead({
  showPeriodList,
  defaultPeriod,
  onPeriodChange,
  onShowPeriodListChange,
  chartTypeList,
  defaultChartType,
  typeOHLC,
  setTypeOHLC,
  onChartTypeChange,
  onIndictorClick,
  onSettingClick,
  // onClickFullScreen,
  // onClickSave,
  selectedUserTypes,
  onToggleUserType,
}: ChartHeadProps) {
  const { t } = useTranslation()
  const [activePeriod, setActivePeriod] = useState<string>(defaultPeriod)
  const [activeChartType, setActiveChartType] = useState<number>(defaultChartType)
  const [showValue, setShowValue] = useState<string>(typeOHLC)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleActivePeriod = (tab: string) => {
    setActivePeriod(tab)
  }

  const handlePeriodChange = (tab: string) => {
    handleActivePeriod(tab)
    if (onPeriodChange) {
      onPeriodChange(tab)
    }
  }

  const handleActiveChartType = (tab: number) => {
    setActiveChartType(tab)
  }

  const handleChartTypeChange = (tab: number) => {
    handleActiveChartType(tab)
    if (onChartTypeChange) {
      onChartTypeChange(tab)
    }
  }

  const handlePeriodListChange = (value: IntervalItem[]) => {
    onShowPeriodListChange(value)
  }

  const handleShowChangeChange = (value: string) => {
    setShowValue(value)
    setTypeOHLC(value as 'price' | 'marketCap')
  }

  useEffect(() => {
    const activeItem = itemRefs?.current?.[activePeriod]
    if (activeItem) {
      const scrollHandler = () => {
        activeItem.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
      const animationFrameId = requestAnimationFrame(scrollHandler)

      return () => {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [activePeriod, showPeriodList])

  return (
    <>
      <div className="bg-[#17171B] px-[10px] py-1 flex h-[30px] items-center whitespace-nowrap justify-between flex-nowrap">
        <div className="flex-1 flex items-center flex-nowrap gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center gap-[15px] mr-[6px]">
              {showPeriodList
                // .filter((item) => item.show)
                .map((item) => (
                  <div
                    className={cn(
                      'cursor-pointer text-[calc(1rem*(13/16))] hover:text-(--text-primary)',
                      activePeriod === item.value ? 'text-(--text-primary)' : 'text-(--text-placeholder)',
                    )}
                    ref={(el) => {
                      itemRefs.current[item.value] = el
                    }}
                    key={item.value}
                    onClick={() => {
                      handlePeriodChange(item.value)
                    }}
                  >
                    {item.label}
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="pl-1.5 flex items-center gap-2 flex-shrink-0 text-[calc(1rem*(10/16))]">
          <div className="flex items-center flex-shrink-0 mr-2">
            <div className="flex items-center gap-2 mr-[6px]">
              {chartTypeList.map((item) => (
                // <div
                //   className="cursor-pointer"
                //   key={item.value}
                //   onClick={() => {
                //     handleChartTypeChange(item.value)
                //   }}
                // >
                //   <img
                //     className="size-[16px]"
                //     src={activeChartType === item.value ? item.selectedIcon : item.icon}
                //     alt="icon"
                //   />
                // </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger type="button" onClick={() => handleChartTypeChange(item.value)}>
                      <img
                        className="size-[16px]"
                        src={activeChartType === item.value ? item.selectedIcon : item.icon}
                        alt="icon"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[360px] bg-[#191919]">
                      <p className="text-[12px] tracking-wide">{t(item.label)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <ButtonKlineStyle currentChartType={activeChartType} handleChartTypeChange={handleChartTypeChange} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 mr-2">
            {onToggleUserType && selectedUserTypes && (
              <MarkersPopover selectedUserTypes={selectedUserTypes} onToggleUserType={onToggleUserType} />
            )}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger>
                  <img
                    className="cursor-pointer size-[16px] hover:scale-[1.1] transition-transform duration-200"
                    src="/images/chart/chart-indicator.svg"
                    onClick={onIndictorClick}
                    alt="icon chart indicator"
                  />
                </TooltipTrigger>
                <TooltipContent className="max-w-[360px]">
                  <p className="text-xs leading-none">Indicators</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger>
                  <img
                    className="cursor-pointer size-[16px] hover:scale-[1.1] transition-transform duration-200"
                    onClick={onSettingClick}
                    src="/images/chart/chart-setting.svg"
                    alt="icon chart setting"
                  />
                </TooltipTrigger>
                <TooltipContent className="max-w-[360px]">
                  <p className="text-xs leading-none">Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <BubbleMap />
          {showValueList.map((item, index) => (
            <div
              className={cn(
                'cursor-pointer',
                showValue === item.value ? 'text-white' : 'text-[#908E98]',
                index === 0 ? 'border-r border-[#343339] pr-2' : '',
              )}
              key={item.value}
              onClick={() => {
                handleShowChangeChange(item.value)
              }}
            >
              {t(item.label)}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ChartHead
