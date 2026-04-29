import { useEffect, useMemo, useState,useRef } from 'react'
import NavigationHeader from '@/components/nodeAgent/NavigationHeader'
import './style.css'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import TimeRangeSelect from '@/components/nodeAgent/TimeRangeSelect'
import Chart from './components/chart'
import { useNodeAgentData, useDateRange } from './hooks/useNodeAgent'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

interface DataOverviewSummary {
  all: number
  contract: number
  meme: number
}

const initialSummary: DataOverviewSummary = {
  all: 0,
  contract: 0,
  meme: 0,
}

const DataOverview = ({  }: { }) => {
  const { t } = useTranslation()
  const {isDesktop} = useResponsive()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('TODAY')
  const {  fetchDataOverView,invitationChartData,transactionChartData,rebateChartData} = useNodeAgentData({
    autoFetchDataOverView: {
      timeRange:timeRange,
    }, 
  })
  const dataRange = useDateRange(timeRange as any)

  useEffect(() => {
    fetchDataOverView( timeRange)
  }, [ timeRange])

  return (
    <div className={cn("@container relative mx-auto px-3 min-h-[100vh] bg-[#121212] flex flex-col pb-[12px]", 
      isDesktop && 'w-full min-h-fit'
    )}>
     {!isDesktop && <div className="sticky top-0 z-10">
        <NavigationHeader 
          title={''}
          onBack={() => {
            navigate(-1)
          }}
          showBack={true}
          showClose={true}
        />
      </div>}
      <div className="mt-[12px]">
        <div className="flex justify-between  mb-[12px]">
          <div className={cn(isDesktop ? 'flex items-center' : 'flex flex-col')}>
            {!isDesktop && <div className="text-[18px] font-medium">{t('nodeAgent.dataOverview')}</div>}
            {timeRange != 'ALL_TIME' && (
              <div className="text-[12px] text-[#FFFFFF80] mt-[8px] mb-[12px]"> 
                {timeRange === 'TODAY' ? (
                  <span>{dataRange?.startDate} (UTC+8) </span>
                ) : (
                  <>
                    <span>{dataRange?.startDate}</span>
                    <span className="text-[#FFFFFF50] mx-[6px]">{t('nodeAgent.to')}</span>
                    <span>{dataRange?.endDate}</span>
                    <span className="text-[#FFFFFF50] ml-[6px]"> (UTC+8) </span>
                  </>
                )}
            </div>
            )}
          </div>
          <div className="max-w-[200px]">
            <TimeRangeSelect
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>
        </div>
      
      </div>
      {/* 图表 */}
      <Chart  type='threeline' title={t('nodeAgent.tradingOverview.rebateAmount')} dataSummary={rebateChartData?.currentValues}  chartData={rebateChartData?.data} />
      <div className="mt-[12px]">
        <Chart type='threeline' title={t('nodeAgent.tradingOverview.transactionVolume')} dataSummary={transactionChartData?.currentValues} chartData={transactionChartData?.data} />
      </div>
      <div className="mt-[12px]">
        <Chart  type='aline' title={t('nodeAgent.tradingOverview.invitedCount')} dataSummary={invitationChartData?.currentValues} chartData={invitationChartData?.data} />
      </div>
    </div >
  )
}

export default DataOverview
