import GaugeChart from '@components/detailInfo/contractMonitoring/GaugeChart.tsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowSize } from 'react-use'

const defaultChartWidth = 375
const chartWidthPercentage = 51.5

type ContractMonitoringChartProps = {
  isOpen?: boolean
  gaugeValue?: number
  riskText?: string
  contractInfo?: Array<{
    type: 'ok' | 'danger'
    title: string
    content: string
    icon?: string
  }>
  riskCounts?: {
    highRisk: number
    attention: number
    lowRisk: number
  }
  top10Percentage?: string | null
  sellTax: string
  buyTax: string
}

const ContractMonitoringChart = ({
  isOpen,
  gaugeValue = 65,
  riskText,
  contractInfo = [],
  riskCounts,
  top10Percentage,
  buyTax,
  sellTax,
}: ContractMonitoringChartProps) => {
  const { t } = useTranslation()
  const [chartWidth, setChartWidth] = useState<number>(defaultChartWidth)
  const [isChartReady, setIsChartReady] = useState<boolean>(false)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const { width } = useWindowSize()

  const handleResize = () => {
    if (!chartContainerRef.current) return

    const containerWidth = chartContainerRef.current.clientWidth
    if (containerWidth > 0) {
      const newChartWidth = (containerWidth / 100) * chartWidthPercentage
      setChartWidth(newChartWidth)
    }
  }

  useLayoutEffect(() => {
    let resizeObserver: ResizeObserver | null = null

    if (chartContainerRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(chartContainerRef.current)
    }

    setIsChartReady(true)
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (isOpen && chartContainerRef.current) {
      const timeoutId = setTimeout(() => {
        setIsChartReady(true)
        handleResize()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isOpen])

  return (
    <div className="bg-[#2b2b33] rounded-[6px] relative z-1 mt-2.5 p-4 pr-0" ref={chartContainerRef}>
      <div className="text-[16px] leading-[11px] font-[450]">
        {top10Percentage ? (
          <>
            TOP10: <span className="text-[25px] text-[#ff2651] leading-[11px] font-[450]">{`${top10Percentage}`}</span>
          </>
        ) : (
          t('contractMonitoring.top10')
        )}
      </div>
      <div className="flex">
        <div className="flex flex-col items-start pt-4.5 gap-2">
          {contractInfo.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center gap-[4px] leading-[1]">
              {item.icon && (
                <img src={`/images/tokenDetail/${item.icon}.svg`} className="sizez-[12px] min-w-[18px] pr-1" alt="" />
              )}
              <div className="text-[calc(1rem*(12/16))] text-white min-w-[110px]">{item.title}</div>
              <img
                src={`/images/tokenDetail/icon-${item.type === 'ok' ? 'check' : 'x'}-rounded.svg`}
                className="w-[12px] min-w-[12px]"
                alt=""
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center flex-1 relative -mt-[20px]">
          {isChartReady && (
            <GaugeChart
              key={`gauge-${chartWidth}-${isOpen}`}
              value={gaugeValue}
              subtitle={t('contractMonitoring.riskDetection')}
              title={riskText || t('contractMonitoring.mediumRisk')}
              size={width > 320 ? (width > 375 ? 180 : 150) : 130}
              // width={width > 320 ? 180 : 150}
              // height={width > 320 ? 180 : 150}
              className="pointer-events-none"
            ></GaugeChart>
          )}
          {/* <div className="text-center absolute top-[58%] left-[50%] -translate-x-1/2 ">
            <div className="text-[calc(1rem*(16/16))] leading-none font-[520] text-[#ff4166] text-center w-full">
              {riskText || t('contractMonitoring.mediumRisk')}
            </div>
            <div className="text-[calc(1rem*(10/16))] text-[#FFFFFFB2] mt-1">
              {t('contractMonitoring.riskDetection')}
            </div>
          </div> */}
        </div>
      </div>
      <div className="flex flex-col justify-between border-t-[0.5px] border-[#343339] pt-5 pr-4">
        <div className="flex gap-[12px] justify-between leading-[1] w-full">
          <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
            <div className="app-font-light text-[calc(1rem*(20/16))] text-[#FF353C]">{riskCounts?.highRisk || 0}</div>
            <div className="text-[calc(1rem*(11/16))] leading-[12px] text-center text-[#CCCADB]">
              {t('contractMonitoring.riskItems')}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
            <div className="app-font-light text-[calc(1rem*(20/16))] text-[#FF6E27]">{riskCounts?.attention || 0}</div>
            <div className="text-[calc(1rem*(12/16))]  text-center text-[#CCCADB]">
              {t('contractMonitoring.attentionItems')}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
            <div className="app-font-light text-[calc(1rem*(20/16))] text-[#00FFF6]">{riskCounts?.lowRisk || 0}</div>
            <div className="text-[calc(1rem*(11/16))] leading-[12px] text-center text-[#CCCADB]">
              {t('contractMonitoring.lowRiskItems')}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
            <div className="app-font-light text-[calc(1rem*(20/16))] text-[#2FFD95]">
              {buyTax}
              <span className="text-sm text-[#2FFD95]">%</span>
            </div>
            <div className="text-[calc(1rem*(11/16))] leading-[12px] text-center text-[#CCCADB]">
              {t('contractMonitoring.buyTax')}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-[10px]">
            <div className="app-font-light text-[calc(1rem*(20/16))] text-[#FF2651]">
              {sellTax}
              <span className="text-sm text-[#FF2651]">%</span>
            </div>
            <div className="text-[calc(1rem*(11/16))] leading-[12px] text-center text-[#CCCADB]">
              {t('contractMonitoring.sellTax')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractMonitoringChart
