import React, { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import XStockWatchlistCard from './XStockWatchlistCard'
import { XStockToken } from '@/types/xstocks.ts'
import { ApolloClient } from '@apollo/client'
import { getXStocksTokens, removeTokenFromFavorite } from '@services/tokens.service.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { ButtonConnectWallet } from '@components/common/ButtonConnectWallet.tsx'
import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useSortedList } from '@components/xstocks/hooks/useSortedList.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { xstocksActions } from '@/redux/modules/xstocks.slice.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { SortDirection, TokenSortFields } from '@/@generated/gql/graphql-future.ts'
import { useTranslation } from 'react-i18next'
import XStockHeader, { SortBy } from '../xstocks/XStockHeader'
import { toast } from 'sonner'
import { useActiveChainType } from '@/hooks/useActiveChain'
import { useMutation } from '@apollo/client/react/hooks/useMutation'

const fetchXStockWatchlist = async (client: ApolloClient<any>): Promise<XStockToken[]> => {
  const res = await client.query({
    query: getXStocksTokens,
    variables: {
      input: {
        chainId: 501424,
        categoryId: 'XStock',
        page: 1,
        limit: 100,
        sortBy: TokenSortFields.MarketCap,
        sortType: SortDirection.Desc,
      },
    },
  })
  const tokens = res.data.tokensByCategory?.data || []
  return tokens.filter((token) => token.isFavorite)
}

const TabWatchlistContent = (props: {
  items: XStockToken[]
  isLoading: boolean
  isConnected: boolean
  onItemRemoved: (token: XStockToken) => void
}) => {
  const { items, isLoading, isConnected, onItemRemoved } = props
  const { t } = useTranslation()
  const handleDelete = (token: XStockToken) => {
    onItemRemoved?.(token)
  }

  if (!isConnected)
    return (
      <div className="pt-[100px]">
        <ButtonConnectWallet />
      </div>
    )
  if (isLoading) return <ListTokenSkeleton />
  if (items.length === 0)
    return (
      <div className="m-auto">
        <EmptyList emptyText={t('listCoin.noDataWatchlist')} />
      </div>
    )

  return (
    <AnimatePresence>
      {items.map((item) => (
        <motion.div key={item.address} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5 }}>
          <XStockWatchlistCard token={item} onItemRemoved={() => handleDelete(item)} />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

interface TabWatchlistProps {
  headerClassName?: string
  items?: XStockToken[] // 可选的外部数据
  isLoading?: boolean // 可选的加载状态
  onItemRemoved?: (token: XStockToken) => void // 可选的删除回调
}

const TabWatchlist: React.FC<TabWatchlistProps> = ({ 
  headerClassName, 
  items: externalItems, 
  isLoading: externalIsLoading,
  onItemRemoved: externalOnItemRemoved 
}) => {
  const queryClient = useQueryClient()
  const activeWallet = useActiveWallet()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const sortBy = useAppSelector((state) => state.xstocks.sorts.watchlist as SortBy)
  const setSortBy = useCallback(
    (newSortBy: SortBy) => {
      dispatch(xstocksActions.setSortBy({ tab: 'watchlist', sortBy: newSortBy }))
    },
    [dispatch],
  )
  const [removeFromFavoritesMutation] = useMutation(removeTokenFromFavorite, { client: futureClient })
  const activeChainType = useActiveChainType()
  
  // 如果没有传入外部数据，则使用内部查询
  const { data: internalItems = [], isLoading: internalIsLoading } = useQuery<XStockToken[]>({
    enabled: activeWallet.isConnected && !externalItems, // 只有在没有外部数据时才查询
    queryKey: ['xstock-watchlist'],
    queryFn: () => fetchXStockWatchlist(futureClient),
  })

  // 使用外部数据或内部数据
  const items = externalItems || internalItems
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading

  const handleOnItemRemoved = async (token: XStockToken) => {
    // 如果有外部回调，使用外部回调
    if (externalOnItemRemoved) {
      externalOnItemRemoved(token)
      return
    }

    // 否则使用内部逻辑
    // 立即更新本地缓存（乐观更新）
    queryClient.setQueryData(['xstock-watchlist'], (oldItems: XStockToken[] | undefined) => {
      if (!oldItems) return oldItems
      return oldItems.filter((item) => item.address !== token.address)
    })

    // 显示成功提示
    toast.success(t('toast.removeFavoriteSuccess'), {
      duration: 3000,
    })

    // 并行执行 mutation
    removeFromFavoritesMutation({ variables: { token: token.address, chain: activeChainType } }).catch(() => {
      // 如果失败，恢复数据
      queryClient.invalidateQueries({ queryKey: ['xstock-watchlist'] })
      toast.warning(t('toast.removeFavoriteFailed'))
    })
  }

  // 始终对数据进行排序
  const sortedList = useSortedList(items, sortBy, '24h')

  return (
    <div className="flex-1 flex flex-col">
      <XStockHeader className="pt-2.5!" headerClassName={headerClassName} defaultSortBy={sortBy} onSortChange={setSortBy} />
      <TabWatchlistContent
        key={`watchlist-${sortBy.field}-${sortBy.direction}`}
        isLoading={isLoading}
        items={sortedList}
        isConnected={activeWallet.isConnected}
        onItemRemoved={handleOnItemRemoved}
      />
    </div>
  )
}

export default TabWatchlist
