import CategoryStatsCard from '@components/category/CategoryStatsCard.tsx'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { formatPriceChange, fShortenNumber } from '@/lib/number.ts'
import CategorySortHeader, { CategorySortField } from '@components/category/CategorySortHeader.tsx'
import useTokenSorting from '@hooks/useTokenSorting.ts'
import { cn, getPath } from '@/lib/utils.ts'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { formatMarketValue } from '@/lib/format.ts'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useApolloClient } from '@apollo/client'
import { getCategoryStatistics, getTokensByCategory } from '@services/tokens.service.ts'
import { GetTokensByCategoryInput } from '@/types/requests.ts'
import { CategoryToken } from '@/types/category.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useSubscription } from '@/lib/mqtt'
import { TokenStatisticDto } from '@/@generated/gql/graphql-core.ts'
import { GetTokensByCategoryResponse } from '@/types/responses.ts'
import { IconEmpty } from '@components/icon'
import { useTranslation } from 'react-i18next'
import { Loading } from '@components/common/Loading.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'

type UseTokensOptions = {
  sortBy?: CategorySortField
  sortType?: 'ASC' | 'DESC'
}

const sortByMap: Record<CategorySortField, GetTokensByCategoryInput['input']['sortBy']> = {
  [CategorySortField.MarketCap]: 'MarketCap',
  [CategorySortField.Price]: 'Price',
  [CategorySortField.Change24h]: 'Price24hChange',
  [CategorySortField.Volume24h]: 'Volume24h',
  [CategorySortField.None]: 'MarketCap', // Default sort
}

const useTokens = (options: UseTokensOptions) => {
  const apolloClient = useApolloClient()
  const { sortBy = CategorySortField.MarketCap, sortType = 'DESC' } = options
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['tokens', 'xStocks', sortBy, sortType],
    initialPageParam: 1,
    getNextPageParam: (lastPage: GetTokensByCategoryResponse) => {
      // Assuming the API supports pagination, return the next page number
      return lastPage.tokensByCategory.data.length < 20 ? undefined : lastPage.tokensByCategory.page + 1
    },
    queryFn: async ({ pageParam }) => {
      const res = await apolloClient.query({
        query: getTokensByCategory,
        variables: {
          input: {
            chainId: 501424,
            categoryId: 'XStock',
            page: pageParam,
            limit: 100,
            sortBy: sortByMap[sortBy] || 'MarketCap',
            sortType: sortType || 'DESC',
          },
        },
      })
      return res.data as GetTokensByCategoryResponse
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  const tokens = useMemo(() => {
    return data?.pages.flatMap((page) => page.tokensByCategory.data) || []
  }, [data])
  return {
    tokens,
    ...rest,
  }
}

const ListCoinSkeleton = () => {
  return (
    <div className="space-y-3 px-2.5">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-11" />
      ))}
    </div>
  )
}

const useRealtimeData = (tokens: CategoryToken[]) => {
  const [realtimeTokens, setRealtimeTokens] = useState<CategoryToken[]>(tokens)
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(tokens.map((token) => `public/token_statistic/${activeChainId}/${token.address}`))

  useEffect(() => {
    setRealtimeTokens(tokens)
  }, [tokens])

  useEffect(() => {
    const msg = message?.message?.toString()
    if (msg) {
      const data: TokenStatisticDto = JSON.parse(msg)
      const topic = message?.topic?.toString()
      const address = topic?.split('/').pop()
      // console.log('address', address, 'data', data)
      if (!address) return
      setRealtimeTokens((prevState) =>
        prevState.map((token) =>
          token.address === address
            ? {
                ...token,
                marketCap: data.marketcap ? data.marketcap : token.marketCap,
                price: data.price ? data.price : token.price,
                price24hChange: data.price24hChange ? data.price24hChange : token.price24hChange,
                volume24h: data.volume24h ? data.volume24h : token.volume24h,
              }
            : token,
        ),
      )
    }
  }, [message])

  const { upCount, downCount, total } = useMemo(() => {
    const upCount = realtimeTokens.filter((token) => token.price24hChange && +token.price24hChange > 0).length
    const downCount = realtimeTokens.filter((token) => token.price24hChange && +token.price24hChange < 0).length
    return {
      upCount,
      downCount,
      total: realtimeTokens.length,
    }
  }, [realtimeTokens])

  return {
    realtimeTokens,
    upCount,
    downCount,
    total,
  }
}

