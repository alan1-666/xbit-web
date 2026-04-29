import { MemeTokenWithFormatted } from '@/types/token.ts'
import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useSubscription } from '@/lib/mqtt'
import { memeTokenCache } from '@/utils/memeTokenCache.ts'
import { parseNumber } from '@/lib/number.ts'

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

type SmartMoneyMqttPayload = {
  tb: string
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

type NormalizedTokenInfo = {
  top10HolderPercentage?: number
  sniperPercentage?: number
  insiderTradingPercentage?: number
  sameSourceWallet?: number
  devHold?: number
  holders?: number
  devProjects?: number
}

type TokenInfoMqttPayload = TokenInfoMqtt | TokenInfoMqtt[]

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
  return ((+data.sniperHoldAmount * 100) / totalSupply) * Math.pow(10, decimals)
}

const normalizeTokenInfo = (data: TokenInfoMqtt, token: MemeTokenWithFormatted): NormalizedTokenInfo => {
  const totalSupply = token.totalSupply ? +token.totalSupply : undefined
  return {
    top10HolderPercentage: calculateTop10HolderPercentage(data, totalSupply),
    sniperPercentage: data.sniperHoldAmount
      ? calculateSniperPercentage(data, totalSupply, token.decimals ? +token.decimals : undefined)
      : undefined,
    insiderTradingPercentage: data.insiderTradingPercentage
      ? parseFloat(data.insiderTradingPercentage) * 100
      : undefined,
    sameSourceWallet: data.dbp ? parseFloat(data.dbp) : undefined,
    devHold: calculateDevHoldPercentage(data, totalSupply),
    holders: data.hc ? parseFloat(data.hc) : undefined,
    devProjects: data.dt ? +data.dt : undefined,
  }
}

