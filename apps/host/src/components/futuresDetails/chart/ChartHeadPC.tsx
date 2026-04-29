import ButtonKlineStylePC from './ButtonKlineStylePC';
import { TradingViewChartTypeItem } from '@/datafeeds/resolution-map';
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react';
import ButtonPeriod from './ButtonPeriodPC';
import ButtonIndicatorsPC from '@/components/chart/ButtonIndicatorsPC';
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { selectFuturesTradePreferences, futuresTradePreferencesActions } from '@/redux/modules/futuresTradePreferences.slice'
import { useTranslation } from 'react-i18next'
export interface Interval {
  label: string
  value: string
  show: boolean
}

interface ChartHeadProps {
  onChartTypeChange?: (type: number) => void;
  chartTypeList: TradingViewChartTypeItem[],
  defaultChartType: number,
  onSettingClick: () => any
  showPeriodList: Interval[],
  onShowPeriodListChange: (value: Interval[]) => any
  // 新增：页面内全屏控制
  isInternalFullscreen?: boolean
  onToggleInternalFullscreen?: () => void
}


const ChartHead = ({ onChartTypeChange, chartTypeList, defaultChartType, onSettingClick, showPeriodList,
  onShowPeriodListChange, isInternalFullscreen = false, onToggleInternalFullscreen }: ChartHeadProps) => {
  const [activeChartType, setActiveChartType] = useState<number>(defaultChartType)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { klinePeriod: activePeriod } = useAppSelector(selectFuturesTradePreferences)

  const handlePeriodChange = (item: Interval) => {
    let chartType: number = 1

    if (item.value === '1' && item.label !== '1m') {
      chartType = 2
    } else {
      chartType = 1
    }
    setActiveChartType(chartType)
    if (onChartTypeChange) {
      onChartTypeChange(chartType)
    }
    dispatch(futuresTradePreferencesActions.updateTradePreferences({
      klinePeriod: item.label
    }))

  };

  const handleActiveChartType = (tab: number) => {
    setActiveChartType(tab)
  }

  const handleChartTypeChange = (tab: number) => {
    handleActiveChartType(tab)
    if (onChartTypeChange) {
      onChartTypeChange(tab)
    }
  }

  const handlePeriodListChange = (value: Interval[]) => {
    onShowPeriodListChange(value)
  }

  // 确保 chartType 始终与当前周期同步
  useEffect(() => {
    const currentPeriod = showPeriodList.find((item) => item.label === activePeriod)
    if (currentPeriod) {
      let correctChartType: number = 1
      if (currentPeriod.value === '1' && currentPeriod.label !== '1m') {
        correctChartType = 2 // 分时用折线图
      } else {
        correctChartType = 1 // 其他用K线图
      }

      // 如果当前 chartType 不正确，则更新
      if (activeChartType !== correctChartType) {
        setActiveChartType(correctChartType)
        if (onChartTypeChange) {
          onChartTypeChange(correctChartType)
        }
      }
    }
  }, [activePeriod, showPeriodList])

  // 内部全屏不使用浏览器 Fullscreen API，直接透传回调
  const toggleFullscreen = () => {
    if (onToggleInternalFullscreen) {
      onToggleInternalFullscreen()
    }
  }


  return (
    <div className="relative z-10 py-2 px-[10px] flex items-center gap-2 text-[#645F7B] text-xs leading-xs">
      <div className="flex-1 flex items-center justify-between gap-4.5 overflow-x-auto _hidescrollbar">
        <div className="flex items-center">
          {/* 周期切换，下拉样式 */}
          <ButtonPeriod
            currentPeriodList={showPeriodList}
            handlePeriodListChange={handlePeriodListChange}
            activePeriod={activePeriod}
            onPeriodChange={handlePeriodChange}
            onResetPeriodList={onShowPeriodListChange}
          />

          {/* 图表类型切换 */}
          <div className="flex items-center gap-2 ml-2 h-8 pl-1 border-l border-[#26262C]">
            <ButtonKlineStylePC
              currentChartType={activeChartType}
              chartTypeList={chartTypeList}
              handleChartTypeChange={handleChartTypeChange}
            />
          </div>

          {/* 指标下拉 */}
          <div className="flex items-center gap-2 ml-2 h-8 pl-1 border-l border-[#26262C]">
            <ButtonIndicatorsPC />
          </div>
        </div>
        {/* 右侧功能按钮 */}
         {/* Fullscreen toggle */}
         <button
            type="button"
            onClick={toggleFullscreen}
            className={cn(
              'ml-2 px-2 py-1 rounded hover:text-white transition-colors',
              isInternalFullscreen ? 'text-(--text-primary)' : 'text-(--text-placeholder)'
            )}>
            <img src="/images/icons/full-screen.svg" alt="full-screen" />
          </button>
      </div>
    </div>
  )
}
export default ChartHead