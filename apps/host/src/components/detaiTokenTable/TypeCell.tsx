import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { cn } from '@/lib/utils.ts'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export interface TypeCellProps {
  transaction: RealtimeTransaction
  className?: string
}

const handleTextColor = (type: RealtimeTransactionType) => {
  switch (type) {
    case RealtimeTransactionType.Buy:
      return 'text-rise'
    case RealtimeTransactionType.Sell:
      return 'text-fall'
    case RealtimeTransactionType.AddLiquidity:
      return 'text-rise'
    case RealtimeTransactionType.RemoveLiquidity:
      return 'text-reduce'
    default:
      return 'text-white'
  }
}

export const TypeCell = ({ transaction, className }: TypeCellProps) => {
  const { t } = useTranslation()
  const typeLabel = useMemo(() => {
    switch (transaction.type) {
      case RealtimeTransactionType.Buy:
        return t('detail.tokenDetail.buy')
      case RealtimeTransactionType.Sell:
        return t('detail.tokenDetail.sell')
      case RealtimeTransactionType.AddLiquidity:
        return t('detail.tokenDetail.addLiquidity')
      case RealtimeTransactionType.RemoveLiquidity:
        return t('detail.tokenDetail.removeLiquidity')
      case RealtimeTransactionType.Burn:
        return t('detail.tokenDetail.burn')
      default:
        return ''
    }
  }, [transaction.type, t])
  return (
    <div
      data-source={transaction.source ?? 'api'}
      className={cn(handleTextColor(transaction.type), 'text-[calc(13rem/16)] font-medium', className)}
    >
      {typeLabel}
    </div>
  )
}