export const useMemeTokenStatistics = (original: MemeTokenWithFormatted) => {
  const [token, setToken] = useState(original)
  const env = import.meta.env.VITE_STAGE

  const topics = useMemo(() => {
    const now = dayjs()
    const createdAt = dayjs(token.createdTime)
    const duration = now.diff(createdAt, 'seconds')
    // If the token is created less than 1 hour ago, use the original token topic
    if (duration < 3600) {
      return [
        `public/meme/token_info/${original.chainId}/${original?.token}`,
        `public/meme/token_sm_holding/${original.chainId}/${original.token}`,
      ]
    } else {
      return [
        `public/token_statistic/${original.chainId}/${original?.token}`,
        `public/meme/token_sm_holding/${original.chainId}/${original.token}`,
      ]
    }
  }, [token.createdTime])

  const { message } = useSubscription(topics)

  // Get cache when mount
  // useEffect(() => {
  //   if (env !== 'prod' && !window.location.search.includes('cache=1')) return // Skip cache in non-production environments
  //
  //   let isMounted = true
  //   memeTokenCache.get(original.token, 10000).then((cached) => {
  //     if (cached && isMounted) {
  //       setToken(cached)
  //     }
  //   })
  //   return () => {
  //     isMounted = false
  //   }
  // }, [original.token])

  useEffect(() => {
    const msg = message?.message?.toString()
    if (!msg || !message?.topic) return
    const topic = message.topic

    if (topic === `public/token_statistic/${original.chainId}/${original?.token}`) {
      const data: TokenStatisticMqttPayload = JSON.parse(msg)
      setToken((prevState) => ({
        ...prevState,
        ...data,
        buyTxs1h: data.totalTransactions?.numberOfPurchases1h
          ? Math.max(data.totalTransactions?.numberOfPurchases1h, prevState.buyTxs1h)
          : prevState.buyTxs1h,
        buyTxs5m: data.totalTransactions?.numberOfPurchases5m
          ? Math.max(data.totalTransactions?.numberOfPurchases5m)
          : prevState.buyTxs5m,
        buyTxs6h: data.totalTransactions?.numberOfPurchases6h
          ? Math.max(data.totalTransactions?.numberOfPurchases6h, prevState.buyTxs6h)
          : prevState.buyTxs6h,
        buyTxs24h: data.totalTransactions?.numberOfPurchases24h
          ? Math.max(data.totalTransactions?.numberOfPurchases24h, prevState.buyTxs24h)
          : prevState.buyTxs24h,
        sellTxs1h: data.totalTransactions?.numberOfSales1h
          ? Math.max(data.totalTransactions?.numberOfSales1h, prevState.sellTxs1h)
          : prevState.sellTxs1h,
        sellTxs5m: data.totalTransactions?.numberOfSales5m
          ? Math.max(data.totalTransactions?.numberOfSales5m)
          : prevState.sellTxs5m,
        sellTxs6h: data.totalTransactions?.numberOfSales6h
          ? Math.max(data.totalTransactions?.numberOfSales6h, prevState.sellTxs6h)
          : prevState.sellTxs6h,
        sellTxs24h: data.totalTransactions?.numberOfSales24h
          ? Math.max(data.totalTransactions?.numberOfSales24h, prevState.sellTxs24h)
          : prevState.sellTxs24h,
      }))
    } else if (topic === `public/meme/token_info/${original.chainId}/${original?.token}`) {
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

      const normalizedTokenInfo = normalizeTokenInfo(tokenInfo, token)

      setToken((prevState) => ({
        ...prevState,
        top10Holder: normalizedTokenInfo.top10HolderPercentage ?? prevState.top10Holder,
        sniperHoldPct: normalizedTokenInfo.sniperPercentage ?? prevState.sniperHoldPct,
        insider: normalizedTokenInfo.insiderTradingPercentage ?? prevState.insider,
        sameSourceWallet: normalizedTokenInfo.sameSourceWallet
          ? normalizedTokenInfo.sameSourceWallet.toString()
          : prevState.sameSourceWallet,
        numberOfHolder: normalizedTokenInfo.holders ?? prevState.numberOfHolder,
        devHold: normalizedTokenInfo.devHold ?? prevState.devHold,
        devLaunched: normalizedTokenInfo.devProjects ?? prevState.devLaunched,
        buyTxs1m: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs1m) : prevState.buyTxs1m,
        buyTxs1h: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs1h) : prevState.buyTxs1h,
        buyTxs5m: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs5m) : prevState.buyTxs5m,
        buyTxs6h: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs6h) : prevState.buyTxs6h,
        buyTxs24h: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs24h) : prevState.buyTxs24h,
        sellTxs1m: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs1m) : prevState.sellTxs1m,
        sellTxs1h: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs1h) : prevState.sellTxs1h,
        sellTxs5m: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs5m) : prevState.sellTxs5m,
        sellTxs6h: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs6h) : prevState.sellTxs6h,
        sellTxs24h: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs24h) : prevState.sellTxs24h,
        marketcap: tokenInfo.mc ? parseNumber(tokenInfo.mc) : prevState.marketcap,
        volume5m: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume5m,
        volume1h: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume1h,
        volume1m: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume1m,
        volume6h: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume6h,
        volume24h: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume24h,
        internalMarketProgress: tokenInfo.internalMarketProgress ?? prevState.internalMarketProgress,
        sniperHoldAmount: tokenInfo.sniperHoldAmount ?? prevState.sniperHoldAmount,
        top10Balance: tokenInfo.thb ?? prevState.top10Balance,
        devHoldBalance: tokenInfo.dhb ?? prevState.devHoldBalance,
      }))
    } else if (topic === `public/meme/token_sm_holding/${original.chainId}/${original.token}`) {
      const data: SmartMoneyMqttPayload = JSON.parse(msg)
      setToken((prevState) => ({
        ...prevState,
        smartMoneyHolder: data.tb ? parseFloat(data.tb) : prevState.smartMoneyHolder,
      }))
    }
  }, [message])

  // Cache token when token is changed and not equal to original
  useEffect(() => {
    if (env !== 'prod' && !window.location.search.includes('cache=1')) return // Skip cache in non-production environments
    if (token && token !== original) {
      const shouldSkipCache =
        token.devHold === original.devHold &&
        token.top10Holder === original.top10Holder &&
        token.sniperHoldPct === original.sniperHoldPct &&
        token.insider === original.insider &&
        token.sameSourceWallet === original.sameSourceWallet &&
        token.numberOfHolder === original.numberOfHolder &&
        token.smartMoneyHolder === original.smartMoneyHolder &&
        token.devLaunched === original.devLaunched &&
        token.volume1h === original.volume1h &&
        token.volume1m === original.volume1m &&
        token.volume5m === original.volume5m &&
        token.volume6h === original.volume6h &&
        token.volume24h === original.volume24h
      if (!shouldSkipCache) {
        memeTokenCache.set(original.token, token, 10000) // Cache for 10 seconds
      }
    }
  }, [token, original])

  return token
}
