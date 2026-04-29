import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Sector, Tooltip, LabelList, Cell } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import type { UserPositionHoldingTimeRow } from '@/hooks/useGetUserPositionHoldingTime'

type Props = {
  rows: UserPositionHoldingTimeRow[]
  topN?: number
  height?: number
}

type Datum = {
  coin: string
  valueMs: number
  pct: number
  __empty?: boolean
}

function toNum(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function getHoldingMs(r: UserPositionHoldingTimeRow) {
  const t = toNum((r as any).timeSum)
  if (t > 0) return t
  const fallback = toNum((r as any).totalHoldingTime)
  return fallback > 0 ? fallback : 0
}

function formatDuration(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return '0s'
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}h`
  const day = Math.floor(hour / 24)
  return `${day}d`
}

function formatPct(p: number) {
  if (!Number.isFinite(p) || p <= 0) return '0%'
  if (p < 1) return `${p.toFixed(1)}%`
  return `${p.toFixed(0)}%`
}

const PALETTE = [
  '#6F3FF5',
  '#00E497',
  '#FF1B49',
  '#00B4FF',
  '#FFB020',
  '#A9A9B5',
  '#B392F0',
  '#48D1CC',
  '#FF7A90',
  '#7CFFCB',
]

const EMPTY_RING: Datum[] = [{ coin: 'EMPTY', valueMs: 1, pct: 100, __empty: true }]

export const HoldingTimePie: React.FC<Props> = ({ rows, topN = 8, height = 360 }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const { t } = useTranslation()

  const { chartData, totalMs, isEmpty } = useMemo(() => {
    const map = new Map<string, number>()

    for (const r of rows ?? []) {
      const coin = String(r.coin ?? '').trim() || 'UNKNOWN'
      const ms = getHoldingMs(r)
      if (ms <= 0) continue
      map.set(coin, (map.get(coin) ?? 0) + ms)
    }

    const list = Array.from(map.entries())
      .map(([coin, valueMs]) => ({ coin, valueMs }))
      .sort((a, b) => b.valueMs - a.valueMs)

    const total = list.reduce((s, x) => s + x.valueMs, 0)
    if (!total) return { chartData: EMPTY_RING, totalMs: 0, isEmpty: true }

    const head = list.slice(0, Math.max(1, topN))
    const tail = list.slice(Math.max(1, topN))
    const othersMs = tail.reduce((s, x) => s + x.valueMs, 0)

    const merged = [...head, ...(othersMs > 0 ? [{ coin: 'Others', valueMs: othersMs }] : [])]

    return {
      chartData: merged.map((x) => ({
        coin: x.coin,
        valueMs: x.valueMs,
        pct: (x.valueMs / total) * 100,
        __empty: false,
      })),
      totalMs: total,
      isEmpty: false,
    }
  }, [rows, topN])

  const W = 520
  const H = height
  const CX = W / 2
  const CY = H / 2
  const innerR = 64
  const outerR = 96

  const centerTitle = isEmpty ? '--' : formatDuration(totalMs)
  const RADIAN = Math.PI / 180

  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props
    const item = (chartData as any[])[index]
    if (!item || item.__empty) return null

    // 小扇区不显示，避免挤爆
    if (!Number.isFinite(percent) || percent < 0.07) return null

    const r = innerRadius + (outerRadius - innerRadius) * 0.55
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#FBFBFB" pointerEvents="none">
        {item.coin}
      </text>
    )
  }

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
                  {t('smartMoney.addressDetail.nodata')}
                </div>
              )
            }

            return (
              <div className="rounded-md bg-[#0E0F13] border border-white/10 p-3 text-xs shadow-lg min-w-[200px]">
                {/* <div className="font-medium mb-2 text-[#FBFBFB]">{p.coin}</div> */}

                <div className="grid grid-cols-[105px_1fr] gap-y-1">
                  <div className="text-right text-[#FBFBFB]">{t('smartMoney.addressDetail.asset')}:</div>
                  <div className="pl-2 text-[#B87EFF]">{p.coin}</div>

                  <div className="text-right text-[#FBFBFB]">{t('smartMoney.addressDetail.holdingTime')}:</div>
                  <div className="pl-2 text-[#B87EFF]">{formatDuration(Number(p.valueMs))}</div>

                  <div className="text-right text-[#FBFBFB]">{t('smartMoney.addressDetail.percentage')}:</div>
                  <div className="pl-2 text-[#B87EFF]">{formatPct(Number(p.pct))}</div>
                </div>
              </div>
            )
          }}
        />

        <Pie
          data={chartData as any}
          dataKey="valueMs"
          nameKey="coin"
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
          labelLine={false}
          label={renderLabel}
        >
          {(chartData as any[]).map((d, idx) => (
            <Cell
              key={`cell-${d.coin}-${idx}`}
              fill={d.__empty ? 'rgba(255,255,255,0.08)' : PALETTE[idx % PALETTE.length]}
            />
          ))}
        </Pie>

        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.9)">
          <tspan fontSize="18" fontWeight="700">
            {centerTitle}
          </tspan>
          <tspan x={CX} dy="18" fontSize="12" fill="rgba(255,255,255,0.45)">
            {t('smartMoney.addressDetail.totalHoldingTime')}
          </tspan>
        </text>
      </PieChart>
    </div>
  )
}
