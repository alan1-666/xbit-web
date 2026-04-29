import { MemeTokenInfo, MemeTokenInfoRaw } from '@/types/tokenInfo.ts'
import { MemeTokenWithFormatted } from '@/types/token.ts'
import { useAppSelector } from '@/redux/store'
import { memeTokenInfoSelectors } from '@/redux/modules/memeTokenInfo.slice.ts'
import { useMemo } from 'react'

const normalizeMemeTokenInfo = (data: MemeTokenInfoRaw): MemeTokenInfo => {
  return {
    marketCap: data.mc ? +data.mc : undefined,
    volume1m: data.vl1m ? +data.vl1m : undefined,
    volume5m: data.vl5m ? +data.vl5m : undefined,
    volume1h: data.vl1h ? +data.vl1h : undefined,
    volume6h: data.vl6h ? +data.vl6h : undefined,
    volume24h: data.vl24h ? +data.vl24h : undefined,
    txBuys1m: data.txb1m ? +data.txb1m : undefined,
    txBuys5m: data.txb5m ? +data.txb5m : undefined,
    txBuys1h: data.txb1h ? +data.txb1h : undefined,
    txBuys6h: data.txb6h ? +data.txb6h : undefined,
    txBuys24h: data.txb24h ? +data.txb24h : undefined,
    txSells1m: data.txs1m ? +data.txs1m : undefined,
    txSells5m: data.txs5m ? +data.txs5m : undefined,
    txSells1h: data.txs1h ? +data.txs1h : undefined,
    txSells6h: data.txs6h ? +data.txs6h : undefined,
    txSells24h: data.txs24h ? +data.txs24h : undefined,
    progress: data.impp ? +data.impp : undefined,
    devHold: data.dp ? +data.dp : undefined,
    top10: data.t10hp ? +data.t10hp : undefined,
    sniper: data.sp ? +data.sp : undefined,
    holderCount: data.hc ? +data.hc : undefined,
    totalMigrated: data.dt ? +data.dt : undefined,
    bundle: data.dbp ? +data.dbp : undefined,
    insider: data.itp ? +data.itp : undefined,
  }
}

export const useRealtimeMemeTokenInfo = (original: MemeTokenWithFormatted) => {
  const realtimeTokenInfo = useAppSelector(memeTokenInfoSelectors.selectMemeTokenInfo(original.chainId, original.token))
  const sniperHoldAmount = realtimeTokenInfo?.shb ? +realtimeTokenInfo.shb : undefined
  const sniperPercent = useMemo(() => {
    if (sniperHoldAmount === undefined || original.totalSupply === 0) return undefined
    return (sniperHoldAmount / original.totalSupply) * 100
  }, [sniperHoldAmount, original.totalSupply])
  return useMemo(() => {
    const normalizedInfo = realtimeTokenInfo ? normalizeMemeTokenInfo(realtimeTokenInfo) : ({} as MemeTokenInfo)
    const newToken: MemeTokenWithFormatted = {
      ...original,
      marketcap: normalizedInfo.marketCap ?? original.marketcap,
      volume1m: normalizedInfo.volume1m ?? original.volume1m,
      volume5m: normalizedInfo.volume5m ?? original.volume5m,
      volume1h: normalizedInfo.volume1h ?? original.volume1h,
      volume6h: normalizedInfo.volume6h ?? original.volume6h,
      volume24h: normalizedInfo.volume24h ?? original.volume24h,
      buyTxs1m: normalizedInfo.txBuys1m ?? original.buyTxs1m,
      buyTxs5m: normalizedInfo.txBuys5m ?? original.buyTxs5m,
      buyTxs1h: normalizedInfo.txBuys1h ?? original.buyTxs1h,
      buyTxs6h: normalizedInfo.txBuys6h ?? original.buyTxs6h,
      buyTxs24h: normalizedInfo.txBuys24h ?? original.buyTxs24h,
      sellTxs1m: normalizedInfo.txSells1m ?? original.sellTxs1m,
      sellTxs5m: normalizedInfo.txSells5m ?? original.sellTxs5m,
      sellTxs1h: normalizedInfo.txSells1h ?? original.sellTxs1h,
      sellTxs6h: normalizedInfo.txSells6h ?? original.sellTxs6h,
      sellTxs24h: normalizedInfo.txSells24h ?? original.sellTxs24h,
      internalMarketProgress: normalizedInfo.progress ?? original.internalMarketProgress,
      devHold: normalizedInfo.devHold ?? original.devHold,
      top10Holder: normalizedInfo.top10 ?? original.top10Holder,
      sniperHoldPct: sniperPercent ?? original.sniperHoldPct,
      numberOfHolder: normalizedInfo.holderCount ?? original.numberOfHolder,
      devMigrated: normalizedInfo.totalMigrated ?? original.devMigrated,
      bundlerHoldingPercent: normalizedInfo.bundle ?? original.bundlerHoldingPercent,
      insider: normalizedInfo.insider ?? original.insider,
    }
    return newToken
  }, [original, realtimeTokenInfo])
}
