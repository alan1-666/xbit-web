import React from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { cn } from '@/lib/utils'

export type RangeKey = 'ONE_DAY' | 'SEVEN_DAYS' | 'THIRTY_DAYS' | 'ALL'

export type RangeTabItem<K extends string = string> = {
  key: K
  label: React.ReactNode
}

type Props<K extends string = string> = {
  titlePrefix?: string
  titleSuffix?: string
  activeLabelMap?: Record<string, React.ReactNode> // 副标题映射
  active: K
  tabs: RangeTabItem<K>[]
  onChange: (key: K) => void

  className?: string
}

export function ChartRangeTabs<K extends string = string>({
  titlePrefix = '',
  titleSuffix = '',
  activeLabelMap,
  active,
  tabs,
  onChange,
  className,
}: Props<K>) {
  const subtitle = activeLabelMap?.[active] ?? active
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  return (
    <div className={clsx('flex justify-between items-center mb-3', className)}>
      {/* 副标题 */}
      <div className={cn("text-sm text-[#908E9A]", isDesktop ? "pl-8" : "pl-5")}>
        {subtitle === t('smartMoney.chart.allTime') ? '' : titlePrefix + ' '}
        {subtitle + ' '} 
        {titleSuffix}
      </div>

      {/* Tabs */}
      <div
        className={clsx(
          'flex items-center p-1',
          'rounded-[6px]',
          'border-[0.5px] border-[#212129]',
          isDesktop ? "" : "mr-5 mt-2"
        )}
      >
        {tabs.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={String(t.key)}
              onClick={() => onChange(t.key)}
              className={clsx(
                'h-8 px-3 py-1.5 text-sm transition-colors',
                'rounded',
                isActive ? 'bg-[#212129] text-white' : 'bg-transparent text-gray-300 hover:text-white/70',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
