import { useAppSelector } from '@/redux/store'
import { useMemo, useState } from 'react'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'
import { useMemeTokens } from '@pages/meme/discover/desktop/hooks/useMemeTokens.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { TimeRange } from '@/@generated/gql/graphql-future.ts'
import {
  toHolders,
  toLiquidityPool,
  toMarketCap,
  toProgress,
  toSortBy,
  toTransactions,
  toVolumes,
} from '@components/discover/filter/mapper.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { DexFilter } from '@components/discover/filter/FilterFormData.ts'

export const useCompletingTokens = () => {
  const [paused, setPaused] = useState(false)
  const filter = useAppSelector((state) => state.home.filters['TAB_MEME_completing'])
  const activeChain = useActiveChain()
  const timeframe = filter?.timeframe || '1h'

  const queryKey = useMemo(() => {
    return ['tokens', 'meme', LifecycleStates.Completing, filter, activeChain]
  }, [filter, activeChain])

  const dexList = useMemo(() => {
    const key = `${activeChain || TYPE_CHAIN.SOLANA}DexList` as DexFilter
    if (!activeChain) return undefined
    return filter[key]
  }, [filter, activeChain])

  const dexListFilter = useMemo(() => {
    const list = dexList
    if (!list) {
      return {}
    } else {
      return { dexes: list.join(',') }
    }
  }, [dexList])

  const result = useMemeTokens({
    queryKey: queryKey,
    input: {
      chain: listCoinHelper.getChainType(activeChain || TYPE_CHAIN.SOLANA),
      lifecycleStates: LifecycleStates.Completing,
      sortBy: filter.sortBy ? toSortBy(filter.sortBy, timeframe) : '-internalMarketProgress',
      timeRange: TimeRange.H1,
      ...dexListFilter,
      ...(toMarketCap(filter) ?? {}),
      ...(toHolders(filter) ?? {}),
      ...(toLiquidityPool(filter) ?? {}),
      ...(toTransactions(filter) ?? {}),
      ...(toVolumes(filter) ?? {}),
      ...(toProgress(filter) ?? {}),
    },
    paused: paused,
    refetchInterval: 5000, // 10 seconds
    timeframe: timeframe as '1m' | '5m' | '1h' | '6h' | '24h',
  })

  // TODO: Handle updating completing tokens data

  return {
    ...result,
    paused,
    setPaused,
  }
}
