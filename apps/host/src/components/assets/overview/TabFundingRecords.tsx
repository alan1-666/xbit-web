import { LoadingSpinnerGradient } from '@/components/ui/loading-spinner'
import { useTxDetail } from '@/hooks/useTxDetail'
import { ARB_USDC_ADDRESS_V2 } from '@/lib/constant.ts'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { useSubscription } from '@/lib/mqtt'
import { formatAddressWallet } from '@/lib/string.ts'
import { cn } from '@/lib/utils.ts'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { ChainIds, FundingType, TransferStatus, TransferType } from '@/types/enums.ts'
import { AssetSelect } from '@components/assets/overview/AssetSelect.tsx'
import { TypesSelect } from '@components/assets/overview/TypesSelect.tsx'
import { Loading } from '@components/common/Loading.tsx'
import { IconEmpty } from '@components/icon'
import { getFundingWalletHistory } from '@services/wallet.service.ts'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import CountdownTimer from './CountdownTimer'
import { TFunction } from 'i18next'
import { FundingRecordTokenLogos } from '@components/assets/overview/FundingRecordTokenLogos.tsx'
import { SOL_ADDRESS } from '@components/assets/overview/funding-records/utils.ts'
import { FundingRecordAmount } from '@components/assets/overview/funding-records/FundingRecordAmount.tsx'

export interface FundingRecord {
  id: string
  createdAt: string
  timestamp: number
  address: string
  type: FundingType | string
  status: TransferStatus
  token: string
  chainId: number | string
  tokenAccount: string
  from: string
  to: string
  txHash: string
  errorMessage: string
  errorCode: string
  rawBalance?: string
  nativeBalance?: string
  balance?: string
  amount?: string
  amountUsd?: string
  fee?: string
  rawFee?: number
  blockNumber?: number
  toBlockNumber?: number
  toChainId: number
  toToken: string
  toAmount: number
  toAmountUsd?: number
  route: string
  crossChainFee: number
  crossChainFeeUnit: string
  estimationTime?: number
  depositAddress?: string
  depositChainId: number
  depositToken?: string
  depositAmount?: string
  depositFee?: string
  depositTxHash?: string
  depositStatus?: TransferStatus
  depositErrorCode?: string
  depositErrorMessage?: string
  nonce?: number
  toTxHash?: string
  memo?: string
}

export const transactionTypeLabelKeys: Record<FundingType | 'AddVault' | 'RemoveVault' | 'Exchange', string> = {
  [FundingType.Deposit]: 'assets.overview.deposit',
  [FundingType.DepositFutureExternal]: 'assets.overview.deposit',
  [FundingType.Withdraw]: 'assets.overview.withdrawal',
  [FundingType.Swap]: 'assets.overview.transfer',
  [FundingType.DepositFuture]: 'assets.overview.transfer',
  [FundingType.WithdrawFuture]: 'assets.overview.transfer',
  [FundingType.WithdrawFutureExternal]: 'assets.overview.withdrawal',
  [FundingType.DepositPredictExternal]: 'assets.overview.deposit',
  [FundingType.WithdrawPredictExternal]: 'assets.overview.withdrawal',
  AddVault: 'assets.overview.depositVault',
  RemoveVault: 'assets.overview.redeemVault',
  Exchange: 'assets.overview.exchange',
}

const tokenAddressMap: Record<string, string> = {
  SOL: SOL_ADDRESS,
  ETH: '0x0000000000000000000000000000000000000000',
  'ARB-ETH': '0x0000000000000000000000000000000000000000',
  USDC: ARB_USDC_ADDRESS_V2,
  BNB: '0x0000000000000000000000000000000000000000',
}

const tokenChainMap: Record<string, ChainIds> = {
  SOL: ChainIds.Solana,
  ETH: ChainIds.Ethereum,
  'ARB-ETH': ChainIds.Arbitrum,
  USDC: ChainIds.Arbitrum,
  BNB: ChainIds.Bsc,
}

type FundingRecordRowProps = {
  record: FundingRecord
  itemClassName?: string
  openTxDetail: (record: FundingRecord) => void
  renderStatusIcon: (record: FundingRecord) => JSX.Element
}

