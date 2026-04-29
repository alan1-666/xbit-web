import SwapStatus from '@/components/transfer/drawer/SwapStatus'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { ARB_USDC_ADDRESS, NATIVE_TOKEN_ADDRESS } from '@/lib/constant.ts'
import { useSubscription } from '@/lib/mqtt'
import { cn } from '@/lib/utils.ts'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { mappedChainTypeToChainId } from '@/redux/modules/newWallet.slice.ts'
import { useAppSelector } from '@/redux/store'
import { ChainIds, FundingType, TransferErrorCode, TransferStatus } from '@/types/enums.ts'
import { getBlockChainLogo, getBlockchainLogo2, getLinkExplorer, relayExplorer } from '@/utils/helpers'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { USDC_ADDRESS_ARBITRUM } from '@components/transfer/constants.ts'
import useGetPrices from '@hooks/useGetPrices.ts'
import { useResponsive } from '@hooks/useResponsive.ts'
import DrawerTitle from './DrawerTitle'
import { RecordStatus } from './RecordStatus'
import DepositWithdrawDetails from './DepositWithdrawDetails'
import { networkMap } from '@/lib/blockchain.ts'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import eventBus from '@/lib/eventBus.ts'

type Props = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  record: FundingRecord | null
}

const chainFeeMap: Record<number, string> = {
  [ChainIds.Solana]: 'SOL',
  [ChainIds.Ethereum]: 'ETH',
  [ChainIds.Arbitrum]: 'ETH',
  [ChainIds.Bsc]: 'BNB',
  [728126428]: 'TRX',
  [ChainIds.Hyperliquid]: 'USDC',
  [ChainIds.HyperEVM]: 'USDC',
  [ChainIds.Mon]: 'MON',
}

const networkLogo = (chainId: number) => {
  switch (chainId) {
    case ChainIds.Ethereum:
      return '/images/icons/chains/ic-ethereum.svg'
    case ChainIds.Arbitrum:
      return '/images/icons/chains/ic-arbitrum.svg'
    case ChainIds.Solana:
      return '/images/icons/chains/ic-solana.svg'
    case ChainIds.Bsc:
      return '/images/bsc.svg'
    case ChainIds.Mon:
      return '/images/icons/chains/ic-monad.svg'
    case ChainIds.Hyperliquid:
      return '/images/icons/chains/ic-hyperliquid.png'
    case ChainIds.HyperEVM:
      return '/images/icons/chains/ic-hyperliquid.png'
    case ChainIds.Polygon:
      return getBlockchainLogo2(ChainIds.Polygon)
    default:
      return ''
  }
}

const usePrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
      bnbPrice: priceList['BNB'],
      monPrice: priceList['MON'],
    }
  }, [priceList])
}

const SOL_ADDRESS = 'So11111111111111111111111111111111111111111'
const SOL_FEE = 0.000005
const NATIVE_ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const ETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const ARB_ETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const BNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_HYPERLIQUID_ADDRESS = '0x00000000000000000000000000000000'

const depositOrWithdrawTypes = [
  FundingType.Withdraw,
  FundingType.Deposit,
  FundingType.WithdrawFutureExternal,
  FundingType.DepositFutureExternal,
  FundingType.DepositPredictExternal,
  FundingType.WithdrawPredictExternal,
]

