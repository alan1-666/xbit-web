import {
  ColumnDefWithMeta,
  VirtualizedDataTable,
} from '@pages/meme/discover/desktop/components/VirtualizedDataTable.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import AiIcon from '@components/common/Card/AiIcon.tsx'
import { TokenStatisticRow } from '@pages/meme/discover/desktop/components/TokenStatisticRow.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { createContext, MouseEvent, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { getBlockChainLogo } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { Trans, useTranslation } from 'react-i18next'
import { SecurityCell } from '@pages/meme/discover/desktop/components/SecurityCell.tsx'
import { QuickBuyButton } from '@components/discover/QuickBuyButton.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useCategoryTokens } from '@pages/meme/discover/desktop/hooks/useCategoryTokens.ts'
import { TimeframeOption, TimeframeSelector } from '@components/discover/TimeframeSelector.tsx'
import QuickBuy from '@components/discover/QuickBuy.tsx'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import { SortDirection, TokensStatisticByCategoryDto, TokenSortFields } from '@/@generated/gql/graphql-future.ts'
import { Link } from 'react-router-dom'
import { cn, getPath } from '@/lib/utils.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import dayjs from 'dayjs'
import { IconsGroup } from '@components/discover/IconsGroup.tsx'
import { HoverableTokenAvatar } from '@pages/meme/discover/desktop/components/HoverableTokenAvatar.tsx'
import { AiAnalysisSheet, AiAnalysisSheetHandle } from '@pages/meme/discover/desktop/components/AiAnalysisSheet.tsx'
import { useAllBacklistAddresses } from '@pages/meme/discover/desktop/hooks/useBlacklistAddress.ts'
import { useShouldShowTopBar } from '@pages/meme/discover/desktop/hooks/useShouldShowTopBar.ts'
import { SortingState } from '@tanstack/react-table'
import { IconWithValue } from '@pages/meme/discover/desktop/components/IconWithValue.tsx'
import { IconCrown } from '@components/v2/ui-shared/icons/IconCrown.tsx'
import { FavoriteTokenIcon } from '@components/v2/ui-shared/components/FavoriteTokenIcon.tsx'
import { DevMigratedTooltip } from '@pages/meme/discover/desktop/components/DevMigratedTooltip.tsx'
import { useAppSelector } from '@/redux/store'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { formatPercent } from '@/lib/format.ts'

export interface CategoryTokensListProps {
  categoryId: string
}