const getTransactionAccountDescription = (record: FundingRecord, t: TFunction) => {
  if (
    record.type === FundingType.Deposit ||
    record.type === FundingType.DepositFutureExternal ||
    record.type === FundingType.DepositPredictExternal
  ) {
    return `${t('assets.overview.fundingHistory.fromAccount')} ${formatAddressWallet(record.from)}`
  }
  if (record.type === FundingType.Withdraw || record.type === FundingType.WithdrawPredictExternal) {
    return `${t('assets.overview.fundingHistory.toAccount')} ${formatAddressWallet(record.to)}`
  }
  if (record.type === FundingType.WithdrawFutureExternal) {
    return `${t('assets.overview.fundingHistory.toAccount')} ${formatAddressWallet(record.to)}`
  }
  if (record.type === FundingType.Swap) {
    if (record.chainId === ChainIds.Hyperliquid || record.chainId === ChainIds.HyperEVM) {
      return `${t('assets.transfers.contractAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.memeAccount')}`
    }
    if (
      record.depositChainId === ChainIds.HyperEVM ||
      record.toChainId === ChainIds.Hyperliquid ||
      record.toChainId === ChainIds.HyperEVM
    ) {
      return `${t('assets.transfers.memeAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.contractAccount')}`
    }
    return t('assets.transfers.memeAccount')
  }

  if (record.type === FundingType.WithdrawFuture || record.chainId === ChainIds.Hyperliquid) {
    return `${t('assets.transfers.contractAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.memeAccount')}`
  }

  if (record.type === FundingType.DepositFuture) {
    return `${t('assets.transfers.memeAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.contractAccount')}`
  }

  return ''
}

const FundingRecordRow = ({ record, itemClassName, openTxDetail, renderStatusIcon }: FundingRecordRowProps) => {
  const { t } = useTranslation()

  return (
    <div
      onClick={() => {
        openTxDetail(record)
      }}
      className={cn(
        'px-3 py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#ECECED14] transition-colors duration-200',
        itemClassName,
      )}
    >
      <div className="flex-1 flex items-center gap-2">
        <FundingRecordTokenLogos record={record} />

        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[14px] text-white">
              {t(transactionTypeLabelKeys[record.type as keyof typeof transactionTypeLabelKeys])}
            </span>
            <div className="flex gap-1">
              {renderStatusIcon(record)}
              {record.type === FundingType.WithdrawFuture &&
                (record.status === TransferStatus.Pending || record.status === TransferStatus.Processing) && (
                  <CountdownTimer createdAt={record.createdAt} estimationTime={record.estimationTime || null} />
                )}
            </div>
          </div>
          <div className="mt-1.5 font-normal text-[11px] leading-2.5 text-white/50">
            {getTransactionAccountDescription(record, t)}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-end">
        <FundingRecordAmount record={record} />
      </div>
    </div>
  )
}

export interface TabFundingRecordsProps {
  showFilter?: boolean
  itemClassName?: string
  groupHeaderClassName?: string
  className?: string
}

