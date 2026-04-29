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

export const useCompletedTokens = () => {
  const [paused, setPaused] = useState(false)
  const filter = useAppSelector((state) => state.home.filters['TAB_MEME_completed'])
  const activeChain = useActiveChain()
  const timeframe = filter.timeframe || '1h'

  const queryKey = useMemo(() => {
    return ['tokens', 'meme', LifecycleStates.Completed, filter, activeChain]
  }, [filter, activeChain])

  const dexListFilter = useMemo(() => {
    const key = `${activeChain || TYPE_CHAIN.SOLANA}DexList`
    const list = filter[key]
    if (!list) {
      return {}
    } else {
      return { dexes: list.join(',') }
    }
  }, [filter, activeChain])

  const result = useMemeTokens({
    queryKey: queryKey,
    input: {
      chain: listCoinHelper.getChainType(activeChain || TYPE_CHAIN.SOLANA),
      lifecycleStates: LifecycleStates.Completed,
      sortBy: filter.sortBy ? toSortBy(filter.sortBy, timeframe) : '-migratedAt',
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
    refetchInterval: 10000, // 10 seconds
    timeframe: timeframe as '1m' | '5m' | '1h' | '6h' | '24h',
    maxPages: 8,
  })

  return {
    ...result,
    paused,
    setPaused,
  }
}
