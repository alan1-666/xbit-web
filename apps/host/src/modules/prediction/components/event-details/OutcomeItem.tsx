import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MouseEvent, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'

export interface OutcomeItemProps {
  outcomeLabel: string
  type: 'yes' | 'no'
  marketId: string
  onClick: (e: MouseEvent, outcome: 'yes' | 'no') => void
  price: number
  minTickSize?: number
  className?: string
}

export const OutcomeItem = (props: OutcomeItemProps) => {
  const { outcomeLabel, type, marketId, onClick, price, minTickSize, className } = props
  const { selectedOutcome, selectedMarket, selectedSide } = useEventDetailsPageContext()
  const { t } = useTranslation()

  const formattedPrice = useMemo(() => {
    const precision = -Math.log10((minTickSize || 0.01) * 100)
    return (price * 100)
      .toLocaleString('en-US', {
        minimumFractionDigits: precision < 0 ? 0 : precision,
        maximumFractionDigits: precision < 0 ? 0 : precision,
      })
      .replace(/\.0+$/, '') // Remove trailing zeros and optional decimal point
  }, [price, minTickSize])

  return (
    <Button
      className={cn(
        'px-3 w-36 py-1 bg-[#2A2A2F] text-[calc(14rem/16)] rounded-none text-white font-medium ml-2',
        type === 'yes' ? 'rounded-bl-[6px]' : 'rounded-tr-[6px]',
        className,
        type === 'yes' &&
          (selectedOutcome === 'yes' && selectedMarket?.id === marketId ? 'bg-rise' : 'bg-[#04332B] text-rise'),
        type === 'no' &&
          (selectedOutcome === 'no' && selectedMarket?.id === marketId ? 'bg-fall' : 'bg-[#38120B] text-fall'),
      )}
      onClick={(e) => onClick(e, type)}
    >
      <div className="flex w-full min-w-0 items-center justify-center gap-1 text-center">
        <span className="shrink-0 text-xs font-semibold">
          {selectedSide === 'buy' ? t('prediction.orderForm.buy') : t('prediction.orderForm.sell')}
        </span>
        <span className="min-w-0 max-w-22 truncate text-xs font-semibold">{outcomeLabel}</span>
        <span className="shrink-0 text-sm font-semibold">{formattedPrice}¢</span>
      </div>
    </Button>
  )
}
