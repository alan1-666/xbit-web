import { cn } from '@/lib/utils.ts'
import { DisplayPriceType } from '@/types/enums.ts'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { useContext, useMemo } from 'react'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'
import { formatPrice, formatVolume } from '@/lib/format.ts'
import { RootState, useAppSelector } from '@/redux/store'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'

export interface PriceCellProps {
  transaction: RealtimeTransaction
  className?: string
}

export const PriceCell = (props: PriceCellProps) => {
  const { transaction, className } = props
  const { totalSupply } = useContext(TradingTransactionsContext)
  const price = transaction.usdPrice
  const displayPriceType = useAppSelector(
    (state: RootState) => (state.tokenDetail as TokenDetailState).displayPriceType,
  )
  const marketCap = useMemo(() => {
    if (price <= 0 || totalSupply <= 0) return 0
    return price * totalSupply
  }, [price, totalSupply])

  const handleTextColor = (type: RealtimeTransactionType) => {
    switch (type) {
      case RealtimeTransactionType.Buy:
        return 'text-rise'
      case RealtimeTransactionType.Sell:
        return 'text-fall'
      default:
        return 'text-white'
    }
  }

  return (
    <div className={cn(handleTextColor(transaction.type), 'text-[calc(12rem/16)] leading-none font-[380]', className)}>
      {displayPriceType === DisplayPriceType.PRICE ? (
        <>
          {formatPrice(price, {
            showCurrency: true,
          })}
        </>
      ) : (
        <>
          {formatVolume(marketCap, {
            showCurrency: true,
          })}
        </>
      )}
    </div>
  )
}
