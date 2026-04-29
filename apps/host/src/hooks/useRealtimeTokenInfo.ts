import { useSubscription } from '@/lib/mqtt'
import { useEffect, useState } from 'react'
import { useActiveChainId } from '@hooks/useActiveChain.ts'

export type TokenInfoMqtt = {
  top10HolderPercentage?: string
  sniperPercentage?: string | undefined
  insiderTradingPercentage?: string | undefined
  sameSourceWallet?: string | undefined
  thb?: string // Top 10 Holder Balance
  dhp?: string // Dev Hold Percentage
  dhb?: string // Dev Hold Balance
  hc?: string // Holders Count
  dt?: string // Dev token launched
  dbp?: string // Same Source Wallet Percentage
  sniperHoldAmount?: string
  vl?: string // Volume
  mc?: string // Market Cap
  txb?: string // Buy Transactions
  txs?: string // Sell Transactions
  internalMarketProgress: string // Internal Market Progress
}

type TokenInfoMqttPayload = TokenInfoMqtt | TokenInfoMqtt[]

export const useRealtimeTokenInfo = (tokenAddress: string | null | undefined) => {
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(`public/meme/token_info/${activeChainId}/${tokenAddress}`, {
    shouldSkip: !tokenAddress,
  })
  const [tokenInfo, setTokenInfo] = useState<TokenInfoMqtt | null>(null)

  useEffect(() => {
    const msg = message?.message?.toString()
    if (!msg || !message?.topic) return
    const data: TokenInfoMqttPayload = JSON.parse(msg)
    let tokenInfo: TokenInfoMqtt
    const isArray = Array.isArray(data)
    if (isArray) {
      tokenInfo = data.reduce((acc, cur) => {
        return {
          ...acc,
          top10HolderPercentage: cur.top10HolderPercentage ?? acc.top10HolderPercentage,
          sniperPercentage: cur.sniperPercentage ?? acc.sniperPercentage,
          insiderTradingPercentage: cur.insiderTradingPercentage ?? acc.insiderTradingPercentage,
          sameSourceWallet: cur.sameSourceWallet ?? acc.sameSourceWallet,
          thb: cur.thb ?? acc.thb,
          dhp: cur.dhp ?? acc.dhp,
          dhb: cur.dhb ?? acc.dhb,
          hc: cur.hc ?? acc.hc,
          dt: cur.dt ?? acc.dt,
          dbp: cur.dbp ?? acc.dbp,
          sniperHoldAmount: cur.sniperHoldAmount ?? acc.sniperHoldAmount,
          txb: cur.txb ?? acc.txb,
          txs: cur.txs ?? acc.txs,
          mc: cur.mc ?? acc.mc,
          vl: cur.vl ?? acc.vl,
          internalMarketProgress: cur.internalMarketProgress ?? acc.internalMarketProgress,
        }
      }, {} as TokenInfoMqtt)
    } else {
      tokenInfo = data as TokenInfoMqtt
    }
    // Remove undefined values
    tokenInfo = Object.fromEntries(
      Object.entries(tokenInfo).filter(([_, value]) => value !== undefined),
    ) as TokenInfoMqtt

    setTokenInfo((prevState) => ({
      ...prevState,
      ...tokenInfo,
    }))
  }, [message])
  return tokenInfo
}
