import ButtonKlineStyle from '@/components/chart/ButtonKlineStyle';
import { TradingViewChartTypeItem } from '@/datafeeds/resolution-map';
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react';
import ButtonPeriod from './ButtonPeriod';
import { intervalMap } from '../datafeeds/resolution-map';
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { selectFuturesTradePreferences, futuresTradePreferencesActions } from '@/redux/modules/futuresTradePreferences.slice'

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
  isTrendPage: boolean
  showPeriodList: Interval[],
  onShowPeriodListChange: (value: Interval[]) => any
}


const ChartHead = ({ onChartTypeChange, chartTypeList,defaultChartType, onSettingClick, isTrendPage, showPeriodList, 
  onShowPeriodListChange }: ChartHeadProps) => {
  const [activeChartType, setActiveChartType] = useState<number>(defaultChartType)
  const periodContainerRef = useRef<HTMLDivElement | null>(null)

  const dispatch = useAppDispatch()
  const { klinePeriod: activePeriod } = useAppSelector(selectFuturesTradePreferences)
  

  const handlePeriodChange = (item: Interval) => {
    let chartType: number = 1

    if(item.value === '1' && item.label !== '1m') {
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

    let showList = value.filter((item) => item.show)
    if (!showList.find((item) => item.label === activePeriod)) {
      handlePeriodChange(showList[0])
    }
  }

  const scrollToPeriod = (periodLabel: string) => {
    const container = periodContainerRef.current
    if (!container) {
      return
    }

    const target = container.querySelector<HTMLDivElement>(`[data-period-label="${periodLabel}"]`)
    if (!target) {
      return
    }

    const containerWidth = container.clientWidth
    const containerScrollWidth = container.scrollWidth
    const maxScrollLeft = containerScrollWidth - containerWidth

    if (maxScrollLeft <= 0) {
      return
    }

    const targetLeft = target.offsetLeft
    const targetRight = targetLeft + target.offsetWidth
    const currentScrollLeft = container.scrollLeft
    const currentScrollRight = currentScrollLeft + containerWidth

    let desiredScrollLeft = targetLeft + target.offsetWidth / 2 - containerWidth / 2

    if (desiredScrollLeft < 0) {
      desiredScrollLeft = 0
    }

    if (desiredScrollLeft > maxScrollLeft) {
      desiredScrollLeft = maxScrollLeft
    }

    if (targetRight <= currentScrollLeft || targetLeft >= currentScrollRight) {
      container.scrollTo({
        left: desiredScrollLeft,
        behavior: 'smooth',
      })

      return
    }

    container.scrollTo({
      left: desiredScrollLeft,
      behavior: 'smooth',
    })
  }

  const onClickPeriod = (item: Interval) => {
    handlePeriodChange(item)
    scrollToPeriod(item.label)
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

  useEffect(() => {
    if (!activePeriod) {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToPeriod(activePeriod)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [activePeriod, showPeriodList])

  return (
    <div className="py-2 px-[10px] bg-[#ECECED0A] flex items-center gap-2
    text-[#FFFFFF80] text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
      <div
        className="flex-1 flex items-center gap-4.5 overflow-x-auto _hidescrollbar"
        ref={periodContainerRef}
      >
        {
          intervalMap.map((item, index) =>  (
            <div 
              key={index} 
              data-period-label={item.label}
              className={cn(
                'cursor-pointer hover:text-white',
                activePeriod === item.label ? 'text-white font-bold' : '',
                index === 0 && 'min-w-[26px]'
              )}
              onClick={() => {
                onClickPeriod(item)
              }}
            >
              {item.label}
            </div>
          ))
        }
      </div>
      {/* Chart type selection */}
      {isTrendPage && (
        <>
          <div className="flex items-center gap-2">
            {
              chartTypeList.map((item) => (
                <div
                  className="cursor-pointer"
                  key={item.value}
                  onClick={() => {
                    handleChartTypeChange(item.value)
                  }}
                >
                  {/* <img className="size-[16px]" src={activeChartType === item.value ? item.selectedIcon : item.icon} alt="icon" /> */}
                </div>
              ))
            }
            <ButtonKlineStyle currentChartType={activeChartType} handleChartTypeChange={handleChartTypeChange} />
          </div>
          {/* <div className="flex items-center gap-2 mr-[3px] pl-[6px] border-l-[1px] border-[#ECECED1F]">
            <img className="cursor-pointer size-[16px]" onClick={onSettingClick} src="/images/futuresDetail/chart-settings.svg" />
          </div> */}
        </>
      )}
    </div>
  )
}
export default ChartHead