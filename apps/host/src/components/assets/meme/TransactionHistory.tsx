import { ChainType } from '@/@generated/gql/graphql-meme2'
import {
  Order,
  OrderSortField,
  SearchOrderInput,
  SortDirection,
  TransactionType,
} from '@/@generated/gql/graphql-trading.ts'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import TokenFilter from '@/components/transactionHistory/TokenFilter'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { APP_PATH } from '@/lib/constant'
import { formatAmount, formatBalance, formatPrice, formatVolume } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client'
import { formatAddressWallet } from '@/lib/string'
import { cn, getPath } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { getTransactions } from '@/services/order.service'
import { ChainIds } from '@/types/enums.ts'
import { formatMoney, getBlockchainLogo2, getLinkExplorer } from '@/utils/helpers'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconEmpty } from '@components/icon'
import IconArrowSwap from '@components/icon/stroke/IconArrowSwap.tsx'
import IconFund from '@components/icon/stroke/IconFund.tsx'
import { IconWallet } from '@components/icon/stroke/IconWallet.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const mapChainIdToChainType = (chainId: number): ChainType => {
  switch (chainId) {
    case ChainIds.Solana:
      return ChainType.Solana
    case ChainIds.Ethereum:
      return ChainType.Evm
    case ChainIds.Arbitrum:
      return ChainType.Evm
    case ChainIds.Bsc:
      return ChainType.Bsc
    case ChainIds.Mon:
      return ChainType.Mon
    default:
      return ChainType.Solana
  }
}

const Transaction = ({
  data,
  showMCap,
  index,
  unit,
}: {
  data: Order
  showMCap: boolean
  index: number
  unit: 'USD' | 'SOL' | 'BNB' | 'MON'
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)

  const symbol = data?.baseSymbol || 'Unknown'
  const token = data?.baseAddress || ''
  const chainId = Number(data?.chainId) as ChainIds
  const createdAt = data?.createdAt
  const isXStock = data?.isXStock || false
  const { logo: logoUrl } = useTokenInfo(token, chainId)
  const txHash = data?.txid || ''
  const type = data?.transactionType || ''
  const baseAmount = Number(data?.baseAmount)
  const quoteAmount = Number(data?.quoteAmount)
  const baseDecimal = data?.baseDecimal || 8
  const closePriceUsd = Number(data?.closePriceUsd)
  const marketCap = data?.marketCap
  const priorityFee = Number(data?.priorityFee)

  const walletName = useMemo(() => {
    return (
      listWalletsByChain.find((item: any) => item?.walletAddress?.toLowerCase() === data?.userAddress?.toLowerCase())
        ?.name || '--'
    )
  }, [data?.userAddress, listWalletsByChain])

  const handleNavigation = () => {
    const chainType =
      chainId === ChainIds.Ethereum
        ? 'arb'
        : chainId === ChainIds.Arbitrum
          ? 'arb'
          : chainId === ChainIds.Bsc
            ? 'bsc'
            : chainId === ChainIds.Mon
              ? 'mon'
              : 'sol'
    const path = isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL
    navigate(
      getPath(path, {
        address: token,
        chain: chainType,
      }),
      {
        state: { symbol: symbol },
      },
    )
  }

  return (
    <div
      className={cn(
        'min-h-[48px] w-max min-w-full px-4 py-[14px] grid grid-cols-[3fr_100px_2fr_2fr_2fr_100px_2fr_150px_150px] font-[330] text-[14px] text-[#FBFBFB] leading-none hover:bg-[#18181B] cursor-pointer',
        index % 2 === 0 ? 'bg-[#101114]' : 'bg-transparent',
      )}
      onClick={() => {
        const link = getLinkExplorer(chainId, txHash)
        window.open(link, '_blank')
      }}
    >
      <div
        className="pr-3 min-w-[180px] flex items-center gap-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          handleNavigation()
        }}
      >
        <LogoWithChain
          logo={logoUrl}
          logoContainerClassName="rounded-md"
          logoClassName="size-8 rounded-md min-w-[32px]"
          name={symbol}
          chainLogo={getBlockchainLogo2(chainId)}
        />
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div className="font-[380] text-[13px] leading-none text-[#FBFBFB]">{symbol}</div>
              {isXStock && <IconXStock />}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[13px] leading-none text-[#79778C]">
            <span>{formatAddressWallet(token)}</span>
            <CopyButton text={token} className="size-[14px] text-[#79778C]" type="tokenAddress" />
          </div>
        </div>
      </div>
      <div className="px-3 flex items-center">
        <div
          className={`${type === TransactionType.Buy ? 'text-rise' : type === TransactionType.Sell ? 'text-fall' : ''}`}
        >
          {(() => {
            switch (type) {
              case TransactionType.Buy:
                return t('history.buy')
              case TransactionType.Sell:
                return t('history.sell')
              default:
                return type
            }
          })()}
        </div>
      </div>
      <div className="px-3 min-w-[100px] flex items-center">
        {unit === 'USD' ? (
          formatVolume(baseAmount * Number(closePriceUsd), {
            showCurrency: true,
            roundMode: 'floor',
          })
        ) : (
          <>
            <span className="flex items-center no-wrap w-full gap-1">
              <img src={getBlockchainLogo2(chainId)} alt="" className="w-3 h-3" />
              {formatAmount(closePriceUsd ? quoteAmount : 0, {
                showCurrency: false,
                roundMode: 'floor',
              })}
            </span>
          </>
        )}
      </div>
      <div className="px-3 min-w-[100px] flex items-center">
        <span>
          {formatAmount(baseAmount, {
            roundMode: 'floor',
          })}
        </span>
      </div>
      <div className="px-3 min-w-[100px] flex items-center">
        {showMCap
          ? formatVolume(marketCap, {
              showCurrency: true,
              roundMode: 'floor',
            })
          : formatPrice(closePriceUsd, {
              showCurrency: true,
              roundMode: 'ceil',
            })}
      </div>
      <div className="px-3 flex items-center">
        {formatBalance(priorityFee, {
          showCurrency: true,
          roundMode: 'ceil',
        })}
      </div>
      <div className="px-3 min-w-[130px] flex items-center">
        <div className="flex items-center gap-1">
          <IconWallet className="size-[14px] text-[#FBFBFB]" />
          <span className="text-[#FBFBFB]">{walletName}</span>
        </div>
      </div>
      <div className="px-3 flex items-center">
        <a
          href={getLinkExplorer(chainId, txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#843BEA] hover:underline"
        >
          {formatAddressWallet(txHash)}
        </a>
      </div>
      <div className="pl-3 flex items-center whitespace-nowrap">{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
    </div>
  )
}

const TransactionSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'min-h-[48px] w-max min-w-full px-4 py-[14px] grid grid-cols-[3fr_100px_2fr_2fr_2fr_100px_2fr_150px_150px]',
            index % 2 === 0 ? 'bg-[#101114]' : 'bg-transparent',
          )}
        >
          <div className="pr-3 min-w-[180px] flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-[12px] w-[120px]" />
              <Skeleton className="h-[12px] w-[160px]" />
            </div>
          </div>
          <div className="px-3 flex items-center">
            <Skeleton className="h-[14px] w-[60px]" />
          </div>
          <div className="px-3 min-w-[100px] flex items-center">
            <Skeleton className="h-[14px] w-[90px]" />
          </div>
          <div className="px-3 min-w-[100px] flex items-center">
            <Skeleton className="h-[14px] w-[90px]" />
          </div>
          <div className="px-3 min-w-[100px] flex items-center">
            <Skeleton className="h-[14px] w-[90px]" />
          </div>
          <div className="px-3 flex items-center">
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
          <div className="px-3 min-w-[130px] flex items-center">
            <Skeleton className="h-[14px] w-[120px]" />
          </div>
          <div className="px-3 flex items-center">
            <Skeleton className="h-[14px] w-[140px]" />
          </div>
          <div className="pl-3 flex items-center">
            <Skeleton className="h-[14px] w-[120px]" />
          </div>
        </div>
      ))}
    </>
  )
}

