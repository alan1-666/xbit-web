import { useMemeTokens } from './useMemeTokens'
import { useMemo, useState } from 'react'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-future.ts'
import { useAppSelector } from '@/redux/store'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import {
  toHolders,
  toLiquidityPool,
  toMarketCap,
  toProgress,
  toTransactions,
  toVolumes,
} from '@components/discover/filter/mapper.ts'
import { TimeRange } from '@/@generated/gql/graphql-future.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { DexFilter, FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useAddNewMemeTokens } from '@hooks/useAddNewMemeTokens.ts'

export const useNewMemeTokens = () => {
  const [paused, setPaused] = useState(false)
  const filter = useAppSelector((state) => state.home.filters['TAB_MEME_newCreation'] as FilterFormData)
  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain()
  const timeframe = filter.timeframe || '1h'

  const queryKey = useMemo(() => {
    return ['tokens', 'meme', LifecycleStates.NewCreation, filter, activeChain, activeWallet.walletAddress]
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
      lifecycleStates: LifecycleStates.NewCreation,
      sortBy: '-createdTime',
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
    refetchInterval: Infinity,
    timeframe: timeframe as '1m' | '5m' | '1h' | '6h' | '24h',
  })

  useAddNewMemeTokens({
    queryKey,
    paused,
    filter,
    dexList,
    timeframe,
  })

  return {
    paused,
    setPaused,
    ...result,
  }
}
