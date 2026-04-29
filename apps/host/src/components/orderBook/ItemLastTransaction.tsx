import { cn } from '@/lib/utils.ts'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { DisplayPriceType, FilterTransactionAmountType } from '@/types/enums.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useTranslation } from 'react-i18next'
import { VolumeCell } from '@components/orderBook/VolumeCell.tsx'
import { MarketCapCell } from '@components/orderBook/MarketCapCell.tsx'
import { TimeCell } from '@components/orderBook/TimeCell.tsx'
import { useState } from 'react'

type ItemLastTransactionProps = {
  transaction: RealtimeTransaction
  currency: FilterTransactionAmountType
  maxPriceUsd: number
  totalSupply: number
  priceType: DisplayPriceType
  exclusive?: boolean
  baseSymbol: string
}

const ItemLastTransaction = ({
  transaction,
  currency,
  maxPriceUsd,
  totalSupply,
  priceType,
  exclusive = false,
  baseSymbol,
}: ItemLastTransactionProps) => {
  const { t } = useTranslation()
  const chainId = useActiveChainId()
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild onClick={() => setShowTooltip((prev) => !prev)}>
          <div
            data-source={transaction.source}
            className={cn(
              'relative grid grid-cols-5 gap-1 w-full font-[380] text-[11px] leading-none',
              exclusive ? 'opacity-50' : '',
            )}
          >
            <div
              className={cn(
                'absolute -top-[3px] left-0 h-[18px] -z-[1] max-w-full',
                transaction.type === RealtimeTransactionType.Buy ? 'bg-(image:--rise-transaction-bg)' : '',
                transaction.type === RealtimeTransactionType.Sell ? 'bg-(image:--fall-transaction-bg)' : '',
              )}
              style={{
                width: `${((Number(transaction?.usdPrice) * Number(transaction?.baseAmount)) / maxPriceUsd) * 100}%`,
              }}
            />

            <div className={cn('col-span-2')}>
              <VolumeCell
                transaction={transaction}
                chainId={chainId}
                currency={currency}
                exclusive={exclusive}
                baseSymbol={baseSymbol}
              />
            </div>
            <div className={cn('col-span-2')}>
              <MarketCapCell
                transaction={transaction}
                exclusive={exclusive}
                totalSupply={totalSupply}
                priceType={priceType}
              />
            </div>
            <TimeCell transaction={transaction} exclusive={exclusive} />
          </div>
        </TooltipTrigger>
        {exclusive && (
          <TooltipContent className="text-center">
            <p className="text-xs leading-none no-wrap">{t(`orderBook.exclusive.${transaction.reasonFiltering}`)}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

export default ItemLastTransaction
