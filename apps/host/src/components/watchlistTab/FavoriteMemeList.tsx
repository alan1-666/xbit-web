import Text from '@/components/common/Text'
import { PriceChangeText } from '@/components/futuresDiscover/table/crypto-table'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { formatMoney, formatPriceDisplay, formatPercentage, getLaunchpad } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MemeDto } from '@/@generated/gql/graphql-future'
import { useWatchlistTokensAll } from '@/pages/meme/discover/desktop/hooks/useWatchlistTokensAll'
import { useTranslation } from 'react-i18next'
import { ChainIds } from '@/types/enums'
import { getDexLogo } from '@/utils/lauchpad.ts'
import RecommendedMemes from './RecommendedMemes'
import { futureClient } from '@/lib/gql/apollo-client'
import { removeTokenFromFavorite } from '@/services/tokens.service'
import { toast } from 'sonner'
import { getPath } from '@/lib/utils'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { useMutation } from '@apollo/client'
import { TokenAvatar } from '@/components/discover/cards/TokenAvatar'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice'
import { SortField, SortType } from '@/components/discover/filter/FilterFormData'
import { TableVirtual } from '../futuresDiscover/table/table-virtual'
import { useActiveChainType } from '@hooks/useActiveChain.ts'

const MEME_COINS_ICON = import.meta.env.VITE_FUTURES_COINS_ICON

const getCoinIconUrl = (token: string) => {
  if (!token) {
    return ''
  }

  if (!MEME_COINS_ICON) {
    return ''
  }

  return `${MEME_COINS_ICON}/${token.toUpperCase()}.svg`
}

const getLaunchpadLogo = (token: MemeDto) => {
  const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
  return launchpad ? getDexLogo(launchpad) : undefined
}

const getChainIcon = (chainId: number) => {
  const chainIconMap: Record<number, string> = {
    [ChainIds.Solana]: '/images/icons/icon-sol.svg',
    [ChainIds.Ethereum]: '/images/ether.svg',
    [ChainIds.Arbitrum]: '/images/icons/chains/ic-arbitrum.svg',
    [ChainIds.Bsc]: '/images/bsc.svg',
    [ChainIds.Mon]: '/images/icons/chains/ic-monad.svg',
  }

  return chainIconMap[chainId] || '/images/icons/icon-sol.svg'
}

const SortHeader = React.memo(
  ({
    text,
    onSort,
    sortIndicator,
  }: {
    text: string
    onSort: () => void
    sortIndicator: { upColor: string; downColor: string }
  }) => (
    <div className="flex cursor-pointer items-center gap-[2px]" onClick={onSort}>
      <Text text={text} fontSize={11} fontWeight="regular" color="#878B99" className="cursor-pointer" />
      <div className="ml-0 flex cursor-pointer flex-col">
        <IconSortUp currentColor={sortIndicator.upColor} />
        <IconSortDown currentColor={sortIndicator.downColor} />
      </div>
    </div>
  ),
)

SortHeader.displayName = 'SortHeader'

// 映射前端字段到后端 sortBy 字段
const SORT_FIELD_MAP: Record<string, SortField> = {
  marketcap: 'marketCap',
  liquidity: 'liquidityPool',
  price: 'price',
  price1hChange: 'price1hChange',
  symbol: 'symbol',
}

interface FavoriteMemeListProps {
  type?: string
}

