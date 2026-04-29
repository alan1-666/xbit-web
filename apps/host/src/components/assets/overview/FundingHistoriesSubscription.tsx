import { useSubscription } from '@/lib/mqtt'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { useAppDispatch } from '@/redux/store'
import { FundingType, TransferStatus } from '@/types/enums.ts'
import { getDrawerTitleFail, getDrawerTitleSuccess } from '@components/assets/transferDetails/drawerTitleHelpers.ts'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
import { ChainIds } from '@/types/enums.ts'
import { ChainType } from '@/@generated/gql/graphql-trading.ts'

const mapChainIdToChainType = (chainId: number): ChainType | string => {
  switch (chainId) {
    case ChainIds.Solana:
      return ChainType.Solana
    case ChainIds.Ethereum:
      return ChainType.Evm
    case ChainIds.Arbitrum:
      return ChainType.Evm
    case ChainIds.Bsc:
      return ChainType.Bsc
    case ChainIds.Hyperliquid:
    case ChainIds.HyperEVM:
      return 'Hyperliquid'
    default:
      return 'Unknown'
  }
}

const FundingHistoriesSubscription = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const userId = useSelector(_userInfo)?.userId
  const [latestTxHash, setLatestTxHash] = useState('')

  const { message: fundingHistoriesUpdated } = useSubscription(`users/${userId}/funding_histories_updated`, {
    shouldSkip: !userId,
  })

  const logSuccessEvent = (tx: any) => {
    const type = tx?.type
    switch (type) {
      case FundingType.Deposit:
      case FundingType.DepositFutureExternal:
        logEvent2(ACTIONS.deposit_success, {
          amount: tx?.amount || 0,
          chain_type: mapChainIdToChainType(+tx?.chainId),
          token: tx?.toToken ? tx?.toToken : tx?.token,
        })
        break
      case FundingType.Withdraw:
      case FundingType.WithdrawFutureExternal:
        logEvent2(ACTIONS.withdraw_success, {
          amount: tx?.amount || 0,
          chain_type: mapChainIdToChainType(+tx?.chainId),
          token: tx?.token,
        })
        break
      case FundingType.Swap:
      case FundingType.DepositFuture:
      case FundingType.WithdrawFuture:
        logEvent2(ACTIONS.transfer_success, {
          amount: tx?.amount || 0,
          from_account: tx?.from,
          to_account: tx?.to,
        })
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (!fundingHistoriesUpdated) return
    try {
      const message = fundingHistoriesUpdated?.message
      const data = JSON.parse(message?.toString() || '')
      if (data) {
        const latestTxData = data[0]
        if (latestTxData) {
          const type = latestTxData?.type
          const newLatestTxHash = latestTxData?.txHash
          const status = latestTxData?.status
          if (status === TransferStatus.Success) {
            logSuccessEvent(latestTxData)
          }
          if (status === TransferStatus.Failed || status === TransferStatus.Success) {
            const isFutureType = type === FundingType.DepositFuture || type === FundingType.WithdrawFuture
            if (isFutureType) {
              toast.dismiss()
            }
            if (newLatestTxHash !== latestTxHash) {
              const toastMethod = status === TransferStatus.Failed ? toast.error : toast.success
              const getTitle = status === TransferStatus.Failed ? getDrawerTitleFail : getDrawerTitleSuccess
              toastMethod(getTitle(t, latestTxData))
              setLatestTxHash(newLatestTxHash)
            }
            dispatch(exchangeActions.closeExchangeDialog())
          }
        }
      }
    } catch (error) {
      console.error('Error parsing fundingHistoriesUpdated:', error)
    }
  }, [fundingHistoriesUpdated, dispatch, t])

  return null
}

export default FundingHistoriesSubscription
