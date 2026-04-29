import { LiquidityChartDto } from '@/@generated/gql/graphql-core.ts'
import { formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { mapLiquidityChartDataToChartItem } from '@/utils/mappingType.ts'
import { useResponsive } from '@hooks/useResponsive.ts'
import dayjs from 'dayjs'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface LiquidityChartProps {
  className?: string
  data: LiquidityChartDto[]
}

type CustomCursorProps = {
  x?: number
  y?: number
  height?: number
  width?: number
}

const CustomCursor = (props: CustomCursorProps) => {
  const { x, y, height, width } = props
  if (x === undefined || y === undefined || height === undefined || width === undefined) {
    return null
  }
  return (
    <line
      x1={x + width / 2}
      x2={x + width / 2}
      y1={y}
      y2={y + height}
      stroke="#FFFFFF"
      strokeWidth={1}
      strokeDasharray="5 5"
    />
  )
}

type CustomTooltipProps = {
  active?: boolean
  payload?: {
    value: number
    payload: { rawDate: string }
  }[]
  label?: string
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    const date = payload[0].payload.rawDate
    return (
      <div className="bg-[#232329] rounded-[8px] p-2.5 text-[#FFFFFFB2] ">
        <p className="text-[calc(11rem/16)] mb-1">{dayjs(date).format('YYYY/MM/DD HH:mm')}</p>
        <p className="text-[calc(11rem/16)]">
          {t('liquidityChart.liquidity')}: {formatVolume(payload[0]?.value ?? 0, { showCurrency: true })}
        </p>
      </div>
    )
  }
  return null
}

const LiquidityChart: React.FC<LiquidityChartProps> = ({ className = '', data }) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const liquidityData = mapLiquidityChartDataToChartItem(data)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollLeft = el.scrollWidth // scroll to end
    }
  }, [])

  return (
    <div className={cn('w-full rounded-[8px] h-auto p-2.5 bg-[#19191E]', className)}>
      <div className={cn('mb-4', isDesktop ? 'hidden' : '')}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-[linear-gradient(47.78deg,_#9C2CFF_2.71%,_#FF5EFF_93.06%)] rounded-tr-full rounded-br-full "></div>
          <h3 className="text-white text-lg font-medium">{t('liquidityChart.totalLiquidity')}</h3>
        </div>
      </div>
      <div className="relative flex items-center justify-start w-full overflow-x-auto no-scrollbar" ref={scrollRef}>
        {/*sticky YAxis*/}
        <div
          className={cn(
            'sticky top-0 left-0 z-[5] min-w-[36px] h-[271px]',
            isDesktop ? 'bg-background' : 'bg-[#19191E]',
          )}
        >
          <ResponsiveContainer height={271} width="100%" className={'relative'}>
            <BarChart
              data={liquidityData}
              margin={{
                top: 24,
                bottom: 10,
                left: -24,
              }}
              barCategoryGap="10%"
            >
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#FFFFFF70',
                  fontSize: 9,
                }}
                interval={2}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#FFFFFF80',
                  fontSize: 10,
                  fontWeight: 400,
                  fontFamily: 'inherit',
                }}
                tickFormatter={(value: number) =>
                  formatVolume(value, {
                    showCurrency: true,
                  })
                }
                label={{
                  value: '$',
                  position: 'insideTopLeft',
                  angle: 0,
                  textAnchor: 'start',
                  offset: 10,
                  style: { fill: '#FFFFFF80', fontSize: '12px' },
                }}
              />
              <Bar dataKey="value" maxBarSize={10}></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/*Chart*/}
        <div style={{ minWidth: `${data.length * 20}px`, height: '271px' }}>
          <ResponsiveContainer height={271} width="100%" className={'relative'}>
            <BarChart
              data={liquidityData}
              margin={{
                top: 24,
                bottom: 10,
                left: -24,
              }}
              barCategoryGap="10%"
            >
              <CartesianGrid stroke="#2A2D33" strokeWidth={1} horizontal={true} vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#FFFFFF70',
                  fontSize: 9,
                }}
                interval={2}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(47.78)">
                  <stop offset="2.71%" stopColor="#843BEA" />
                  <stop offset="93.06%" stopColor="#843BEA" />
                </linearGradient>
              </defs>
              {/* Main Bar with hover tracking */}
              <Bar dataKey="value" maxBarSize={10}>
                {liquidityData.map((_, index) => (
                  <Cell key={`bar-${index}`} fill="url(#barGradient)" className={'bg-transparent cursor-pointer'} />
                ))}
              </Bar>
              <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default LiquidityChart
