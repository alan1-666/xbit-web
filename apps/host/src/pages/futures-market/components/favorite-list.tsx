import Text from '@/components/common/Text'
import Optional from '@/components/futuresDiscover/optional'
import RecommendedContracts from '@/components/watchlistTab/RecommendedContracts'
import { LeverageBadge } from '@/components/futuresDiscover/table/crypto-table'
import { PriceChange } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { UPSERT_FAVORITE_SYMBOL } from '@/services/symbol.dex.service'
import { formatMoney, formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useMergedData } from '../hooks/useSymbolListSubscription'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import {
  ISymbolList,
  removeFavorite,
  setFavorites,
  setIsEmptyFavorites,
  SymbolListState,
} from '@/redux/modules/symbolList.slide'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { CoinIcon, PairName } from './market-overview-table-utils'
import { useFavoriteSymbols } from '../hooks/useFavoriteSymbols'

type SortMode = 'default' | 'desc' | 'asc'
type SortKey = 'symbol' | 'marketCap' | 'currentPrice' | 'volume' | 'changPxPercent'

const DEFAULT_PAGE_SIZE = 20

const SortHeader = React.memo(
  ({
    text,
    onSort,
    sortIndicator,
  }: {
    text: string
    onSort: () => void
    sortIndicator: { upColor: string; downColor: string }
  }) => {
    return (
      <div className="flex cursor-pointer" onClick={onSort}>
        <Text text={text} fontSize={11} fontWeight="light" color="#5E5C66" className="cursor-pointer" />
        <div className="flex flex-col ml-1 cursor-pointer">
          <IconSortUp currentColor={sortIndicator.upColor} />
          <IconSortDown currentColor={sortIndicator.downColor} />
        </div>
      </div>
    )
  },
)

SortHeader.displayName = 'SortHeader'

const toNumberValue = (value: unknown) => {
  const num = Number(value)
  if (!Number.isFinite(num)) {
    return 0
  }
  return num
}

const sortFavorites = (data: ISymbolList[], sortState: { key: SortKey | null; mode: SortMode }) => {
  if (sortState.mode === 'default' || !sortState.key) {
    return data
  }

  const { key, mode } = sortState
  const directionMap: Record<Exclude<SortMode, 'default'>, number> = {
    asc: 1,
    desc: -1,
  }
  const direction = directionMap[mode]

  return [...data].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]

    if (key === 'symbol') {
      const result = String(aValue || '').localeCompare(String(bValue || ''))
      return result * direction
    }

    const result = toNumberValue(aValue) - toNumberValue(bValue)
    return result * direction
  })
}

