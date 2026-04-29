import { formatAmount, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { ChainIds, FilterTransactionAmountType } from '@/types/enums.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/redux/store'
import { UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { getTokenSymbol } from '@/utils/token.ts'
import { selectQuoteSymbol } from '@/redux/modules/quoteSymbols.slice.ts'
import { priceChain } from '@/redux/modules/price.slice'
import { getNativeTokenByActiveChain } from '@/lib/blockchain'

export interface VolumeCellProps {
  transaction: RealtimeTransaction
  symbol: string
  currency?: FilterTransactionAmountType
  className?: string
}

const handleTextColor = (type: string) => {
  switch (type) {
    case RealtimeTransactionType.Buy:
      return 'text-rise'
    case RealtimeTransactionType.Sell:
      return 'text-fall'
    default:
      return 'text-[#CACACA]'
  }
}

const QuoteSymbol = (props: { quoteToken: string }) => {
  const { quoteToken } = props
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const quoteSymbolFromState = useAppSelector(selectQuoteSymbol(quoteToken))
  const quoteSymbol = getTokenSymbol(activeChainId, quoteToken, '--', true)
  return <>{quoteSymbolFromState || quoteSymbol}</>
}

export const VolumeCell = (props: VolumeCellProps) => {
  const { transaction, symbol, className } = props
  const usdAmount = transaction.volumeUsd
  const dataUnit = useAppSelector((state) => (state.userSettings as UserSettingsState).dataUnit)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const nativePrice = useAppSelector(priceChain(activeChain))
  const nativeAmount = useMemo(() => {
    if (transaction.nativeAmount) return transaction.nativeAmount
    if (usdAmount && nativePrice) {
      return usdAmount / nativePrice
    }
    return 0
  }, [transaction.nativeAmount, nativePrice, usdAmount])
  const nativeToken = getNativeTokenByActiveChain(activeChain)
  const { t } = useTranslation()

  if (
    transaction.type === RealtimeTransactionType.AddLiquidity ||
    transaction.type === RealtimeTransactionType.RemoveLiquidity
  ) {
    const { quoteAmount, baseAmount, quoteToken } = transaction
    const sign = transaction.type === RealtimeTransactionType.RemoveLiquidity ? '-' : '+'
    return (
      <div
        className={cn(
          'text-[calc(13rem/16)] font-medium text-white',
          // transaction.type === RealtimeTransactionType.AddLiquidity ? 'text-rise' : 'text-reduce',
          className,
        )}
      >
        <>
          {sign}
          {formatAmount(quoteAmount)} <QuoteSymbol quoteToken={quoteToken} />
          {` ${t('detail.tokenDetail.and')} `}
          {formatAmount(baseAmount, { unit: symbol })}
        </>
      </div>
    )
  }
  if (transaction.type === RealtimeTransactionType.Burn) {
    return (
      <div className={cn(handleTextColor(transaction?.type), 'text-[calc(13rem/16)] font-medium', className)}>
        -
        {formatAmount(transaction.baseAmount, {
          unit: symbol,
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        // handleTextColor(transaction?.type),
        'text-[calc(13rem/16)] whitespace-nowrap font-medium text-white',
        className,
      )}
    >
      {dataUnit !== 'USD'
        ? formatAmount(nativeAmount, {
            unit: nativeToken,
          })
        : usdAmount < 0.01
          ? '<$0.01'
          : formatVolume(usdAmount, {
              showCurrency: true,
            })}
    </div>
  )
}
