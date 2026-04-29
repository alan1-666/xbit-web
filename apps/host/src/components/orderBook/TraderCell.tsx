import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import TooltipTransaction from '@components/orderBook/TooltipTransaction.tsx'
import { cn } from '@/lib/utils.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { APP_PATH } from '@/lib/constant.ts'

export interface TraderCellProps {
  transaction: RealtimeTransaction
  chainId: number
  tokenAddress: string
  exclusive: boolean
  isHovered: boolean
  setIsHovered: (value: boolean) => void
}

export const TraderCell = (props: TraderCellProps) => {
  const { transaction, chainId, tokenAddress, exclusive, isHovered, setIsHovered } = props
  return (
    <div>
      <TooltipTransaction
        transaction={transaction}
        chainId={chainId}
        tokenAddress={tokenAddress}
        open={isHovered}
        setOpen={setIsHovered}
      >
        <a
          href={`${APP_PATH.MEME_WALLET}/${transaction.maker}?tab=Summary`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'text-[#FFFFFFCC] hover:text-[#843BEA] hover:underline font-mono',
            exclusive ? 'opacity-50' : '',
          )}
        >
          {formatAddressWallet(transaction.maker)}
        </a>
      </TooltipTransaction>
    </div>
  )
}
