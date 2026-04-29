import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { BaseChart } from '@/modules/prediction/components/event-details/BaseChart.tsx'
import { formatPercent } from '@/lib/format'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'

export interface MarketChartProps {
  market: MarketModel
}

export const MarketChart = (props: MarketChartProps) => {
  const { market } = props
  const markets = useMemo(() => [market], [market])
  const { t } = useTranslation()

  const [priceHistoryValue, setPriceHistoryValue] = useState<number | null>(null)

  const handleDataReady = useCallback((data: { priceHistoryValue: number | null }) => {
    setPriceHistoryValue(data.priceHistoryValue)
  }, [])

  const displayValue =
    priceHistoryValue !== null
      ? formatPercent(priceHistoryValue, { showSign: true })
      : market.oneDayPriceChange

  return (
    <div className="pb-2 px-2">
      <div className="flex items-center justify-between p-3">
        <span className="text-white text-base font-semibold">
          {t('prediction.price.history')}
        </span>
        <div
          className={cn(
            'flex items-center gap-1',
            priceHistoryValue !== null && priceHistoryValue < 0 && 'text-fall',
          )}
        >
          <img
            src="/images/prediction/icon-arrow-history.svg"
            alt="arrow history"
            className={cn(priceHistoryValue !== null && priceHistoryValue < 0 && 'rotate-180')}
            style={
              priceHistoryValue !== null && priceHistoryValue < 0
                ? { filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(346deg) brightness(98%) contrast(96%)' }
                : undefined
            }
          />
          <span
            className={cn(
              priceHistoryValue !== null &&
                (priceHistoryValue > 0 ? 'text-rise' : priceHistoryValue < 0 ? 'text-fall' : 'text-[#908E98]'),
            )}
          >
            {displayValue}
          </span>
        </div>
      </div>
      <BaseChart
          markets={markets}
          isPending={false}
          onDataReady={handleDataReady}
          variant="market"
          volume={market.volume != null ? Number(market.volume) : undefined}
        />
    </div>
  )
}