const TransferDetailBottomSheet = ({ open, setOpen, record }: Props) => {
  if (!record) return <></>
  const { t } = useTranslation()
  const [recordUpdated, setRecordUpdated] = useState<FundingRecord | null>({
    ...record,
  })
  const userId = useSelector(_userInfo)?.userId
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const { isDesktop } = useResponsive()

  const walletName = (walletAddress: string, chainId: number | string) => {
    if (chainId) {
      const walletData = listWalletsByChain.find(
        (item: any) =>
          item.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
          mappedChainTypeToChainId(item.chain) == chainId,
      )
      return walletData?.name || ''
    } else {
      const walletData = listWalletsByChain.find(
        (item: any) => item.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
      )
      return walletData?.name || ''
    }
  }
  const { logo: logoUrl, symbol: tokenSymbol } = useTokenInfo(record.token, Number(record.chainId))

  const { message: messageWithdrawUpdated, client: clientWithdrawUpdated } = useSubscription(
    `users/${userId}/withdraw_record_updated`,
  )
  const { message: messageFundingHistoriesUpdated, client: clientFundingHistoriesUpdated } = useSubscription(
    `users/${userId}/funding_histories_updated`,
  )

  useEffect(() => {
    if (!messageWithdrawUpdated) return
    try {
      const message = messageWithdrawUpdated?.message
      const data = JSON.parse(message?.toString() || '')
      if (data?.id === record?.id) {
        setRecordUpdated((prev) =>
          prev
            ? {
                ...prev,
                errorCode: data?.errorCode ?? prev.errorCode,
                status: data?.status ?? prev.status,
                txHash: data?.txid ?? prev.txHash,
                blockNumber: data?.blockNumber ?? prev.blockNumber,
                fee: data?.fee ?? prev.fee,
                toAmountUsd: data?.toAmountUsd ?? prev.toAmountUsd,
                toBlockNumber: data?.toBlockNumber ?? prev.toBlockNumber,
                toTxHash: data?.toTxHash ?? prev.toTxHash,
              }
            : prev,
        )
      }
    } catch (error) {
      return
    }
  }, [messageWithdrawUpdated])

  useEffect(() => {
    if (!messageFundingHistoriesUpdated) return
    try {
      const message = messageFundingHistoriesUpdated?.message
      const data = JSON.parse(message?.toString() || '')
      const isMatch = isFuturesWithdrawal
        ? data?.nonce === record?.nonce && data?.address === record?.address
        : data.id === record?.id
      if (typeof data === 'object' && data !== null && isMatch) {
        setRecordUpdated((prev) =>
          prev
            ? {
                ...prev,
                errorCode: data?.errorCode ?? prev.errorCode,
                status: data?.status ?? prev.status,
                txHash: data?.txHash ?? prev.txHash,
                blockNumber: data?.blockNumber ?? prev.blockNumber,
                fee: data?.fee ?? prev.fee,
                toAmountUsd: data?.toAmountUsd ?? prev.toAmountUsd,
                toBlockNumber: data?.toBlockNumber ?? prev.toBlockNumber,
                toTxHash: data?.toTxHash ?? prev.toTxHash,
              }
            : prev,
        )
      } else if (Array.isArray(data) && data.length > 0) {
        let updatedRecord
        if (isFuturesWithdrawal) {
          updatedRecord = data.find(
            (item: FundingRecord) => item?.nonce === record?.nonce && item?.address === record?.address,
          )
        } else {
          updatedRecord = data.find((item: FundingRecord) => item.id === record?.id)
        }
        if (updatedRecord) {
          setRecordUpdated((prev) =>
            prev
              ? {
                  ...prev,
                  errorCode: updatedRecord?.errorCode ?? prev.errorCode,
                  status: updatedRecord?.status ?? prev.status,
                  txHash: updatedRecord?.txHash ?? prev.txHash,
                  blockNumber: updatedRecord?.blockNumber ?? prev.blockNumber,
                  fee: updatedRecord?.fee ?? prev.fee,
                  toAmountUsd: updatedRecord?.toAmountUsd ?? prev.toAmountUsd,
                  toBlockNumber: updatedRecord?.toBlockNumber ?? prev.toBlockNumber,
                  toTxHash: updatedRecord?.toTxHash ?? prev.toTxHash,
                }
              : prev,
          )
        }
        return
      }
    } catch (error) {
      return
    }
  }, [messageFundingHistoriesUpdated])

  useEffect(() => {
    const handler = (data: any) => {
      const transactionId = data.data.transactionId
      const txHash = data.data.transactionHash
      setRecordUpdated((prev) => {
        if (!prev || prev?.id !== transactionId) return prev
        return {
          ...prev,
          status: TransferStatus.Success,
          txHash: txHash ?? prev.txHash,
        }
      })
    }
    eventBus.on('PREDICTION_WITHDRAW_CONFIRMED', handler)
    return () => {
      eventBus.remove('PREDICTION_WITHDRAW_CONFIRMED', handler)
    }
  }, [])

  const { solPrice, ethPrice, bnbPrice, monPrice } = usePrices()
  const priceMqtt = useMemo(() => {
    if (record.token === SOL_ADDRESS) return solPrice
    if (record.token === ETH_ADDRESS || record.token.toLowerCase() === NATIVE_TOKEN_ADDRESS.arb.WETH.toLowerCase()) {
      return ethPrice
    }
    if (record.token === NATIVE_ETH_ADDRESS) {
      if (+record.chainId === ChainIds.Bsc) {
        return bnbPrice
      }
      if (+record.chainId === ChainIds.Mon) {
        return monPrice
      }
      return ethPrice
    }
    if (record.token.toLowerCase() === BNB_ADDRESS.toLowerCase()) return bnbPrice
    if (record.token.toLowerCase() === ARB_USDC_ADDRESS.toLowerCase()) return 1
    if (record.token.toLowerCase() === NATIVE_TOKEN_ADDRESS.polygon.USDC.toLowerCase()) return 1
    return 0
  }, [solPrice, ethPrice, bnbPrice, record.token])

  const { data: fallbackPriceData } = useGetPrices({
    tokens: [record.token],
    chainId: +record.chainId,
  })
  const fallbackPrice = fallbackPriceData?.getPrices?.[0]?.price ?? 0

  const mapCodeToErrorMessage = (errorCode: TransferErrorCode | string) => {
    switch (errorCode) {
      case TransferErrorCode.BALANCE_INSUFFICIENT:
        return t('assets.withdrawal.insufficientBalanceError')
      case TransferErrorCode.TRANSACTION_SIGN_FAILED:
        return t('assets.withdrawal.signFailed')
      case TransferErrorCode.RPC_RATE_LIMITED:
        return t('assets.withdrawal.rpcRateLimited')
      case TransferErrorCode.RPC_ERROR:
        return t('assets.withdrawal.rpcError')
      case TransferErrorCode.UNCONFIRMED_TRANSACTION:
        return t('assets.withdrawal.unconfirmedTransaction')
      case TransferErrorCode.FEE_BUDGET:
        return t('assets.withdrawal.feeBudget')
      default:
        return t('assets.withdrawal.unknownError')
    }
  }

  const tokenLogo = useMemo(() => {
    if (record.token === SOL_ADDRESS) return '/images/icons/chains/ic-solana2.png'
    if (record.token === NATIVE_ETH_ADDRESS) {
      if (+record?.chainId === ChainIds.Bsc) {
        return '/images/bnb.svg'
      }
      if (+record?.chainId === ChainIds.Mon) {
        return '/images/icons/chains/ic-monad.svg'
      }
      return '/images/icons/chains/ic-ethereum.svg'
    }
    if (record.token === ETH_ADDRESS && +record.chainId === ChainIds.Ethereum) {
      return '/images/icons/chains/ic-ethereum.svg'
    }
    if (record.token === ARB_ETH_ADDRESS && +record.chainId === ChainIds.Arbitrum) {
      return '/images/icons/chains/ic-ethereum.svg'
    }
    if (
      (record.token.toLowerCase() === USDC_ADDRESS_ARBITRUM &&
        (+record.chainId === ChainIds.Arbitrum || +record.chainId === ChainIds.HyperEVM)) ||
      record.token.toLowerCase() === USDC_HYPERLIQUID_ADDRESS ||
      +record.chainId === ChainIds.Hyperliquid
    ) {
      return '/images/icons/chains/ic-usdc.svg'
    }
    if (record.token.toLowerCase() === BNB_ADDRESS.toLowerCase() && +record.chainId === ChainIds.Bsc) {
      return '/images/bnb.svg'
    }
    if (logoUrl) return logoUrl
    return getBlockChainLogo(+record.chainId, record.token)
  }, [record])

  const networkFee = useMemo(() => {
    if (recordUpdated?.fee) return Number(recordUpdated.fee)
    if (record.fee) return Number(record.fee)
    if (+record.chainId === ChainIds.Solana) return SOL_FEE
    return 0
  }, [record, recordUpdated])

  const isFuturesWithdrawal = useMemo(() => {
    return (
      +record.chainId === ChainIds.HyperEVM &&
      (record.type === FundingType.WithdrawFutureExternal || record.type === FundingType.WithdrawFuture)
    )
  }, [record])

  useEffect(() => {
    return () => {
      if (clientWithdrawUpdated) {
        clientWithdrawUpdated.unsubscribe(`users/${userId}/withdraw_record_updated`)
      }
      if (clientFundingHistoriesUpdated) {
        clientFundingHistoriesUpdated.unsubscribe(`users/${userId}/funding_histories_updated`)
      }
    }
  }, [])

  const isDepositOrWithdraw = useMemo(() => {
    return depositOrWithdrawTypes.includes(record.type as FundingType)
  }, [record.type])

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      drawerClassName={cn(isDesktop ? 'max-w-[600px]' : '')}
      isShowBgImg={false}
      leftIcon={isDesktop ? <div /> : <div className="size-6" />}
      drawerContentClassName={cn(isDesktop ? 'bg-[#212127]' : '')}
      drawerHeaderClassName={cn(isDesktop ? 'border-b border-[#ECECED14] pb-2 justify-start px-4 pl-6' : '')}
      titleClassName={cn(isDesktop ? 'flex-1 mb-0' : '')}
      title={<DrawerTitle record={record} recordUpdated={recordUpdated} isDesktop={isDesktop} />}
      drawerContent={
        <div className={cn(isDesktop ? 'px-3' : '')}>
          <div className="flex flex-col items-center">
            {isDesktop ? <RecordStatus recordUpdated={recordUpdated} record={record} /> : null}
            {recordUpdated?.status === TransferStatus.Failed && (
              <div className="mt-0.5 text-[13px] text-[#F23F58] leading-[1.4] text-left">
                {mapCodeToErrorMessage(recordUpdated?.errorCode)}
              </div>
            )}
          </div>
          {isDepositOrWithdraw ? (
            <DepositWithdrawDetails
              record={record}
              recordUpdated={recordUpdated}
              isDesktop={isDesktop}
              tokenLogo={tokenLogo}
              tokenSymbol={tokenSymbol}
              fallbackPrice={fallbackPrice}
              priceMqtt={priceMqtt}
              networkFee={networkFee}
              isFuturesWithdrawal={isFuturesWithdrawal}
              chainFeeMap={chainFeeMap}
              networkMap={networkMap}
              networkLogo={networkLogo}
              walletName={walletName}
            />
          ) : (
            <SwapStatus record={record} recordUpdated={recordUpdated} />
          )}
          {isDesktop ? (
            <a
              href={
                recordUpdated?.memo
                  ? relayExplorer(recordUpdated.memo)
                  : getLinkExplorer(
                      record.type === FundingType.DepositFutureExternal ||
                        recordUpdated?.type === FundingType.WithdrawFutureExternal
                        ? (recordUpdated?.toChainId ?? record.toChainId)
                        : +(recordUpdated?.chainId ?? record?.chainId),
                      record.type === FundingType.DepositFutureExternal ||
                        recordUpdated?.type === FundingType.WithdrawFutureExternal
                        ? (recordUpdated?.toTxHash ?? '')
                        : (recordUpdated?.txHash ?? ''),
                    )
              }
              target="_blank"
              rel="noopener noreferrer"
              className={
                recordUpdated?.memo
                  ? recordUpdated?.memo
                  : recordUpdated?.txHash
                    ? 'no-underline mt-6 block'
                    : 'no-underline mt-6 block pointer-events-none opacity-50'
              }
            >
              <button className="w-full bg-[#2B2B33] h-10 border rounded-full border-[#79778C29]">
                {t('notifications.viewOnExplorer')}
              </button>
            </a>
          ) : null}
        </div>
      }
    />
  )
}

export default TransferDetailBottomSheet
