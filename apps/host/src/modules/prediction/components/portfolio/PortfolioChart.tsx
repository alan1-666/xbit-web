import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis, XAxis } from 'recharts'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { formatBalance } from '@/lib/format'

interface ChartData {
  t: number
  p: number
}

interface PortfolioChartProps {
  data: ChartData[]
  onHover?: (data: { value: number; date: Date } | null) => void
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data: rawData, onHover }) => {
  const isBlank = !rawData || rawData.length <= 1

  const data = useMemo(() => {
    if (isBlank) {
      const now = Math.floor(Date.now() / 1000)
      const value = rawData?.length === 1 ? rawData[0].p : 0
      return [
        { t: now - 86400, p: value, date: new Date((now - 86400) * 1000), value },
        { t: now, p: value, date: new Date(now * 1000), value },
      ]
    }

    return rawData.map((item) => ({
      ...item,
      date: new Date(item.t * 1000),
      value: item.p,
    }))
  }, [rawData, isBlank])

  const { domain, baseValue } = useMemo(() => {
    if (isBlank) {
      const value = rawData?.length === 1 ? rawData[0].p : 0
      return {
        domain: [value - 1, value + 1],
        baseValue: value - 1,
      }
    }

    const values = data.map((d) => d.p)
    const min = Math.min(...values)
    const max = Math.max(...values)

    return {
      domain: [min, max],
      baseValue: min,
    }
  }, [data, isBlank, rawData])

  const lastValue = data.length > 0 ? data[data.length - 1].value : 0
  const isPositive = lastValue >= 0
  const chartColor = isPositive ? '#21e09d' : '#824de6'

  // Track hovered value to dynamically change chart color
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const activeColor = hoveredValue !== null ? (hoveredValue >= 0 ? '#21e09d' : '#824de6') : chartColor

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      const pointColor = payload[0].value >= 0 ? '#21e09d' : '#824de6'
      return (
        <div className="bg-[#212127] px-2 py-1 gap-2 rounded-[8px] flex items-center shadow-lg">
          <div className="w-1 rounded-full h-8" style={{ backgroundColor: pointColor }}></div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[#FBFBFB] text-[calc(14rem/16)] leading-[calc(19rem/16)] font-[330] whitespace-nowrap break-keep">
              {format(dataPoint.date, 'MMM d, h:mm a')}
            </div>
            <div className="text-[calc(14rem/16)] leading-[calc(19rem/16)] font-[380]" style={{ color: pointColor }}>
              {payload[0].value > 0 ? '+' : ''}
              {formatBalance(payload[0].value, { showCurrency: true })}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          onMouseMove={
            isBlank
              ? undefined
              : (e) => {
                  if (e.activePayload && e.activePayload[0]) {
                    const value = e.activePayload[0].value as number
                    setHoveredValue(value)
                    onHover?.({
                      value,
                      date: e.activePayload[0].payload.date as Date,
                    })
                  }
                }
          }
          onMouseLeave={
            isBlank
              ? undefined
              : () => {
                  setHoveredValue(null)
                  onHover?.(null)
                }
          }
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={activeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" hide type="number" domain={['dataMin', 'dataMax']} />
          <YAxis hide domain={domain} type="number" />
          {!isBlank && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: activeColor, strokeWidth: 1, strokeDasharray: '4 4' }}
              isAnimationActive={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="p"
            stroke={activeColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            baseValue={baseValue}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
