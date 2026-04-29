"use client"

import * as React from "react"
import { ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Line, Tooltip } from "recharts"
import { ReferenceLine } from "recharts"
import { cn } from "@/lib/utils"

interface ChartData {
  name: string
  value: number
}

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

interface PnLAreaChartProps {
  data: ChartData[]
  className?: string
  height?: number
  yTickFormatter?: (value: number) => string
  xAllowDuplicatedCategory?: boolean
  xInterval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd'
  xTickFormatter?: (value: string, index: number) => string
  chartType?: 'asset' | 'pnl' // 'asset' 使用紫色系，'pnl' 使用红绿色系
}

// 自定义 Tooltip 组件
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: ChartData
  }>
  chartType: 'asset' | 'pnl'
  valueFormatter?: (value: number) => string
}

// 将传入的时间/标签格式化为 MM-DD
const formatDateToMMDD = (label: string): string => {
  if (!label) return ''
  const [datePart] = label.split(' ')
  const parts = datePart.split('-')
  if (parts.length >= 3) {
    // 形如 YYYY-MM-DD
    const month = parts[1]?.padStart(2, '0')
    const day = parts[2]?.padStart(2, '0')
    return `${month}-${day}`
  }
  if (parts.length === 2) {
    // 形如 MM-DD
    const month = parts[0]?.padStart(2, '0')
    const day = parts[1]?.padStart(2, '0')
    return `${month}-${day}`
  }
  const d = new Date(label)
  if (!Number.isNaN(d.getTime())) {
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${mm}-${dd}`
  }
  return label
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  chartType,
  valueFormatter 
}) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0]
  const value = data.value
  
  // 确定颜色和前缀
  let indicatorColor = '#C8A7FD' // 默认紫色（资产）
  let textColor = '#C8A7FD'
  let prefix = ''
  
  if (chartType === 'pnl') {
    if (value > 0) {
      indicatorColor = '#00E890'
      textColor = '#00E890'
      prefix = '+'
    } else if (value < 0) {
      indicatorColor = '#FF7479'
      textColor = '#FF7479'
      prefix = '-'
    } else {
      indicatorColor = 'rgba(255,255,255,0.5)'
      textColor = 'rgba(255,255,255,0.5)'
    }
  }

  const formattedValue = valueFormatter 
    ? valueFormatter(Math.abs(value)) 
    : `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div 
      className="rounded-lg px-3 py-2 shadow-lg"
      style={{ 
        backgroundColor: 'rgba(36, 38, 43, 0.95)',
        border: 'none',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="flex items-center gap-2">
        {/* 左侧彩色指示器 */}
        <div 
          className="w-1 h-12 rounded-full"
          style={{ backgroundColor: indicatorColor }}
        />
        <div className="flex flex-col gap-1">
          {/* 时间 */}
          <div 
            className="text-sm whitespace-nowrap"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            {formatDateToMMDD(data.payload.name)}
          </div>
          {/* 金额 */}
          <div 
            className="text-base font-medium whitespace-nowrap"
            style={{ color: textColor }}
          >
            {prefix}{formattedValue}
          </div>
        </div>
      </div>
    </div>
  )
}

const PnLAreaChart = React.forwardRef<HTMLDivElement, PnLAreaChartProps>(
  ({ data, className, height = 300, yTickFormatter, xAllowDuplicatedCategory = true, xInterval, xTickFormatter, chartType = 'pnl' }, ref) => {
    // 计算按 y=0 分割的填充 offset
    const getFillOffset = (arr: { value: number }[]) => {
      const values = arr.map((d) => d.value)
      const dataMax = Math.max(...values)
      const dataMin = Math.min(...values)
      if (dataMax <= 0) return 0
      if (dataMin >= 0) return 1
      return dataMax / (dataMax - dataMin)
    }

    const offset = getFillOffset(data)

    // 在相邻点发生正负切换时，插入 y=0 的“过渡点”，用于保证主曲线在 0 轴处连贯
    const processedData = React.useMemo(() => {
      if (!Array.isArray(data) || data.length === 0) return [] as ChartData[]
      const result: ChartData[] = []
      for (let i = 0; i < data.length; i++) {
        const current = data[i]
        if (i > 0) {
          const prev = data[i - 1]
          const prevSign = Math.sign(prev.value)
          const currSign = Math.sign(current.value)
          if (prevSign !== 0 && currSign !== 0 && prevSign !== currSign) {
            // 插入 0 轴过渡点；名称允许重复，X 轴已开启 allowDuplicatedCategory
            result.push({ name: `${prev.name}-0`, value: 0 })
          }
        }
        result.push(current)
      }
      return result
    }, [data])

    // 根据图表类型决定渲染逻辑
    if (chartType === 'asset') {
      // 资产数据：使用紫色系，不需要正负值区分
      return (
        <div ref={ref} className={cn("w-full", className)} style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >

              <CartesianGrid
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                allowDuplicatedCategory={xAllowDuplicatedCategory}
                interval={xInterval as any}
                tickFormatter={xTickFormatter as any}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                tickFormatter={yTickFormatter}
              />

              <Tooltip
                content={<CustomTooltip chartType="asset" valueFormatter={yTickFormatter} />}
                cursor={{ stroke: 'rgba(200, 167, 253, 0.3)', strokeWidth: 1 }}
                isAnimationActive={false}
              />

              {/* 填充区域 */}
              <Area
                type="linear"
                dataKey="value"
                stroke="none"
                fill="#C8A7FD"
                fillOpacity={0.2}
                connectNulls={false}
                isAnimationActive={false}
              />

              {/* 主曲线 */}
              <Line
                type="linear"
                dataKey="value"
                stroke="#C8A7FD"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )
    }

    // PnL 数据：使用红绿色系，区分正负值
    return (
      <div ref={ref} className={cn("w-full", className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset={offset} stopColor="#00E890" stopOpacity={0.2} />
                <stop offset={offset} stopColor="#FF7479" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              allowDuplicatedCategory={xAllowDuplicatedCategory}
              interval={xInterval as any}
              tickFormatter={xTickFormatter as any}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
              tickFormatter={yTickFormatter}
            />

            <Tooltip
              content={<CustomTooltip chartType="pnl" valueFormatter={yTickFormatter} />}
              cursor={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
              isAnimationActive={false}
            />

            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

            {/* 基础填充：按 y=0 分割填充，上绿下红（不描边） */}
            <Area
              type="linear"
              dataKey="value"
              stroke="none"
              fill="url(#valueFill)"
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* 主曲线（仅线段）：y < 0 显示红色 */}
            <Line
              type="linear"
              dataKey={(d: ChartData) => (d.value <= 0 ? d.value : null)}
              stroke="#FF7479"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 主曲线（仅线段）：y >= 0 显示绿色 */}
            <Line
              type="linear"
              dataKey={(d: ChartData) => (d.value >= 0 ? d.value : null)}
              stroke="#00E890"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }
)
PnLAreaChart.displayName = "PnLAreaChart"

export { ChartContainer, PnLAreaChart }
export type { ChartConfig, ChartData }
