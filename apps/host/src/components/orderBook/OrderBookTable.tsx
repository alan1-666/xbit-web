import { LastTransaction, TransactionType } from '@/@generated/gql/graphql-core.ts'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { DisplayPriceType, FilterTransactionAmountType } from '@/types/enums.ts'
import { formatDecimalLongValue, formatSmartTimeDiff } from '@/utils/helpers.ts'
import { cn } from '@/lib/utils.ts'
import { DataTableVirtualItem } from '@components/orderBook/DataTableVirtualItem.tsx'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice.ts'

type OrderBookTableProps = {
  data: LastTransaction[]
  currency: FilterTransactionAmountType
  handleChangeCurrency: () => void
  priceType: DisplayPriceType
  handleChangePriceType: () => void
  handleScrollToBottom: () => void
  maxPriceUsd: number
  totalSupply: number
  decimals: string | undefined
}

const OrderBookTable = ({
  data,
  currency,
  handleChangeCurrency,
  priceType,
  handleChangePriceType,
  maxPriceUsd,
  totalSupply,
  handleScrollToBottom,
}: OrderBookTableProps) => {
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const priceNativeToken = useAppSelector(priceChain(activeChain))

  const orderBookColumn: ColumnDef<LastTransaction>[] = [
    {
      accessorKey: 'amount',
      header: () => (
        <div
          className="flex items-center gap-[2px] min-w-[52px] select-none cursor-pointer"
          onClick={handleChangeCurrency}
        >
          <div className="text-[calc(1rem*(10/16))]  whitespace-nowrap">{t('detail.tokenDetail.value')}</div>
          <img src="/images/orderBook/icon-refund.svg" className="w-3 min-w-3" alt="change currency" />
        </div>
      ),
      cell: ({ row }) => {
        const item = row?.original

        const usdValue = parseFloat(item?.usdAmount)
        const solValue = usdValue / (parseFloat(priceNativeToken) || 1)

        return (
          <div className="flex items-center min-w-[52px]">
            {currency === FilterTransactionAmountType.SOL && (
              <img src="/images/orderBook/icon-sol.png" alt="icon sol" />
            )}
            <span className={cn(item?.transactionType === TransactionType.Buy ? 'text-rise' : 'text-fall')}>
              {currency === FilterTransactionAmountType.SOL ? '' : '$'}
              {formatDecimalLongValue(currency === FilterTransactionAmountType.USDT ? usdValue : solValue, 3)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      header: () => (
        <div
          className="flex items-center gap-[2px] min-w-11 select-none cursor-pointer"
          onClick={handleChangePriceType}
        >
          <div className="text-[calc(1rem*(10/16))] whitespace-nowrap">
            {priceType === DisplayPriceType.PRICE ? t('orderBook.price') : t('orderBook.marketCap')}
          </div>
          <img src="/images/futuresDetail/arrow-swap-icon.svg" className="w-2.5 min-w-2.5" alt="change mc - price" />
        </div>
      ),
      cell: ({ row }) => {
        const transaction = row?.original

        return (
          <div className="text-[#FFFFFFCC] min-w-11">
            $
            {formatDecimalLongValue(
              priceType === DisplayPriceType.PRICE
                ? Number(transaction?.priceUsd)
                : Number(transaction?.priceUsd) * totalSupply,
              priceType === DisplayPriceType.PRICE ? 4 : 2,
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'timestamp',
      header: () => (
        <div className="flex items-center justify-end gap-[2px] min-w-9 select-none cursor-pointer pr-1">
          <div className="text-[calc(1rem*(10/16))] whitespace-nowrap">{t('orderBook.time')}</div>
        </div>
      ),
      cell: ({ row }) => {
        const transaction = row?.original

        return (
          <div className="text-[#FFFFFFCC] text-end min-w-9 w-full">
            {formatSmartTimeDiff(transaction.timestamp * 1000)}
          </div>
        )
      },
    },
  ]

  return (
    <DataTableVirtualItem
      columns={orderBookColumn}
      data={data}
      isStickyHeader
      onBottomReached={handleScrollToBottom}
      containerClassName="border-0 relative min-h-[220px] h-full"
      tableHeadClassName="h-3 px-0"
      tableHeaderRowClassName="!border-0 !bg-[#111]"
      tableBodyRowClassName="border-0 text-[calc(1rem*(11/16))] leading-[1] relative"
      tableCellClassName="p-0 min-w-9 w-full max-w-3/7 last:w-10 last:pr-1"
      tableBodyClassName="top-2"
      handleBgRowClassName={(row) => {
        const tx = row?.original as LastTransaction
        return cn(
          'absolute -top-[3px] left-0 h-[18px] -z-[1] max-w-full',
          tx?.transactionType === TransactionType.Buy
            ? 'bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,255,180,0.2)_100%)]'
            : 'bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(171,87,255,0.3)_100%)]',
        )
      }}
      handleBgRowStyle={(row) => {
        const tx = row?.original as LastTransaction
        return { width: `${((Number(tx?.priceUsd) * Number(tx?.baseAmount)) / maxPriceUsd) * 100}%` }
      }}
    />
  )
}

export default OrderBookTable
