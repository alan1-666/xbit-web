import SelectHistory from '@/components/assets/history/SelectHistory'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { APP_PATH } from '@/lib/constant.ts'
import { formatAmount } from '@/lib/format'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { useSubscription } from '@/lib/mqtt'
import { formatAddressWallet } from '@/lib/string.ts'
import { cn } from '@/lib/utils'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { mappedChainTypeToChainId } from '@/redux/modules/newWallet.slice.ts'
import { useAppSelector } from '@/redux/store'
import { ChainIds, FundingType, TransferStatus, TransferType } from '@/types/enums.ts'
import { UITab } from '@/types/uiTabs.ts'
import { getNameFromChainId } from '@/utils/chain'
import { getBlockChainLogo, getBlockchainLogo2, getLinkExplorer, relayExplorer } from '@/utils/helpers'
import { Loading } from '@components/common/Loading.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { USDC_ADDRESS_ARBITRUM } from '@components/transfer/constants.ts'
import { getFundingWalletHistory } from '@services/wallet.service.ts'
import { useInfiniteQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { TFunction } from 'i18next'
import { WalletTransferItem } from '@/@generated/gql/graphql-core.ts'

const tabs: UITab[] = [
  {
    label: 'exchange.deposit',
    value: 'deposit',
  },
  {
    label: 'exchange.withdrawal',
    value: 'withdraw',
  },
  {
    label: 'exchange.transfer',
    value: 'transfer',
  },
]

const NATIVE_ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const ETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const ARB_ETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const SOL_ADDRESS = 'So11111111111111111111111111111111111111111'
const BNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_HYPERLIQUID_ADDRESS = '0x00000000000000000000000000000000'
const USDC_POLYGON_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

const getTokenLogoByAddress = (chainId: string | number, token?: string) => {
  if (!token) {
    if (+chainId === ChainIds.HyperEVM || +chainId === ChainIds.Hyperliquid) {
      return '/images/icons/chains/ic-usdc.svg'
    }

    if ([ChainIds.Ethereum, ChainIds.Arbitrum, ChainIds.Base].includes(+chainId)) {
      return '/images/icons/chains/ic-ethereum.svg'
    }

    if (+chainId === ChainIds.Bsc) {
      return '/images/bnb.svg'
    }

    if (+chainId === ChainIds.Mon) {
      return '/images/icons/chains/ic-monad.svg'
    }

    return getBlockChainLogo(+chainId, SOL_ADDRESS)
  }

  if (token === SOL_ADDRESS) return '/images/icons/chains/ic-solana2.png'
  if (token === NATIVE_ETH_ADDRESS) {
    if (+chainId === ChainIds.Bsc) {
      return '/images/bnb.svg'
    }
    if (+chainId === ChainIds.Mon) {
      return '/images/icons/chains/ic-monad.svg'
    }
    return '/images/icons/chains/ic-ethereum.svg'
  }
  if (token === ETH_ADDRESS && +chainId === ChainIds.Ethereum) {
    return '/images/icons/chains/ic-ethereum.svg'
  }
  if (token === ARB_ETH_ADDRESS && +chainId === ChainIds.Arbitrum) {
    return '/images/icons/chains/ic-ethereum.svg'
  }

  if (
    token.toLowerCase() === USDC_ADDRESS_ARBITRUM &&
    (+chainId === ChainIds.Arbitrum || +chainId === ChainIds.HyperEVM)
  ) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  if (token.toLowerCase() === BNB_ADDRESS.toLowerCase() && +chainId === ChainIds.Bsc) {
    return '/images/bnb.svg'
  }
  if (token.toLowerCase() === USDC_HYPERLIQUID_ADDRESS || +chainId === ChainIds.Hyperliquid) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  if (token.toLowerCase() === USDC_POLYGON_ADDRESS.toLowerCase()) {
    return '/images/icons/chains/ic-usdc.svg'
  }
  return getBlockChainLogo(+chainId, token)
}

type AssetHistoryRecordItemProps = {
  record: any
  selectedTab: string
  t: any
  getUnit: (tokenAddress: string, chainId?: string | number, fallback?: string) => string
  walletName: (walletAddress: string, chainId: number | string) => string
  mapStatus: (status: TransferStatus) => string
}

const getDepositAccount = (type: FundingType, t: TFunction) => {
  switch (type) {
    case FundingType.Deposit:
      return t('assets.funding.meme')
    case FundingType.DepositPredictExternal:
      return t('assets.prediction.prediction')
    default:
      return t('assets.futures.futures')
  }
}

const getWithdrawAccount = (type: FundingType, t: TFunction) => {
  switch (type) {
    case FundingType.Withdraw:
      return t('assets.funding.meme')
    case FundingType.WithdrawPredictExternal:
      return t('assets.prediction.prediction')
    default:
      return t('assets.futures.futures')
  }
}

const DepositItem = (props: {
  record: WalletTransferItem
  getUnit: (tokenAddress: string, chainId?: string | number, fallback?: string) => string
  tokenSymbol?: string
}) => {
  const { record, getUnit, tokenSymbol } = props
  const toToken = record.toToken || record.token
  const tokenLogo = getTokenLogoByAddress(+record.chainId, toToken) ?? '/images/icons/chains/ic-usdc.svg'
  const { t } = useTranslation()
  const amount = useMemo(() => {
    if (record.type === FundingType.DepositFutureExternal || record.type === FundingType.DepositPredictExternal) {
      return record?.toAmount ?? record.amount
    }
    return record.amount
  }, [record])

  const unit = useMemo(() => {
    if (record.type === FundingType.DepositFutureExternal) {
      return 'USDC'
    }
    if (record.type === FundingType.DepositPredictExternal) {
      return getUnit(toToken, ChainIds.Polygon)
    }
    return getUnit(record?.token, record.chainId, tokenSymbol)
  }, [record, getUnit, tokenSymbol])

  return (
    <>
      <div className="text-[11px] leading-4 text-[#908E98]">
        {dayjs(record.timestamp * 1000).format('MM/DD/YYYY HH:mm:ss')}
      </div>
      <div className="font-semibold text-[14px] leading-5.5 flex items-center gap-1">
        <LogoWithChain
          logo={record.type === FundingType.DepositFutureExternal ? '/images/icons/chains/ic-usdc.svg' : tokenLogo}
          logoClassName="min-w-4 size-4"
          name={getUnit(record.token, record.chainId, tokenSymbol)}
        />
        <span>
          {formatAmount(amount, {
            unit: unit,
          })}
        </span>
      </div>
      <div className="text-[11px] leading-4 text-[#908E98] flex items-center gap-1">
        <span>{t('exchange.from')}:</span>
        <LogoWithChain
          logo={getBlockchainLogo2(record?.chainId)}
          name={getNameFromChainId(record?.chainId)}
          logoClassName="min-w-3 size-3"
        />
        <span>{formatAddressWallet(record.from)}</span>
      </div>
      <span className="border-[0.1px] border-[#9D9CA2] px-3.75 py-0.5 rounded-xl font-medium text-[11px] text-[#908E98] leading-3">
        {getDepositAccount(record?.type as FundingType, t)}
      </span>
    </>
  )
}

const AssetHistoryRecordItem = ({
  record,
  selectedTab,
  t,
  getUnit,
  walletName,
  mapStatus,
}: AssetHistoryRecordItemProps) => {
  const tokenLogo = getTokenLogoByAddress(+record.chainId, record.token) ?? '/images/icons/chains/ic-usdc.svg'
  const toTokenLogo = getTokenLogoByAddress(+record.toChainId, record.toToken) ?? '/images/icons/chains/ic-usdc.svg'
  const toAmount = record?.depositAmount ? record?.depositAmount : record.toAmount
  const { symbol: tokenSymbol } = useTokenInfo(record.token, Number(record.chainId))

  return (
    <div className="relative bg-[#17171B] rounded-[10px] px-3.75 py-2.5 space-y-2">
      {selectedTab === 'deposit' && <DepositItem record={record} getUnit={getUnit} />}
      {selectedTab === 'withdraw' && (
        <>
          <div className="text-[11px] leading-4 text-[#908E98]">
            {dayjs(record.timestamp * 1000).format('MM/DD/YYYY HH:mm:ss')}
          </div>
          <div className="font-semibold text-[14px] leading-5.5 flex items-center gap-1">
            <LogoWithChain
              logo={record.type === FundingType.DepositFutureExternal ? '/images/icons/chains/ic-usdc.svg' : tokenLogo}
              logoClassName="min-w-4 size-4"
              name={getUnit(record.token, record.chainId, tokenSymbol)}
            />
            <span>
              {formatAmount(record.amount, {
                unit: getUnit(record?.token, record.chainId, tokenSymbol),
              })}
            </span>
          </div>
          <div className="text-[11px] leading-4 text-[#908E98] flex items-center gap-1">
            <span>{t('exchange.to')}:</span>
            <LogoWithChain
              logo={getBlockchainLogo2(record?.toChainId ?? record.chainId)}
              name={getNameFromChainId(record?.toChainId ?? record.chainId)}
              logoClassName="min-w-3 size-3"
            />
            <span>{formatAddressWallet(record.to)}</span>
          </div>
          <span className="border-[0.1px] border-[#9D9CA2] px-3.75 py-0.5 rounded-xl font-medium text-[11px] text-[#908E98] leading-3">
            {getWithdrawAccount(record?.type, t)}
          </span>
        </>
      )}
      {selectedTab === 'transfer' && (
        <>
          <div className="text-[11px] leading-4 text-[#908E98]">
            {dayjs(record.timestamp * 1000).format('MM/DD/YYYY HH:mm:ss')}
          </div>
          <div className="font-semibold text-[14px] leading-5.5 flex items-center gap-1">
            <LogoWithChain
              logo={tokenLogo}
              logoClassName="min-w-4 size-4"
              name={getUnit(record.token, record.chainId)}
            />
            <span>
              {formatAmount(record.amount, {
                unit: getUnit(record?.token, record.chainId),
              })}
            </span>
            <span className="text-[#908E98]">→</span>
            <LogoWithChain
              logo={toTokenLogo}
              logoClassName="min-w-4 size-4"
              name={getUnit(record.toToken, record.toChainId)}
            />
            <span>
              {formatAmount(toAmount, {
                unit: getUnit(record?.toToken, record.toChainId),
              })}
            </span>
          </div>
          <div className="text-[11px] leading-4 text-[#908E98] flex items-center gap-1">
            <span>{t('exchange.from')}:</span>
            <LogoWithChain
              logo={getBlockchainLogo2(
                record.chainId == ChainIds.HyperEVM || record.chainId == ChainIds.Hyperliquid
                  ? ChainIds.Hyperliquid
                  : record?.chainId,
              )}
              logoClassName="min-w-3 size-3"
              name={getNameFromChainId(
                record.chainId == ChainIds.HyperEVM || record.chainId == ChainIds.Hyperliquid
                  ? ChainIds.Hyperliquid
                  : record?.chainId,
              )}
            />
            <span>
              {getNameFromChainId(
                record.chainId == ChainIds.HyperEVM || record.chainId == ChainIds.Hyperliquid
                  ? ChainIds.Hyperliquid
                  : record?.chainId,
              )}{' '}
              {record.chainId == ChainIds.HyperEVM || record.chainId == ChainIds.Hyperliquid
                ? t('assets.futures.futures')
                : walletName(record.from, record.chainId)}
            </span>
          </div>
          <div className="text-[11px] leading-4 text-[#908E98] flex items-center gap-1">
            {t('exchange.to')}:
            <LogoWithChain
              logo={getBlockchainLogo2(
                record.toChainId == ChainIds.HyperEVM || record.toChainId == ChainIds.Hyperliquid
                  ? ChainIds.Hyperliquid
                  : record?.toChainId,
              )}
              logoClassName="min-w-3 size-3"
              name={getNameFromChainId(
                record.toChainId == ChainIds.HyperEVM || record.toChainId == ChainIds.Hyperliquid
                  ? ChainIds.Hyperliquid
                  : record?.toChainId,
              )}
            />
            <span>
              {getNameFromChainId(
                record.toChainId == ChainIds.HyperEVM || record.toChainId == ChainIds.Hyperliquid
                  ? ChainIds.Hyperliquid
                  : record?.toChainId,
              )}{' '}
              {record.toChainId == ChainIds.HyperEVM || record.toChainId == ChainIds.Hyperliquid
                ? t('assets.futures.futures')
                : walletName(record.to, record.toChainId)}
            </span>
          </div>
        </>
      )}
      {record.status === TransferStatus.Failed && (
        <div className="mt-2 font-medium text-[9px] leading-4 text-[#FFC767]">{t('exchange.refunds')}</div>
      )}
      {record.status === TransferStatus.Success ? (
        <a
          href={
            record?.memo
              ? relayExplorer(record.memo)
              : getLinkExplorer(
                  record.type === FundingType.DepositFutureExternal ||
                    record?.type === FundingType.WithdrawFutureExternal
                    ? (record?.toChainId ?? record.toChainId)
                    : +(record?.chainId ?? record?.chainId),
                  record.type === FundingType.DepositFutureExternal ||
                    record?.type === FundingType.WithdrawFutureExternal
                    ? (record?.toTxHash ?? record?.txHash ?? '')
                    : (record?.txHash ?? ''),
                )
          }
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-2.5 font-medium text-[11px] leading-2.5 text-[#C8A7FD] underline"
        >
          {t('notifications.viewOnExplorer')}
        </a>
      ) : (
        <span
          className={cn(
            'absolute top-3 right-2.5 px-[7.5px] py-0.5 font-medium text-[11px] leading-2.5 rounded-xl',
            record.status === TransferStatus.Failed && 'bg-[#2B2B33] text-[#FFC767]',
            record.status === TransferStatus.Processing && 'bg-[#843BEA]',
          )}
        >
          {mapStatus(record.status)}
        </span>
      )}
    </div>
  )
}

const AssetHistory = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { chainId, wallet } = location.state || {}
  const navigate = useNavigate()
  const userId = useSelector(_userInfo)?.userId
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const [selectedTab, setSelectedTab] = useState(tabs[0].value || 'deposit')

  const side = useMemo(() => {
    const search = location.search || ''
    if (search.includes('page=futures') || search.includes('page=perps')) {
      return 'perps'
    }
    if (search.includes('page=funding') || search.includes('page=meme')) {
      return 'meme'
    }
    if (search.includes('page=prediction')) {
      return 'prediction'
    }
    return undefined
  }, [location.search])

  const types = useMemo(() => {
    switch (selectedTab) {
      case 'deposit':
        if (side === 'meme') {
          return [TransferType.Deposit]
        }
        if (side === 'perps') {
          return [TransferType.DepositFutureExternal]
        }
        if (side === 'prediction') {
          return [TransferType.PredictionDepositExternal]
        }
        return [TransferType.Deposit, TransferType.DepositFutureExternal, TransferType.PredictionDepositExternal]
      case 'withdraw':
        if (side === 'meme') {
          return [TransferType.Withdraw]
        }
        if (side === 'perps') {
          return [TransferType.WithdrawFutureExternal]
        }
        if (side === 'prediction') {
          return [TransferType.PredictionWithdrawExternal]
        }
        return [TransferType.Withdraw, TransferType.WithdrawFutureExternal, TransferType.PredictionWithdrawExternal]
      case 'transfer':
        if (side === 'meme') {
          return [TransferType.Swap]
        }
        if (side === 'perps') {
          return [TransferType.Swap, TransferType.DepositFuture, TransferType.WithdrawFuture]
        }
        if (side === 'prediction') {
          return [TransferType.Other] // TODO: Add prediction transfer type when it's ready
        }
        return [TransferType.Swap, TransferType.DepositFuture, TransferType.WithdrawFuture]
      default:
        return undefined
    }
  }, [selectedTab, side])

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: ['AssetsHistory', types, wallet, chainId],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await gqlClient.query({
        query: getFundingWalletHistory,
        variables: {
          input: {
            limit: 20,
            page: pageParam,
            types: types,
            walletAddress: wallet,
            chainId: chainId,
          },
        },
      })
      return response.data.getFundingWalletHistory || []
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined
    },
  })

  const records = useMemo(() => {
    if (!data || data.pages?.length === 0) return []
    return data.pages.flat()
  }, [data])

  const { message: messageWithdrawStatisticsUpdate } = useSubscription(`users/${userId}/withdraw_statistics_updated`, {
    clientOptions: { qos: 1 },
    shouldSkip: !userId,
  })
  const { message: messageFundingHistoriesUpdated } = useSubscription(`users/${userId}/funding_histories_updated`, {
    shouldSkip: !userId,
  })

  useEffect(() => {
    if (!messageWithdrawStatisticsUpdate) return
    try {
      const message = messageWithdrawStatisticsUpdate?.message
      const data = JSON.parse(message?.toString() || '')
      if (data) {
        setTimeout(() => {
          refetch()
        })
      }
    } catch (error) {
      console.error('Error parsing messageWithdrawStatisticsUpdate:', error)
    }
  }, [messageWithdrawStatisticsUpdate])

  useEffect(() => {
    if (!messageFundingHistoriesUpdated) return
    try {
      const message = messageFundingHistoriesUpdated?.message
      const data = JSON.parse(message?.toString() || '')
      if (data) {
        setTimeout(() => {
          refetch()
        })
      }
    } catch (error) {
      console.error('Error parsing messageFundingHistoriesUpdated:', error)
    }
  }, [messageFundingHistoriesUpdated])

  const getUnit = (tokenAddress: string, chainId?: string | number, fallback?: string) => {
    if (!tokenAddress && !chainId) return 'USDC'

    if (!tokenAddress && chainId) {
      switch (+chainId) {
        case ChainIds.Ethereum:
        case ChainIds.Arbitrum:
        case ChainIds.Base:
          return 'ETH'
        case ChainIds.Solana:
          return 'SOL'
        case ChainIds.Bsc:
          return 'BNB'
        case ChainIds.Mon:
          return 'MON'
        default:
          return 'USDC'
      }
    }

    if (!tokenAddress) return 'USDC'
    switch (tokenAddress.toLowerCase()) {
      case SOL_ADDRESS.toLowerCase():
        return 'SOL'
      case ETH_ADDRESS.toLowerCase():
        return 'ETH'
      case ARB_ETH_ADDRESS.toLowerCase():
        return 'ETH'
      case NATIVE_ETH_ADDRESS.toLowerCase():
        if (chainId && +chainId === ChainIds.Bsc) {
          return 'BNB'
        }
        if (chainId && +chainId === ChainIds.Mon) {
          return 'MON'
        }
        return 'ETH'
      case USDC_ADDRESS_ARBITRUM.toLowerCase():
        return 'USDC'
      case '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'.toLowerCase():
        return 'USDC' // Fallback for USDC.e
      case USDC_POLYGON_ADDRESS.toLowerCase():
        return 'USDC'
      case BNB_ADDRESS.toLowerCase():
        return 'BNB'
      case USDC_HYPERLIQUID_ADDRESS.toLowerCase():
        return 'USDC'
      default:
        return fallback || '--'
    }
  }

  const mapStatus = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.Success:
        return t('exchange.success')
      case TransferStatus.Failed:
        return t('exchange.failed')
      default:
        return t('exchange.processing')
    }
  }

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

  const nodataText = useMemo(() => {
    switch (selectedTab) {
      case 'deposit':
        return t('exchange.noDeposit')
      case 'withdraw':
        return t('exchange.noWithdrawal')
      case 'transfer':
        return t('exchange.noTransfer')
      default:
        return t('exchange.noDeposit')
    }
  }, [selectedTab, t])

  const note = useMemo(() => {
    switch (selectedTab) {
      case 'deposit':
        return t('exchange.depositNote')
      case 'withdraw':
        return t('exchange.withdrawalNote')
      case 'transfer':
        return t('exchange.transferNote')
      default:
        return t('exchange.depositNote')
    }
  }, [selectedTab, t])

  const [openSelectHistory, setOpenSelectHistory] = useState(false)

  return (
    <div className="flex max-h-screen h-screen flex-col overflow-hidden bg-[#0A0A0A] text-white">
      <div className="fixed top-0 left-0 w-full z-10 bg-[#0A0A0A]">
        <div className="flex items-center justify-between">
          <div className="max-w-3xl mx-auto flex items-center justify-between w-full p-4">
            <div className="w-24">
              <img
                src="/images/icons/arrow-left.svg"
                className="w-6 h-6 cursor-pointer"
                alt="arrow-left"
                onClick={() => {
                  const page = new URLSearchParams(location?.search).get('page')
                  const path = page ? APP_PATH.ASSETS + `/${page}` : APP_PATH.ASSETS
                  const searchParams = new URLSearchParams()
                  if (page) {
                    searchParams.set('main', page)
                  }
                  const url = `${path}?${searchParams.toString()}`
                  navigate(url, {
                    state: { chainId, wallet },
                  })
                }}
              />
            </div>
            <div
              className="flex gap-1 items-center cursor-pointer"
              onClick={() => {
                side && setOpenSelectHistory(true)
              }}
            >
              <div className="text-[calc(18rem/16)] leading-6 font-medium flex items-center gap-2">
                <span className="whitespace-nowrap">{t('assets.history.assetHistory')}</span>
                {side && <img src="/images/icons/arrow-down3.svg" className="w-3" alt="arrow-down" />}
              </div>
            </div>
            <div className="w-24 flex items-center justify-end"></div>
          </div>
        </div>
        <MovingLineTabs
          tabs={tabs.map((tab) => ({
            label: t(tab.label),
            value: tab.value,
          }))}
          defaultTab={selectedTab}
          onTabChange={(tab) => setSelectedTab(tab)}
          containerClassName="max-w-3xl mx-auto justify-start bg-transparent"
          showContainerBottomLine={false}
          tabLineClassName="before:h-[5px] before:rounded-t-[5px] before:bg-[#843BEA]"
        />
      </div>
      <>
        {records.length === 0 && !isLoading ? (
          <div className="p-4 flex flex-col items-center justify-center h-[calc(100vh-190px)]">
            <div className="font-semibold text-[14px] leading-5.5">{nodataText}</div>
            <div className="text-[11px] text-[#908E98] leading-4">{note}</div>
          </div>
        ) : (
          <div
            className="no-scrollbar pb-4 px-4 pt-27 space-y-2 overflow-auto"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement
              if (target.scrollTop + target.clientHeight >= target.scrollHeight * 0.75) {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage()
                }
              }
            }}
          >
            {records.map((record) => (
              <AssetHistoryRecordItem
                key={record?.id}
                record={record}
                selectedTab={selectedTab}
                t={t}
                getUnit={getUnit}
                walletName={walletName}
                mapStatus={mapStatus}
              />
            ))}
            {(hasNextPage || isLoading) && (
              <div className="flex justify-center items-center py-4">
                <Loading />
              </div>
            )}
          </div>
        )}
      </>
      <SelectHistory
        open={openSelectHistory}
        setOpen={setOpenSelectHistory}
        onSelected={(type: string) => {
          if (type === 'assetHistory') {
            navigate(APP_PATH.ASSET_HISTORY + (side ? `?page=${side}` : ''), {
              state: { wallet, chainId },
            })
          } else if (type === 'tradeHistory') {
            side === 'prediction'
              ? navigate(APP_PATH.PREDICTION_PORTFOLIO + '?page=prediction')
              : navigate(APP_PATH.TRADE_HISTORY + (side ? `?page=${side}` : ''), {
                  state: { wallet, chainId },
                })
          }
        }}
      />
    </div>
  )
}

export default AssetHistory
