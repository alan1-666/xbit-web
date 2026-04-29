
import { TransactionType } from '@/@generated/gql/graphql-future'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { memo } from 'react'

interface TransactionTypeTextProps {
  type?: TransactionType
  className?: string
}

const TransactionTypeText = ({ type, className }: TransactionTypeTextProps) => {
  const { t } = useTranslation()

  switch (type) {
    case TransactionType.Sell:
      return <span className={cn('text-fall', className)}>{t('detail.smartMoney.sell')}</span>
    case TransactionType.Buy:
      return <span className={cn('text-rise', className)}>{t('detail.smartMoney.buy')}</span>
    case TransactionType.Add:
      return <span className={cn('text-[#009C46]', className)}>{t('detail.smartMoney.addLiquidity')}</span>
    case TransactionType.Remove:
      return <span className={cn('text-[#F25461]', className)}>{t('detail.smartMoney.removeLiquidity')}</span>
    default:
      return <span className={cn('text-[#FFF]', className)}>{''}</span>
  }
}

export default memo(TransactionTypeText)
