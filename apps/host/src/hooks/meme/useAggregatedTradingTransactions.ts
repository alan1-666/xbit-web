import { useTradingTransactions, UseTradingTransactionsOptions } from '@hooks/meme/useTradingTransactions.ts'
import { useRealtimeTransactions } from '@hooks/useRealtimeTransactions.tsx'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import { useMemo } from 'react'
import { uniqBy } from 'lodash-es'
import { useKlineExclusiveTxs } from '@hooks/useKlineExclusiveTxs.ts'
import { useTokenSymbolsResolver } from '@hooks/meme/useTokenSymbolsResolver.ts'
import { getTokenSymbol } from '@/utils/token.ts'

export interface UseAggregatedTradingTransactionsOptions extends UseTradingTransactionsOptions {
  filterFn: (transaction: RealtimeTransaction) => boolean
  sortDirection?: '-timestamp' | '+timestamp'
}

export const useAggregatedTradingTransactions = (options: UseAggregatedTradingTransactionsOptions) => {
  const { filterFn, sortDirection = '-timestamp', ...rest } = options
  const tokenAddress = rest.input.token || ''
  const activeChainId = rest.input.chainId
  const { transactions: apiTransactions, ...restQuery } = useTradingTransactions(rest)
  const realtimeTransactions = useRealtimeTransactions()
  const exclusiveTxs = useKlineExclusiveTxs({
    tokenAddress: tokenAddress,
    chainId: activeChainId,
  })

  const filteredTransactions = useMemo(() => {
    return realtimeTransactions.filter(filterFn)
  }, [realtimeTransactions, filterFn])

  const mergedTransactions = useMemo(() => {
    // Apply merge sort to combine realtime and API transactions
    // let i = 0
    // let j = 0
    // const finalTransactions = []
    // while (i < filteredTransactions.length && j < apiTransactions.length) {
    //   const realtimeTx = filteredTransactions[i]
    //   const apiTx = apiTransactions[j]
    //   if (realtimeTx.timestamp >= apiTx.timestamp) {
    //     finalTransactions.push(realtimeTx)
    //     i++
    //   } else {
    //     finalTransactions.push(apiTx)
    //     j++
    //   }
    // }
    //
    // // Add any remaining transactions from either array
    // while (i < filteredTransactions.length) {
    //   finalTransactions.push(filteredTransactions[i])
    //   i++
    // }
    // while (j < apiTransactions.length) {
    //   finalTransactions.push(apiTransactions[j])
    //   j++
    // }
    // const sortedTransactions =
    //   sortDirection === '-timestamp' ? filteredTransactions.concat([]).reverse() : filteredTransactions
    // const finalTransactions = sortedTransactions.concat(apiTransactions)
    let finalTransactions: RealtimeTransaction[] = []
    if (sortDirection === '-timestamp') {
      finalTransactions = filteredTransactions.concat(apiTransactions)
    } else {
      const sorted = filteredTransactions.concat([]).reverse()
      finalTransactions = apiTransactions.concat(sorted)
    }

    return uniqBy(finalTransactions, (tx) => `${tx.txHash}-${tx.type}-${tx.logIndex}-${tx.eventIndex}`)
  }, [filteredTransactions, apiTransactions])

  const aggregatedWithExclusive = useMemo(() => {
    return mergedTransactions.map((tx) => {
      const exclusiveInfo = exclusiveTxs.find((exTx) => exTx.txHash === tx.txHash && exTx.eventIndex === tx.eventIndex)
      if (exclusiveInfo) {
        const newTx: RealtimeTransaction = {
          ...tx,
          isKlineTx: false,
          reasonFiltering: exclusiveInfo.reasonFiltering,
        }
        return newTx
      }
      return tx
    }) as RealtimeTransaction[]
  }, [mergedTransactions, exclusiveTxs])

  const quoteTokens = useMemo(() => {
    const tokensSet = new Set<string>()
    mergedTransactions.forEach((tx) => {
      const symbol = getTokenSymbol(activeChainId, tx.quoteToken, undefined)
      if (!symbol || symbol === '--') {
        tokensSet.add(tx.quoteToken)
      }
    })
    return Array.from(tokensSet)
  }, [mergedTransactions, activeChainId])

  useTokenSymbolsResolver(quoteTokens)

  return {
    transactions: aggregatedWithExclusive,
    ...restQuery,
  }
}
