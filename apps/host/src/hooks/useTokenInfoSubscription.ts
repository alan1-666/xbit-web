import { useEffect, useMemo, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { useActiveChainId } from '@hooks/useActiveChain.ts'

export interface UseTokenInfoSubscriptionOptions {
  token?: string
  useTopic: 'token_info' | 'token_statistic'
  totalSupply: number
}

type TokenStatisticMqttPayload = {
  chainId: number
  createdTime: string
  marketcap: string
  volume1h: string
  volume1m: string
  volume24h: string
  volume5m: string
  volume6h: string
  totalTransactions: {
    numberOfPurchases1h: number
    numberOfPurchases5m: number
    numberOfPurchases6h: number
    numberOfPurchases24h: number
    numberOfSales1h: number
    numberOfSales5m: number
    numberOfSales6h: number
    numberOfSales24h: number
  }
  numberOfHolder: number
}

type TokenInfoMqtt = {
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

export interface NormalizedTokenInfo {
  top10HolderPercentage?: number
  devHoldingPercentage?: number
  numberOfHolders?: number
  sniperHoldingPercentage?: number
  insiderTradingPercentage?: number
  bundlerHoldingPercentage?: number
}

const calculateTop10HolderPercentage = (data: TokenInfoMqtt, totalSupply?: number): number | undefined => {
  if (data.top10HolderPercentage !== undefined) {
    return parseFloat(data.top10HolderPercentage) * 100
  }
  if (data.thb && totalSupply) {
    return (+data.thb / totalSupply) * 100
  }
  return undefined
}

const calculateDevHoldPercentage = (data: TokenInfoMqtt, totalSupply?: number): number | undefined => {
  if (data.dhp !== undefined) {
    return parseFloat(data.dhp) * 100
  }
  if (data.dhb && totalSupply) {
    return (+data.dhb / totalSupply) * 100
  }
  return undefined
}

const calculateSniperPercentage = (data: TokenInfoMqtt, totalSupply?: number, decimals?: number) => {
  if (data.sniperHoldAmount === undefined || data.sniperHoldAmount === null) return undefined
  if (!totalSupply || !decimals) return undefined
  return (+data.sniperHoldAmount * 100) / totalSupply
}

const normalizeTokenStatistic = (data: TokenStatisticMqttPayload): NormalizedTokenInfo => {
  return {
    numberOfHolders: data.numberOfHolder,
  }
}

const normalizeTokenInfo = (data: TokenInfoMqtt, totalSupply: number): NormalizedTokenInfo => {
  return {
    top10HolderPercentage: calculateTop10HolderPercentage(data, totalSupply),
    devHoldingPercentage: calculateDevHoldPercentage(data, totalSupply),
    numberOfHolders: data.hc ? parseInt(data.hc) : undefined,
    sniperHoldingPercentage: calculateSniperPercentage(data, totalSupply, 18),
    insiderTradingPercentage: data.insiderTradingPercentage
      ? parseFloat(data.insiderTradingPercentage) * 100
      : undefined,
    bundlerHoldingPercentage: data.dbp ? parseFloat(data.dbp) * 100 : undefined,
  }
}

export const useTokenInfoSubscription = (options: UseTokenInfoSubscriptionOptions) => {
  const { token, useTopic = 'token_info', totalSupply } = options
  const [tokenInfo, setTokenInfo] = useState<NormalizedTokenInfo | null>(null)
  const activeChainId = useActiveChainId()
  const topic = useMemo(() => {
    if (useTopic === 'token_statistic') return `public/token_statistic/${activeChainId}/${token}`
    return `public/meme/token_info/${activeChainId}/${token}`
  }, [useTopic, token])

  const { message } = useSubscription(topic, { shouldSkip: !token })

  useEffect(() => {
    const msg = message?.message?.toString()
    if (!msg || !message?.topic) return
    const topic = message.topic
    if (topic === `public/token_statistic/${activeChainId}/${token}`) {
      const data: TokenStatisticMqttPayload = JSON.parse(msg)
      const normalized = normalizeTokenStatistic(data)
      setTokenInfo((prevState) => ({
        ...prevState,
        ...normalized,
      }))
    } else if (topic === `public/meme/token_info/${activeChainId}/${token}`) {
      const data: TokenInfoMqtt[] = JSON.parse(msg)
      const mergedData: TokenInfoMqtt = data.reduce((acc, curr) => ({ ...acc, ...curr }), {} as TokenInfoMqtt)
      const normalized = normalizeTokenInfo(mergedData, totalSupply)
      // Remove all undefined fields
      const cleanedNormalized: NormalizedTokenInfo = {}
      Object.keys(normalized).forEach((key) => {
        const k = key as keyof NormalizedTokenInfo
        if (normalized[k] !== undefined) {
          cleanedNormalized[k] = normalized[k]
        }
      })
      setTokenInfo((prevState) => ({
        ...prevState,
        ...cleanedNormalized,
      }))
    }
  }, [message, token, activeChainId, totalSupply])
  return tokenInfo
}
