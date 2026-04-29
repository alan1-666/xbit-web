import { formatAmount, formatPercent } from '@/lib/format'
import { TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import LineChart from '@components/detailHolderTab/LineChart.tsx'
import React from 'react'
import { useTranslation } from 'react-i18next'

const ChartHolders = () => {
  const { t } = useTranslation()
  const { holderCount, top10Holder, avgHolding, insiderPct, holderChart } = useAppSelector(
    (state: RootState) => state.tradeTab as TradeTabState,
  )

  return (
    <div className="flex items-center gap-1 w-full overflow-auto">
      <div className="flex items-center gap-1 bg-[#101114] py-1.5 px-1.5 rounded-[4px] w-fit">
        <div className="flex flex-col gap-[5px]">
          <div className="text-[11px] text-[#605e68] leading-none font-[330] whitespace-nowrap">
            {t('detail.holderChart.holder')}
          </div>
          <div className="app-font-medium text-[12px] leading-[1] text-[#fff]">
            {formatAmount(holderCount, {
              roundMode: 'floor',
            })}
          </div>
        </div>
        <LineChart
          lastItem={holderCount}
          lineData={holderChart?.holder ?? []}
          normalizeMinLength={24}
          numberOfFill={1}
        />
      </div>

      <div className="flex items-center gap-1 bg-[#101114] py-1.5 px-1.5 rounded-[4px] w-fit">
        <div className="flex flex-col gap-[5px]">
          <div className="text-[11px] text-[#605e68] leading-none font-[330] whitespace-nowrap">
            {t('detail.holderChart.top10')}
          </div>
          <div className="app-font-medium text-[12px] leading-[1] text-[#fff]">{formatPercent(top10Holder)}</div>
        </div>
        <LineChart
          lastItem={top10Holder}
          lineData={holderChart?.top10 ?? []}
          normalizeMinLength={24}
          numberOfFill={1}
        />
      </div>

      <div className="flex items-center gap-1 bg-[#101114] py-1.5 px-1.5 rounded-[4px] w-fit">
        <div className="flex flex-col gap-[5px]">
          <div className="text-[11px] text-[#605e68] leading-none font-[330] whitespace-nowrap">
            {t('detail.holderChart.avgHolding')}
          </div>
          <div className="app-font-medium text-[12px] leading-[1] text-[#fff]">
            {formatAmount(avgHolding, {
              roundMode: 'floor',
            })}
          </div>
        </div>
        <LineChart
          lastItem={avgHolding}
          lineData={holderChart?.avgHolding ?? []}
          normalizeMinLength={24}
          numberOfFill={1}
        />
      </div>

      <div className="flex items-center gap-1 bg-[#101114] py-1.5 px-1.5 rounded-[4px] w-fit">
        <div className="flex flex-col gap-[5px]">
          <div className="text-[11px] text-[#605e68] leading-none font-[330] whitespace-nowrap">
            {t('detail.holderChart.sniper')}
          </div>
          <div className="app-font-medium text-[12px] leading-[1] text-[#fff]">
            {formatPercent((insiderPct ?? 0) * 100)}
          </div>
        </div>
        <LineChart
          lastItem={insiderPct}
          lineData={holderChart?.insider ?? []}
          normalizeMinLength={24}
          numberOfFill={1}
        />
      </div>
    </div>
  )
}

export default React.memo(ChartHolders)
