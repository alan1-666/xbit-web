import { formatDecimalLongValue, formatSmartTimeDiff } from '@/utils/helpers.ts'
import { cn } from '@/lib/utils.ts'
import { DisplayPriceType, FilterTransactionAmountType } from '@/types/enums.ts'
import { LastTransaction } from '@/@generated/gql/graphql-core.ts'

type OrderRecordProps = {
  transaction: LastTransaction
  isDown?: boolean
  className?: string
  style?: object
  priceType: DisplayPriceType
  currency: FilterTransactionAmountType
}

const OrderRecord = ({ transaction, isDown, className, style, priceType, currency }: OrderRecordProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-2.5 app-font-medium text-[calc(1rem*(11/16))] leading-[1] mb-[11.55px] last:mb-0',
        className,
      )}
      style={style}
    >
      <div className={cn('flex items-center gap-0.5 text-[#00CE89]', isDown && 'text-[#AB57FF]')}>
        {currency === FilterTransactionAmountType.SOL && <img src="/images/orderBook/icon-sol.png" alt="icon sol" />}
        <span>
          {currency === FilterTransactionAmountType.SOL ? "" : "$"}
          {formatDecimalLongValue(
            currency === FilterTransactionAmountType.SOL
              ? Number(transaction?.quoteAmount)
              : Number(transaction?.baseAmount), 3)}
        </span>
      </div>
      <div className="text-[#FFFFFFCC]">
        $
        {formatDecimalLongValue(
          priceType === DisplayPriceType.PRICE
            ? Number(transaction?.priceUsd)
            : Number(transaction?.marketCap), 3)}
      </div>
      <div className="text-[#FFFFFFCC] text-end">{formatSmartTimeDiff(transaction.timestamp)}</div>
    </div>
  )
}

export default OrderRecord