const Favorites = ({
  isLoading,
  symbolsFavorite,
  type,
  onRemoveFromFavorites,
  scrollElement,
}: {
  symbolsFavorite: ISymbolList[]
  isLoading: boolean
  type: string
  onRemoveFromFavorites: (symbol: string) => void
  scrollElement?: HTMLDivElement | null
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE)
  const [sortState, setSortState] = useState<{ key: SortKey | null; mode: SortMode }>({
    key: null,
    mode: 'default',
  })

  const onClickSortHeader = useCallback((key: SortKey) => {
    setSortState((prev) => {
      if (prev.key !== key) {
        return {
          key,
          mode: 'desc',
        }
      }

      const nextModeMap: Record<SortMode, SortMode> = {
        default: 'desc',
        desc: 'asc',
        asc: 'default',
      }

      const nextMode = nextModeMap[prev.mode]
      if (nextMode === 'default') {
        return {
          key: null,
          mode: 'default',
        }
      }

      return {
        key,
        mode: nextMode,
      }
    })
  }, [])

  const getSortIndicator = useCallback(
    (key: SortKey, activeColorProps?: string) => {
      const activeColor = activeColorProps ? activeColorProps : '#843BEA'
      const inactiveColor = '#5E5C66'

      let upColor = inactiveColor
      let downColor = inactiveColor

      if (sortState.key === key) {
        if (sortState.mode === 'asc') {
          upColor = activeColor
        }
        if (sortState.mode === 'desc') {
          downColor = activeColor
        }
      }

      return { upColor, downColor }
    },
    [sortState],
  )

  const handleRowClick = useCallback((row: ISymbolList) => {
    navigate(`/futures/${row.symbol}`)
  }, [])

  const handleUpsertFavorite = useCallback(async (symbol: string, isFavorite: boolean) => {
    try {
      const { data } = await symbolDexClient.mutate({
        mutation: UPSERT_FAVORITE_SYMBOL,
        variables: {
          input: {
            symbol,
            isFavorite,
          },
        },
      })

      if (data?.upsertFavoriteSymbol.status !== 'success') {
        console.error('Mutation error:', data.error)
        toast.error('Error occurred while updating favorite status', {
          duration: 3000,
        })
        return { success: false, error: data.error }
      }

      return {
        success: data?.upsertFavoriteSymbol.status || 'success',
        error: null,
      }
    } catch (err: any) {
      console.error('Network error:', err)
      toast.error(err[0].message, {
        duration: 3000,
      })
      return { success: false, error: 'Network error occurred' }
    }
  }, [])

  const handleSwipeDelete = useCallback(
    async (symbolData: ISymbolList): Promise<void> => {
      try {
        // 立即从本地缓存移除（乐观更新）
        onRemoveFromFavorites(symbolData.symbol)

        // 并行执行 mutation 和显示成功提示
        handleUpsertFavorite(symbolData.symbol, false).catch((error) => {
          console.error('删除失败:', error)
          toast.error(t('toast.removeFavoriteFailed'), {
            duration: 3000,
          })
        })

        toast.success(t('toast.removeFavoriteSuccess'), {
          duration: 3000,
        })
      } catch (error) {
        console.error('删除失败:', error)
        toast.error(t('toast.removeFavoriteFailed'), {
          duration: 3000,
        })
        throw error
      }
    },
    [handleUpsertFavorite, onRemoveFromFavorites, t],
  )

  const sortedData = useMemo(() => {
    return sortFavorites(symbolsFavorite, sortState)
  }, [symbolsFavorite, sortState])

  const visibleData = useMemo(() => {
    return sortedData
  }, [sortedData, visibleCount])

  const onBottomReached = useCallback(() => {
    if (type !== 'home') {
      return
    }
    setVisibleCount((prev) => {
      if (prev >= symbolsFavorite.length) {
        return prev
      }
      return Math.min(prev + DEFAULT_PAGE_SIZE, symbolsFavorite.length)
    })
  }, [type, symbolsFavorite.length])

  const columnHelper = useMemo(() => {
    return createColumnHelper<ISymbolList>()
  }, [])

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center">
            <div className="flex items-center gap-1.5">
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.token')}
                onSort={() => onClickSortHeader('symbol')}
                sortIndicator={getSortIndicator('symbol')}
              />
              <div className="w-px h-3 bg-[#414141]"></div>
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.marketCap')}
                onSort={() => onClickSortHeader('marketCap')}
                sortIndicator={getSortIndicator('marketCap')}
              />
            </div>
          </div>
        ),
        cell: (info) => {
          const { symbol, marketCap, maxLeverage } = info.row.original

          return (
            <div className="flex items-center gap-2">
              <CoinIcon symbol={symbol} />
              <div className="flex flex-col gap-1">
                <div className="flex items-end">
                  <PairName symbol={symbol} marketKind="futures" />
                  <LeverageBadge value={maxLeverage as unknown as string} />
                </div>
                <div className="flex gap-1 items-end">
                  <div className="text-[calc(1rem*(12/16))] text-[#FFFFFF80] lining-nums">{formatMoney(marketCap)}</div>
                </div>
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('currentPrice', {
        header: () => (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1.5">
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.price')}
                onSort={() => onClickSortHeader('currentPrice')}
                sortIndicator={getSortIndicator('currentPrice')}
              />
              <div className="w-px h-3 bg-[#414141]"></div>
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.volume')}
                onSort={() => onClickSortHeader('volume')}
                sortIndicator={getSortIndicator('volume')}
              />
            </div>
          </div>
        ),
        cell: (info: any) => {
          const currentPrice = info.getValue()
          const volume = info.row.original.volume
          return (
            <div className="flex items-end gap-1 flex-col relative">
              <Text
                text={formatNumberWithCommas(`${currentPrice}`, 9)}
                fontSize={14}
                fontWeight="medium"
                className="lining-nums"
              />
              <Text
                text={formatMoney(volume)}
                fontSize={12}
                fontWeight="regular"
                color="#908E98"
                className="lining-nums"
              />
            </div>
          )
        },
      }),
      columnHelper.accessor('changPxPercent', {
        header: () => (
          <div className="flex justify-end gap-2">
            <div className="flex items-center text-right">
              <SortHeader
                text={t('tokenSearchDrawer.tableHeaders.24hChange')}
                onSort={() => onClickSortHeader('changPxPercent')}
                sortIndicator={getSortIndicator('changPxPercent')}
              />
            </div>
          </div>
        ),
        cell: (info) => {
          const changePercent = info.getValue()
          return <PriceChange value={formatPercentage(changePercent)} isPositive={Number(changePercent) > 0} />
        },
      }),
    ]
  }, [columnHelper, getSortIndicator, onClickSortHeader])

  return (
    <>
      <TableVirtual<ISymbolList, any>
        isLoading={isLoading}
        columns={columns}
        data={visibleData}
        isStickyHeader={true}
        // tableClassName="table-fixed"
        containerClassName={'!border-none _hidescrollbar !overflow-visible'}
        cusTomMaxHeight={'none'}
        disableMaxHeight={false}
        scrollElement={scrollElement || undefined}
        tableHeaderClassName={cn(
          'text-[#5E5C66] text-[12px] font-[300]',
          type === 'home' ? ' top-[36px]!' : ' top-[60px]!',
        )}
        tableHeaderRowClassName="!border-none "
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-3 justify-end px-table-cell w-27-precent"
        tableHeadClassName="px-table-cell w-27-precent bg-[#0A0A0A] pt-4 pb-2.5"
        enableSwipeToDelete={true}
        onSwipeDelete={handleSwipeDelete}
        swipeDeleteText="Delete"
        onRowClick={handleRowClick}
        onBottomReached={onBottomReached}
        tableRowClassName="!border-none"
        rowHeight={61}
        paddingBottom={type === 'home' ? '80px' : '0'}
        wrapperClassName="min-h-full"
        cusTomMaxHeightPC="100%"
      />
    </>
  )
}

