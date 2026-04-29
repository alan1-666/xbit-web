import { FundingRecord, transactionTypeLabelKeys } from '@/components/assets/overview/TabFundingRecords'
import { LoadingSpinnerGradient } from '@/components/ui/loading-spinner'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useTxDetail } from '@/hooks/useTxDetail'
import { APP_PATH } from '@/lib/constant.ts'
import { formatAmount, formatBalance } from '@/lib/format'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { ChainIds, FundingType, TransferStatus } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { Loading } from '@components/common/Loading.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconEmpty, IconEye, IconEyeSlash } from '@components/icon'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'
import { getFundingWalletHistory } from '@services/wallet.service.ts'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { throttle } from 'lodash-es'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const FundingHistory = ({
  token,
  onClose,
}: {
  token: {
    chainId: number
    address: string
    symbol: string
    logo: string
    amount: number
    decimals?: number
    value: number
  }
  onClose?: () => void
}) => {
  const { t } = useTranslation()
  const navigateWithLocation = useNavigateWithLocation()
  const { selectedWallet } = useContext(AssetOverviewContext)
  const [hideBalance, setHideBalance] = useState(false)
  const { openTxDetail } = useTxDetail()

  const tokensSupportedTransfers = [
    '0x0000000000000000000000000000000000000000', // ETH Native, BNB Native
    'So11111111111111111111111111111111111111111', // Solana Native
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // ETH on Arbitrum
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC on Arbitrum
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH on Ethereum
  ]

  const isTokenSupportTransfer = useMemo(() => {
    return (
      tokensSupportedTransfers.includes(token.address) || tokensSupportedTransfers.includes(token.address.toLowerCase())
    )
  }, [token.address])

  const assetsNav = [
    {
      key: 'deposit',
      icon: '/images/icons/asset-deposit-v3.svg',
      title: t('assets.deposit.title'),
    },
    {
      key: 'withdraw',
      icon: '/images/icons/asset-withdraw-v3.svg',
      title: t('assets.withdraw.withdrawLabel'),
    },
    {
      key: 'transfer',
      icon: '/images/icons/asset-swap-v3.svg',
      title: t('assets.transfer'),
    },
    // {
    //   key: 'buy',
    //   icon: '/images/icons/asset-buy.svg',
    //   title: t('assets.buy'),
    // },
  ]

  const onItemClick = (key: string) => {
    switch (key) {
      case 'deposit':
        navigateWithLocation(`${APP_PATH.DEPOSIT}`)
        break
      case 'withdraw':
        navigateWithLocation(
          `${APP_PATH.WITHDRAWAL}?token=${token.symbol}&chainId=${token.chainId}&tokenAddress=${token.address}`,
        )
        break
      case 'transfer':
        navigateWithLocation(`${APP_PATH.CRYPTO_DEPOSIT}?source=funding`)
        break
      case 'buy':
        toast.info('Coming soon!')
        break
      default:
        break
    }
  }

  const { isDesktop } = useResponsive()

  const {
    data: recordsData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['fundingHistory', token.address, selectedWallet?.walletAddress],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await gqlClient.query({
        query: getFundingWalletHistory,
        variables: {
          input: {
            limit: 20,
            page: pageParam,
            token: token.address,
            chainId: token.chainId,
            walletAddress: selectedWallet?.walletAddress || '',
          },
        },
      })
      return (response.data.getFundingWalletHistory || []) as FundingRecord[]
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined
    },
  })

  const records = useMemo(() => {
    if (!recordsData || recordsData.pages?.length === 0) return []
    return recordsData.pages.flat()
  }, [recordsData])

  const recordGroupedByDate = useMemo(() => {
    return records.reduce((acc: Record<string, FundingRecord[]>, record) => {
      const date = dayjs(record.createdAt).format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(record)
      return acc
    }, {})
  }, [records])

  const renderStatusIcon = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.Success:
        return <img src="/images/icons/transfer-success.svg" alt="Success" className="w-[16px] h-[16px]" />
      case TransferStatus.Failed:
        return <img src="/images/icons/transfer-fail.svg" alt="Failed" className="w-[16px] h-[16px]" />
      default:
        return <LoadingSpinnerGradient size={16} />
    }
  }

  const loadMoreFn = async () => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return
    await fetchNextPage()
  }

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.75

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !isFetchingNextPage && hasNextPage) {
        loadMoreFn().finally(() => {})
      }
    }, 200)

    const scrollableDiv = document.getElementById('scrollableDiv')
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', throttled)
    } else {
      window.addEventListener('scroll', throttled)
    }
    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener('scroll', throttled)
      } else {
        window.removeEventListener('scroll', throttled)
      }
    }
  }, [isFetchingNextPage, hasNextPage, loadMoreFn])

  const queryClient = useQueryClient()
  useEffect(() => {
    return () => {
      // Cancel any ongoing queries related to meme tokens when the component unmounts
      queryClient.cancelQueries({
        queryKey: ['fundingHistory', token.address, selectedWallet?.walletAddress],
      })

      // Clear the query cache for meme tokens, except first page
      queryClient.setQueryData(['fundingHistory', token.address, selectedWallet?.walletAddress], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.slice(0, 1), // Keep only the first page
          pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
        }
      })
    }
  }, [])

  return (
    <div
      className={`relative flex flex-col ${isDesktop ? 'w-full h-full bg-[#232329]' : '@container mx-auto min-h-[100vh] bg-[#121212]'}`}
    >
      {!isDesktop && (
        <div className="p-4 flex items-center justify-center bg-[#121212] relative">
          <img
            className="w-6 h-6 cursor-pointer absolute left-4 top-4"
            alt="arrow-left"
            src="/images/icons/arrow-left.svg"
            onClick={onClose}
          ></img>
          <div className="flex items-center gap-1.5">
            <LogoWithChain
              logo={token.logo}
              logoClassName="w-6 h-6"
              name={token.symbol}
              chainLogo={getBlockchainLogo2(token.chainId)}
            />
            <span className="text-[18px] font-[380] text-white">{token.symbol}</span>
          </div>
        </div>
      )}
      <div
        id="scrollableDiv"
        className={`h-[calc(100vh-60px)] overflow-y-auto no-scrollbar ${isDesktop ? 'h-[calc(80vh-60px)]' : ''}`}
      >
        <div className="px-3">
          <div className="flex items-end gap-1">
            <span className="font-[520] text-[32px] leading-none text-white">
              {hideBalance ? (
                '*****'
              ) : (
                <span>
                  {formatAmount(token.amount, {
                    roundMode: 'floor',
                  })}
                </span>
              )}
            </span>
            <span onClick={() => setHideBalance(!hideBalance)} className="cursor-pointer">
              {hideBalance ? <IconEyeSlash /> : <IconEye />}
            </span>
          </div>
          <div className="mt-2 font-[330] text-[15px] leading-none text-white/50">
            ≈ {hideBalance ? '*****' : formatBalance(token.value, { showCurrency: true, roundMode: 'floor' })}
          </div>
        </div>
        {!isDesktop && (
          <div className="mt-4 flex items-center justify-center gap-2 px-2.5">
            {assetsNav.map((item, index) => {
              return (
                <div
                  key={index}
                  className="cursor-pointer  bg-[#18181D] p-[10.5px] rounded-2xl flex-1 max-w-17.5"
                  onClick={() => {
                    if (isTokenSupportTransfer) {
                      onItemClick(item.key)
                    } else {
                      toast.error(
                        t('assets.unsupportedTokenTransfer', {
                          action: item.title,
                        }),
                      )
                    }
                  }}
                >
                  <div className="flex items-center justify-center">
                    <div className="rounded-full">
                      <img src={item.icon} alt={item.title} className="size-8" />
                    </div>
                  </div>
                  <div className="mt-1.25 text-center text-[12px] leading-none text-[#9D9CA2]">{item.title}</div>
                </div>
              )
            })}
          </div>
        )}
        <div className="px-3 py-4 border-b border-[#ECECED1F]">
          <div className="font-[450] text-[20px] leading-none text-white">
            {t('assets.fundingHistory.receivingAddress')}
          </div>
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="text-[16px] font-[330] text-white/50 break-all">{selectedWallet?.walletAddress}</span>
            <CopyButton text={selectedWallet?.walletAddress} />
          </div>
        </div>
        <div className="mt-6">
          <div className="px-3 font-[450] text-[20px] leading-none text-white">
            {t('assets.fundingHistory.history')}
          </div>
          {records.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-48">
              <IconEmpty />
              <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
            </div>
          )}
          {Object.keys(recordGroupedByDate).length !== 0 &&
            Object.keys(recordGroupedByDate).map((date) => (
              <div key={date} className="mt-4 animate-slide-up-delay">
                <div className="font-[330] text-[14px] leading-[10px] text-white/70 px-3 mb-2.5">
                  {dayjs(date).format('YYYY-MM-DD')}
                </div>
                {recordGroupedByDate[date].map((record, index) => {
                  const selectedWalletAddress = selectedWallet?.walletAddress?.toLowerCase()
                  const fromAddress = record.from || ''
                  const toAddress = record.to || ''
                  const status = record.status
                  const amount = record.amount
                  let toAmount = record?.depositAmount ? record?.depositAmount : record.toAmount
                  if (record.token === record.toToken && !toAmount) {
                    toAmount = Number(record.amount) - Number(record.fee)
                  }
                  let type = record.type as FundingType
                  if (record.type === FundingType.Withdraw && selectedWalletAddress === toAddress.toLowerCase()) {
                    type = FundingType.Deposit
                  }
                  if (record.type === FundingType.Deposit && selectedWalletAddress === fromAddress.toLowerCase()) {
                    type = FundingType.Withdraw
                  }
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-4 hover:bg-[#ECECED14] transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        openTxDetail(record)
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        {type === FundingType.Deposit ? (
                          <img src="/images/icons/deposit2.svg" alt="deposit" className="w-8 h-8" />
                        ) : type === FundingType.Withdraw ? (
                          <img src="/images/icons/withdraw2.svg" alt="withdraw" className="w-8 h-8" />
                        ) : (
                          <img src="/images/icons/transfer2.svg" alt="transfer" className="w-8 h-8" />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[16px] font-[380] leading-none text-white">
                              {t(transactionTypeLabelKeys[type as keyof typeof transactionTypeLabelKeys])}
                            </span>
                            {renderStatusIcon(record.status)}
                          </div>
                          <div className="mt-1.5 font-[330] text-[14px] leading-none text-white/50">
                            {type === FundingType.Deposit
                              ? `${t('assets.overview.fundingHistory.fromAccount')} ${formatAddressWallet(record.from)}`
                              : type === FundingType.Withdraw
                                ? `${t('assets.overview.fundingHistory.toAccount')} ${formatAddressWallet(record.to)}`
                                : type === FundingType.Swap
                                  ? record?.depositChainId === ChainIds.HyperEVM
                                    ? `${t('assets.transfers.memeAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.contractAccount')}`
                                    : t('assets.transfers.memeAccount')
                                  : type === FundingType.WithdrawFuture
                                    ? `${t('assets.transfers.contractAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.memeAccount')}`
                                    : type === FundingType.DepositFuture
                                      ? `${t('assets.transfers.memeAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.contractAccount')}`
                                      : ''}
                          </div>
                        </div>
                      </div>
                      <div>
                        {hideBalance ? (
                          <div className="font-[450] text-[16px] leading-none text-white">***** {token.symbol}</div>
                        ) : selectedWalletAddress === fromAddress.toLowerCase() ? (
                          <div
                            className={`font-[450] text-[16px] leading-none ${status === TransferStatus.Success ? 'text-fall' : 'text-white/50'}`}
                          >
                            -
                            {formatAmount(amount, {
                              roundMode: 'floor',
                              unit: token.symbol,
                            })}
                          </div>
                        ) : selectedWalletAddress === toAddress.toLowerCase() ? (
                          <div
                            className={`font-[450] text-[16px] leading-none ${status === TransferStatus.Success ? 'text-rise' : 'text-white/50'}`}
                          >
                            +
                            {formatAmount(type === FundingType.Deposit ? amount : toAmount, {
                              roundMode: 'floor',
                              unit: token.symbol,
                            })}
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          {(hasNextPage || isLoading) && (
            <div className="flex justify-center items-center py-4">
              <Loading />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FundingHistory
