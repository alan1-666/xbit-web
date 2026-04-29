import { Column, ColumnDef, flexRender, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { MemeDto } from '@/@generated/gql/graphql-future.ts'
import { createContext, CSSProperties, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn, getPath } from '@/lib/utils.ts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table.tsx'
import { TrendingTokenCell } from '@pages/meme/discover/desktop/components/TrendingTokenCell.tsx'
import TrendChart from '@components/listCoin/card/TrendChart.tsx'
import { useTrendChartData } from '@hooks/useTrendChartData.ts'
import { TokenTrending } from '@/types/token.ts'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { Trans } from 'react-i18next'
import { fShortenNumber } from '@/lib/number.ts'
import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import { SecurityCell } from '@pages/meme/discover/desktop/components/SecurityCell.tsx'
import { QuickBuyButton } from '@components/discover/QuickBuyButton.tsx'
import { Link } from 'react-router-dom'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { ChainIds } from '@/types/enums.ts'
import { useDispatch } from 'react-redux'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { SortField } from '@components/discover/filter/FilterFormData.ts'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { AiAnalysisSheet, AiAnalysisSheetHandle } from '@pages/meme/discover/desktop/components/AiAnalysisSheet.tsx'
import { FavoriteTokenIcon } from '@components/v2/ui-shared/components/FavoriteTokenIcon.tsx'
import { useShouldShowTopBar } from '@pages/meme/discover/desktop/hooks/useShouldShowTopBar.ts'
import { useAppSelector } from '@/redux/store'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { getBlockChainLogo } from '@/utils/helpers'

export interface TokenTrendingTableProps {
  tokens: MemeDto[]
  className?: string
  timeframe?: TimeframeOption
  onLoadMore?: () => void
  isLoading?: boolean
  onFavoriteToken: (token: string, isFavorite: boolean) => void
}

interface ContextState {
  timeframe: TimeframeOption
  onAiClick: (tokenAddress: string) => void
  onFavoriteToken: (token: string, isFavorite: boolean) => void
}

const Context = createContext<ContextState>({
  timeframe: '1h',
  onAiClick: () => {},
  onFavoriteToken: () => {},
})

type ColumnMeta = {
  style: CSSProperties
}

const getTx = (token: MemeDto, timeframe: TimeframeOption) => {
  switch (timeframe) {
    case '1m':
      return {
        buy: token.buyTxs1m || 0,
        sell: token.sellTxs1m || 0,
      }
    case '5m':
      return {
        buy: token.buyTxs5m || 0,
        sell: token.sellTxs5m || 0,
      }
    case '1h':
      return {
        buy: token.buyTxs1h || 0,
        sell: token.sellTxs1h || 0,
      }
    case '6h':
      return {
        buy: token.buyTxs6h || 0,
        sell: token.sellTxs6h || 0,
      }
    case '24h':
      return {
        buy: token.buyTxs24h || 0,
        sell: token.sellTxs24h || 0,
      }
  }
}

const columns: ColumnDef<MemeDto>[] = [
  {
    id: 'favorite',
    header: () => <span className="pl-2">#</span>,
    size: 40,
    cell: ({ row }) => {
      const token = row.original
      const { onFavoriteToken } = useContext(Context)
      const handleAdd = () => {
        onFavoriteToken(token.token || '', true)
      }

      const handleRemove = () => {
        onFavoriteToken(token.token || '', false)
      }

      return (
        <div>
          <FavoriteTokenIcon
            defaultValue={token.isFavorite}
            token={token.token}
            symbol={token.symbol}
            onAdded={handleAdd}
            onRemoving={handleRemove}
          />
        </div>
      )
    },
  },
  {
    id: 'info',
    header: () => <Trans i18nKey="categories.tokenName" />,
    meta: {
      style: {
        flex: 1,
        minWidth: 400,
      },
    } as ColumnMeta,
    cell: ({ row }) => {
      const { onAiClick } = useContext(Context)
      const token = row.original
      const isDebug = window.location.search.includes('debug=1')
      return <TrendingTokenCell token={token} onAiClick={onAiClick} showDebug={isDebug} />
    },
  },
  {
    id: 'chart',
    maxSize: 100,
    header: () => <></>,
    cell: ({ row }) => {
      const { timeframe } = useContext(Context)
      const token = row.original
      const trend = listCoinHelper.getTokenTrend(token as TokenTrending, timeframe)
      const { pricesData, volumesData, chartLength } = useTrendChartData({
        token: row.original as TokenTrending,
        timeframe: timeframe as string,
      })
      return (
        <TrendChart lineData={pricesData} barData={volumesData} barLength={chartLength} glowingEffect trend={trend} />
      )
    },
  },
  {
    id: 'marketCap',
    enableSorting: true,
    size: 120,
    header: () => <Trans i18nKey="listCoin.columns.marketCapPC" />,
    cell: ({ row }) => {
      const token = row.original
      return (
        <div className="text-[calc(14rem/16)] font-medium">
          <MarketDisplay value={token.marketcap ? +token.marketcap : 0} />
        </div>
      )
    },
  },
  {
    id: 'liquidity',
    size: 100,
    enableSorting: true,
    header: () => <Trans i18nKey="listCoin.columns.pool" />,
    cell: ({ row }) => {
      const token = row.original
      return (
        <div className="text-[calc(14rem/16)] font-medium">
          ${fShortenNumber(token.liquidity ? +token.liquidity : 0)}
        </div>
      )
    },
  },
  {
    id: 'holders',
    enableSorting: true,
    size: 90,
    header: () => <Trans i18nKey="listCoin.columns.holders" />,
    cell: ({ row }) => {
      const token = row.original
      return (
        <div className="text-[calc(14rem/16)] font-medium">
          {fShortenNumber(token.numberOfHolder ? +token.numberOfHolder : 0)}
        </div>
      )
    },
  },
  {
    id: 'transactions',
    enableSorting: true,
    header: () => {
      const { timeframe } = useContext(Context)
      return <Trans i18nKey="listCoin.columns.transactionsWithTime" values={{ time: timeframe }} />
    },
    cell: ({ row }) => {
      const token = row.original
      const { timeframe } = useContext(Context)
      const { buy, sell } = getTx(token, timeframe as TimeframeOption)
      const total = buy + sell
      return (
        <div className="text-[calc(14rem/16)] font-medium">
          <div>{fShortenNumber(total)}</div>
          <div>
            <span className="text-rise">{fShortenNumber(buy)}</span>
            <span> / </span>
            <span className="text-fall">{fShortenNumber(sell)}</span>
          </div>
        </div>
      )
    },
  },
  {
    id: 'volume',
    enableSorting: true,
    size: 110,
    header: () => {
      const { timeframe } = useContext(Context)
      return <Trans i18nKey="listCoin.columns.volumeWithTime" values={{ time: timeframe }} />
    },
    cell: ({ row }) => {
      const token = row.original
      const { timeframe } = useContext(Context)
      const volume = listCoinHelper.getVolumes(token as TokenTrending, timeframe as string)
      return <div className="text-[calc(14rem/16)] font-medium">${volume}</div>
    },
  },
  {
    id: 'security',
    meta: {
      style: { flex: 1, minWidth: 350, maxWidth: 500 },
    },
    header: () => <Trans i18nKey="contractMonitoring.title" />,
    cell: ({ row }) => {
      const token = row.original
      return (
        <SecurityCell
          mint={token.mint}
          blacklist={token.blacklist}
          burnt={token.burnt}
          top10Holder={token.top10Holder}
        />
      )
    },
  },
  {
    id: 'quickBuy',
    header: () => <Trans i18nKey="listCoin.columns.quickBuy" />,
    size: 90,
    cell: ({ row }) => {
      const token = row.original
      return (
        <div>
          <QuickBuyButton token={token} className="bg-impartal shadow-none h-8" showUnit={true} />
        </div>
      )
    },
  },
]

const getSortField = (columnId: string): SortField | undefined => {
  switch (columnId) {
    case 'marketCap':
      return 'marketCap'
    case 'liquidity':
      return 'liquidityPool'
    case 'holders':
      return 'holders'
    case 'transactions':
      return 'transactions'
    case 'volume':
      return 'volumes'
    default:
      return undefined
  }
}

export const TokenTrendingTable = (props: TokenTrendingTableProps) => {
  const { tokens, className, timeframe, onLoadMore, isLoading, onFavoriteToken } = props
  const [sorting, setSorting] = useState<SortingState>([])
  const dispatch = useDispatch()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const aiRef = useRef<AiAnalysisSheetHandle>(null)
  const isTopBarVisible = useShouldShowTopBar()
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)
  const table = useReactTable({
    data: tokens,
    columns: columns,
    columnResizeMode: 'onChange',
    enableSorting: true,
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      setSorting(updater)
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSort = useCallback((column: Column<MemeDto>) => {
    if (!column.columnDef.enableSorting) return
    const currentSort = column.getIsSorted()
    if (currentSort === 'desc') {
      column.toggleSorting(false, false)
    } else if (currentSort === 'asc') {
      column.toggleSorting(undefined, false)
    } else {
      column.toggleSorting(true, false)
    }
  }, [])

  const handleAiClick = (tokenAddress: string) => {
    aiRef.current?.open(tokenAddress)
  }

  useEffect(() => {
    const sort = sorting[0]
    if (sort) {
      const id = sort.id
      const desc = sort.desc
      const sortField = getSortField(id)
      if (!sortField) return
      dispatch(
        homeActions.updateFilter({
          key: 'trending',
          filter: {
            sortBy: {
              field: sortField,
              type: desc ? 'desc' : 'asc',
            },
          },
        }),
      )
    } else {
      dispatch(
        homeActions.updateFilter({
          key: 'trending',
          filter: {
            sortBy: undefined,
          },
        }),
      )
    }
  }, [sorting])

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 102,
    getScrollElement: () => tableContainerRef.current,
    overscan: 5,
  })

  const contextValue = useMemo(() => {
    return {
      timeframe: timeframe || '24h',
      onAiClick: handleAiClick,
      onFavoriteToken: onFavoriteToken,
    }
  }, [timeframe])

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems()
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) {
      return
    }
    if (lastItem.index >= rows.length - 3) {
      onLoadMore?.()
    }
  }, [rowVirtualizer.getVirtualItems()])

  return (
    <Context.Provider value={contextValue}>
      <div
        ref={tableContainerRef}
        className={cn(
          'overflow-auto no-vertical-scrollbar overscroll-contain relative border rounded-[6px] mt-2 border-[#101114]',
          isShowMaintenanceNotification
            ? isTopBarVisible
              ? 'h-[calc(100vh-242px)]'
              : 'h-[calc(100vh-204px)]'
            : isTopBarVisible
              ? 'h-[calc(100vh-210px)]'
              : 'h-[calc(100vh-172px)]',
          className,
        )}
      >
        <Table className="grid">
          <TableHeader className="grid sticky top-0 z-[1] bg-[#0a0a0a] rounded-[6px]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="flex w-full border-0 border-b border-[#79778C29]">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="flex"
                    style={
                      (header.column.columnDef.meta as ColumnMeta)?.style
                        ? (header.column.columnDef.meta as ColumnMeta)?.style
                        : { width: header.column.getSize() }
                    }
                  >
                    <div
                      className={cn(
                        header.column.columnDef.enableSorting ? 'cursor-pointer select-none' : '',
                        'flex items-center font-normal text-[#FFFFFF80] text-[calc(14rem/16)]',
                      )}
                      onClick={() => handleSort(header.column)}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.columnDef.enableSorting ? (
                        <div className="pl-0.5">
                          <IconSortUp currentColor={header.column.getIsSorted() === 'asc' ? '#AB57FF' : '#FFFFFF80'} />
                          <IconSortDown
                            currentColor={header.column.getIsSorted() === 'desc' ? '#AB57FF' : '#FFFFFF80'}
                          />
                        </div>
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 20 }).map((_, index) => (
                <Skeleton key={index} className="w-full" style={{ height: 102 }} />
              ))}
            </div>
          )}
          <TableBody className="grid relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              const token = row.original

              const tokenLogo = () => {
                  if (token.image) return token.image
                  return getBlockChainLogo(token.chainId, token.token)
                }
              return (
                <Link
                  to={getPath(APP_PATH.MEME_TOKEN_DETAIL, {
                    chain: CHAIN_SYMBOLS[row.original.chainId || ChainIds.Solana],
                    address: row.original.token || '',
                  })}
                  state={{
                    symbol: token.symbol,
                    tokenLogo: tokenLogo(),
                    tokenName: token.name,
                    isFavorite: token.isFavorite,
                    createdTime: token.createdTime,
                    address: token.token,
                    devMigrated: token.devMigrated,
                    chainId: token.chainId,
                  }}
                  className="h-fit"
                >
                  <TableRow
                    key={row.id}
                    data-index={virtualRow.index}
                    className={cn(
                      'flex absolute top-0 w-full box-border hover:bg-[#ECECED1F]',
                      virtualRow.index % 2 === 1 ? 'bg-[#101114]' : 'bg-transparent',
                    )}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      height: `${virtualRow.size}px`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="flex items-center"
                        style={
                          (cell.column.columnDef.meta as ColumnMeta)?.style
                            ? (cell.column.columnDef.meta as ColumnMeta)?.style
                            : { width: cell.column.getSize() }
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                </Link>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {/**/}
      {/*<VirtualizedDataTable*/}
      {/*  data={tokens}*/}
      {/*  columns={columns}*/}
      {/*  estimateSize={102}*/}
      {/*  isLoading={isLoading}*/}
      {/*  sorting={sorting}*/}
      {/*  onSortingChange={setSorting}*/}
      {/*  className={cn(*/}
      {/*    'overflow-auto no-vertical-scrollbar overscroll-contain relative border rounded-[6px] mt-2',*/}
      {/*    isTopBarVisible ? 'h-[calc(100vh-210px)]' : 'h-[calc(100vh-172px)]',*/}
      {/*    className,*/}
      {/*  )}*/}
      {/*  rowWrapper={Link}*/}
      {/*  rowWrapperPropsFn={(row) => ({*/}
      {/*    to: getPath(APP_PATH.MEME_TOKEN_DETAIL, {*/}
      {/*      chain: CHAIN_SYMBOLS[row.chainId || ChainIds.Solana],*/}
      {/*      address: row.token || '',*/}
      {/*    }),*/}
      {/*  })}*/}
      {/*  onLoadMore={onLoadMore}*/}
      {/*/>*/}
      <AiAnalysisSheet ref={aiRef} />
    </Context.Provider>
  )
}