const FavoriteMemeList = ({}: FavoriteMemeListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const columnHelper = createColumnHelper<MemeDto>()
  const [removeFromFavoritesMutation] = useMutation(removeTokenFromFavorite, { client: futureClient })
  const activeChainType = useActiveChainType()

  // 获取当前的 filter 状态
  const currentFilter = useAppSelector((state) => state.home.filters.watchlist)
  const currentSortBy = currentFilter.sortBy

  // 使用 watchlist tokens hook 获取收藏的 meme 列表（一次性获取所有数据）
  const { data, isLoading, loadMore, refetch, removeToken, isFetchingNextPage, hasNextPage } = useWatchlistTokensAll({
    excludeBlacklisted: false,
    favoriteType: 'MEME',
  })

  const currentData = useMemo(() => {
    return data || []
  }, [data])

  // 处理排序点击
  const handleSort = useCallback(
    (field: string) => {
      const mappedField = SORT_FIELD_MAP[field] || field

      let newSortBy: { field: SortField; type: SortType } | undefined

      if (!currentSortBy || currentSortBy.field !== mappedField) {
        // 新字段，默认降序
        newSortBy = { field: mappedField as SortField, type: 'desc' }
      } else if (currentSortBy.type === 'desc') {
        // 当前降序，切换到升序
        newSortBy = { field: mappedField as SortField, type: 'asc' }
      } else {
        // 当前升序，取消排序
        newSortBy = undefined
      }

      dispatch(
        homeActions.updateFilter({
          key: 'watchlist',
          filter: { sortBy: newSortBy },
        }),
      )
    },
    [currentSortBy, dispatch],
  )

  // 获取排序指示器
  const getSortIndicator = useCallback(
    (field: string, activeColor: string = '#FFFFFF') => {
      const mappedField = SORT_FIELD_MAP[field] || field
      const isActive = currentSortBy?.field === mappedField
      const isAsc = isActive && currentSortBy?.type === 'asc'
      const isDesc = isActive && currentSortBy?.type === 'desc'

      return {
        upColor: isAsc ? activeColor : '#FFFFFF40',
        downColor: isDesc ? activeColor : '#FFFFFF40',
      }
    },
    [currentSortBy],
  )

  const onRowClick = useCallback(
    (row: MemeDto) => {
      navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: row.token, chain: CHAIN_SYMBOLS[row.chainId] }))
    },
    [navigate],
  )

  const handleSwipeDelete = useCallback(
    async (memeData: MemeDto): Promise<void> => {
      try {
        // 立即从本地缓存移除（乐观更新）
        removeToken(memeData.token || '')

        // 并行执行 mutation 和显示成功提示
        removeFromFavoritesMutation({
          variables: {
            token: memeData.token,
            chain: activeChainType,
          },
        }).catch((error) => {
          console.error('删除失败:', error)
          // 如果失败，刷新列表恢复数据
          refetch()
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
    [removeFromFavoritesMutation, removeToken, refetch, t, activeChainType],
  )

  const BRAND_COLOR = '#843BEA'

  const sortHandlers = useMemo(
    () => ({
      symbol: () => handleSort('symbol'),
      marketcap: () => handleSort('marketcap'),
      price: () => handleSort('price'),
      liquidity: () => handleSort('liquidity'),
      price1hChange: () => handleSort('price1hChange'),
    }),
    [handleSort],
  )

  const sortIndicators = useMemo(
    () => ({
      symbol: getSortIndicator('symbol', BRAND_COLOR),
      marketcap: getSortIndicator('marketcap', BRAND_COLOR),
      price: getSortIndicator('price', BRAND_COLOR),
      liquidity: getSortIndicator('liquidity', BRAND_COLOR),
      price1hChange: getSortIndicator('price1hChange', BRAND_COLOR),
    }),
    [getSortIndicator],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: () => (
          <div className="flex items-center gap-[6px]">
            <SortHeader
              text={t('tokenSearchDrawer.tableHeaders.token')}
              onSort={sortHandlers.symbol}
              sortIndicator={sortIndicators.symbol}
            />
            <div className="w-px h-3 bg-[#414141]"></div>
            <SortHeader
              text={t('tokenSearchDrawer.tableHeaders.marketCap')}
              onSort={sortHandlers.marketcap}
              sortIndicator={sortIndicators.marketcap}
            />
            <div className="w-px h-3 bg-[#414141]"></div>
            <SortHeader
              text={t('listCoin.columns.pool')}
              onSort={sortHandlers.liquidity}
              sortIndicator={sortIndicators.liquidity}
            />
          </div>
        ),
        cell: (info) => {
          const { symbol, image, avatarUrl, token, marketcap, liquidity, chainId } = info.row.original
          const iconUrl = avatarUrl || image || getCoinIconUrl(symbol)
          const launchpadLogo = getLaunchpadLogo(info.row.original)
          const displayAddress = token ? `${token.slice(0, 4)}...${token.slice(-4)}` : ''
          const chainIcon = getChainIcon(chainId)

          return (
            <div className="flex items-center gap-[7px]">
              <TokenAvatar
                tokenAvatar={iconUrl}
                chainLogo={chainIcon}
                name={symbol}
                className="size-6"
                avatarClassName="rounded-full border-none"
                chainLogoContainerClassName="-bottom-0.75 -right-0.75"
                chainLogoClassName="p-[2px]"
              />
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center gap-1">
                  <Text text={symbol} fontSize={14} fontWeight="semibold" className="leading-[14px]" />
                  {launchpadLogo && (
                    <img src={launchpadLogo} className="size-[14px] rounded-full bg-[#000000]" alt="launchpad logo" />
                  )}
                  {/* {index < 3 && <Text text="🔥" fontSize={12} />} */}
                </div>
                <Text
                  text={displayAddress}
                  fontSize={12}
                  fontWeight="regular"
                  color="#908e98"
                  className="lining-nums leading-[12px]"
                />
                <div className="flex items-center gap-[6px]">
                  <Text
                    text={`${formatMoney(marketcap)}`}
                    fontSize={10}
                    fontWeight="regular"
                    color="#908e98"
                    className="lining-nums leading-[10px]"
                  />
                  <Text text="|" fontSize={12} color="#25242B" />
                  <Text
                    text={`${formatMoney(liquidity)}`}
                    fontSize={10}
                    fontWeight="regular"
                    color="#908e98"
                    className="lining-nums leading-[10px]"
                  />
                </div>
              </div>
            </div>
          )
        },
      }),

      columnHelper.accessor('price', {
        header: () => (
          <div className="flex items-center justify-end gap-[1px] whitespace-nowrap">
            <SortHeader
              text={t('transaction.price')}
              onSort={sortHandlers.price}
              sortIndicator={sortIndicators.price}
            />
            <div className="w-px h-3 bg-[#414141] mx-1"></div>
            <SortHeader
              text={t('listCoin.columns.priceChangeWithTime', { time: '1h' })}
              onSort={sortHandlers.price1hChange}
              sortIndicator={sortIndicators.price1hChange}
            />
          </div>
        ),
        cell: (info) => {
          const price = info.getValue()
          const changePercent = info.row.original.price1hChange

          return (
            <div className="flex flex-col items-end gap-[6px]">
              <Text
                text={formatPriceDisplay(price)}
                fontSize={14}
                fontWeight="regular"
                className="lining-nums leading-[14px]"
              />
              <PriceChangeText value={formatPercentage(changePercent)} isPositive={Number(changePercent) > 0} />
            </div>
          )
        },
      }),
    ],
    [columnHelper, sortHandlers, sortIndicators, t],
  )

  // 如果没有自选 Meme，显示推荐列表
  if (!isLoading && currentData.length === 0) {
    return <RecommendedMemes onAddSuccess={refetch} />
  }

  return (
    <>
      <TableVirtual<MemeDto, any>
        columns={columns}
        data={currentData}
        onRowClick={onRowClick}
        isLoading={isLoading}
        isStickyHeader={true}
        containerClassName="!border-none _hidescrollbar !overflow-visible"
        disableMaxHeight={false}
        tableHeaderClassName={`text-[#878B99] text-[calc(1rem*(12/16))] font-[400] top-[62px]! mt-2`}
        tableHeaderRowClassName="!border-none "
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-[10px] justify-end px-table-cell w-27-precent"
        tableHeadClassName="px-table-cell bg-[#0A0A0A] w-27-precent !py-2"
        tableRowClassName="!border-none"
        rowHeight={75}
        enableSwipeToDelete
        onSwipeDelete={handleSwipeDelete}
        swipeDeleteText="Delete"
        wrapperClassName="min-h-full"
        cusTomMaxHeightPC="100%"
        paddingBottom="0"
      />
    </>
  )
}

export default React.memo(FavoriteMemeList)