type Props = {
  hidden: boolean
  walletsByChain: UserEmbeddedWalletDto[]
  wallet: string | undefined
  chainId?: number | undefined
}

export const TransactionHistory = ({ hidden, walletsByChain, wallet, chainId }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const walletAddresses = useMemo(() => {
    if (!wallet) {
      return walletsByChain.map((item: any) => item?.walletAddress)
    }
    return [wallet]
  }, [wallet, walletsByChain])
  const nativeUnit = chainId === ChainIds.Bsc ? 'BNB' : chainId === ChainIds.Mon ? 'MON' : 'SOL'
  const [tokenFilter, setTokenFilter] = useState<string | undefined>(undefined)
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(undefined)
  const [openModalFilterByType, setOpenModalFilterByType] = useState(false)
  const [showMCap, setShowMCap] = useState(false)
  const [unit, setUnit] = useState<'USD' | 'SOL' | 'BNB' | 'MON'>('USD')

  const TRANSACTION_TYPES: { label: string; value?: TransactionType }[] = [
    { label: t('history.all'), value: undefined },
    { label: t('history.buy'), value: TransactionType.Buy },
    { label: t('history.sell'), value: TransactionType.Sell },
  ]
  const walletAddressesKey = useMemo(() => walletAddresses.join('|'), [walletAddresses])
  const { data, refetch, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['transactions', walletAddressesKey, chainId, tokenFilter, typeFilter],
    queryFn: async ({ pageParam }) => {
      const queryInput: SearchOrderInput = {
        userAddress: '',
        userAddresses: walletAddresses,
        transactionType: typeFilter,
        baseAddress: tokenFilter,
        limit: 20,
        offset: pageParam,
        sortDir: SortDirection.Desc,
        sortField: OrderSortField.CreatedAt,
      }
      if (chainId) {
        queryInput.chain = mapChainIdToChainType(chainId)
      }
      const response = await tradingClient.query({
        query: getTransactions,
        variables: {
          input: queryInput,
        },
        fetchPolicy: 'no-cache',
      })
      return (response?.data?.getTransactions || []) as Order[]
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined
    },
  })

  useEffect(() => {
    if (!hidden) refetch()
  }, [hidden])

  const transactions = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flat() as Order[]
  }, [data?.pages])

  useEffect(() => {
    return () => {
      // Cancel any ongoing queries related to meme tokens when the component unmounts
      queryClient.cancelQueries({
        queryKey: ['transactions', walletAddressesKey, chainId, tokenFilter, typeFilter],
      })

      // Clear the query cache for meme tokens, except first page
      queryClient.setQueryData(
        ['transactions', walletAddressesKey, chainId, tokenFilter, typeFilter],
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.slice(0, 1), // Keep only the first page
            pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
          }
        },
      )
    }
  }, [])

  useEffect(() => {
    setTokenFilter(undefined)
    setTypeFilter(undefined)
  }, [walletAddressesKey])

  return (
    <div className={cn(hidden ? 'hidden' : 'block', 'w-full overflow-auto')}>
      <div className="w-max min-w-full overflow-auto">
        <div className="relative min-h-[48px] w-max min-w-full px-4 py-[14px] grid grid-cols-[3fr_100px_2fr_2fr_2fr_100px_2fr_150px_150px] items-center font-[330] text-[13px] text-[#6C6A74] leading-none">
          <div className="min-w-[180px] pr-3 flex items-center">
            <TokenFilter
              userAddresses={walletAddresses}
              value={tokenFilter || ''}
              onValueChange={(value) => {
                setTokenFilter(value || undefined)
              }}
            />
          </div>
          <div className="px-3">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                setOpenModalFilterByType(true)
              }}
            >
              <div>{t('history.type')}</div>
              <div className="flex items-center justify-center w-[14px] h-[14px]">
                {typeFilter ? (
                  <img src="/images/icons/icon-filter-solid.svg" className="w-[10px] h-[10px]" alt="" />
                ) : (
                  <img src="/images/icons/icon-filter.svg" className="w-[10px] h-[10px]" alt="" />
                )}
              </div>
            </div>
            <Popover open={openModalFilterByType} onOpenChange={setOpenModalFilterByType}>
              <PopoverAnchor />
              <PopoverContent className="w-[90px] bg-[#212127] p-1 z-[9999]" align="start" side="bottom" sideOffset={4}>
                {TRANSACTION_TYPES.map((e) => (
                  <div
                    key={e.value}
                    className={cn(
                      'hover:bg-[#27272a] cursor-pointer px-2 py-1 rounded text-center',
                      typeFilter === e.value && 'text-[#FBFBFB] bg-[#2B2B33]',
                    )}
                    onClick={() => {
                      setTypeFilter(e.value)
                      setOpenModalFilterByType(false)
                    }}
                  >
                    <span className="font-[380] text-[13px] text-center mx-auto">{e.label}</span>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>
          <div className="px-3 min-w-[100px] flex items-center gap-1">
            {t('history.tradeVolume')}
            <div
              className="flex items-center gap-1 cursor-pointer transition-all duration-100 hover:text-[#B9B9B9]"
              onClick={(e) => {
                e.stopPropagation()
                setUnit(unit === 'USD' ? nativeUnit : 'USD')
              }}
            >
              <span>{unit}</span>
              <IconFund className="size-[14px]" />
            </div>
          </div>
          <div className="px-3 min-w-[100px]">{t('history.amount')}</div>
          <div className="px-3 min-w-[100px]">
            <div className="flex items-center gap-[2px] cursor-pointer" onClick={() => setShowMCap(!showMCap)}>
              <span>{showMCap ? t('history.mcap') : t('history.price')}</span>
              <IconArrowSwap className="w-3 h-3 text-[#6C6A74]" />
            </div>
          </div>
          <div className="px-3 min-w-[100px]">{t('history.priorityFee')}</div>
          <div className="px-3 min-w-[130px]">{t('assets.wallet.title')}</div>
          <div className="px-3">{t('history.txHash')}</div>
          <div className="pl-3">{t('history.time')}</div>
        </div>
        <div
          className="h-[375px] w-max min-w-full overflow-y-auto overflow-x-hidden"
          style={{ scrollbarGutter: 'stable' }}
          onScroll={(e) => {
            const target = e.target as HTMLDivElement
            if (target.scrollTop / (target.scrollHeight - target.clientHeight) > 0.75) {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
              }
            }
          }}
        >
          {isLoading ? (
            <TransactionSkeleton count={6} />
          ) : transactions.length === 0 ? (
            <div className="h-[200px] flex flex-col justify-center items-center gap-2">
              <IconEmpty />
              <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">{t('history.nodata')}</span>
            </div>
          ) : (
            transactions.map((tx: Order, index) => (
              <Transaction key={index} data={tx} showMCap={showMCap} index={index} unit={unit} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
