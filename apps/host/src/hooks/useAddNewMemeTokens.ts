import { FilterFormData } from '@/components/discover/filter/FilterFormData'
import { useCallback, useEffect, useRef } from 'react'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { MemeTokenWithFormatted } from '@/types/token.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { MemeDto } from '@/@generated/gql/graphql-meme2.ts'
import { useTokenAvatarsSubscriptions } from '@hooks/useTokenAvatarSubscription.ts'
import { useNewMemeTokensListenerV2 } from '@hooks/meme/useNewMemeTokensListenerV2.ts'
import { useNewMemeTokensListener } from '@hooks/useNewMemeTokensListener.ts'

const getTxAndVolumeByTimeframe = (token: MemeDto, timeframe: string) => {
  switch (timeframe) {
    case '1m':
      return {
        txs: token.txs1m ?? 0,
        volume: token.volume1m ?? 0,
      }
    case '5m':
      return {
        txs: token.txs5m ?? 0,
        volume: token.volume5m ?? 0,
      }
    case '1h':
      return {
        txs: token.txs1h ?? 0,
        volume: token.volume1h ?? 0,
      }
    case '6h':
      return {
        txs: token.txs6h ?? 0,
        volume: token.volume6h ?? 0,
      }
    case '24h':
      return {
        txs: token.txs24h ?? 0,
        volume: token.volume24h ?? 0,
      }
    default:
      return {
        txs: token.txs1h ?? 0,
        volume: token.volume1h ?? 0,
      }
  }
}

interface UseAddNewMemeTokensOptions {
  queryKey: any[]
  paused: boolean
  filter: FilterFormData
  dexList: string[] | undefined
  timeframe: string
  enabled?: boolean
}

export const useAddNewMemeTokens = (options: UseAddNewMemeTokensOptions) => {
  const { queryKey, paused, filter, dexList, timeframe, enabled } = options
  const pausedList = useRef<MemeTokenWithFormatted[]>([])
  const queryClient = useQueryClient()
  const activeChainId = useActiveChainId()
  const isEligibleForNewMemeTokens = useCallback(
    (token: MemeDto) => {
      // Check if the token's chain matches the current filter's chain
      const isChainMatch = token.chainId === activeChainId
      if (!isChainMatch) return false

      // Check if the token's dexList matches the current filter's dexList
      const isDexListMatch = !dexList || dexList.some((allowedDex) => token.dexes?.includes(allowedDex) ?? false)
      if (!isDexListMatch) return false

      // Check the token's market cap
      const filteredMarketCap = filter.marketCap
      if (filteredMarketCap) {
        const allowedMax = filteredMarketCap.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredMarketCap.min ?? 0
        const tokenMarketCap = token.marketcap ?? 0
        if (tokenMarketCap < allowedMin || tokenMarketCap >= allowedMax) return false
      }

      // Check the token's holders
      const filteredHolders = filter.holders
      if (filteredHolders) {
        const allowedMax = filteredHolders.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredHolders.min ?? 0
        const tokenHolders = token.numberOfHolder ?? 0
        if (tokenHolders < allowedMin || tokenHolders >= allowedMax) return false
      }

      // Check the token's liquidity pool
      const filteredLiquidityPool = filter.liquidityPool
      if (filteredLiquidityPool) {
        const allowedMax = filteredLiquidityPool.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredLiquidityPool.min ?? 0
        const tokenLiquidityPool = token.liquidity ?? 0
        if (tokenLiquidityPool < allowedMin || tokenLiquidityPool >= allowedMax) return false
      }

      const { txs, volume } = getTxAndVolumeByTimeframe(token, timeframe)

      // Check the token's transactions
      const filteredTransactions = filter.transactions
      if (filteredTransactions) {
        const allowedMax = filteredTransactions.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredTransactions.min ?? 0
        const tokenTransactions = txs
        if (tokenTransactions < allowedMin || tokenTransactions >= allowedMax) return false
      }

      // Check the token's volumes
      const filteredVolumes = filter.volumes
      if (filteredVolumes) {
        const allowedMax = filteredVolumes.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredVolumes.min ?? 0
        const tokenVolumes = volume
        if (tokenVolumes < allowedMin || tokenVolumes >= allowedMax) return false
      }

      // Check the token's progress
      const filteredProgress = filter.progress
      if (filteredProgress) {
        const allowedMax = filteredProgress.max ?? Number.MAX_SAFE_INTEGER
        const allowedMin = filteredProgress.min ?? 0
        const tokenProgress = token.internalMarketProgress ?? 0
        if (tokenProgress < allowedMin || tokenProgress >= allowedMax) return false
      }

      // If all checks pass, the token is eligible
      return true
    },
    [filter, timeframe, activeChainId],
  )
  const addNewTokensToQuery = useCallback(
    (newTokens: MemeTokenWithFormatted[]) => {
      queryClient.setQueryData(queryKey, (oldData: InfiniteData<MemeTokenWithFormatted[]> | undefined) => {
        if (!oldData) return oldData
        // Check if the new tokens are already in the list
        const allOldTokens = oldData.pages.flatMap((page) => page || [])
        const uniqueNewTokens: MemeTokenWithFormatted[] = []
        newTokens.forEach((token) => {
          const isNew = !allOldTokens.some((oldToken) => oldToken.token?.toLowerCase() === token.token?.toLowerCase())
          if (isNew) {
            uniqueNewTokens.push(token)
          }
        })
        if (uniqueNewTokens.length === 0) return oldData
        const newPages = oldData.pages.map((page, index) => {
          if (index === 0) {
            return [...uniqueNewTokens, ...(page || [])].slice(0, 100) // Keep first page to max 100 items
          }
          return page
        })
        return {
          ...oldData,
          pages: newPages,
        }
      })
    },
    [queryKey],
  )

  useEffect(() => {
    if (!paused && pausedList.current.length > 0) {
      // If we are resuming from paused state, update the query with the paused tokens
      addNewTokensToQuery(pausedList.current)
      pausedList.current = []
    }
  }, [paused])

  const removeFromPausedList = useCallback((tokenAddress: string) => {
    pausedList.current = pausedList.current.filter((token) => token.token.toLowerCase() !== tokenAddress.toLowerCase())
  }, [])

  useNewMemeTokensListenerV2({
    shouldSkip: enabled === false,
    callback: (newTokens) => {
      const eligibleTokens = newTokens.filter(isEligibleForNewMemeTokens)
      const newList = eligibleTokens.map((token) => token as MemeTokenWithFormatted)
      if (paused) {
        pausedList.current = newList.concat(pausedList.current)
      } else {
        addNewTokensToQuery(newList)
      }
    },
  })

  useTokenAvatarsSubscriptions(
    pausedList.current.map((token) => `public/meme/token_image/${token.chainId}/${token.token}`),
  )

  return {
    removeFromPausedList,
  }
}
