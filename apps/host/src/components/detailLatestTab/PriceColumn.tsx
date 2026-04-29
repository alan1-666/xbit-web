import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { formatAmount, formatPrice, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { DisplayPriceType } from '@/types/enums.ts'
import { TYPE_BUY, TYPE_SELL, TYPE_TPSL } from '@const/tokenDetail.ts'
import { useMemo } from 'react'
import { useResponsive } from '@hooks/useResponsive.ts'

type PriceColumnProps = {
  transaction: TransactionDto
  displayPriceType: DisplayPriceType
  totalSupply: number
}

const PriceColumn = ({ transaction, displayPriceType, totalSupply }: PriceColumnProps) => {
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const nativeTokenPrice = useNativeTokenPrice()
  const { isDesktop } = useResponsive()

  const handleTextColor = (type: string) => {
    if (isDesktop) {
      return 'text-rise'
    }
    switch (type) {
      // case TYPE_BUY:
      //   return 'text-rise'
      // case TYPE_SELL:
      //   return 'text-fall'
      // case TYPE_TPSL:
      default:
        return 'text-[#CACACA]'
    }
  }

  const nativePriceAtTransaction = useMemo(() => {
    const usdAmount = transaction.usdAmount ? +transaction.usdAmount : null
    const nativeAmount = transaction.nativeAmount ? +transaction.nativeAmount : null
    if (!usdAmount || !nativeAmount) return null
    return usdAmount / nativeAmount
  }, [transaction])

  const marketCap = useMemo(() => {
    // return transaction && transaction.usdPrice && totalSupply ? transaction.usdPrice * totalSupply : null
    const mc = +transaction.usdPrice * totalSupply
    if (dataUnit === 'USD') {
      return mc
    }
    if (nativePriceAtTransaction) {
      return mc / nativePriceAtTransaction
    }
    return mc / nativeTokenPrice
  }, [transaction, totalSupply, dataUnit])

  const price = useMemo(() => {
    if (!transaction) return null
    if (dataUnit === 'USD') {
      return transaction.usdPrice ? +transaction.usdPrice : null
    }
    return transaction.nativePrice ? +transaction.nativePrice : null
  }, [transaction, dataUnit])

  const displayedPrice = useMemo(() => {
    if (!price) return '--'
    if (dataUnit === 'USD') {
      return formatPrice(price, { showCurrency: true, roundMode: 'ceil' })
    }
    return formatAmount(price, { roundMode: 'ceil', unit: dataUnit })
  }, [price, dataUnit])

  const displayedMarketCap = useMemo(() => {
    if (marketCap === null) return '--'
    if (dataUnit === 'USD') {
      return formatVolume(marketCap, { showCurrency: true, roundMode: 'ceil' })
    }
    return formatAmount(marketCap, { roundMode: 'ceil', unit: dataUnit })
  }, [marketCap, dataUnit])

  return (
    <div
      className={cn(
        handleTextColor(transaction?.type),
        'flex items-center gap-0.5 min-w-[80px] whitespace-nowrap text-xs app-font-light',
      )}
    >
      {displayPriceType === DisplayPriceType.PRICE ? displayedPrice : displayedMarketCap}
    </div>
  )
}

export default PriceColumn
