import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils.ts'

type AmountColumnProps = {
  transaction: TransactionDto
  className?: string
}

const AmountColumn = ({ transaction, className }: AmountColumnProps) => {
  return (
    <div className={cn('min-w-[80px]', className)}>
      {formatAmount(transaction.baseAmount, {
        roundMode: 'floor',
      })}
    </div>
  )
}

export default AmountColumn
