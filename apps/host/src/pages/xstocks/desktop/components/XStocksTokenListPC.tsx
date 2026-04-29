import { TokensStatisticByCategoryDto } from '@/@generated/gql/graphql-future.ts'
import MoneyFormatted from '@/components/common/MoneyFormatted'
import { FavoriteTokenIcon } from '@/components/v2/ui-shared/components/FavoriteTokenIcon'
import { useSortedList } from '@/components/xstocks/hooks/useSortedList'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { SortBy, SortByField } from '@/redux/modules/xstocks.slice'
import { ChainIds } from '@/types/enums.ts'
import { XStockToken } from '@/types/xstocks'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import { IconsGroup } from '@components/discover/IconsGroup.tsx'
import { QuickBuyButton } from '@components/discover/QuickBuyButton.tsx'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { AiAnalysisSheetHandle } from '@pages/meme/discover/desktop/components/AiAnalysisSheet.tsx'
import {
  ColumnDefWithMeta,
  VirtualizedDataTable,
} from '@pages/meme/discover/desktop/components/VirtualizedDataTable.tsx'
import { SortingState } from '@tanstack/react-table'
import { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import handleUpdateCacheXstock from '../hooks/handleUpdateCacheXstock'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { formatMarketValue } from '@/lib/format.ts'
import { TokenAvatar } from '@components/discover/cards/TokenAvatar.tsx'
import { useAppSelector } from '@/redux/store'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'

export interface CategoryTokensLitProps {
  categoryId: string
}

const Context = createContext<{
  timeframe: TimeframeOption
  onAiClick?: (tokenAddress: string) => void
}>({
  timeframe: '1h',
  onAiClick: undefined,
})

const getBuyAndSellFromTimeframe = (token: TokensStatisticByCategoryDto, timeframe: TimeframeOption) => {
  switch (timeframe) {
    case '1m':
      return { buy: token.buyTxs1m ?? 0, sell: token.sellTxs1m ?? 0 }
    case '5m':
      return { buy: token.buyTxs5m ?? 0, sell: token.sellTxs5m ?? 0 }
    case '1h':
      return { buy: token.buyTxs1h ?? 0, sell: token.sellTxs1h ?? 0 }
    case '6h':
      return { buy: token.buyTxs6h ?? 0, sell: token.sellTxs6h ?? 0 }
    case '24h':
      return { buy: token.buyTxs24h ?? 0, sell: token.sellTxs24h ?? 0 }
    default: {
      return { buy: token.buyTxs1h ?? 0, sell: token.sellTxs1h ?? 0 }
    }
  }
}

const columns: ColumnDefWithMeta<TokensStatisticByCategoryDto>[] = [
  {
    id: 'token',
    header: () => <Trans i18nKey="xstocks.columns.token" />,
    enableSorting: true,
    meta: {
      style: { flex: 1, minWidth: 300 },
    },
    cell: ({ row }) => {
      const token = row.original
      const { t } = useTranslation()
      const { onAdded, onRemoveSuccess } = handleUpdateCacheXstock()
      const location = useLocation()
      const tokenLogo = useMemo(() => {
        if (token.logoUrl) return token.logoUrl
        return getBlockChainLogo(token.chainId ? +token.chainId : ChainIds.Solana, token.address || '')
      }, [token])

      return (
        <TooltipProvider>
          <div className="flex gap-2.5">
            <div className="mr-1.5 flex items-center justify-center">
              <FavoriteTokenIcon
                defaultValue={token.isFavorite}
                token={token.address}
                symbol={token.symbol}
                triggerClassName="py-0"
                // showDialog={location.search === '?page=watchlist'}
                onAdded={() => {
                  onAdded({ token })
                }}
                onRemoving={() => {
                  onRemoveSuccess({ token })
                }}
              />
            </div>
            <TokenAvatar
              tokenAvatar={tokenLogo}
              chainLogo={getBlockchainLogo2(token.chainId ? +token.chainId : ChainIds.Solana)}
              className="size-[52px] rounded-full"
              avatarClassName="rounded-full"
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div className="flex items-baseline gap-1">
                  <SimpleTooltip content={token.name}>
                    <span className="text-[calc(16rem/16)] font-medium text-white">{token.symbol} </span>
                  </SimpleTooltip>
                  <span className="text-[calc(12rem/16)] leading-3 font-[330] text-[#FFFFFF80]">
                    {token.name?.replace('xStock', '')}
                  </span>
                  <IconXStock />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="text-[#6C6A74] text-[calc(12rem/16)]">{formatAddressWallet(token.address || '')}</div>
                <SimpleTooltip content={t('listCoin.tooltip.copyAddress')}>
                  <div>
                    <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center" text={token.address} type="tokenAddress" />
                  </div>
                </SimpleTooltip>
                <IconsGroup
                  tokenAddress={token.address}
                  twitterUrl={token.twitterUrl || ''}
                  websiteUrl={token.website || ''}
                  twitterChangeCount={token.twitterNameChangeCount ? +token.twitterNameChangeCount : 0}
                  twitterPostId={token.tweetId || ''}
                  advertisesOnDex={token.advertisesOnDex ?? false}
                  telegram={token.telegram}
                />
              </div>
            </div>
          </div>
        </TooltipProvider>
      )
    },
  },
  {
    id: 'liquidity',
    header: () => <Trans i18nKey="tokenData.liquidityPool" />,
    enableSorting: true,
    cell: ({ row }) => {
      const token = row.original
      return <div>${fShortenNumber(token.liquidity ? +token.liquidity : 0)}</div>
    },
  },
  {
    id: 'marketCap',
    header: () => <Trans i18nKey="tokenData.marketCap" />,
    enableSorting: true,
    cell: ({ row }) => {
      const token = row.original
      return <MarketDisplay value={token.marketCap ? +token.marketCap : 0} showColor={true} />
    },
  },
  {
    id: 'holders',
    header: () => <Trans i18nKey="listCoin.columns.holders" />,
    enableSorting: true,
    cell: ({ row }) => {
      const token = row.original
      return <div>{fShortenNumber(token.numberOfHolder ? +token.numberOfHolder : 0)}</div>
    },
  },
  {
    id: 'txs',
    header: () => {
      const { timeframe } = useContext(Context)
      return <Trans i18nKey="listCoin.columns.transactionsWithTime" values={{ time: timeframe }} />
    },
    enableSorting: true,
    cell: ({ row }) => {
      const { timeframe } = useContext(Context)
      const token = row.original
      const { buy, sell } = getBuyAndSellFromTimeframe(token, timeframe)
      const total = buy + sell
      return (
        <div>
          <div>{total}</div>
          <div>
            <span className="text-rise">{buy}</span> <span className="text-[#FFFFFF80]">/</span>{' '}
            <span className="text-fall">{sell}</span>
          </div>
        </div>
      )
    },
  },
  {
    id: 'volume24h',
    header: () => {
      const { timeframe } = useContext(Context)
      return <Trans i18nKey="listCoin.columns.volumeWithTime" values={{ time: timeframe }} />
    },
    enableSorting: true,
    cell: ({ row }) => {
      const { timeframe } = useContext(Context)
      const token = row.original
      const volume = (() => {
        switch (timeframe) {
          case '1m':
            return token.volume1m ?? 0
          case '5m':
            return token.volume5m ?? 0
          case '1h':
            return token.volume1h ?? 0
          case '6h':
            return token.volume6h ?? 0
          case '24h':
            return token.volume24h ?? 0
          default: {
            return token.volume1h ?? 0
          }
        }
      })()
      return (
        <div
          className={cn(
            volume < 10_000
              ? 'text-[#908E98]'
              : volume < 100_000
                ? 'text-[#EA963A]'
                : volume < 1_000_000
                  ? 'text-[#21E09D]'
                  : 'text-impartal',
          )}
        >
          {volume >= 0 ? `${formatMarketValue(volume, '$')}` : '--'}
        </div>
      )
    },
  },
  {
    id: 'price',
    header: () => <Trans i18nKey="xstocks.columns.price" />,
    enableSorting: true,
    cell: ({ row }) => {
      const token = row.original
      return <MoneyFormatted value={token.price ? +token.price : 0} />
    },
  },
  {
    id: 'change24h',
    header: () => <Trans i18nKey="xstocks.columns.change24h" />,
    enableSorting: true,
    cell: ({ row }) => {
      const token = row.original
      return (
        <div
          className={cn(
            token.price24hChange && token.price24hChange > 0
              ? 'text-rise'
              : token.price24hChange && token.price24hChange < 0
                ? 'text-fall'
                : 'text-[#908E98]',
          )}
        >
          <MoneyFormatted value={token.price24hChange ? +token.price24hChange : 0} showUnit={false} />%
        </div>
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
          <QuickBuyButton
            token={{
              ...token,
              token: token.address || '',
              symbol: token.symbol || '',
              marketcap: token.marketCap ? +token.marketCap : 0,
            }}
            className="bg-impartal shadow-none h-8"
          />
        </div>
      )
    },
  },
]

interface IXStocksTokenListPCProps {
  loadMore: () => void
  isLoading: boolean
  tokens: TokensStatisticByCategoryDto[]
  timeframe: '1m' | '5m' | '1h' | '6h' | '24h'
  defaultSortBy: SortBy
  onSortChange: (sortBy: SortBy) => void
  emptyText?: string
}

export const XStocksTokenListPC = ({
  isLoading,
  loadMore,
  tokens,
  timeframe,
  defaultSortBy,
  onSortChange,
  emptyText,
}: IXStocksTokenListPCProps) => {
  const activeWallet = useActiveWallet()
  const ref = useRef<AiAnalysisSheetHandle>(null)
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)

  const handleAiClick = useCallback(
    (tokenAddress: string) => {
      ref.current?.open(tokenAddress)
    },
    [ref.current],
  )

  const contextValue = useMemo(() => ({ timeframe, onAiClick: handleAiClick }), [timeframe, handleAiClick])

  const sorting = useMemo((): SortingState => {
    if (!defaultSortBy.field) return []

    return [
      {
        id: defaultSortBy.field,
        desc: defaultSortBy.direction === 'desc',
      },
    ]
  }, [defaultSortBy, timeframe])

  const handleSortingChange = useCallback(
    (updaterOrValue: SortingState | ((prev: SortingState) => SortingState)) => {
      const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue

      if (newSorting.length === 0) {
        onSortChange({ field: '' as SortByField, direction: 'asc' })
      } else {
        const sort = newSorting[0]
        onSortChange({
          field: sort.id as SortByField,
          direction: sort.desc ? 'desc' : 'asc',
        })
      }
    },
    [sorting, onSortChange, timeframe],
  )

  const sortedList = useSortedList(tokens as unknown as XStockToken[], defaultSortBy, timeframe)

  return (
    <Context.Provider value={contextValue}>
      <div>
        <VirtualizedDataTable
          data={sortedList as unknown as TokensStatisticByCategoryDto[]}
          columns={columns}
          estimateSize={94}
          className={cn(
            'border-none',
            isShowMaintenanceNotification ? 'max-h-[calc(100dvh-256px)]' : 'max-h-[calc(100dvh-224px)]',
          )}
          onLoadMore={loadMore}
          isLoading={isLoading}
          rowWrapper={Link}
          rowWrapperPropsFn={(row) => ({
            to: getPath(APP_PATH.X_STOCK_DETAIL, {
              chain: CHAIN_SYMBOLS[row.chainId ? +row.chainId : ChainIds.Solana],
              address: row.address || '',
            }),
          })}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          getItemKey={(index) => `${activeWallet.walletAddress}-${sortedList[index]?.address || index}`}
          headerClassName="bg-[#18181B]"
          rowClassName="border-none"
          striped
          emptyText={emptyText}
        />
      </div>
    </Context.Provider>
  )
}
