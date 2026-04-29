import useHandleGetData from '@/pages/futures-market/hooks/useHandleGetData'
import useSymbolListSubscription, { useMergedData } from '@/pages/futures-market/hooks/useSymbolListSubscription'
import { SymbolListState } from '@/redux/modules/symbolList.slide'
import { RootState, useAppSelector } from '@/redux/store'
import FuturesFooterCard from './FuturesFooterCard'
import { memo, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ServiceConfig } from '@/lib/gql/service-config'

const FuturesFooterListCard = () => {
  const { symbolData } = useSymbolListSubscription({
    shouldSkip: false,
  })

  const { favorites, lists } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)

  // 使用 token 判定登录，避免 isLogin 与 token 不一致造成加载态卡住
  const isLoggedIn = !!ServiceConfig.token

  // 收藏数据（登录时）
  const { isLoadingFavorite, getFavoriteSymbols, symbolsFavorite } = useHandleGetData({
    condition: 'volume',
    isFavorite: isLoggedIn,
    skip: !isLoggedIn, // 未登录时跳过收藏数据获取
    isDisabledNomalList: true, // 避免重复请求普通列表
    refetchOnFavoritesChange: true, // 收藏数量变化时重新拉取
  })

  // 成交量数据（未登录或收藏为空时兜底）
  const { isLoading: isLoadingVolume } = useHandleGetData({
    condition: 'volume',
    isFavorite: false,
    skip: isLoggedIn, // 已登录时跳过成交量数据获取
  })

  // 组装两类数据并做兜底：登录优先展示收藏，否则展示成交量 Top5
  const mergedFavorites = useMergedData(symbolsFavorite?.length ? symbolsFavorite : favorites, symbolData)
  const mergedVolumeTop5 = useMergedData(lists.volume.slice(0, 5), symbolData)
  const displayData = isLoggedIn && mergedFavorites.length > 0 ? mergedFavorites : mergedVolumeTop5

  // 仅在实际负责的数据源处于加载中且最终无数据时展示 Skeleton
  const isResponsibleLoading = isLoggedIn ? isLoadingFavorite : isLoadingVolume
  const hasData = displayData.length > 0

  // 兜底：登录后若收藏仍为空，主动触发一次收藏拉取
  useEffect(() => {
    if (isLoggedIn && favorites.length === 0) {
      getFavoriteSymbols()
    }
  }, [isLoggedIn])
  
  if (isResponsibleLoading && !hasData) {
    return (
      <div className="min-w-fit h-full flex gap-5 items-center overflow-x-auto">
        {[1, 2, 3, 4, 5].map((r) => (
          <Skeleton className="h-[15px] w-[100px] flex-shrink-0" key={r} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-w-fit h-full flex gap-5 items-center flex-1 overflow-x-auto scrollbar-hide">
      {displayData.map((token) => (
        <FuturesFooterCard key={token.symbol} cardItem={token} />
      ))}
    </div>
  )
}

export default memo(FuturesFooterListCard)