const TokenRow = (props: { token: CategoryToken }) => {
  const { token } = props
  const chainLogo = getBlockchainLogo2(token.chainId ?? ChainIds.Solana)
  const price24hChange = token.price24hChange ? +token.price24hChange : 0
  const priceColor = price24hChange > 0 ? 'text-rise' : price24hChange < 0 ? 'text-fall' : 'text-white'
  return (
    <a
      href={getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: token.address!, chain: CHAIN_SYMBOLS[token.chainId!] })}
      className={cn(
        'py-3 mb-3 border-b-[0.5px] border-[#ECECED08] flex justify-between items-center hover:bg-[#27272a] transition-colors',
      )}
    >
      <div className="flex items-center w-[40%] md:w-[50%]">
        <div className="relative mr-2">
          <div className="flex -space-x-4">
            <ChainCurrencyIcon
              chainIcon={chainLogo}
              currencyIcon={token.logoUrl ?? ''}
              name={token.symbol ?? ''}
              avatarClassName="ml-0"
            />
          </div>
        </div>
        <div>
          <div className="text-white font-medium text-[calc(13rem/16)]">{token.symbol}</div>
          <div className={`text-[calc(11rem/16)] leading-[calc(11rem/16)] font-normal text-[#ffffff70] `}>
            {formatMarketValue(token.marketCap ? +token.marketCap : 0, '$')}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start w-[30%] pl-[5%] sm:pl-0">
        <MoneyFormatted value={token.price ?? 0} className="text-white font-medium text-[calc(13rem/16)]" />
        <div className={cn('justify-start text-[calc(11rem/16)] font-medium leading-3', priceColor)}>
          {price24hChange > 0 ? '+' : ''}
          {formatPriceChange(price24hChange)}
        </div>
      </div>
      <div className="flex flex-col items-end w-[30%] md:w-[20%]">
        <div className="w-20 text-right justify-start text-primary text-[calc(13rem/16)] font-medium leading-3">
          {token.volume24h ? `$${fShortenNumber(+token.volume24h)}` : '--'}
        </div>
      </div>
    </a>
  )
}

const directionMap: Record<string, 'ASC' | 'DESC'> = {
  asc: 'ASC',
  desc: 'DESC',
}

const X_STOCKS_CATEGORY_ID = 'XStock'

interface TokenListProps {
  tokens: CategoryToken[]
  isLoading: boolean
  onBottomReached?: () => void
  hasNextPage?: boolean
}

const TokenList = (props: TokenListProps) => {
  const { tokens, isLoading, onBottomReached, hasNextPage } = props
  const { t } = useTranslation()
  const listRef = useRef<HTMLDivElement>(null)

  const virtualizer = useWindowVirtualizer({
    count: tokens.length,
    estimateSize: () => 46, // Estimate the height of each row
    overscan: 10, // Number of items to render outside the visible area
    gap: 8,
    getItemKey: (index) => `${tokens[index]?.address}-${index}`,
  })

  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().slice(-1)[0]
    if (lastItem && lastItem.index >= tokens.length - 3) {
      onBottomReached?.()
    }
  }, [virtualizer.getVirtualItems()])

  if (isLoading) {
    return <ListCoinSkeleton />
  }

  if (!tokens.length) {
    return (
      <div className={`p-4 text-center text-[#ffffff70] text-[12px] flex flex-col items-center`}>
        <IconEmpty />
        {t('categoryDetail.noData')}
      </div>
    )
  }

  return (
    <div ref={listRef} className="relative w-full">
      <div style={{ height: `${virtualizer.getTotalSize() + (hasNextPage ? 100 : 0)}px` }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${item.start}px)` }}
            key={item.key}
          >
            <TokenRow token={tokens[item.index]} />
          </div>
        ))}
        {hasNextPage && (
          <div
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${virtualizer.getTotalSize()}px)` }}
          >
            <div className="pt-3 w-full flex justify-center items-center">
              <Loading />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const StatsCard = (props: { total: number; upCount: number; downCount: number }) => {
  const { upCount, downCount, total } = props
  const client = useApolloClient()
  const { data, isPending } = useQuery({
    queryKey: ['getCategoryStatistics', 'xStocks'],
    queryFn: async () => {
      const res = await client.query({
        query: getCategoryStatistics,
        variables: {
          input: {
            chainId: ChainIds.Solana,
            categoryId: X_STOCKS_CATEGORY_ID,
          },
        },
      })
      return res.data?.getCategoryStatistic
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  })
  if (isPending) {
    return <Skeleton className="w-full h-32" />
  }
  return (
    <CategoryStatsCard
      label="xStocks"
      averageIncrease={`${fShortenNumber(data?.price24hChange ?? 0, 2)}%`}
      totalMarketCap={`${data?.marketCap ? formatMarketValue(data?.marketCap, '$') : '--'}`}
      totalVolume={`$${fShortenNumber(data?.volume24h ?? 0, 2)}`}
      upCount={upCount ?? 0}
      downCount={downCount ?? 0}
      total={total ?? 0}
    />
  )
}

export const TabXStocks = () => {
  const { sortState, handleSortChange } = useTokenSorting()

  const { tokens, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useTokens({
    sortBy: sortState.field,
    sortType: directionMap[sortState.direction] || 'DESC',
  })

  const { realtimeTokens, upCount, downCount, total } = useRealtimeData(tokens)

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage().then(() => {})
    }
  }

  return (
    <div className="px-2 pt-2 pb-[95px]">
      <StatsCard upCount={upCount} downCount={downCount} total={total} />

      <div className="pt-[11px] pb-2 sticky top-0 z-10 bg-[#0A0A0A]">
        <CategorySortHeader sortState={sortState} onSortChange={handleSortChange} />
      </div>

      <TokenList
        tokens={realtimeTokens}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        onBottomReached={handleLoadMore}
      />
    </div>
  )
}
