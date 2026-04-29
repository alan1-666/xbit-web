import HeaderBackTransparent from '@/components/header/HeaderBackTransparent'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import CategoryTabs from '@/components/category/CategoryTabs'
import CategoryStatsCard from '@/components/category/CategoryStatsCard'
import CategorySortHeader, { CategorySortField, CategorySortState } from '@/components/category/CategorySortHeader'
import CategoryTokenList from '@/components/category/CategoryTokenList'
import useTokenSorting from '@/hooks/useTokenSorting'
import { useCategories } from '@hooks/useCategories.ts'
import { Category, CategoryToken } from '@/types/category.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useApolloClient } from '@apollo/client'
import { getCategoryStatistics, getTokensByCategory } from '@services/tokens.service.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { formatMarketValue } from '@/lib/format.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { useInfiniteQuery, useQuery as useReactQuery } from '@tanstack/react-query'
import { _isMobileDevice, _isMobileSafari, cn, getPath } from '@/lib/utils.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { Loading } from '@components/common/Loading.tsx'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getBlockChainLogo } from '@/utils/helpers'

const useCategoryStatistics = (chainId: string, categoryName?: string | null) => {
  const client = useApolloClient()
  const { data, ...rest } = useReactQuery({
    queryKey: ['getCategoryStatistics', chainId, categoryName],
    enabled: !!categoryName,
    queryFn: async () => {
      const res = await client.query({
        query: getCategoryStatistics,
        variables: {
          input: {
            chainId: +chainId,
            categoryId: categoryName!,
          },
        },
      })
      return res.data?.getCategoryStatistic
    },
  })
  return {
    categoryStatistics: data,
    loading: !data && rest.isPending,
  }
}

const getSortBy = (sortState: CategorySortState) => {
  switch (sortState.field) {
    case CategorySortField.MarketCap:
      return 'MarketCap'
    case CategorySortField.Change24h:
      return 'Price24hChange'
    case CategorySortField.Price:
      return 'Price'
    case CategorySortField.Volume24h:
      return 'Volume24h'
    default:
      return 'MarketCap'
  }
}

const useTokens = (chainId: string, categoryName: string | null | undefined, categorySortState: CategorySortState) => {
  const { data, isPending, ...rest } = useInfiniteQuery({
    queryKey: ['getTokensByCategory', chainId, categoryName, categorySortState.field, categorySortState.direction],
    initialPageParam: 1,
    enabled: !!categoryName,
    queryFn: async ({ pageParam }) => {
      return futureClient.query({
        query: getTokensByCategory,
        variables: {
          input: {
            chainId: +chainId,
            categoryId: categoryName!,
            page: pageParam,
            limit: 20,
            sortBy: getSortBy(categorySortState),
            sortType: categorySortState.direction === 'asc' ? 'asc' : 'desc',
          },
        },
      })
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.tokensByCategory.data.length === 20) {
        return lastPage.data.tokensByCategory.page + 1
      } else {
        return undefined
      }
    },
  })
  const tokens = useMemo(() => {
    if (!data) return []
    return data.pages.map((page) => page.data.tokensByCategory.data).flat()
  }, [data])

  return {
    tokens,
    loading: isPending,
    isPending,
    ...rest,
  }
}

const StatsCardSkeleton = () => {
  return <Skeleton className="w-full h-32" />
}

const ListCoinSkeleton = () => {
  return (
    <div className="space-y-3 px-2.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-11" />
      ))}
    </div>
  )
}

/**
 * Page component for the category detail
 * Shows a list of tokens in a specific category with sorting and filtering options
 */
const CategoryDetailPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = useParams()
  const scrollRef = useRef<HTMLDivElement>(null)
  const categoryId = params.category!
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const { sortState, handleSortChange } = useTokenSorting()
  const activeChainId = useActiveChainId()
  const chainId = activeChainId ? activeChainId.toString() : ChainIds.Solana.toString()
  const { tokens, fetchNextPage, isFetchingNextPage, isPending, hasNextPage } = useTokens(
    chainId,
    selectedCategory?.categoryId,
    sortState,
  )
  const { categories: allCategories, loading: allCategoriesLoading } = useCategories()
  const { categoryStatistics, loading: categoryStatisticsLoading } = useCategoryStatistics(
    chainId,
    selectedCategory?.categoryId,
  )

  
  const handleTokenClick = (token: CategoryToken) => {
    navigate(
      getPath(APP_PATH.MEME_TOKEN_DETAIL, {
        address: token.address!,
        chain: CHAIN_SYMBOLS[token.chainId ? +token.chainId : ChainIds.Solana],
      }),
      {
        state: {
          symbol: token.symbol,
          tokenName: token.name,
          isFavorite: token.isFavorite,
          address: token.address,
          chainId: token.chainId,
        },
      },
    )
  }

  const handleNavigateBack = () => {
    navigate(APP_PATH.MEME_DISCOVER + '?page=classification', { replace: true })
  }

  const currentCategory = allCategories?.find((category) => category.categoryId === categoryId)

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      // check if scroll over 75%
      const scrollTop = scrollElement.scrollTop
      const scrollHeight = scrollElement.scrollHeight
      const clientHeight = scrollElement.clientHeight
      if (scrollTop + clientHeight >= scrollHeight * 0.75 && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage().then()
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [isFetchingNextPage, fetchNextPage])

  return (
    <div className="flex max-h-screen flex-col overflow-hidden">
      <div className="fixed top-0 left-0 right-0 max-w-[768px] mx-auto">
        <div className="absolute inset-0 z-[-1] backdrop-blur-3xl" />
        <HeaderBackTransparent
          title={t('categoryDetail.title')}
          onBack={handleNavigateBack}
          right={<div className="size-6" />}
        />
        {!allCategoriesLoading && <CategoryTabs onCategoryChange={setSelectedCategory} allCategories={allCategories} />}
      </div>

      <div
        ref={scrollRef}
        className={cn(
          'flex-1 mt-[82px] overflow-y-scroll no-scrollbar overscroll-y-none',
          _isMobileSafari() ? 'pb-[130px]' : _isMobileDevice() ? 'pb-[200px]' : 'pb-[95px]',
        )}
      >
        <div className="px-2.5 pt-2">
          {!categoryStatisticsLoading && !!selectedCategory ? (
            <CategoryStatsCard
              label={selectedCategory?.name ?? currentCategory?.name ?? ''}
              averageIncrease={categoryStatistics?.price24hChange ?? 0}
              totalMarketCap={`${categoryStatistics?.marketCap ? formatMarketValue(categoryStatistics?.marketCap, '$') : '--'}`}
              totalVolume={`$${fShortenNumber(categoryStatistics?.volume24h ?? 0, 2)}`}
              upCount={categoryStatistics?.priceUpCount ?? 0}
              downCount={categoryStatistics?.priceDownCount ?? 0}
              total={categoryStatistics?.tokensCount}
            />
          ) : (
            <StatsCardSkeleton />
          )}
        </div>

        <div className="px-2.5 py-2 sticky top-0 z-10 bg-[#0A0A0A]">
          <CategorySortHeader sortState={sortState} onSortChange={handleSortChange} />
        </div>

        {!isPending ? (
          <CategoryTokenList tokens={tokens} onTokenClick={handleTokenClick} className="px-2.5 overscroll-y-none" />
        ) : (
          <ListCoinSkeleton />
        )}
        {hasNextPage && (
          <div className="px-2.5 py-2 w-full flex justify-center items-center">
            <Loading />
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryDetailPage
