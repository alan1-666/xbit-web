import { useState, useMemo, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { MemeDto, ChainType } from '@/@generated/gql/graphql-future'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { futureClient, symbolDexClient } from '@/lib/gql/apollo-client'
import {
  removeTokenFromFavorite,
  updateFavoriteTokenOrder,
} from '@services/tokens.service'
import { IconEmpty } from '@components/icon'
import {
  GET_FAVORITE_SYMBOLS,
  UPSERT_FAVORITE_SYMBOL,
  UPDATE_FAVORITE_SYMBOL_ORDER,
} from '@/services/symbol.dex.service'
import { setFavorites, removeFavorite, ISymbolList } from '@/redux/modules/symbolList.slide'
import { loadSymbolListSnapshot, saveSymbolListSnapshot } from '@/utils/indexedDB/symbolListDB'
import { ServiceConfig } from '@/lib/gql/service-config'
import { mappedChainIdToChainType } from '@/redux/modules/newWallet.slice'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { getLaunchpad, getBlockChainLogo } from '@/utils/helpers'
import { getDexLogo } from '@/utils/lauchpad'
import { ChainIds } from '@/types/enums'
import { useWatchlistTokens } from '@/pages/meme/discover/desktop/hooks/useWatchlistTokens'
import { Configs } from '@/const/configs'

const TAB_VALUE = {
  CONTRACT: '合约',
  MEME: 'Meme',
  XSTOCKS: '美股',
} as const

type TabValue = (typeof TAB_VALUE)[keyof typeof TAB_VALUE]

interface FavoriteItem {
  id: string
  symbol: string
  selected: boolean
  iconUrl?: string
  launchpadLogo?: string
}

// 获取合约币种图标
const FUTURES_COINS_ICON = import.meta.env.VITE_FUTURES_COINS_ICON

const getCoinIconUrl = (coin: string) => {
  if (!coin || !FUTURES_COINS_ICON) return ''
  return `${FUTURES_COINS_ICON}/${coin}.svg`
}

// 获取 Meme 币种图标
const getMemeIconUrl = (token: MemeDto) => {
  const { symbol, image, avatarUrl } = token
  return avatarUrl || image || (symbol && FUTURES_COINS_ICON ? `${FUTURES_COINS_ICON}/${symbol.toUpperCase()}.svg` : '')
}

// 获取 Meme 的 launchpad logo
const getLaunchpadLogo = (token: MemeDto) => {
  const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
  return launchpad ? getDexLogo(launchpad) : undefined
}

// 图标加载错误处理
const onCoinIconError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  const target = e.currentTarget
  if (!target || target.dataset.fallbackApplied === 'true') return
  target.dataset.fallbackApplied = 'true'
}

// 可拖拽的列表项组件
interface DraggableItemProps {
  item: FavoriteItem
  onToggle: (id: string) => void
}

