import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useHistoricalFundingRatePaginationData } from '../../hook/useFundingRateData'
import { FundingRateInterval } from '@/@generated/gql/graphql-dexHyperTrader'
import { format } from 'date-fns'
import { LoadingTable } from '@/components/common/LoadingTable'
import { useTranslation } from 'react-i18next'
import { roundUp } from '@/lib/number'

const HistoricalChart = ({
  symbol,
  refreshTick,
  onRefetchDone,
}: {
  symbol: string
  refreshTick: number
  onRefetchDone: () => void
}) => {
  const [selectedTab, setSelectedTab] = useState('14')
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [hoverValue, setHoverValue] = useState<string | null>(null)

  const { data, isLoading, refetch } = useHistoricalFundingRatePaginationData({
    input: {
      pagination: {
        page: 1,
        limit: +selectedTab,
      },
      symbol: symbol,
      interval: FundingRateInterval.Interval_1D,
    },
  })
  const dataList = data?.data || []

  useEffect(() => {
    if (refreshTick > 0) {
      refetch().finally(() => onRefetchDone())
    }
  }, [refreshTick])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      if (minutes === 0) {
        if ([1, 21, 41].includes(seconds)) {
          refetch()
        }
      } else if (minutes === 1) {
        if (seconds === 1) {
          refetch()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [refetch])

  const chartData = useMemo(() => {
    if (!dataList || dataList.length === 0) return []

    return [...dataList].reverse().map((item) => ({
      ...item,
      rateNum: parseFloat(item.fundingRate) || 0,
      displayTime: format(item.fundingTime, 'MM-dd'),
      fullTime: format(item.fundingTime, 'MM-dd HH:mm'),
    }))
  }, [dataList])

  const TABS = [
    {
      key: '7d',
      value: '7',
      label: '7D',
    },
    {
      key: '14d',
      value: '14',
      label: '14D',
    },
  ]

  const { off, offSecond, strokeColor, fillColor } = useMemo(() => {
    const rates = chartData.map((i) => i.rateNum)
    const dataMax = Math.max(...rates)
    const dataMin = Math.min(...rates)

    if (dataMin >= 0) {
      return {
        off: 0,
        offSecond: 1,
        strokeColor: '#35cb94',
        fillColor: '#162521',
      }
    }

    if (dataMax <= 0) {
      return {
        off: 0,
        offSecond: 1,
        strokeColor: '#df394c',
        fillColor: '#291d1f',
      }
    }

    const offset = dataMax / (dataMax - dataMin)
    return {
      off: offset,
      offSecond: offset,
      strokeColor: 'url(#splitStroke)',
      fillColor: 'url(#solidFill)',
    }
  }, [chartData])

  const chartHeight = isDesktop ? 400 : 300

  const handleMouseMove = (state: any) => {
    if (state && state.activePayload) {
      const value = state.activePayload[0].payload.rateNum
      setHoverValue((value * 100).toFixed(4))
    }
  }

  const handleMouseLeave = () => {
    setHoverValue(null)
  }

  const displayValue = useMemo(() => {
    if (hoverValue !== null) return hoverValue
    if (dataList?.length > 0) {
      return (dataList[0]?.fundingRate * 100).toFixed(4)
    }
    return '0.0000'
  }, [hoverValue, dataList])

  return (
    <div
      className={cn(
        'w-full bg-[#121214] p-2 overflow-hidden border border-[#79778C29] rounded-xl',
        !isDesktop && 'w-auto mx-4 pb-0',
      )}
    >
      {isLoading ? (
        <div className="flex items-center justify-center" style={{ height: chartHeight + 57 }}>
          <LoadingTable />
        </div>
      ) : (
        <>
          <div className={cn('flex items-center justify-between px-3 py-3', !isDesktop && 'px-0 pt-0.5 pb-5')}>
            <p>
              {t('fundingRate.title.header')}:{' '}
              {/* {dataList?.length > 0 ? (dataList?.[dataList.length - 1]?.fundingRate * 100).toFixed(4) : 0}% */}
              <span>{displayValue}%</span>
            </p>
            <div className="flex items-center border-[0.5px] border-[#2A2839] rounded-[6px] p-1">
              {TABS.map((tab) => (
                <div
                  key={tab.key}
                  className={cn(
                    'px-3 py-1.25 rounded-[4px] transition-all duration-200 text-[#A9A9B3] hover:text-white cursor-pointer',
                    {
                      'bg-[#2A2839] text-white': selectedTab === tab.value,
                    },
                  )}
                  onClick={() => setSelectedTab(tab.value)}
                >
                  <p className="text-[14px] font-medium leading-none">{tab.label}</p>
                </div>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="solidFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#162521" stopOpacity={1} />
                  <stop offset={offSecond} stopColor="#291d1f" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#35cb94" stopOpacity={1} />
                  <stop offset={offSecond} stopColor="#df394c" stopOpacity={1} />
                </linearGradient>
              </defs>

              <XAxis dataKey="displayTime" axisLine={false} tickLine={false} tick={{ fill: '#605E68', fontSize: 11 }} minTickGap={50} />

              <YAxis
                dataKey="rateNum"
                axisLine={false}
                tickLine={false}
                // width={75}
                domain={['auto', 'auto']}
                tick={(props) => (
                  <text x={props.x} y={props.y} className="fill-[#605E68] text-[11px]" textAnchor="end">
                    {(props.payload.value * 100).toFixed(4)}%
                  </text>
                )}
              />

              <Tooltip
                cursor={{ stroke: '#27272a', strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: '#212127',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  lineHeight: 1,
                }}
                labelFormatter={(_, payload) => (
                  <span className="text-[11px] text-[#908e98] leading-none">{payload[0]?.payload?.fullTime}</span>
                )}
                formatter={(value: number) => [
                  <span key="rate" className="text-[12px] font-bold text-[#EAECEF] leading-none">
                    {roundUp(value * 100)}%
                  </span>,
                  // '',
                ]}
              />

              <ReferenceLine y={0} stroke="#27272a" strokeWidth={1} />

              <Area
                type="linear"
                dataKey="rateNum"
                stroke={strokeColor}
                strokeWidth={2}
                fill={fillColor}
                fillOpacity={1}
                isAnimationActive={false}
                activeDot={(props: any) => {
                  const { cx, cy, payload } = props
                  const isPositive = payload.rateNum >= 0
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#fff"
                      stroke={isPositive ? '#35cb94' : '#df394c'}
                      strokeWidth={2}
                    />
                  )
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}

export default HistoricalChart
