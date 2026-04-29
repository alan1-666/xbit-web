import { formatAmount, formatPercent, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import LineChart from '@components/detailHolderTab/LineChart.tsx'
import { useHorizontalDragScroll } from '@hooks/useHorizontalDragScroll.ts' // if you already use a cn helper; else remove
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const Divider = React.memo(() => <div className="min-w-[1px] h-[36px] bg-[#ECECED14]" />)

type StatCardProps = {
  label: string
  valueNode: React.ReactNode
  chart?: { lastItem: number; data: number[] | undefined; strokeColor?: string }
  className?: string
}

const StatCard = React.memo(({ label, valueNode, chart, className }: StatCardProps) => {
  return (
    <div className={cn('flex items-center gap-1 py-[5px] px-1.5 rounded-[6px] w-fit', className)}>
      <div className="flex flex-col gap-[5px]">
        <div className="app-font-regular text-[16px] leading-[1] text-[#fff]/50 whitespace-nowrap">{label}</div>
        <div className="app-font-medium text-[18px] leading-[1] text-[#fff]">{valueNode}</div>
      </div>
      {chart && (
        <LineChart
          lastItem={chart.lastItem}
          lineData={chart.data ?? []}
          strokeColor={chart.strokeColor ?? '#009C46'}
          normalizeMinLength={24}
          numberOfFill={1}
        />
      )}
    </div>
  )
})

const ChartHoldersPc = () => {
  const { t } = useTranslation()
  const {
    holderCount,
    top10Holder,
    avgHolding,
    insiderPct,
    phishingPct,
    botPct,
    bundlePct,
    newWalletPct,
    inActivePct,
    holderChart,
  } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)

  const { containerRef, eventHandlers } = useHorizontalDragScroll()

  const cards = useMemo(() => {
    return [
      {
        key: 'holder',
        dividerAfter: true,
        node: (
          <StatCard
            label={t('detail.holderChart.holder')}
            valueNode={
              <div className="text-[18px]">
                {formatVolume(holderCount, {
                  roundMode: 'floor',
                })}
              </div>
            }
            chart={{ lastItem: holderCount ?? 0, data: holderChart?.holder }}
          />
        ),
      },
      {
        key: 'top10',
        dividerAfter: true,
        node: (
          <StatCard
            label={t('detail.holderChart.top10')}
            valueNode={<div className="text-[18px]">{formatPercent(top10Holder)}</div>}
            chart={{ lastItem: top10Holder ?? 0, data: holderChart?.top10 }}
          />
        ),
      },
      {
        key: 'avgHolding',
        dividerAfter: true,
        node: (
          <StatCard
            label={t('detail.holderChart.avgHolding')}
            valueNode={
              <div className="text-[18px]">
                {formatAmount(avgHolding, {
                  roundMode: 'floor',
                })}
              </div>
            }
            chart={{ lastItem: avgHolding ?? 0, data: holderChart?.avgHolding }}
          />
        ),
      },
      {
        key: 'sniper',
        dividerAfter: true,
        node: (
          <StatCard
            label={t('detail.holderChart.sniper')}
            valueNode={<div className="text-[18px]">{formatPercent((insiderPct ?? 0) * 100)}</div>}
          />
        ),
      },
      {
        key: 'phishing',
        dividerAfter: true,
        node: (
          <StatCard
            label={t('detail.holderChart.phishing')}
            valueNode={
              <div className="text-[18px]">
                {formatPercent((phishingPct ?? 0) * 100, {
                  showSmallAsAngleBracket: true,
                })}
              </div>
            }
          />
        ),
      },
      {
        key: 'bundled',
        dividerAfter: true,
        node: (
          <StatCard
            label={t('detail.holderChart.bundled')}
            valueNode={
              <div className="text-[18px]">
                {formatPercent((bundlePct ?? 0) * 100, {
                  showSmallAsAngleBracket: true,
                })}
              </div>
            }
          />
        ),
      },
      {
        key: 'bot',
        dividerAfter: true,
        node: (
          <StatCard
            label={t('detail.holderChart.bot')}
            valueNode={
              <div className="text-[18px]">
                {formatPercent((botPct ?? 0) * 100, {
                  showSmallAsAngleBracket: true,
                })}
              </div>
            }
          />
        ),
      },
      {
        key: 'newWallet',
        dividerAfter: true,
        node: (
          <StatCard
            label={t('detail.holderChart.newWallet')}
            valueNode={
              <div className="text-[18px]">
                {formatPercent((newWalletPct ?? 0) * 100, {
                  showSmallAsAngleBracket: true,
                })}
              </div>
            }
          />
        ),
      },
      {
        key: 'inactive',
        dividerAfter: false,
        node: (
          <StatCard
            label={t('detail.holderChart.inactive')}
            valueNode={
              <div className="text-[18px]">
                {formatPercent((inActivePct ?? 0) * 100, {
                  showSmallAsAngleBracket: true,
                })}
              </div>
            }
          />
        ),
      },
    ]
  }, [
    t,
    holderCount,
    avgHolding,
    insiderPct,
    holderChart.holder,
    holderChart.top10,
    holderChart.avgHolding,
    phishingPct,
    bundlePct,
    botPct,
    newWalletPct,
    inActivePct,
  ])

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-5 w-full overflow-x-auto overflow-y-hidden select-none cursor-grab scroll-smooth scrollbar-hide px-2 border-b"
      {...eventHandlers}
    >
      {cards.map((c) => (
        <React.Fragment key={c.key}>
          {c.node}
          {c.dividerAfter && <Divider />}
        </React.Fragment>
      ))}
    </div>
  )
}

export default React.memo(ChartHoldersPc)