const DraggableItem = ({ item, onToggle }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  // 阻止拖拽区域的点击事件冒泡
  const handleDragAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex items-center justify-between h-[58px] px-[12px] select-none', isDragging && 'bg-[#27272a]')}
    >
      <div onClick={() => onToggle(item.id)} className="flex items-center gap-[12px] flex-1 min-w-0">
        <button className="w-[17px] h-[17px] flex-shrink-0">
          {item.selected ? (
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <rect width="17" height="17" rx="3" fill="#843BEA" />
              <path
                d="M4 8.5L7 11.5L13 5.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <rect x="0.5" y="0.5" width="16" height="16" rx="2.5" stroke="#3F3F46" fill="none" />
            </svg>
          )}
        </button>
        
        {/* 头像 */}
        {item.iconUrl && (
          <img
            src={item.iconUrl}
            alt={item.symbol}
            className="w-[24px] h-[24px] rounded-full bg-[#EDF0F4] object-contain flex-shrink-0"
            onError={onCoinIconError}
          />
        )}
        
        <p className="text-[14px] font-semibold leading-[14px] text-white truncate">{item.symbol}</p>
      </div>
      <div 
        {...attributes} 
        {...listeners}
        onClick={handleDragAreaClick}
        className="flex items-center justify-center pl-[12px] pr-[4px] py-[16px] -mr-[4px] cursor-grab active:cursor-grabbing touch-none"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 6H16M4 10H16M4 14H16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

const EditFavoritesPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  // 从 URL 参数初始化 tab
  const initialTab = useMemo(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'meme') return TAB_VALUE.MEME
    if (tabParam === 'xstocks' && Configs.enableSolana()) return TAB_VALUE.XSTOCKS
    return TAB_VALUE.CONTRACT
  }, [searchParams])

  // 判断是否从 discover 页面进来（隐藏 tab 切换）
  const isFromDiscover = useMemo(() => {
    const source = searchParams.get('source')
    return source === 'discover'
  }, [searchParams])

  const [currentTab, setCurrentTab] = useState<TabValue>(initialTab)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // 获取合约自选数据
  const symbolListState = useAppSelector((state: any) => state.symbolListSlice)
  const contractFavorites = symbolListState?.favorites || []

  // 本地排序状态（用于拖拽后的临时排序）
  const [localContractData, setLocalContractData] = useState<ISymbolList[]>([])
  const [localMemeData, setLocalMemeData] = useState<MemeDto[]>([])
  const [localXStockData, setLocalXStockData] = useState<MemeDto[]>([])

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  )

  // 获取合约收藏数据（从 API 或缓存）
  const { data: contractData = [] } = useQuery<ISymbolList[]>({
    enabled: ServiceConfig.token !== undefined,
    queryKey: ['contract-favorites-edit'],
    queryFn: async () => {
      // 如果 Redux 中已有数据，直接返回
      if (contractFavorites.length > 0) {
        return contractFavorites
      }

      // 尝试从缓存加载
      const cacheLoaded = await loadSymbolListSnapshot('favorite')
      if (cacheLoaded?.list?.length) {
        dispatch(setFavorites(cacheLoaded.list as ISymbolList[]))
        return cacheLoaded.list as ISymbolList[]
      }

      // 从 API 获取
      const { data } = await symbolDexClient.query({
        query: GET_FAVORITE_SYMBOLS,
      })
      const favorites = data?.getFavoriteSymbols?.list || []
      dispatch(setFavorites(favorites))
      return favorites
    },
  })

  // 获取 Meme 收藏数据（使用 useWatchlistTokens hook，与 FavoriteMemeList 保持一致）
  const {
    data: memeData = [],
    fetchNextPage: fetchNextMemePage,
    hasNextPage: memeHasNextPage,
    isFetchingNextPage: isFetchingNextMemePage,
    removeToken: removeMemeToken,
  } = useWatchlistTokens({
    excludeBlacklisted: false,
    favoriteType: 'MEME',
  })

  // 获取美股自选数据（使用 useWatchlistTokens hook，与 FavoriteMemeList 保持一致）
  const {
    data: xstockData = [],
    fetchNextPage: fetchNextXStockPage,
    hasNextPage: xstockHasNextPage,
    isFetchingNextPage: isFetchingNextXStockPage,
    removeToken: removeXStockToken,
  } = useWatchlistTokens({
    excludeBlacklisted: false,
    favoriteType: 'XSTOCK',
  })

  // 同步远程数据到本地状态
  useEffect(() => {
    setLocalContractData(contractData)
  }, [contractData])

  useEffect(() => {
    setLocalMemeData(memeData)
  }, [memeData])

  useEffect(() => {
    setLocalXStockData(xstockData)
  }, [xstockData])

  // 本地状态管理选中项
  const [selectedItems, setSelectedItems] = useState<Record<TabValue, Set<string>>>({
    [TAB_VALUE.CONTRACT]: new Set(),
    [TAB_VALUE.MEME]: new Set(),
    [TAB_VALUE.XSTOCKS]: new Set(),
  })

  // 转换数据格式 - 使用本地数据以支持拖拽排序
  const favorites = useMemo<Record<TabValue, FavoriteItem[]>>(() => {
    const currentContractData = localContractData.length > 0 ? localContractData : contractData
    const currentMemeData = localMemeData.length > 0 ? localMemeData : memeData
    const currentXStockData = localXStockData.length > 0 ? localXStockData : xstockData

    return {
      [TAB_VALUE.CONTRACT]: (currentContractData || []).map((item: any) => ({
        id: item.symbol || '',
        symbol: item.symbol || '',
        selected: selectedItems[TAB_VALUE.CONTRACT].has(item.symbol || ''),
        iconUrl: getCoinIconUrl(item.symbol || ''),
      })),
      [TAB_VALUE.MEME]: currentMemeData.map((item: MemeDto) => ({
        id: item.token || '',
        symbol: item.symbol || '',
        selected: selectedItems[TAB_VALUE.MEME].has(item.token || ''),
        iconUrl: getMemeIconUrl(item),
        launchpadLogo: getLaunchpadLogo(item),
      })),
      [TAB_VALUE.XSTOCKS]: currentXStockData.map((item: MemeDto) => {
        const chainId = item.chainId ? +item.chainId : ChainIds.Solana
        return {
          id: item.token || '',
          symbol: item.symbol || '',
          selected: selectedItems[TAB_VALUE.XSTOCKS].has(item.token || ''),
          iconUrl: item.avatarUrl || item.image || getBlockChainLogo(chainId, item.token!),
        }
      }),
    }
  }, [localContractData, localMemeData, localXStockData, contractData, memeData, xstockData, selectedItems])

  const tabs = useMemo(
    () => [
      { value: TAB_VALUE.CONTRACT, label: t('assets.futures.futures') },
      { value: TAB_VALUE.MEME, label: t('header.meme') },
      { value: TAB_VALUE.XSTOCKS, label: t('header.xstocks') },
    ].filter((t) => t.value !== TAB_VALUE.XSTOCKS || Configs.enableSolana()),
    [t],
  )

  const currentFavorites = favorites[currentTab]
  const selectedCount = selectedItems[currentTab].size
  const allSelected = selectedCount > 0 && selectedCount === currentFavorites.length

  const handleTabChange = useCallback((tab: TabValue) => {
    setCurrentTab(tab)
  }, [])

  const handleBack = useCallback(() => {
    navigate(location.state?.from || -1, { replace: true })
  }, [navigate, location.state?.from])

  const handleToggleItem = useCallback(
    (id: string) => {
      setSelectedItems((prev) => {
        const newSet = new Set(prev[currentTab])
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return {
          ...prev,
          [currentTab]: newSet,
        }
      })
    },
    [currentTab],
  )

  const handleToggleAll = useCallback(() => {
    setSelectedItems((prev) => {
      const newSet = new Set<string>()
      if (!allSelected) {
        currentFavorites.forEach((item) => newSet.add(item.id))
      }
      return {
        ...prev,
        [currentTab]: newSet,
      }
    })
  }, [currentTab, allSelected, currentFavorites])

  const handleRemoveSelected = useCallback(async () => {
    if (selectedCount === 0) return

    const selectedIds = Array.from(selectedItems[currentTab])

    try {
      if (currentTab === TAB_VALUE.CONTRACT) {
        // 合约：批量调用 API 删除
        const promises = selectedIds.map((symbol) =>
          symbolDexClient.mutate({
            mutation: UPSERT_FAVORITE_SYMBOL,
            variables: {
              input: {
                symbol,
                isFavorite: false,
              },
            },
          }),
        )

        await Promise.all(promises)

        // 更新 Redux 状态
        selectedIds.forEach((symbol) => {
          dispatch(removeFavorite(symbol))
        })

        // 更新缓存
        const updatedFavorites = contractFavorites.filter((item: ISymbolList) => !selectedIds.includes(item.symbol))
        await saveSymbolListSnapshot('favorite', {
          list: updatedFavorites,
          lastUpdated: Date.now(),
          condition: 'favorite',
        })

        // 更新本地状态
        setLocalContractData(updatedFavorites)
      } else if (currentTab === TAB_VALUE.MEME) {
        // Meme：批量调用 API 删除
        const memeTokensToRemove = memeData.filter((item) => selectedIds.includes(item.token || ''))
        const promises = memeTokensToRemove.map((item) => {
          // 根据 token 的 chainId 获取对应的 chain 类型
          const chain = item.chainId ? mappedChainIdToChainType(item.chainId) : undefined
          return futureClient.mutate({
            mutation: removeTokenFromFavorite,
            variables: {
              token: item.token,
              chain,
            },
          })
        })

        await Promise.all(promises)

        // 更新本地状态（使用 removeToken 方法）
        selectedIds.forEach((tokenId) => {
          removeMemeToken(tokenId)
        })
        setLocalMemeData((prev) => prev.filter((item) => !selectedIds.includes(item.token || '')))
      } else if (currentTab === TAB_VALUE.XSTOCKS) {
        // 美股：批量调用 API 删除（使用与 Meme 相同的 API）
        const promises = selectedIds.map((token) =>
          futureClient.mutate({
            mutation: removeTokenFromFavorite,
            variables: {
              token,
              chain: undefined,
            },
          }),
        )

        await Promise.all(promises)

        // 更新本地状态（使用 removeToken 方法）
        selectedIds.forEach((tokenId) => {
          removeXStockToken(tokenId)
        })
        setLocalXStockData((prev) => prev.filter((item) => !selectedIds.includes(item.token || '')))
      }

      // 清空选中状态
      setSelectedItems((prev) => ({
        ...prev,
        [currentTab]: new Set(),
      }))

      // 刷新数据
      await queryClient.invalidateQueries({ queryKey: ['contract-favorites-edit'] })
      await queryClient.invalidateQueries({ queryKey: ['tokens', 'watchlist'] })

      // 关闭确认弹窗
      setShowConfirmDialog(false)

      // 显示成功提示
      toast.success(t('toast.removeFavoriteSuccess'), {
        duration: 3000,
      })
    } catch (error) {
      console.error('删除失败:', error)
      toast.error(t('toast.removeFavoriteFailed'), {
        duration: 3000,
      })
      setShowConfirmDialog(false)
    }
  }, [currentTab, selectedCount, selectedItems, contractFavorites, dispatch, queryClient, memeData, removeMemeToken, removeXStockToken, t])

  const handleConfirmRemove = useCallback(() => {
    if (selectedCount === 0) return
    setShowConfirmDialog(true)
  }, [selectedCount])

  // 加载更多数据（Meme 和 XStock 都支持分页）
  const handleLoadMore = useCallback(() => {
    if (currentTab === TAB_VALUE.MEME && memeHasNextPage && !isFetchingNextMemePage) {
      fetchNextMemePage()
    } else if (currentTab === TAB_VALUE.XSTOCKS && xstockHasNextPage && !isFetchingNextXStockPage) {
      fetchNextXStockPage()
    }
  }, [currentTab, memeHasNextPage, isFetchingNextMemePage, fetchNextMemePage, xstockHasNextPage, isFetchingNextXStockPage, fetchNextXStockPage])

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      if (!active || !over || active.id === over.id) return

      if (currentTab === TAB_VALUE.CONTRACT) {
        setLocalContractData((items) => {
          const currentData = items.length > 0 ? items : contractData
          const oldIndex = currentData.findIndex((item: ISymbolList) => item.symbol === active.id)
          const newIndex = currentData.findIndex((item: ISymbolList) => item.symbol === over.id)
          const newOrder = arrayMove(currentData, oldIndex, newIndex) as ISymbolList[]

          // 保存到缓存
          saveSymbolListSnapshot('favorite', {
            list: newOrder,
            lastUpdated: Date.now(),
            condition: 'favorite',
          })

          // 更新 Redux
          dispatch(setFavorites(newOrder))

          // 调用排序接口
          const symbols = newOrder.map((item: ISymbolList) => item.symbol)
          symbolDexClient
            .mutate({
              mutation: UPDATE_FAVORITE_SYMBOL_ORDER,
              variables: {
                input: {
                  symbols,
                },
              },
            })
            .catch((error) => {
              console.error('更新排序失败:', error)
            })

          return newOrder
        })
      } else if (currentTab === TAB_VALUE.MEME) {
        setLocalMemeData((items) => {
          const currentData = items.length > 0 ? items : localMemeData
          const oldIndex = currentData.findIndex((item) => item.token === active.id)
          const newIndex = currentData.findIndex((item) => item.token === over.id)
          const newOrder = arrayMove(currentData, oldIndex, newIndex)

          // 调用排序接口 - 为每个移动的 token 调用
          const movedToken = newOrder[newIndex]
          if (movedToken?.token && movedToken?.chainId) {
            const chain = mappedChainIdToChainType(movedToken.chainId)
            futureClient
              .mutate({
                mutation: updateFavoriteTokenOrder,
                variables: {
                  input: {
                    token: movedToken.token,
                    chain,
                    newPosition: newIndex,
                  },
                },
              })
              .catch((error) => {
                console.error('更新 Meme 排序失败:', error)
              })
          }

          return newOrder
        })
      } else if (currentTab === TAB_VALUE.XSTOCKS) {
        setLocalXStockData((items) => {
          const currentData = items.length > 0 ? items : localXStockData
          const oldIndex = currentData.findIndex((item) => item.token === active.id)
          const newIndex = currentData.findIndex((item) => item.token === over.id)
          const newOrder = arrayMove(currentData, oldIndex, newIndex)

          // 调用排序接口 - XStocks 使用 Solana 链
          const movedToken = newOrder[newIndex]
          if (movedToken?.token) {
            futureClient
              .mutate({
                mutation: updateFavoriteTokenOrder,
                variables: {
                  input: {
                    token: movedToken.token,
                    chain: ChainType.Solana,
                    xStockOrder: newIndex,
                  },
                },
              })
              .catch((error) => {
                console.error('更新 XStocks 排序失败:', error)
              })
          }

          return newOrder
        })
      }
    },
    [currentTab, contractData, localMemeData, localXStockData, dispatch],
  )

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="relative h-[44px] bg-[#0a0a0a] flex items-center justify-center">
        <button
          onClick={handleBack}
          className="absolute left-0 h-full flex items-center justify-center px-3"
          aria-label="go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-[16px] font-normal leading-[17px] text-white">{t('exchange.edit.favorite')}</p>
      </div>

      {/* Tabs - 从 discover 页面进来时隐藏 */}
      {!isFromDiscover && (
        <div className="flex gap-[20px] items-center px-[12px] mt-[16px]">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'text-[14px] font-medium leading-none text-center',
                currentTab === tab.value ? 'text-white' : 'text-[#908e98]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* List Header */}
      {currentFavorites.length > 0 && (
        <div className="flex items-center justify-between px-[12px] py-[1px] mt-[16px]">
          <div className="text-[12px] leading-[16px] text-[#908e98]"> {t('assets.funding.assets')}</div>
          <div className="text-[12px] leading-[16px] text-[#908e98]">{t('holding.sort.sorting')}</div>
        </div>
      )}

      {/* List */}
      <div 
        className="flex-1 overflow-y-auto"
        onScroll={(e) => {
          // Meme 和 XStock tab 需要处理滚动加载
          if (currentTab !== TAB_VALUE.MEME && currentTab !== TAB_VALUE.XSTOCKS) return
          
          const target = e.currentTarget
          const scrollTop = target.scrollTop
          const scrollHeight = target.scrollHeight
          const clientHeight = target.clientHeight
          
          // 滚动到底部时加载更多
          if (scrollHeight - scrollTop - clientHeight < 100) {
            handleLoadMore()
          }
        }}
      >
        {currentFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pb-20">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={currentFavorites.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                {currentFavorites.map((item) => (
                  <DraggableItem key={item.id} item={item} onToggle={handleToggleItem} />
                ))}
              </SortableContext>
            </DndContext>
            
            {/* 加载更多指示器 */}
            {((currentTab === TAB_VALUE.MEME && isFetchingNextMemePage) || 
              (currentTab === TAB_VALUE.XSTOCKS && isFetchingNextXStockPage)) && (
              <div className="flex items-center justify-center py-4">
                <div className="text-[#FFFFFF80] text-[0.75rem]">{t('common.loading')}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-[12px] pb-15">
        <button
          onClick={handleToggleAll}
          className="flex items-center gap-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentFavorites.length === 0}
        >
          <div className="w-[17px] h-[17px]">
            {allSelected ? (
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <rect width="17" height="17" rx="3" fill="#843BEA" />
                <path
                  d="M4 8.5L7 11.5L13 5.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <rect x="0.5" y="0.5" width="16" height="16" rx="2.5" stroke="#3F3F46" fill="none" />
              </svg>
            )}
          </div>
          <p className="text-[14px] leading-[20px] text-white">
            {t('exchange.select.all')}
            {selectedCount > 0 ? `(${selectedCount})` : ''}
          </p>
        </button>
        <button
          onClick={handleConfirmRemove}
          disabled={selectedCount === 0}
          className={cn('flex items-center gap-[8px]', selectedCount === 0 && 'opacity-50')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4.66667H14M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333M3.33333 4.66667L4 13.3333C4 13.687 4.14048 14.0261 4.39052 14.2761C4.64057 14.5262 4.97971 14.6667 5.33333 14.6667H10.6667C11.0203 14.6667 11.3594 14.5262 11.6095 14.2761C11.8595 14.0261 12 13.687 12 13.3333L12.6667 4.66667M6 4.66667V2.66667C6 2.48986 6.07024 2.32029 6.19526 2.19526C6.32029 2.07024 6.48986 2 6.66667 2H9.33333C9.51014 2 9.67971 2.07024 9.80474 2.19526C9.92976 2.32029 10 2.48986 10 2.66667V4.66667"
              stroke={selectedCount > 0 ? '#FF1568' : '#CACACA'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className={cn('text-[14px] leading-[20px]', selectedCount > 0 ? 'text-[#ff1568]' : 'text-[#cacaca]')}>
            {t('futuresDetails.margin.remove')}
            {selectedCount > 0 ? `(${selectedCount})` : ''}
          </p>
        </button>
      </div>

      {/* 确认删除弹窗 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent
          className="w-[270px] p-0 bg-[#2b2b33] border-none rounded-[15px] backdrop-blur-[67.957px]"
          showDialogPrimitiveClose={false}
          overlayClassName="bg-[rgba(0,0,0,0.7)]"
        >
          <div className="flex flex-col">
            {/* 标题 */}
            <div className="border-b border-[#343339] px-4 py-6">
              <p className="text-white text-[16px] font-semibold leading-[24px] text-center">
                {t('exchange.confirm.delete.favorite')}
              </p>
            </div>

            {/* 按钮 */}
            <div className="flex">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-[46px] px-4 py-[11px] text-white text-[16px] font-normal leading-[24px] text-center"
              >
                {t('common.cancel')}
              </button>

              <div className="w-[0.5px] bg-[#343339]" />

              <button
                onClick={handleRemoveSelected}
                className="flex-1 h-[46px] px-4 py-[11px] text-[#ff1568] text-[16px] font-normal leading-[24px] text-center"
              >
                {t('futuresDetails.margin.remove')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EditFavoritesPage
