import { useEffect, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { ReasonFiltering } from '@/@generated/gql/graphql-meme2.ts'

export type KlineExclusiveTx = {
  txHash: string
  eventIndex: number
  reasonFiltering: ReasonFiltering
}

export interface UseKlineExclusiveTxsOptions {
  tokenAddress: string
  chainId: number
}

export const useKlineExclusiveTxs = (options: UseKlineExclusiveTxsOptions) => {
  const { tokenAddress, chainId } = options
  const [exclusiveTransactions, setExclusiveTransactions] = useState<KlineExclusiveTx[]>([])
  const { message } = useSubscription(`public/kline/exclusive/${chainId}/${tokenAddress}`, {
    shouldSkip: !tokenAddress,
  })

  useEffect(() => {
    const msg = message?.message?.toString()
    if (!msg) return
    const payload = JSON.parse(msg) as KlineExclusiveTx | KlineExclusiveTx[]
    if (Array.isArray(payload)) {
      setExclusiveTransactions((prev) => payload.concat(prev))
    } else {
      setExclusiveTransactions((prev) => [payload, ...prev])
    }
  }, [message])

  useEffect(() => {
    return () => {
      setExclusiveTransactions([])
    }
  }, [tokenAddress])

  return exclusiveTransactions
}