export const TabFundingRecords = (props: TabFundingRecordsProps) => {
  const { showFilter = true, itemClassName = '', groupHeaderClassName, className } = props
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const loadMoreRef = useRef(null)
  const { openTxDetail } = useTxDetail()

  const [queryParams, setQueryParams] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      asset: params.get('asset') || 'all',
      type: params.get('type') || 'all',
    }
  })

  const userId = useSelector(_userInfo)?.userId

  const mapTransferType = (type: string) => {
    switch (type) {
      case 'all':
        return undefined
      case 'TRANSFER':
        return [TransferType.Swap, TransferType.DepositFuture, TransferType.WithdrawFuture]
      case 'WITHDRAW':
        return [TransferType.Withdraw, TransferType.WithdrawFutureExternal]
      case 'DEPOSIT':
        return [TransferType.Deposit, TransferType.DepositFutureExternal]
      default:
        return [type]
    }
  }

  const {
    data: recordsData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['fundingRecords', queryParams],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const { asset, type } = queryParams
      const response = await gqlClient.query({
        query: getFundingWalletHistory,
        variables: {
          input: {
            limit: 20,
            page: pageParam,
            types: mapTransferType(type),
            token: tokenAddressMap[asset] || undefined,
            chainId: tokenChainMap[asset] || undefined,
          },
        },
      })
      return (response.data.getFundingWalletHistory || []) as FundingRecord[]
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined
    },
  })

  const queryClient = useQueryClient()
  useEffect(() => {
    return () => {
      // Cancel any ongoing queries related to meme tokens when the component unmounts
      queryClient.cancelQueries({
        queryKey: ['fundingRecords', queryParams],
      })

      // Clear the query cache, except first page
      queryClient.setQueryData(['fundingRecords', queryParams], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.slice(0, 1), // Keep only the first page
          pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
        }
      })
    }
  }, [])

  const records = useMemo(() => {
    if (!recordsData || recordsData.pages?.length === 0) return []
    return recordsData.pages.flat()
  }, [recordsData])

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

  const recordGroupedByDate = useMemo(() => {
    return records.reduce((acc: Record<string, FundingRecord[]>, record) => {
      const date = dayjs(record.timestamp * 1000).format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(record)
      return acc
    }, {})
  }, [records])

  const renderStatusIcon = (record: FundingRecord) => {
    if (record.depositStatus && record.depositStatus !== TransferStatus.Success) {
      switch (record.depositStatus) {
        case TransferStatus.Failed:
          return <img src="/images/icons/transfer-fail.svg" alt="Failed" className="w-4 h-4" />
        default:
          return <LoadingSpinnerGradient size={16} />
      }
    } else {
      switch (record.status) {
        case TransferStatus.Success:
          return <img src="/images/icons/transfer-success.svg" alt="Success" className="w-4 h-4" />
        case TransferStatus.Failed:
          return <img src="/images/icons/transfer-fail.svg" alt="Failed" className="w-4 h-4" />
        default:
          return <LoadingSpinnerGradient size={16} />
      }
    }
  }

  const loadMoreFn = async () => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return
    await fetchNextPage()
  }

  useEffect(() => {
    const asset = searchParams.get('asset') || 'all'
    const type = searchParams.get('type') || 'all'
    setQueryParams({ asset, type })
  }, [searchParams])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreFn().finally(() => {})
        }
      },
      {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: 1.0, // Trigger when 100% of the target is visible
      },
    )
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [isFetchingNextPage, hasNextPage, loadMoreFn, loadMoreRef.current])

  return (
    <div className={cn('mt-3.75', className)}>
      {showFilter && (
        <div className="px-3 flex items-center gap-5">
          <AssetSelect
            currentAsset={queryParams.asset || 'all'}
            onChange={(option) => {
              setQueryParams((prev) => ({
                ...prev,
                asset: option.token || 'all',
              }))
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev)
                if (option.token) {
                  newParams.set('asset', option.token)
                } else {
                  newParams.delete('asset')
                }
                return newParams
              })
            }}
          />
          <TypesSelect
            selectedOption={queryParams.type ?? 'all'}
            setSelectedOption={(value) => {
              setQueryParams((prev) => ({
                ...prev,
                type: value,
              }))
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev)
                if (value !== 'all') {
                  newParams.set('type', value)
                } else {
                  newParams.delete('type')
                }
                return newParams
              })
            }}
          />
        </div>
      )}
      {records.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <IconEmpty />
          <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
        </div>
      ) : (
        <div className="mt-3.75 no-scrollbar">
          {Object.keys(recordGroupedByDate).length !== 0 &&
            Object.keys(recordGroupedByDate).map((date) => (
              <div key={date} className="mt-4">
                <div
                  className={cn('font-[330] text-[14px] leading-2.5 text-white/70 px-3 mb-2.5', groupHeaderClassName)}
                >
                  {dayjs(date).format('YYYY-MM-DD')}
                </div>
                {recordGroupedByDate[date].map((record, index) => (
                  <div key={index}>
                    <FundingRecordRow
                      record={record}
                      itemClassName={itemClassName}
                      openTxDetail={openTxDetail}
                      renderStatusIcon={renderStatusIcon}
                    />
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      <div ref={loadMoreRef} className="w-full h-px" />

      {(hasNextPage || isLoading) && (
        <div className="flex justify-center items-center py-4">
          <Loading />
        </div>
      )}
    </div>
  )
}
