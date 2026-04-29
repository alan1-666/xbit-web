import { useAppSelector } from '@/redux/store'
import { useEffect, useMemo, useState } from 'react'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { getPortfolioOverview } from '@services/tokens.service.ts'
import { PortfolioDTO } from '@/types/holding.ts'
import { PortfolioCardFilter } from '@pages/assets/overview/components/PortfolioCardHeader'
import { isNativeToken } from '@/utils/token.ts'
import { getNativeTokenPrice } from '@pages/assets/overview/hooks/useNativeTokenPrice.ts'
import { usePrices } from '@pages/assets'
import { mappedChainTypeToChainId } from '@/redux/modules/newWallet.slice.ts'

export const useHoldingTokens = (filter: PortfolioCardFilter) => {
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)

  const walletAddresses = useMemo(() => {
    if (filter.walletAddresses) {
      const wallets = new Set(filter.walletAddresses.map((wallet) => wallet.walletAddress))
      return Array.from(wallets)
    }
    const wallets = new Set(listWalletsByChain.map((item: UserEmbeddedWalletDto) => item.walletAddress as string))
    return Array.from(wallets)
  }, [listWalletsByChain, filter])

  const chainIds = useMemo(() => {
    const wallets = filter.walletAddresses || []
    const chainIdsSet = new Set<number>()
    wallets.forEach((wallet) => {
      const chainType = wallet.chain
      const chainId = mappedChainTypeToChainId(chainType)
      if (chainId) {
        chainIdsSet.add(chainId)
      }
    })
    return Array.from(chainIdsSet)
  }, [filter.walletAddresses])

  const {
    data: tokensData,
    isLoading,
    hasNextPage: hasMore,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    ...rest
  } = useInfiniteQuery({
    queryKey: ['tokensOverview', walletAddresses, filter],
    initialPageParam: 1,
    enabled: !walletAddresses || walletAddresses.length > 0,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await gqlClient.query({
        query: getPortfolioOverview,
        variables: {
          input: {
            userAddresses: walletAddresses,
            chainIds: chainIds,
            limit: 100,
            page: pageParam,
            sortBy: '-holdingValue',
            allToken: true,
            hideSmallBalance: filter.hideSmallAmount,
            hideSmallLiquidity: filter.hideSmallLiquidityPool,
            hideZeroBalance: filter.hideSellAll,
            search: filter.searchText || undefined,
          },
        },
      })
      return (res?.data?.getPortfolioOverview?.data || []) as PortfolioDTO[]
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
  })

  const queryClient = useQueryClient()
  useEffect(() => {
    return () => {
      // Cancel any ongoing queries related to meme tokens when the component unmounts
      queryClient.cancelQueries({
        queryKey: ['tokensOverview', walletAddresses],
      })

      // Clear the query cache for meme tokens, except first page
      queryClient.setQueryData(['tokensOverview', walletAddresses], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.slice(0, 1), // Keep only the first page
          pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
        }
      })
    }
  }, [])

  const { solPrice, ethPrice, bnbPrice } = usePrices()

  const assets = useMemo(() => {
    if (!tokensData) return []
    const tokens = tokensData.pages.flatMap((page) => page || [])
    return tokens.sort((a, b) => {
      const aIsLowLiquidity = a.lowLiquidity ? 1 : 0
      const bIsLowLiquidity = b.lowLiquidity ? 1 : 0
      if (aIsLowLiquidity !== bIsLowLiquidity) {
        return aIsLowLiquidity - bIsLowLiquidity // Low liquidity tokens go to the end
      }
      const isNativeA = isNativeToken(a.chainId, a.token)
      const aPriceAdjusted = isNativeA
        ? getNativeTokenPrice({
            chainId: a.chainId,
            ethPrice: ethPrice,
            bnbPrice: bnbPrice,
            solPrice: solPrice,
            address: a.token,
            initialPrice: a.price || 0,
          })
        : a.price || 0
      const isNativeB = isNativeToken(b.chainId, b.token)
      const bPriceAdjusted = isNativeB
        ? getNativeTokenPrice({
            chainId: b.chainId,
            ethPrice: ethPrice,
            bnbPrice: bnbPrice,
            solPrice: solPrice,
            address: b.token,
            initialPrice: b.price || 0,
          })
        : b.price || 0

      const aTotalValue = a.totalBaseAmount * aPriceAdjusted || 0
      const bTotalValue = b.totalBaseAmount * bPriceAdjusted || 0

      if (aTotalValue !== bTotalValue) {
        return bTotalValue - aTotalValue // Sort by total value descending
      }
      return 0
    })
  }, [tokensData?.pages, solPrice, ethPrice, bnbPrice])

  const [assetsRefactored, setAssetsRefactored] = useState<PortfolioDTO[]>(assets)

  useEffect(() => {
    setAssetsRefactored(assets)
  }, [assets])

  const loadMoreFn = async () => {
    if (isLoading || loadingMore || !hasMore) return
    fetchNextPage().then(() => {})
    return true
  }

  return {
    assets,
    assetsRefactored,
    isLoading,
    hasMore,
    loadingMore,
    loadMoreFn,
    ...rest,
  }
}
