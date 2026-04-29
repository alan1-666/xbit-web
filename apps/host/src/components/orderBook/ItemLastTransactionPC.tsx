import { cn } from '@/lib/utils.ts'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { ChainIds, DisplayPriceType, FilterTransactionAmountType } from '@/types/enums.ts'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VolumeCell } from '@components/orderBook/VolumeCell.tsx'
import { MarketCapCell } from '@components/orderBook/MarketCapCell.tsx'
import { TraderCell } from '@components/orderBook/TraderCell.tsx'
import { TimeCell } from '@components/orderBook/TimeCell.tsx'
import { useAppSelector } from '@/redux/store'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { formatVolume } from '@/lib/format'

type ItemLastTransactionProps = {
  chainId: ChainIds
  transaction: RealtimeTransaction
  currency: FilterTransactionAmountType
  maxPriceUsd: number
  totalSupply: number
  priceType: DisplayPriceType
  exclusive?: boolean
  tokenAddress: string
  baseSymbol: string
  exclusiveReason?: string
}

const ItemLastTransaction = ({
  chainId,
  transaction,
  currency,
  maxPriceUsd,
  totalSupply,
  priceType,
  tokenAddress,
  exclusive = false,
  baseSymbol,
  exclusiveReason,
}: ItemLastTransactionProps) => {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const getVolumeSmallByActiveChain = (chain: string): number => {
    switch (chain) {
      case TYPE_CHAIN.SOLANA:
        return 0.01
      case TYPE_CHAIN.BSC:
        return 0.01
      case TYPE_CHAIN.MON:
        return 0.0000001
      default:
        return 0.01
    }
  }

  const volumeUSDSmall = useMemo(() => {
    return getVolumeSmallByActiveChain(activeChain)
  }, [activeChain])

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            data-source={transaction.source}
            className={cn(
              'size-full grid grid-cols-4 gap-1 font-[330] text-[12px] !leading-1 items-center relative',
              exclusive ? 'opacity-50' : '',
            )}
          >
            <div
              className={cn(
                'absolute left-0 inset-x-0 h-[20px] -z-[1] max-w-full',
                transaction.type === RealtimeTransactionType.Buy ? 'bg-(image:--rise-transaction-bg)' : '',
                transaction.type === RealtimeTransactionType.Sell ? 'bg-(image:--fall-transaction-bg)' : '',
              )}
              style={{
                width: `${((Number(transaction?.usdPrice) * Number(transaction?.baseAmount)) / maxPriceUsd) * 100}%`,
              }}
            />

            <VolumeCell
              transaction={transaction}
              chainId={chainId}
              currency={currency}
              exclusive={exclusive}
              delimiter={` ${t('detail.tokenDetail.and')} `}
              baseSymbol={baseSymbol}
              volumeUSDSmall={volumeUSDSmall}
            />

            <MarketCapCell
              transaction={transaction}
              exclusive={exclusive}
              totalSupply={totalSupply}
              priceType={priceType}
            />
            <TraderCell
              transaction={transaction}
              chainId={chainId}
              tokenAddress={tokenAddress}
              exclusive={exclusive}
              isHovered={isHovered}
              setIsHovered={setIsHovered}
            />
            <TimeCell transaction={transaction} exclusive={exclusive} />
          </div>
        </TooltipTrigger>
        {exclusive && (
          <TooltipContent className="text-center">
            <p className="text-xs leading-none no-wrap">
              {t(`orderBook.exclusive.${transaction.reasonFiltering || exclusiveReason}`, {
                value: formatVolume(volumeUSDSmall),
              })}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </>
  )
}

export default ItemLastTransaction
