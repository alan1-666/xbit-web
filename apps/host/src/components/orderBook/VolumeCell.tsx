import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { ChainIds, FilterTransactionAmountType } from '@/types/enums.ts'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { formatAmount, formatVolume } from '@/lib/format.ts'
import { getTokenSymbol } from '@/utils/token.ts'
import { cn } from '@/lib/utils.ts'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import IconSol from '@components/orderBook/IconSol.tsx'
import { ReactNode, useMemo } from 'react'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { selectQuoteSymbol } from '@/redux/modules/quoteSymbols.slice.ts'

export interface VolumeCellProps {
  transaction: RealtimeTransaction
  exclusive: boolean
  currency: FilterTransactionAmountType
  chainId: number | undefined
  delimiter?: string
  baseSymbol: string
  volumeUSDSmall: number
}

const unitMap: Record<number, ReactNode> = {
  [ChainIds.Solana]: <img src="/images/orderBook/icon-sol.png" alt="icon sol" className="size-3" />,
  [ChainIds.Ethereum]: <img src="/images/icons/chains/ic-ethereum.svg" className="size-3" alt="" />,
  [ChainIds.Bsc]: <img src="/images/icons/chains/ic-bnb.svg" className="size-3" alt="" />,
  [ChainIds.Mon]: <img src="/images/icons/chains/ic-monad.svg" className="size-3" alt="" />,
}

const Amount = (props: { amount: number; chainId: number }) => {
  const { amount, chainId } = props
  return (
    <span className="flex items-center gap-[1px]">
      {unitMap[chainId] || <IconSol />}
      {formatAmount(amount, {})}
    </span>
  )
}

const LiquidityTx = (props: {
  transaction: RealtimeTransaction
  delimiter: string | undefined
  baseSymbol: string
}) => {
  const { transaction, delimiter = '/', baseSymbol } = props
  const baseAmount = formatAmount(+transaction.baseAmount)
  const quoteAmount = formatAmount(+transaction.quoteAmount)
  const quoteToken = transaction.quoteToken
  const hasBase = +transaction.baseAmount > 0
  const hasQuote = +transaction.quoteAmount > 0
  const bothZero = !hasBase && !hasQuote
  const sign = transaction.type === RealtimeTransactionType.AddLiquidity ? '+' : '-'
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const quoteSymbolFromState = useAppSelector(selectQuoteSymbol(quoteToken))
  const quoteSymbol = useMemo(() => {
    return quoteSymbolFromState || getTokenSymbol(activeChainId, quoteToken, '--', true)
  }, [activeChainId, quoteSymbolFromState, quoteToken])
  const tooltipContent = `${quoteAmount} ${quoteSymbol} ${delimiter} ${baseAmount} ${baseSymbol}`
  return (
    <SimpleTooltip content={tooltipContent}>
      <div className="flex items-center h-full">
        <div
          className={cn(
            'max-w-full whitespace-nowrap break-keep overflow-x-auto no-scrollbar flex items-center gap-1 h-full',
            transaction.type === RealtimeTransactionType.AddLiquidity ? 'text-rise' : 'text-reduce',
          )}
        >
          {(hasQuote || bothZero) && (
            <span>
              {sign}
              {quoteAmount} {quoteSymbol}
            </span>
          )}
          {(hasBase && hasQuote) || bothZero ? delimiter : ''}
          {(hasBase || bothZero) && (
            <span>
              {sign}
              {baseAmount}
              {` ${baseSymbol}`}
            </span>
          )}
        </div>
      </div>
    </SimpleTooltip>
  )
}

export const VolumeCell = (props: VolumeCellProps) => {
  const { transaction, exclusive, currency, chainId, delimiter = '/', baseSymbol, volumeUSDSmall } = props
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const usdValue = transaction.volumeUsd

  if (
    transaction.type === RealtimeTransactionType.AddLiquidity ||
    transaction.type === RealtimeTransactionType.RemoveLiquidity
  ) {
    return <LiquidityTx delimiter={delimiter} transaction={transaction} baseSymbol={baseSymbol} />
  }

  if (transaction.type === RealtimeTransactionType.Burn) {
    return (
      <div className="flex items-center h-full">
        <span className="text-white">
          -{formatAmount(+transaction.baseAmount)} {baseSymbol}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center',
        transaction?.type === RealtimeTransactionType.Buy ? 'text-rise' : 'text-fall',
        exclusive ? 'opacity-50' : '',
      )}
    >
      {!priceNativeToken || priceNativeToken === 0 ? (
        <div className="flex items-center scale-75">
          <Loader />
        </div>
      ) : currency === FilterTransactionAmountType.USDT ? (
        <span className="flex items-center gap-[1px] min-h-3">
          {usdValue < volumeUSDSmall
            ? `<$${formatVolume(volumeUSDSmall, {})}`
            : formatVolume(usdValue, {
                showCurrency: true,
              })}
        </span>
      ) : (
        <Amount amount={+transaction.nativeAmount} chainId={chainId ? +chainId : ChainIds.Solana} />
      )}
    </div>
  )
}
