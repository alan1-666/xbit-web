import React, { useMemo, useState } from 'react'
import { PieChart, Pie, Sector, Tooltip } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { useTranslation } from 'react-i18next'

export type LeverageBucketKey = '1-5X' | '5-10X' | '10-20X' | '20-50X' | '>50X'

export type LeverageBucketItem = {
  bucket: LeverageBucketKey
  pct?: number
  fill?: string
  color?: string
  count?: number
  key?: string
  name?: string
  risk?: string
}

type Props = {
  data?: LeverageBucketItem[]
  avgLeverage?: number | null
}

/** 空数据：灰色环（你也可以改成 5 段灰色，见下方注释） */
const EMPTY_RING: Array<LeverageBucketItem & { __empty: true }> = [
  {
    bucket: '1-5X',
    count: 1,
    pct: 100,
    fill: 'rgba(255,255,255,0.08)',
    __empty: true,
  },
]

// “空数据也分段展示”的灰色 5 段，就用这个替换 EMPTY_RING：
// const EMPTY_RING = (["1-5X","5-10X","10-20X","20-50X",">50X"] as const).map((b) => ({
//   bucket: b,
//   count: 1,
//   pct: 20,
//   fill: "rgba(255,255,255,0.06)",
//   __empty: true as const,
// }))

/** 产品需求颜色 */
const BUCKET_COLOR: Record<LeverageBucketKey, string> = {
  '1-5X': '#00D084',
  '5-10X': '#667EEA',
  '10-20X': '#FFA500',
  '20-50X': '#FF6B9D',
  '>50X': '#FF4D4D',
}

/** 可选：如果你还想在 tooltip 显示一个“代表杠杆值”（比如中位数/下限），就用它 */
const BUCKET_MID: Record<LeverageBucketKey, number> = {
  '1-5X': 3,
  '5-10X': 7.5,
  '10-20X': 15,
  '20-50X': 35,
  '>50X': 50,
}

export const LeverageUsagePieChart: React.FC<Props> = ({ data, avgLeverage }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    const list = Array.isArray(data) ? data : []

    const normalized = list.map((x) => ({
      bucket: x.bucket,
      count: Number(x.count) || 0,
      fill: x.color ?? '#FFA500', // 默认“黄色”
      key: x.key || '',
      name: x.name || '',
      risk: x.risk || '',
    }))

    const total = normalized.reduce((s, x) => s + x.count, 0)
    if (!total) return EMPTY_RING

    // 用 count 画饼，pct 自己算（避免 pct 丢失导致不渲染）
    return normalized
      .filter((x) => x.count > 0)
      .map((x) => ({
        ...x,
        pct: (x.count / total) * 100,
        __empty: false as const,
      }))
  }, [data])

  const isEmpty = (chartData as any)?.[0]?.__empty === true

  const centerTitle = useMemo(() => {
    if (isEmpty) return '--'
    if (avgLeverage == null || !Number.isFinite(avgLeverage)) return '--'
    return `${avgLeverage.toFixed(1)}X`
  }, [avgLeverage, isEmpty])

  /** 固定 canvas 大小，解决“不显示/超高/算不出高度”的问题 */
  const W = 520
  const H = 360
  const CX = W / 2
  const CY = H / 2

  const innerR = 64
  const outerR = 96

  return (
    <div className="w-full h-[360px] flex items-center justify-center">
      <PieChart width={W} height={H}>
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p: any = payload[0].payload

            if (p.__empty) {
              return (
                <div className="rounded-md bg-[#0E0F13] border border-white/10 p-3 text-xs text-white/80 shadow-lg">
                  No data
                </div>
              )
            }

            return (
              <div className="rounded-md bg-[#0E0F13] border border-white/10 p-3 text-xs shadow-lg min-w-[190px]">
                <div className="font-medium mb-2 text-white">{p.bucket}</div>

                <div className="grid grid-cols-[80px_1fr] gap-y-1">
                  <div className="text-right text-[#FBFBFB]">{t('smartMoney.addressDetail.range')}: </div>
                  <div className="text-[#6F3FF5] pl-2">{p.name}</div>

                  <div className="text-right text-[#FBFBFB]">{t('smartMoney.addressDetail.riskLevel')}: </div>
                  <div className="text-[#6F3FF5] pl-2">{p.risk}</div>

                  <div className="text-right text-[#FBFBFB]">{t('smartMoney.addressDetail.orderCount')}: </div>
                  <div className="text-[#6F3FF5] pl-2">{p.count}</div>

                  <div className="text-right text-[#FBFBFB]">{t('smartMoney.addressDetail.percentage')}: </div>
                  <div className=" text-[#6F3FF5] pl-2">{Number(p.pct).toFixed(2)}%</div>
                </div>
              </div>
            )
          }}
        />

        <Pie
          data={chartData as any}
          dataKey="count"
          nameKey="bucket"
          cx={CX}
          cy={CY}
          innerRadius={innerR}
          outerRadius={outerR}
          paddingAngle={isEmpty ? 0 : 2}
          stroke="transparent"
          strokeWidth={0}
          activeIndex={isEmpty ? -1 : activeIndex}
          onMouseEnter={(_, idx) => !isEmpty && setActiveIndex(idx)}
          activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
            <Sector {...props} outerRadius={outerRadius + 6} />
          )}
        />

        {/* 中心文字 */}
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.9)">
          <tspan fontSize="18" fontWeight="700">
            {centerTitle}
          </tspan>
          <tspan x={CX} dy="18" fontSize="12" fill="rgba(255,255,255,0.45)">
            {t('smartMoney.addressDetail.avgLeverage')}
          </tspan>
        </text>
      </PieChart>
    </div>
  )
}
