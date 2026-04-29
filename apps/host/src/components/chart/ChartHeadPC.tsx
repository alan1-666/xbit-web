import { KlineStickerUserType } from '@/@generated/gql/graphql-meme2'
import ButtonKlineStyle from '@/components/chart/ButtonKlineStylePC'
import ButtonPeriod from '@/components/chart/ButtonPeriodPC'
import { IntervalItem } from '@/datafeeds/index'
import { usePageType } from '@/hooks/usePageType'
import { cn } from '@/lib/utils.ts'
import { chartActions } from '@/redux/modules/chart.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { OHLCType } from '@/types/chart'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import HorizontalScrollWrapper, { ScrollStatus } from '../common/HorizontalScrollWrapper'
import MarkersPopover from './MarkersPopover'

interface showValueOption {
  label: string
  value: string
}

export const USER_TYPE_OPTIONS = [
  { value: KlineStickerUserType.User, label: 'You' },
  { value: KlineStickerUserType.Bot, label: 'Bot' },
  { value: KlineStickerUserType.Dev, label: 'Dev' },
  { value: KlineStickerUserType.Fresh, label: 'Fresh' },
  { value: KlineStickerUserType.Insider, label: 'Insider' },
  { value: KlineStickerUserType.Kol, label: 'KOL' },
  { value: KlineStickerUserType.Renames, label: 'Renames' },
  { value: KlineStickerUserType.Smart, label: 'Smart' },
  { value: KlineStickerUserType.Sniper, label: 'Sniper' },
  { value: KlineStickerUserType.Top10, label: 'Top10' },
  { value: KlineStickerUserType.Tracking, label: 'Tracking' },
  { value: KlineStickerUserType.Whale, label: 'Whale' },
]
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
  showPeriodList: IntervalItem[]
  onPeriodChange?: (value: string) => any
  onShowPeriodListChange: (value: IntervalItem[]) => any
  setTypeOHLC?: Dispatch<SetStateAction<OHLCType>>
  onChartTypeChange?: (value: number) => any
  onIndictorClick?: () => any
  onSettingClick?: () => any
  onClickFullScreen?: () => any
  onClickSnapshot?: () => any
  selectedUserTypes?: Set<KlineStickerUserType | 'all'>
  onToggleUserType?: (userType: KlineStickerUserType | 'all') => any
}
const ChartHeadPC = ({
  showPeriodList,
  onPeriodChange,
  onShowPeriodListChange,
  setTypeOHLC,
  onChartTypeChange,
  onIndictorClick,
  onSettingClick,
  onClickFullScreen,
  onClickSnapshot,
  selectedUserTypes,
  onToggleUserType,
}: ChartHeadProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const pageType = usePageType()
  const chartState = useAppSelector((state) => state.chart[pageType])
  const { period, chartType, ohlcType } = chartState

  const [menuScrollStatus, setMenuScrollStatus] = useState<ScrollStatus>({
    canScrollLeft: false,
    canScrollRight: false,
    isOverflowing: false,
  })

  const handlePeriodChange = (tab: string) => {
    dispatch(chartActions.updatePeriodWithType({ type: pageType, period: tab }))
    if (onPeriodChange) {
      onPeriodChange(tab)
    }
  }

  const handleChartTypeChange = (tab: number) => {
    dispatch(chartActions.updateChartTypeWithType({ type: pageType, chartType: tab }))
    if (onChartTypeChange) {
      onChartTypeChange(tab)
    }
  }

  const handlePeriodListChange = (value: IntervalItem[]) => {
    onShowPeriodListChange(value)
  }

  const handleShowChangeChange = (value: string) => {
    const ohlcValue = value as 'price' | 'marketCap'
    dispatch(chartActions.updateOHLCTypeWithType({ type: pageType, ohlcType: ohlcValue }))
    if (setTypeOHLC) {
      setTypeOHLC(ohlcValue)
    }
  }
  const handleScrollStatusChange = useCallback((status: ScrollStatus) => {
    setMenuScrollStatus(status)
  }, [])

  const listIconKlineComponent = () => {
    return (
      <div className={`flex items-center gap-2 flex-shrink-0 ${!menuScrollStatus?.isOverflowing && 'ml-auto'}`}>
        {onToggleUserType && selectedUserTypes && (
          <MarkersPopover selectedUserTypes={selectedUserTypes} onToggleUserType={onToggleUserType} />
        )}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger type="button" onClick={onIndictorClick}>
              <button
                type="button"
                className="size-[16px] cursor-pointer transition-transform duration-200 hover:scale-[1.1] flex items-center justify-center"
              >
                <img className="size-[16px]" src="/images/chart/chart-indicator.svg" alt="icon chart indicatior" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px] bg-[#191919]">
              <p className="text-[12px] tracking-wide">Indicators</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger type="button" onClick={onSettingClick}>
              <button
                type="button"
                className="size-[16px] cursor-pointer transition-transform duration-200 hover:scale-[1.1] flex items-center justify-center"
              >
                <img className="size-[16px]" src="/images/chart/chart-setting.svg" alt="icon chart setting" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px] bg-[#191919]">
              <p className="text-[12px] tracking-wide">Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger type="button" onClick={onClickFullScreen}>
              <button
                type="button"
                className="size-[16px] cursor-pointer transition-transform duration-200 hover:scale-[1.1] flex items-center justify-center"
              >
                <img className="size-[16px] " src="/images/chart/full-screen.svg" alt="icon full screen" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px] bg-[#191919]">
              <p className="text-[12px] tracking-wide">Fullscreen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger type="button" onClick={onClickSnapshot}>
              <button
                type="button"
                className="size-[18px] cursor-pointer transition-transform duration-200 hover:scale-[1.1] flex items-center justify-center"
              >
                <img className="size-[18px]" src="/images/chart/snap-shot.svg" alt="icon snap shot" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px] bg-[#191919]">
              <p className="text-[12px] tracking-wide">Snapshot</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="relative z-10 flex items-center justify-between px-4 py-2 gap-2">
      <HorizontalScrollWrapper
        containerProps="gap-2 flex-grow overflow-x-auto scrollbar-hide"
        buttonHeight="34px"
        onScrollStatusChange={handleScrollStatusChange}
      >
        <ButtonPeriod
          currentPeriodList={showPeriodList}
          handlePeriodListChange={handlePeriodListChange}
          activePeriod={period}
          handlePeriodChange={handlePeriodChange}
        />
        <ButtonKlineStyle currentChartType={chartType} handleChartTypeChange={handleChartTypeChange} />
        <div className="flex w-max items-center rounded-[4px] bg-[#ECECED0A] p-0.5">
          {showValueList.map((item) => (
            <div
              className={cn(
                'cursor-pointer rounded-[2px] px-3 py-1.5 text-[12px] font-[380] whitespace-nowrap',
                ohlcType === item.value ? 'bg-[#ECECED14] text-white' : 'text-white/50',
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
        {menuScrollStatus?.isOverflowing && listIconKlineComponent()}
      </HorizontalScrollWrapper>
      {!menuScrollStatus?.isOverflowing && listIconKlineComponent()}
    </div>
  )
}

export default ChartHeadPC
