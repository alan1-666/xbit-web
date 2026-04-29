import { useMemo } from 'react'
import WalletAddress from './WalletAddress'
import { ChainIds } from '@/types/enums.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useAppDispatch } from '@/redux/store'
import { setAddress } from '@/redux/modules/tokenDetail.slice.ts'
import { useCurrentPrice } from '@components/detaiTokenTable/hooks/useCurrentPrice.ts'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import { WalletAddressWithTooltip } from './WalletAddressPC'

export interface WalletCellProps {
  transaction: RealtimeTransaction
  address: string
  tokenAddress: string
  price?: string
  walletInfo?: {
    label: string | undefined
    holdingPercentage: number
    totalTxs24h: number
  }
  isPc?: boolean
  isFollowingWallet?: boolean
  txHash?: string
}

export const WalletCell = (props: WalletCellProps) => {
  const { transaction, address, tokenAddress, price, walletInfo, isPc, isFollowingWallet, txHash } = props
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const dispatch = useAppDispatch()
  const currentPrice = useCurrentPrice({
    initialPrice: price,
    tokenAddress: tokenAddress,
  })

  const walletAttributes = useMemo(() => {
    return {
      isDev: walletInfo?.label === 'Dev' || transaction?.isDev,
      isWhale: walletInfo?.label === 'Whale' || transaction?.isWhale,
      isInsider: walletInfo?.label === 'Insider' || transaction?.isInsider,
      isNativeWallet: walletInfo?.label === 'SameSource' || transaction?.isBundler,
      isTop10: walletInfo?.label?.startsWith('Top') || transaction?.isTopTrader,
      isSmartMoney: walletInfo?.label === 'SmartMoney' || transaction?.isSmartMoney,
      isKOL: walletInfo?.label === 'KOL' || transaction?.isKOL,
      isNewWallet: walletInfo?.label === 'Fresh' || transaction?.isNewWallet,
      topHolder: walletInfo?.label ? walletInfo.label.replace('Top', '') : undefined,
    }
  }, [transaction, walletInfo])

  const holdingPercentage = useMemo(() => {
    if (walletInfo?.holdingPercentage) return +walletInfo.holdingPercentage
    return transaction?.holderPct ? +transaction.holderPct : 0
  }, [transaction, walletInfo])
  return (
    <>
      {isPc ? (
        <WalletAddressWithTooltip
          txHash={txHash}
          isFollowingWallet={isFollowingWallet}
          tokenAddress={tokenAddress}
          address={transaction?.maker}
          walletAttributes={walletAttributes}
          tx24h={walletInfo?.totalTxs24h || transaction?.txCount || 0}
          selectedWallet={address}
          holdingPercentage={holdingPercentage}
          onFilterClick={() => {
            if (!address) {
              dispatch(setAddress(transaction?.maker))
            } else {
              dispatch(setAddress(''))
            }
          }}
        />
      ) : (
        <WalletAddress
          address={transaction?.maker}
          walletAttributes={walletAttributes}
          tx24h={walletInfo?.totalTxs24h || transaction?.txCount || 0}
          selectedWallet={address}
          chainId={activeChainId}
          holdingPercentage={holdingPercentage}
          token={tokenAddress}
          currentPrice={currentPrice.toString()}
          onFilterClick={() => {
            if (!address) {
              dispatch(setAddress(transaction?.maker))
            } else {
              dispatch(setAddress(''))
            }
          }}
        />
      )}
    </>
  )
}
