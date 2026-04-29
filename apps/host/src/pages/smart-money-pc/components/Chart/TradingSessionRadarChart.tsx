import React, { useMemo } from 'react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'
import type { TradingSessionRow, TradingSessionTab } from '@/services/hypertrader.service'
import { ChartRangeTabs } from './ChartRangeTabs'
import { buildTradingSessionRadarData } from '@/utils/smart-money'
import { useTranslation } from 'react-i18next'

const AVAILABLE_KEYS = [
  { key: 'ONE_DAY', label: '1D' },
  { key: 'SEVEN_DAYS', label: '7D' },
  { key: 'THIRTY_DAYS', label: '30D' },
  { key: 'ALL', label: 'ALL' },
] as const



type Props = {
  data?: TradingSessionRow
  loading?: boolean
  tab: TradingSessionTab
  onTabChange: (tab: TradingSessionTab) => void
}

export const TradingSessionRadarChart: React.FC<Props> = ({ data, loading, tab, onTabChange }) => {
  const { t } = useTranslation()
  const realData = useMemo(() => buildTradingSessionRadarData(data, t), [data])
  const total = useMemo(() => realData.reduce((s, d) => s + (Number(d.value) || 0), 0), [realData])
  const isEmpty = total === 0

  const ACTIVE_KEYS: Record<string, any> = {
    ONE_DAY: t('smartMoney.chart.1Day'),
    SEVEN_DAYS: t('smartMoney.chart.7Days'),
    THIRTY_DAYS: t('smartMoney.chart.30Days'),
    ALL: t('smartMoney.chart.allTime'),
  }

  // 空数据也给一个“占位雷达”，否则全部为 0 会收缩在中心点，视觉上像“没渲染”
  const chartData = useMemo(() => {
    if (!isEmpty) return realData
    return realData.map((d) => ({ ...d, value: 1 }))
  }, [isEmpty, realData])

  // 空数据给个固定上限，避免刻度全挤在一起
  const maxVal = useMemo(() => {
    if (isEmpty) return 5
    const m = Math.max(...realData.map((d) => Number(d.value) || 0), 0)
    return Math.max(5, Math.ceil(m * 1.1))
  }, [isEmpty, realData])

  return (
    <div className="w-full">
      {/* 顶部 tabs & 副标题 */}
      <div className="mb-3">
        <ChartRangeTabs
          active={tab}
          tabs={AVAILABLE_KEYS as any}
          onChange={(k) => onTabChange(k as TradingSessionTab)}
          activeLabelMap={ACTIVE_KEYS}
          titlePrefix={t('smartMoney.chart.recent')}
          titleSuffix={t('smartMoney.addressDetail.tradingSession')}
        />
      </div>

      <div className="relative w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid strokeOpacity={0.15} />
            <PolarAngleAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
            {/* <PolarRadiusAxis domain={[0, maxVal]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} /> */}
            <PolarRadiusAxis domain={[0, maxVal]} tick={false} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#15161B',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#fff',
              }}
              formatter={(v: any, _name, p: any) => {
                const shown = isEmpty ? 0 : (v ?? 0)
                return [`${shown} ${t('smartMoney.charts.times')}`, `${p?.payload?.label}（${p?.payload?.desc}）`]
              }}
            />
            <Radar dataKey="value" stroke="#6F3FF5" fill="#6F3FF5" fillOpacity={isEmpty ? 0.08 : 0.25} dot={{ r: 2 }} />
          </RadarChart>
        </ResponsiveContainer>

        {/* overlay */}
        {loading ? (
          <div className="absolute inset-0 grid place-items-center text-white/50 text-sm pointer-events-none">
            {t('detail.common.loading')}
          </div>
        ) : null}
      </div>
    </div>
  )
}
