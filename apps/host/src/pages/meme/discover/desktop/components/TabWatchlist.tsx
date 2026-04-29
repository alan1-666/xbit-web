import { MemeDto } from '@/@generated/gql/graphql-future.ts'
import { TrendingTokenCell } from '@pages/meme/discover/desktop/components/TrendingTokenCell.tsx'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { TokenTrending } from '@/types/token.ts'
import { useTrendChartData } from '@hooks/useTrendChartData.ts'
import TrendChart from '@components/listCoin/card/TrendChart.tsx'
import { Trans } from 'react-i18next'
import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { SecurityCell } from '@pages/meme/discover/desktop/components/SecurityCell.tsx'
import { QuickBuyButton } from '@components/discover/QuickBuyButton.tsx'
import { ColumnDefWithMeta } from '@pages/meme/discover/desktop/components/VirtualizedDataTable.tsx'
import { useWatchlistTokens } from '@pages/meme/discover/desktop/hooks/useWatchlistTokens.ts'
import {cn, getPath } from '@/lib/utils.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'
import { DataTable } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { MotionLink } from '@pages/meme/discover/desktop/components/MotionLink.tsx'
import { SortingState } from '@tanstack/react-table'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { SortField } from '@components/discover/filter/FilterFormData.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { FavoriteTokenIcon } from '@components/v2/ui-shared/components/FavoriteTokenIcon.tsx'
import {useShouldShowTopBar} from "@pages/meme/discover/desktop/hooks/useShouldShowTopBar.ts";
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'

const Context = createContext<{
  timeframe: TimeframeOption
  onRemoved?: (token: MemeDto) => void
}>({
  timeframe: '1h',
  onRemoved: undefined,
})

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

const columns: ColumnDefWithMeta<MemeDto>[] = [
  {
    id: 'favorite',
    header: () => <span className="pl-2">#</span>,
    size: 40,
    cell: ({ row }) => {
      const token = row.original
      const { onRemoved } = useContext(Context)
      return (
        <div>
          <FavoriteTokenIcon
            defaultValue={token.isFavorite}
            token={token.token}
            symbol={token.symbol}
            showDialog={true}
            onRemoving={() => onRemoved?.(token)}
          />
        </div>
      )
    },
  },
  {
    id: 'info',
    header: 'Token',
    meta: {
      style: {
        flex: 1,
        minWidth: 400,
      },
    },
    cell: ({ row }) => {
      const token = row.original
      return <TrendingTokenCell token={token} />
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
    header: () => <Trans i18nKey="listCoin.columns.marketCap" />,
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
    minSize: 350,
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
    header: () => <Trans i18nKey="listCoin.quickBuy" />,
    size: 90,
    cell: ({ row }) => {
      const token = row.original
      return (
        <div>
          <QuickBuyButton token={token} />
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

export const TabWatchlist = () => {
  const { data, currentTimeframe, isLoading, loadMore, removeToken } = useWatchlistTokens()
  const [sorting, setSorting] = useState<SortingState>([])
  const dispatch = useAppDispatch()
  const isShowTopBar = useShouldShowTopBar()
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)

  useEffect(() => {
    const sort = sorting[0]
    if (sort) {
      const id = sort.id
      const desc = sort.desc
      const sortField = getSortField(id)
      if (!sortField) return
      dispatch(
        homeActions.updateFilter({
          key: 'watchlist',
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
          key: 'watchlist',
          filter: {
            sortBy: undefined,
          },
        }),
      )
    }
  }, [sorting])

  const handleOnRemoved = useCallback((token: MemeDto) => {
    removeToken(token.token || '')
  }, [])

  const contextValue = useMemo(() => {
    return {
      timeframe: currentTimeframe,
      onRemoved: handleOnRemoved,
    }
  }, [currentTimeframe, handleOnRemoved])

  return (
    <Context.Provider value={contextValue}>
      <div className="w-full px-4">
        <DataTable
          data={data ?? []}
          columns={columns}
          rowHeight={103}
          isLoading={isLoading}
          className={cn(
            'overflow-y-scroll no-vertical-scrollbar border rounded-[6px] mt-2',
            isShowMaintenanceNotification
              ? isShowTopBar
                ? 'h-[calc(100vh-242px)]'
                : 'h-[calc(100vh-208px)]'
              : isShowTopBar
                ? 'h-[calc(100vh-210px)]'
                : 'h-[calc(100vh-176px)]',
          )}
          getRowId={(originalRow) => originalRow.token || ''}
          rowWrapper={MotionLink}
          rowWrapperPropsFn={(row) => ({
            to: getPath(APP_PATH.MEME_TOKEN_DETAIL, {
              chain: CHAIN_SYMBOLS[row.chainId ? +row.chainId : ChainIds.Solana],
              address: row.token || '',
            }),
            exit: { opacity: 0, height: 0 },
            transition: { duration: 0.5 },
          })}
          onLoadMore={loadMore}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      </div>
    </Context.Provider>
  )
}