const Context = createContext<{
  timeframe: TimeframeOption
  onAiClick?: (tokenAddress: string) => void
  onFavoriteToken: (token: string, isFavorite: boolean) => void
}>({
  timeframe: '1h',
  onAiClick: undefined,
  onFavoriteToken: () => {},
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
    id: 'rank',
    header: '#',
    size: 50,
    cell: ({ row }) => {
      const token = row.original
      const { onFavoriteToken } = useContext(Context)
      const handleAdd = () => {
        onFavoriteToken(token.address || '', true)
      }

      const handleRemove = () => {
        onFavoriteToken(token.address || '', false)
      }

      return (
        <div>
          <FavoriteTokenIcon
            defaultValue={token.isFavorite}
            token={token.address}
            symbol={token.symbol}
            onAdded={handleAdd}
            onRemoving={handleRemove}
          />
        </div>
      )
    },
  },
  {
    id: 'token',
    header: () => <Trans i18nKey="categories.tokenName" />,
    meta: {
      style: { flex: 1, minWidth: 400 },
    },
    cell: ({ row }) => {
      const { onAiClick } = useContext(Context)
      const token = row.original
      const { addTokens, addDevs } = useAllBacklistAddresses()
      const { t } = useTranslation()
      const tokenLogo = useMemo(() => {
        if (token.logoUrl) return token.logoUrl
        return getBlockChainLogo(token.chainId ? +token.chainId : ChainIds.Solana, token.address || '')
      }, [token])

      const handleAiClick = (event: MouseEvent) => {
        event.stopPropagation()
        event.preventDefault()
        onAiClick?.(token.address || '')
      }

      const handleAddBlacklistToken = () => {
        addTokens([token.address])
      }

      const handleAddBlacklistDev = () => {
        if (!token.creator) return
        addDevs([token.creator])
      }

      return (
        <TooltipProvider>
          <div className="flex gap-1.5">
            <HoverableTokenAvatar
              tokenAvatar={tokenLogo}
              className="size-16"
              progress={0}
              showProgress={false}
              onHideToken={handleAddBlacklistToken}
              onHideDEV={handleAddBlacklistDev}
              address={token.address}
              chainId={token.chainId ? +token.chainId : ChainIds.Solana}
              name={token.symbol}
            />
            <div className="flex flex-col justify-between h-[70px]">
              <div className="flex items-center gap-1.5">
                <div className="flex items-baseline gap-1">
                  <SimpleTooltip content={token.name}>
                    <span className="text-[calc(16rem/16)] font-medium text-white">{token.symbol} </span>
                  </SimpleTooltip>
                  <SimpleTooltip content={t('listCoin.tooltip.tokenAddress', { token: token.address })}>
                    <span className="text-[calc(12rem/16)] leading-3 font-[330] text-[#FFFFFF80]">{token.name}</span>
                  </SimpleTooltip>
                </div>
                <SimpleTooltip content={t('listCoin.tooltip.copyAddress')}>
                  <div>
                    <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center" text={token.address} type="tokenAddress" />
                  </div>
                </SimpleTooltip>
                <SimpleTooltip content={t('ai.onchainTextTitle')}>
                  <button className="cursor-pointer size-4" onClick={handleAiClick}>
                    <AiIcon />
                  </button>
                </SimpleTooltip>
              </div>
              <div className="flex items-center gap-1.5">
                <SimpleTooltip content={token.createdTimeRaw && token.createdTimeRaw > 0 ? dayjs(token.createdTimeRaw * 1000).format('YYYY-MM-DD HH:mm') : '--' }>
                  <div>
                    <TokenAge createdTime={token.createdTimeRaw && token.createdTimeRaw > 0 ? dayjs(token.createdTimeRaw * 1000).toISOString() : '--'} />
                  </div>
                </SimpleTooltip>
                <IconsGroup
                  tokenAddress={token.address}
                  twitterUrl={token.twitterUrl || ''}
                  websiteUrl={token.website || ''}
                  twitterChangeCount={token.twitterNameChangeCount ? +token.twitterNameChangeCount : 0}
                  twitterPostId={token.tweetId || ''}
                  advertisesOnDex={token.advertisesOnDex ?? false}
                />
                <div className="flex items-center gap-2 text-[calc(12rem/16)] text-white/80 font-[380] border-l pl-2 leading-3">
                  <SimpleTooltip content={t('listCoin.tooltip.holders')}>
                    <IconWithValue
                      icon={<img src="/images/discover/ic-holder.svg" className="size-3.5" alt="" />}
                      value={fShortenNumber(token.numberOfHolder)}
                    />
                  </SimpleTooltip>
                  <SimpleTooltip content={t('listCoin.tooltip.smartMoneyPC')}>
                    <IconWithValue
                      icon={<img src="/images/discover/ic-sm2.svg" className="size-3.5" alt="" />}
                      value={fShortenNumber(token.smartMoneyHolder || 0)}
                    />
                  </SimpleTooltip>
                  <SimpleTooltip
                    content={
                      <DevMigratedTooltip
                        devMigratedCount={token.devMigrated ? token.devMigrated : 0}
                        devLaunched={token.devLaunched ? +token.devLaunched : 1}
                      />
                    }
                  >
                    <IconWithValue
                      icon={
                        <IconCrown
                          className={cn(
                            token.devMigrated && token.devMigrated >= 2 ? 'text-[#FACC14]' : 'text-[#878787]',
                          )}
                        />
                      }
                      value={fShortenNumber(token.devMigrated || 0)}
                    />
                  </SimpleTooltip>
                </div>
              </div>
              <TokenStatisticRow
                devHold={token.devHold ? +token.devHold : 0}
                top10={token.top10Holder ? +token.top10Holder : 0}
                sniper={token.sniperHoldPct ? +token.sniperHoldPct : 0}
                insider={token.insider ? +token.insider : 0}
                bundler={token.bundlerHoldingPercent ? +token.bundlerHoldingPercent : 0}
                address={token.address || ''}
                chainId={token.chainId ? +token.chainId : ChainIds.Solana}
                creator={token.creator || ''}
              />
            </div>
          </div>
        </TooltipProvider>
      )
    },
  },
  {
    id: 'age',
    enableSorting: true,
    size: 80,
    header: () => <Trans i18nKey="detail.tokenDetail.time" />,
    cell: ({ row }) => {
      const token = row.original
      const createdTimeRaw = (token.createdTimeRaw && token.createdTimeRaw > 0) ? new Date(token.createdTimeRaw * 1000) : null
      return <TokenAge createdTime={createdTimeRaw ? createdTimeRaw.toISOString() : '--'} />
    },
  },
  {
    id: 'marketCap',
    enableSorting: true,
    size: 120,
    header: () => <Trans i18nKey="tokenData.marketCap" />,
    cell: ({ row }) => {
      const token = row.original
      return <MarketDisplay value={token.marketCap ? +token.marketCap : 0} />
    },
  },
  {
    id: 'liquidity',
    enableSorting: true,
    size: 120,
    header: () => <Trans i18nKey="tokenData.liquidityPool" />,
    cell: ({ row }) => {
      const token = row.original
      return <div>${fShortenNumber(token.liquidity ? +token.liquidity : 0)}</div>
    },
  },
  {
    id: 'holders',
    size: 80,
    header: () => <Trans i18nKey="listCoin.columns.holders" />,
    cell: ({ row }) => {
      const token = row.original
      return <div>{fShortenNumber(token.numberOfHolder ? +token.numberOfHolder : 0)}</div>
    },
  },
  {
    id: 'transactions',
    enableSorting: true,
    header: () => {
      const { timeframe } = useContext(Context)
      return <Trans i18nKey="listCoin.columns.transactionsWithTimePC" values={{ time: timeframe }} />
    },
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
    id: 'volume',
    enableSorting: true,
    size: 120,
    header: () => {
      const { timeframe } = useContext(Context)
      return <Trans i18nKey="listCoin.columns.volumeWithTimePC" values={{ time: timeframe }} />
    },
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
      return <MarketDisplay value={volume ? +volume : 0} />
    },
  },
  {
    id: 'priceChange',
    size: 120,
    enableSorting: true,
    header: () => {
      const { timeframe } = useContext(Context)
      return <Trans i18nKey="listCoin.columns.priceChangeWithTime" values={{ time: timeframe }} />
    },
    cell: ({ row }) => {
      const { timeframe } = useContext(Context)
      const token = row.original
      const priceChange = useMemo(() => {
        switch (timeframe) {
          case '1m':
            return token.price1mChange ? +token.price1mChange : 0
          case '5m':
            return token.price5mChange ? +token.price5mChange : 0
          case '1h':
            return token.price1hChange ? +token.price1hChange : 0
          case '6h':
            return token.price6hChange ? +token.price6hChange : 0
          case '24h':
            return token.price24hChange ? +token.price24hChange : 0
          default: {
            return token.price1hChange ? +token.price1hChange : 0
          }
        }
      }, [timeframe, token])
      return (
        <div className={priceChange >= 0 ? 'text-rise' : 'text-fall'}>
          {priceChange >= 0 ? '+' : ''}
          {formatPercent(priceChange)}
        </div>
      )
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
          top10Holder={token.top10Holder ? +token.top10Holder : 0}
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
          <QuickBuyButton token={token} showUnit={true} />
        </div>
      )
    },
  },
]

