import {
  ChainType,
  Order,
  OrderSortField,
  SearchOrderInput,
  SortDirection,
  TransactionType,
} from '@/@generated/gql/graphql-trading.ts'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { formatAmount, formatVolume } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client'
import { formatAddressWallet } from '@/lib/string'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { getTransactions } from '@/services/order.service'
import { ChainIds } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers'
import { CopyButton } from '@components/common/copy-button.tsx'
import { Loading } from '@components/common/Loading.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconEmpty } from '@components/icon'
import { useInfiniteQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

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

const Item = ({ data }: { data: Order }) => {
  const baseSymbol = data?.baseSymbol
  const baseAddress = data?.baseAddress
  const baseToken = data?.baseAddress
  const chainId = Number(data?.chainId) as ChainIds
  const isXStock = data?.isXStock || false
  const type = data?.transactionType
  const baseAmount = Number(data?.baseAmount)
  const closePriceUsd = Number(data?.closePriceUsd)
  const { logo: logoToken } = useTokenInfo(baseToken, chainId)
  return (
    <div className="flex items-center justify-between p-3 transition-colors duration-200 hover:bg-[#ECECED14]">
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
            <div className="text-[14px] leading-none font-medium text-white">{baseSymbol}</div>
            {isXStock && <IconXStock />}
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <div className="text-[10px] leading-none font-medium text-white/50">{formatAddressWallet(baseAddress)}</div>
            <CopyButton text={baseAddress} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div
          className={`text-right text-[14px] leading-none font-medium ${type === TransactionType.Buy ? 'text-rise' : type === TransactionType.Sell ? 'text-fall' : ''}`}
        >
          {type === TransactionType.Buy ? '+' : '-'}
          {formatAmount(baseAmount, {
            roundMode: 'floor',
          })}
        </div>
        <span className="text-[11px] leading-none text-[#605E68]">
          {formatVolume(baseAmount * closePriceUsd, {
            showCurrency: true,
            roundMode: 'floor',
          })}
        </span>
      </div>
    </div>
  )
}

const Orders = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { chainId, wallet } = location.state || {}
  const activeWallet = useSelector(_activeWallet)
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: ['orders', wallet, chainId, activeWallet.chainId, activeWallet.walletAddress],
    enabled: !!wallet,
    queryFn: async ({ pageParam }) => {
      const queryInput: SearchOrderInput = {
        userAddress: wallet || activeWallet?.walletAddress || '',
        limit: 20,
        offset: pageParam,
        sortDir: SortDirection.Desc,
        sortField: OrderSortField.CreatedAt,
        chain: mapChainIdToChainType(chainId || activeWallet?.chainId || 0),
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
  })

  const orders = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flat()
  }, [data])

  const ordersGroupByDate = useMemo(() => {
    const group: Record<string, Order[]> = {}
    orders.forEach((order) => {
      const date = dayjs(order.createdAt).format('YYYY-MM-DD')
      if (!group[date]) {
        group[date] = []
      }
      group[date].push(order)
    })
    return group
  }, [orders])

  useEffect(() => {
    refetch()
  }, [chainId, wallet])

  return (
    <div
      className="no-scrollbar p-4 space-y-2 overflow-auto"
      onScroll={(e) => {
        const target = e.target as HTMLDivElement
        if (target.scrollTop + target.clientHeight >= target.scrollHeight * 0.75) {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }
      }}
    >
      {!isLoading && orders && orders.length > 0 && (
        <div className="space-y-3">
          {Object.keys(ordersGroupByDate).map((date) => (
            <div key={date} className="space-y-2">
              <div className="text-[11px] text-[#605E68]">{dayjs(date).format('YYYY/MM/DD')}</div>
              <div className="">
                {ordersGroupByDate[date].map((order) => {
                  return (
                    <div key={order.id}>
                      <Item data={order} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && orders.length === 0 && (
        <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
          <IconEmpty />
          <span className="text-[0.75rem] text-[#FFFFFF80]">{t('history.nodata')}</span>
        </div>
      )}
      {(isFetchingNextPage || isLoading) && (
        <div className="flex items-center justify-center py-4">
          <Loading />
        </div>
      )}
    </div>
  )
}

export default Orders
