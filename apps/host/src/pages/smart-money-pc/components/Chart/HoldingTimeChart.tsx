import React, { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import type { UserPositionHoldingTimeRow } from '@/hooks/useGetUserPositionHoldingTime'
import { buildHoldingTimeHistogram } from '@/utils/smart-money'

type Props = {
  rows: UserPositionHoldingTimeRow[]
}

export const HoldingTimeChart: React.FC<Props> = ({ rows }) => {
  const data = useMemo(() => buildHoldingTimeHistogram(rows), [rows])

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 12 }}>
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.06)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const value = payload[0].value

              return (
                <div
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: '#15161B',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#FBFBFB',
                  }}
                >
                  <div className="font-medium mb-1">{label}</div>
                  <div >订单数量：<span className='text-[#6F3FF5]'>{value} 笔</span></div>
                </div>
              )
            }}
          />

          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.color ?? '#667EEA'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
