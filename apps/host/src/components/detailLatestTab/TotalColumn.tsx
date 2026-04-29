import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { TYPE_BUY, TYPE_SELL, TYPE_TPSL } from '@const/tokenDetail.ts'

type TotalColumnProps = {
  transaction: TransactionDto
}

const TotalColumn = ({ transaction }: TotalColumnProps) => {
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const nativeTokenPrice = useNativeTokenPrice()

  const usdAmount = parseFloat(transaction.usdAmount)
  const amount = transaction.nativeAmount ? +transaction.nativeAmount : usdAmount / nativeTokenPrice

  const handleTextColor = (type: string) => {
    switch (type) {
      case TYPE_BUY:
        return 'text-rise'
      case TYPE_SELL:
        return 'text-fall'
      case TYPE_TPSL:
      default:
        return 'text-[#CACACA]'
    }
  }

  return (
    <div className={cn(handleTextColor(transaction?.type), 'flex items-center gap-0.5 min-w-[90px] whitespace-nowrap')}>
      {dataUnit === 'USD'
        ? formatAmount(usdAmount, {
            showCurrency: true,
            roundMode: 'floor',
          })
        : formatAmount(amount, {
            showCurrency: false,
            roundMode: 'floor',
            unit: dataUnit,
          })}
    </div>
  )
}

export default TotalColumn
