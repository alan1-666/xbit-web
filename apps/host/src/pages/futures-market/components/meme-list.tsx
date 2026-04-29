import Text from '@/components/common/Text'
import { PriceChangeText } from '@/components/futuresDiscover/table/crypto-table'
import { TableVirtual } from '@/components/futuresDiscover/table/table-virtual'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { formatMoney, formatPriceDisplay, formatPercentage, getLaunchpad } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MemeDto } from '@/@generated/gql/graphql-meme2'
import { useTrendingTokens } from '@pages/meme/discover/desktop/hooks/useTrendingTokens'
import { TokenDirection } from '@/@generated/gql/graphql-future'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice'
import { useTranslation } from 'react-i18next'
import { ChainIds } from '@/types/enums'
import { getDexLogo } from '@/utils/lauchpad.ts'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { getPath } from '@/lib/utils'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { TokenAvatar } from '@/components/discover/cards/TokenAvatar'
import { Loading } from '@/components/common/Loading'

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

const DEFAULT_PAGE_SIZE = 20

type SortField = 'symbol' | 'marketcap' | 'price' | 'price1hChange' | 'liquidity'
type SortDirection = 'asc' | 'desc' | null

const useSortableTable = <T extends Record<string, any>>(data: T[]) => {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const onSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      setSortDirection((prevDirection) => {
        if (prevField !== field) {
          return 'desc'
        }

        const directionMap = {
          null: 'desc' as const,
          desc: 'asc' as const,
          asc: null,
        }

        return directionMap[prevDirection || 'null']
      })
      return field
    })
  }, [])

  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) {
      return data
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      let comparison = 0

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else {
        const numA = Number(aValue) || 0
        const numB = Number(bValue) || 0
        comparison = numA - numB
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortField, sortDirection])

  const getSortIndicator = useCallback(
    (field: SortField, activeColor: string = '#FFFFFF') => {
      const isActive = sortField === field
      const isAsc = isActive && sortDirection === 'asc'
      const isDesc = isActive && sortDirection === 'desc'

      return {
        upColor: isAsc ? activeColor : '#FFFFFF40',
        downColor: isDesc ? activeColor : '#FFFFFF40',
      }
    },
    [sortField, sortDirection],
  )

  return {
    sortedData,
    handleSort: onSort,
    getSortIndicator,
  }
}

const MemeList = ({ type }: { type: string }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE)
  const columnHelper = createColumnHelper<MemeDto>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 获取当前选择的链
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  // 获取 Redux 中的 filters 状态（使用独立的 market_trending 键）
  const filters = useAppSelector((state) => state.home?.filters?.market_trending)

  // 确保 filters 状态已初始化
  useEffect(() => {
    if (!filters) {
      const defaultFilter = {
        dexList: [],
        timeframe: '24h',
        marketCap: null,
        holders: null,
        transactions: null,
        volumes: null,
        progress: null,
        liquidityPool: null,
        sortBy: undefined,
        version: 1,
        solDexList: undefined,
        bscDexList: undefined,
        ethDexList: undefined,
        arbDexList: undefined,
      }
      dispatch(
        homeActions.setFilters({
          key: 'market_trending',
          filter: defaultFilter,
        }),
      )
    }
  }, [filters, dispatch])

  // 监听 activeChain 变化
  useEffect(() => {
    console.log('MemeList activeChain changed:', activeChain)
  }, [activeChain])

  // 使用 useTrendingTokens hook，根据当前选择的链请求数据，使用独立的过滤器键
  const { data, isLoading, hasNextPage, loadMore } = useTrendingTokens({
    direction: TokenDirection.Popular,
    chain: activeChain as TYPE_CHAIN, // 传入当前选择的链
    filterKey: 'market_trending', // 使用独立的过滤器键
  })

  const currentData = useMemo(() => {
    console.log('MemeList data:', data)
    console.log('MemeList isLoading:', isLoading)
    console.log('MemeList hasNextPage:', hasNextPage)
    console.log('MemeList data length:', data?.length || 0)
    return data || []
  }, [data, isLoading, hasNextPage])

  const { sortedData, handleSort, getSortIndicator } = useSortableTable<MemeDto>(currentData)

  const visibleData = useMemo(() => {
    console.log('type', type)
    if (type !== 'home') {
      console.log('sortedData', sortedData)
      return sortedData
    }
    return sortedData
  }, [sortedData, type, visibleCount])

  const onBottomReached = useCallback(() => {
    if (type !== 'home') {
      if (hasNextPage && !isLoading) {
        loadMore()
      }
      return
    }
    setVisibleCount((prev) => {
      if (prev >= sortedData.length) {
        return prev
      }
      return Math.min(prev + DEFAULT_PAGE_SIZE, sortedData.length)
    })
  }, [type, sortedData.length, hasNextPage, loadMore, isLoading])

  // 使用 Intersection Observer 监听底部元素
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onBottomReached()
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [onBottomReached])

  const onRowClick = useCallback(
    (row: MemeDto) => {
      navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: row.token, chain: CHAIN_SYMBOLS[row.chainId] }))
    },
    [navigate],
  )

  const sortHandlers = useMemo(
    () => ({
      symbol: () => {
        return handleSort('symbol')
      },
      marketcap: () => {
        return handleSort('marketcap')
      },
      price: () => {
        return handleSort('price')
      },
      liquidity: () => {
        return handleSort('liquidity')
      },
      price1hChange: () => {
        return handleSort('price1hChange')
      },
    }),
    [handleSort],
  )

  const BRAND_COLOR = '#843BEA'
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
                  {/* {index < 3 && (
                    <Text text="🔥" fontSize={12} />
                  )} */}
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
    [columnHelper, sortHandlers, sortIndicators],
  )

  return (
    <div className="relative pt-3">
      <TableVirtual<MemeDto, any>
        columns={columns}
        data={visibleData}
        onRowClick={onRowClick}
        isLoading={isLoading}
        isStickyHeader={true}
        containerClassName={'!border-none _hidescrollbar !overflow-visible'}
        cusTomMaxHeight={'none'}
        disableMaxHeight={true}
        tableHeaderClassName="text-[#908E98] text-[calc(1rem*(11/16))] font-[400] !top-[36px]"
        tableHeaderRowClassName="!border-none"
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer !border-none !py-[10px] justify-end px-table-cell w-27-precent"
        tableHeadClassName="px-table-cell bg-[#0A0A0A] w-27-precent !py-2"
        tableRowClassName="!border-none"
        rowHeight={75}
        paddingBottom={type === 'home' ? '80px' : '0'}
        wrapperClassName="min-h-full"
        cusTomMaxHeightPC="100%"
      />
      {/* 底部哨兵元素，用于触发加载更多 */}
      <div ref={loadMoreRef} className="h-1 w-full" />
      {/* 加载更多时显示 loading 动图 */}
      {hasNextPage && !isLoading && visibleData.length > 0 && (
        <div className="flex justify-center py-4">
          <Loading />
        </div>
      )}
    </div>
  )
}

export default React.memo(MemeList)