const getSortBy = (
  sorting: SortingState,
  timeframe: TimeframeOption,
): { field: TokenSortFields; direction: SortDirection } | undefined => {
  const sort = sorting[0]
  if (!sort) return undefined
  const { id, desc } = sort
  switch (id) {
    case 'marketCap':
      return {
        field: TokenSortFields.MarketCap,
        direction: desc ? SortDirection.Desc : SortDirection.Asc,
      }
    case 'liquidity':
      return {
        field: TokenSortFields.Liquidity,
        direction: desc ? SortDirection.Desc : SortDirection.Asc,
      }
    case 'transactions': {
      switch (timeframe) {
        case '1m':
          return {
            field: TokenSortFields.Txs1m,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '5m':
          return {
            field: TokenSortFields.Txs5m,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '1h':
          return {
            field: TokenSortFields.Txs1h,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '6h':
          return {
            field: TokenSortFields.Txs6h,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        default:
          return {
            field: TokenSortFields.Txs24h,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
      }
    }
    case 'volume': {
      switch (timeframe) {
        case '1m':
          return {
            field: TokenSortFields.Volume1m,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '5m':
          return {
            field: TokenSortFields.Volume5m,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '1h':
          return {
            field: TokenSortFields.Volume1h,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '6h':
          return {
            field: TokenSortFields.Volume6h,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        default:
          return {
            field: TokenSortFields.Volume24h,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
      }
    }
    case 'priceChange': {
      switch (timeframe) {
        case '1m':
          return {
            field: TokenSortFields.Price1mChange,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '5m':
          return {
            field: TokenSortFields.Price5mChange,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '1h':
          return {
            field: TokenSortFields.Price1hChange,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        case '6h':
          return {
            field: TokenSortFields.Price6hChange,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
        default:
          return {
            field: TokenSortFields.Price24hChange,
            direction: desc ? SortDirection.Desc : SortDirection.Asc,
          }
      }
    }
    case 'age':
      return {
        field: TokenSortFields.CreatedTime,
        direction: desc ? SortDirection.Desc : SortDirection.Asc,
      }
    default:
      return undefined
  }
}

export const CategoryTokensList = (props: CategoryTokensListProps) => {
  const { categoryId } = props
  const activeChainId = useActiveChainId()
  const [timeframe, setTimeframe] = useState<TimeframeOption>('1h')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'marketCap', desc: true }])
  const isTopBarVisible = useShouldShowTopBar()
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)

  const { blacklistTokens, blacklistDevs } = useAllBacklistAddresses()

  const sortBy = getSortBy(sorting, timeframe)
  const { tokens, loadMore, isLoading, onTokenFavoriteChanged } = useCategoryTokens({
    categoryId,
    chainId: activeChainId,
    sortBy: sortBy?.field,
    sortType: sortBy?.direction,
  })
  const ref = useRef<AiAnalysisSheetHandle>(null)

  const handleAiClick = useCallback(
    (tokenAddress: string) => {
      ref.current?.open(tokenAddress)
    },
    [ref.current],
  )

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      const isBlacklistedToken = blacklistTokens.some(
        (blacklist) => blacklist.address.toLowerCase() === token.address?.toLowerCase(),
      )
      const isBlacklistedDev = token.creator
        ? blacklistDevs.some((blacklist) => blacklist.address.toLowerCase() === token.creator?.toLowerCase())
        : false
      return !isBlacklistedToken && !isBlacklistedDev
    })
  }, [tokens, blacklistTokens, blacklistDevs])

  const handleFavoriteToken = useCallback((token: string, isFavorite: boolean) => {
    onTokenFavoriteChanged(token, isFavorite)
  }, [])

  const contextValue = useMemo(
    () => ({ timeframe, onAiClick: handleAiClick, onFavoriteToken: handleFavoriteToken }),
    [timeframe, handleAiClick],
  )

  return (
    <Context.Provider value={contextValue}>
      <div>
        <div className="pt-2 flex items-center justify-between">
          <TimeframeSelector currentTimeframe={timeframe} onTimeframeChange={setTimeframe} />
          <QuickBuy presetSelectType="list" className="rounded-full" />
        </div>
        <VirtualizedDataTable
          data={filteredTokens}
          columns={columns}
          estimateSize={94}
          className={cn(
            'border-none',
            isShowMaintenanceNotification
              ? isTopBarVisible
                ? 'h-[calc(100vh-314px)]'
                : 'h-[calc(100vh-280px)]'
              : isTopBarVisible
                ? 'h-[calc(100vh-282px)]'
                : 'h-[calc(100vh-248px)]',
          )}
          onLoadMore={loadMore}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={setSorting}
          getItemKey={(index) => `${tokens[index]?.address}-${index}`}
          rowWrapper={Link}
          rowWrapperPropsFn={(row) => ({
            to: getPath(APP_PATH.MEME_TOKEN_DETAIL, {
              chain: CHAIN_SYMBOLS[row.chainId ? +row.chainId : ChainIds.Solana],
              address: row.address || '',
            }),

            state: {
              symbol: row.symbol,
              tokenLogo: row.logoUrl
                ? row.logoUrl
                : getBlockChainLogo(row.chainId ? +row.chainId : ChainIds.Solana, row.address || ''),
              tokenName: row.name,
              isFavorite: row.isFavorite,
              createdTime: dayjs(row.createdTime * 1000).toISOString(),
              address: row.address,
              devMigrated: row.devMigrated,
              chainId: row.chainId,
            },
          })}
        />
        <AiAnalysisSheet ref={ref} />
      </div>
    </Context.Provider>
  )
}