const FavoriteList = ({
  symbolData,
  type,
  recommendedContracts = [],
  scrollElement,
}: {
  symbolData: ISymbolList[]
  type: string
  recommendedContracts?: ISymbolList[]
  scrollElement?: HTMLDivElement | null
}) => {
  const dispatch = useAppDispatch()

  const {
    lists: { volume },
  } = useAppSelector<RootState, SymbolListState>((state) => state.symbolListSlice)

  // 使用新的 React Query hook
  const { favorites, isLoading: isLoadingFavorite, removeSymbol, refetch } = useFavoriteSymbols()

  const currentData = useMergedData(volume, symbolData)
  const currentDataFavorite = useMergedData(favorites, symbolData)

  const isEmptyFavorites = favorites.length === 0

  // 只有在用户没有收藏任何合约时，才使用推荐合约数据（持仓额前8个）
  const optionalData = useMemo(() => {
    // 如果用户有收藏，不展示推荐数据
    if (favorites.length > 0) {
      return []
    }
    // 用户没有收藏时，优先使用推荐合约数据
    if (recommendedContracts.length > 0) {
      return recommendedContracts
    }
    // 如果推荐数据也没有，回退到 volume 前10个
    return currentData.slice(0, 10)
  }, [favorites.length, recommendedContracts, currentData])

  // 同步到 Redux（保持兼容性）
  useEffect(() => {
    if (!isLoadingFavorite) {
      dispatch(setIsEmptyFavorites(isEmptyFavorites))
      dispatch(setFavorites(favorites))
    }
  }, [favorites.length, isEmptyFavorites, isLoadingFavorite, dispatch])

  const onRemoveFromFavorites = useCallback(
    (symbol: string) => {
      // 使用 React Query 的乐观更新
      removeSymbol(symbol)
      // 同步到 Redux
      dispatch(removeFavorite(symbol))
    },
    [removeSymbol, dispatch],
  )

  // 包装 refetch 函数以适配不同的回调类型
  const handleRefetch = useCallback(async () => {
    await refetch()
  }, [refetch])

  const handleRefetchSync = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <>
      {isLoadingFavorite ? (
        <Favorites
          isLoading={true}
          symbolsFavorite={[]}
          type={type}
          onRemoveFromFavorites={onRemoveFromFavorites}
          scrollElement={scrollElement}
        />
      ) : !isEmptyFavorites ? (
        <Favorites
          isLoading={false}
          symbolsFavorite={currentDataFavorite}
          type={type}
          onRemoveFromFavorites={onRemoveFromFavorites}
          scrollElement={scrollElement}
        />
      ) : // 使用新的推荐合约组件
      recommendedContracts.length > 0 ? (
        <RecommendedContracts contracts={recommendedContracts} onAddSuccess={handleRefetchSync} />
      ) : (
        // 回退到原有的 Optional 组件
        <Optional symbolsFavorite={optionalData || []} isLoading={false} getFavoriteSymbols={handleRefetch} />
      )}
    </>
  )
}

export default FavoriteList
