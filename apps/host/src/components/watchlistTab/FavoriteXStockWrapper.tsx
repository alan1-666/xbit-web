import React, { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useWatchlistTokens } from '@/pages/meme/discover/desktop/hooks/useWatchlistTokens'
import './favorite-xstock-wrapper.css'
import RecommendedXStocks from './RecommendedXStocks'
import XStockWatchList from './XStockWatchlist'

interface FavoriteXStockWrapperProps {
  className?: string
  type?: string
}

/**
 * 美股收藏列表的包装组件
 * 用于在 market 页面的自选 tab 中显示，调整样式以匹配设计
 */
const FavoriteXStockWrapper: React.FC<FavoriteXStockWrapperProps> = ({ className: _className, type: _type }) => {
  const activeWallet = useActiveWallet()
  const queryClient = useQueryClient()

  // 使用 useWatchlistTokens hook 获取收藏的美股列表
  const { data: items = [], isLoading, refetch, removeToken } = useWatchlistTokens({
    excludeBlacklisted: false,
    favoriteType: 'XSTOCK',
  })

  const handleAddSuccess = useCallback(() => {
    // 刷新自选列表
    queryClient.invalidateQueries({ queryKey: ['tokens', 'watchlist'] })
    refetch()
  }, [queryClient, refetch])

  const handleItemRemoved = useCallback((token: any) => {
    // 使用 removeToken 方法从缓存中移除
    removeToken(token.token || token.address)
    
    // 刷新列表
    queryClient.invalidateQueries({ queryKey: ['tokens', 'watchlist'] })
  }, [removeToken, queryClient])

  // 如果已登录且没有自选美股，显示推荐列表
  if (activeWallet.isConnected && !isLoading && items.length === 0) {
    return <RecommendedXStocks onAddSuccess={handleAddSuccess} />
  }

  // 否则显示正常的自选列表，传递数据和回调
  // 转换数据格式以匹配 XStockCard 的期望
  const transformedItems = items.map((item: any) => ({
    ...item,
    address: item.token || item.address, // 确保有 address 字段
    logoUrl: item.avatarUrl || item.image || item.logoUrl, // 确保有 logoUrl 字段
    marketCap: item.marketCap || item.marketcap, // 确保有 marketCap 字段
  }))

  return (
    <XStockWatchList 
      headerClassName="sticky !top-[62px] !z-[11] bg-[#0A0A0A]"
      items={transformedItems as any}
      isLoading={isLoading}
      onItemRemoved={handleItemRemoved}
    />
  )
}

export default FavoriteXStockWrapper
