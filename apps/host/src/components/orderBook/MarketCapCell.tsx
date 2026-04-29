import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { DisplayPriceType } from '@/types/enums.ts'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { formatPrice, formatVolume } from '@/lib/format.ts'

export interface MarketCapCellProps {
  transaction: RealtimeTransaction
  totalSupply: number
  priceType: DisplayPriceType
  exclusive: boolean
}

export const MarketCapCell = (props: MarketCapCellProps) => {
  const { transaction, totalSupply, priceType, exclusive } = props
  const { t } = useTranslation()
  if (transaction.type === RealtimeTransactionType.AddLiquidity) {
    return <div className="text-rise">{t('detail.tokenDetail.addLiquidity')}</div>
  }
  if (transaction.type === RealtimeTransactionType.RemoveLiquidity) {
    return <div className="text-reduce">{t('detail.tokenDetail.removeLiquidity')}</div>
  }
  if (transaction.type === RealtimeTransactionType.Burn) {
    return <div>{t('detail.tokenDetail.burn')}</div>
  }
  return (
    <div className={cn('flex items-center text-[#FFFFFFCC]', exclusive ? 'opacity-50' : '')}>
      {!totalSupply || totalSupply === 0 || Number(transaction?.usdPrice) < 0 ? (
        <div className="flex items-center scale-75">
          <Loader />
        </div>
      ) : priceType === DisplayPriceType.PRICE ? (
        formatPrice(transaction?.usdPrice, {
          showCurrency: true,
        })
      ) : (
        formatVolume(Number(transaction?.usdPrice) * totalSupply, {
          showCurrency: true,
        })
      )}
    </div>
  )
}
