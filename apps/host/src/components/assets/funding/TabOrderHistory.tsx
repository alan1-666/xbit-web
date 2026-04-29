import { ChainType, Order, OrderSortField, SearchOrderInput, SortDirection, TransactionType } from '@/@generated/gql/graphql-trading.ts'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { formatAmount, formatVolume } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client'
import { formatAddressWallet } from '@/lib/string'
import { getTransactions } from '@/services/order.service'
import { ChainIds } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconEmpty } from '@components/icon'
import FilterByType from '@components/transactionHistory/FilterByType.tsx'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { throttle } from 'lodash-es'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const TabOrderHistory = () => {
  const { t } = useTranslation()
  const { selectedWallet, selectedChainId } = useContext(AssetOverviewContext)
  const userAddress = selectedWallet?.walletAddress
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(undefined)
  const [openModalFilterByType, setOpenModalFilterByType] = useState(false)

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
      default:
        return ChainType.Solana
    }
  }

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['transactions', userAddress, typeFilter, selectedChainId],
    enabled: !!userAddress,
    queryFn: async ({ pageParam }) => {
      const queryInput: SearchOrderInput = {
        userAddress: userAddress ?? '',
        transactionType: typeFilter,
        limit: 20,
        offset: pageParam,
        sortDir: SortDirection.Desc,
        sortField: OrderSortField.CreatedAt,
      }
      if (selectedChainId) {
        queryInput.chain = mapChainIdToChainType(selectedChainId)
      }
      const response = await tradingClient.query({
        query: getTransactions,
        variables: {
          input: queryInput,
        },
      })
      return (response?.data?.getTransactions || []) as Order[]
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined
    },
    initialData: () => {
      const json = localStorage.getItem('cachedTransactions')
      if (json) {
        const cachedData = JSON.parse(json)
        return {
          pages: [cachedData],
          pageParams: [0],
        }
      }
    },
  })

  const transactions = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flat()
  }, [data])

  useEffect(() => {
    const cacheTransactions = transactions.slice(0, 20)
    localStorage.setItem('cachedTransactions', JSON.stringify(cacheTransactions))
  }, [transactions])

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.75

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !isFetchingNextPage && hasNextPage) {
        fetchNextPage().finally(() => {})
      }
    }, 200)
    const container = document.getElementById('desktop-layout-content')
    if (container) {
      container.addEventListener('scroll', throttled)
      return () => container.removeEventListener('scroll', throttled)
    }
    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  const transactionsGroupedByDate = useMemo(() => {
    return transactions.reduce((groups: { [key: string]: Order[] }, transaction) => {
      const date = dayjs(transaction.createdAt).format('YYYY-MM-DD')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    }, {})
  }, [transactions])

  const typeLabel = useMemo(() => {
    switch (typeFilter) {
      case TransactionType.Buy:
        return t('history.buy')
      case TransactionType.Sell:
        return t('history.sell')
      default:
        return t('history.all')
    }
  }, [typeFilter])

  const queryClient = useQueryClient()
  useEffect(() => {
    return () => {
      // Cancel any ongoing queries related to meme tokens when the component unmounts
      queryClient.cancelQueries({
        queryKey: ['transactions', userAddress, typeFilter, selectedChainId],
      })

      // Clear the query cache for meme tokens, except first page
      queryClient.setQueryData(['transactions', userAddress, typeFilter, selectedChainId], (oldData: any) => {
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
    <div className="mt-3">
      <div
        className="flex cursor-pointer items-center gap-0.5 px-3"
        onClick={() => {
          setOpenModalFilterByType(true)
        }}
      >
        <span className="text-[14px] font-[330] text-white">{typeLabel}</span>
        <img
          src="/images/icons/arrow-down2.svg"
          alt="arrown"
          className={`h-4 w-4 cursor-pointer transition-all duration-100 ${openModalFilterByType ? 'rotate-180' : ''}`}
        />
      </div>
      {transactions.length === 0 && (
        <div className="flex h-48 flex-col items-center justify-center">
          <IconEmpty />
          <span className="text-[0.75rem] text-[#FFFFFF80]">{t('history.nodata')}</span>
        </div>
      )}
      {Object.keys(transactionsGroupedByDate).length !== 0 &&
        Object.keys(transactionsGroupedByDate).map((date) => (
          <div key={date} className="mt-4">
            <div className="mb-2 px-3 text-[13px] leading-[10px] font-[330] text-white/50">
              {dayjs(date).format('YYYY-MM-DD')}
            </div>
            {transactionsGroupedByDate[date].map((transaction) => {
              return <TransactionRow transaction={transaction} key={transaction.id} />
            })}
          </div>
        ))}
      <FilterByType
        open={openModalFilterByType}
        showTitle={false}
        setOpen={setOpenModalFilterByType}
        typeFilter={typeFilter}
        onFilterByTypeChange={setTypeFilter}
      />
    </div>
  )
}
export default TabOrderHistory

function TransactionRow({ transaction }: { transaction: Order }) {
  const baseSymbol = transaction?.baseSymbol
  const baseAddress = transaction?.baseAddress
  const baseToken = transaction?.baseAddress
  const chainId = Number(transaction?.chainId) as ChainIds
  const isXStock = transaction?.isXStock || false
  const type = transaction?.transactionType
  const baseAmount = Number(transaction?.baseAmount)
  const closePriceUsd = Number(transaction?.closePriceUsd)
  const { logo: logoToken } = useTokenInfo(baseToken, chainId)
  return (
    <div
      key={transaction.id}
      className="flex items-center justify-between px-3 py-4 transition-colors duration-200 hover:bg-[#ECECED14]"
    >
      <div className="flex items-center gap-2">
        <LogoWithChain
          chainImgClassName={'h-[unset]'}
          logo={logoToken}
          logoClassName="w-[28px] h-[28px] rounded-full"
          chainLogo={getBlockchainLogo2(chainId)}
          name={baseSymbol}
        />
        <div>
          <div className="flex items-center gap-1.5">
            <div className="text-[16px] leading-none font-[380] text-white">{baseSymbol}</div>
            {isXStock && <IconXStock />}
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <div className="text-[14px] leading-none font-[330] text-white/50">{formatAddressWallet(baseAddress)}</div>
            <CopyButton text={baseAddress} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div
          className={`text-right text-[18px] leading-none font-[450] ${type === TransactionType.Buy ? 'text-rise' : type === TransactionType.Sell ? 'text-fall' : ''}`}
        >
          {type === TransactionType.Buy ? '+' : '-'}
          {formatAmount(baseAmount, {
            roundMode: 'floor',
          })}
        </div>
        <span className="text-[14px] leading-none font-[330] text-white/50">
          {formatVolume(baseAmount * closePriceUsd, {
            showCurrency: true,
            roundMode: 'floor',
          })}
        </span>
      </div>
    </div>
  )
}
