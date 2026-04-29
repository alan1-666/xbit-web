import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { shortHash } from '@/utils/address'
import { invertNumber } from '@/utils/numbers'

export type TabKey =
  | 'positions'
  | 'openOrders'
  | 'twap'
  | 'trades'
  | 'completedTrades'
  | 'funding'
  | 'orderHistory'
  | 'account'

export type TablesPayload = Record<TabKey, any[]>

const emptyTables = (): TablesPayload => ({
  positions: [],
  openOrders: [],
  twap: [],
  trades: [],
  completedTrades: [],
  funding: [],
  orderHistory: [],
  account: [],
})

const toNum = (v: any) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * TP/SL 提取规则：
 * - TP: type/orderType 包含 "Take Profit" => triggerPx
 * - SL: type/orderType 包含 "Stop" => triggerPx（Stop Market / Stop Limit）
 * - 同一个币只会有一个仓位，所以通常也只会出现一个 TP / SL（若出现多个，取“最近更新时间/时间戳最大”的那条）
 */
const buildTpSlByCoin = (openOrders: any[] = []) => {
  type Val = { tp?: number; sl?: number }
  const map = new Map<string, Val>()

  const sorted = [...openOrders].sort((a, b) => toNum(b.ts ?? b.timestamp) - toNum(a.ts ?? a.timestamp))

  for (const o of sorted) {
    const coin = String(o.symbol ?? o.coin ?? '').trim()
    if (!coin) continue

    const typeStr = String(o.type ?? o.orderType ?? '').toLowerCase()
    const triggerPx = toNum(o.triggerPx)

    if (triggerPx <= 0) continue

    const cur = map.get(coin) ?? {}

    // Take Profit
    if (!cur.tp && typeStr.includes('take profit')) {
      cur.tp = triggerPx
      map.set(coin, cur)
      continue
    }

    // Stop
    if (!cur.sl && typeStr.includes('stop')) {
      cur.sl = triggerPx
      map.set(coin, cur)
      continue
    }
  }

  return map
}

const applyTpSlToPositions = (positions: any[] = [], tpSlMap?: Map<string, { tp?: number; sl?: number }>) => {
  if (!tpSlMap || tpSlMap.size === 0) {
    return positions.map((p) => ({ ...p, tp: p.tp ?? '-', sl: p.sl ?? '-' }))
  }

  return positions.map((p) => {
    const coin = String(p.symbol ?? p.coin ?? '').trim()
    const v = coin ? tpSlMap.get(coin) : undefined
    return {
      ...p,
      tp: v?.tp != null ? String(v.tp) : '-',
      sl: v?.sl != null ? String(v.sl) : '-',
    }
  })
}

/** ---------- mappers ---------- */
export const mapPositionsFromClearinghouse = (raw: any) => {
  const rows = (raw?.assetPositions ?? [])
    .map((x: any) => x?.position)
    .filter(Boolean)
    .map((p: any) => {
      const lev = p?.leverage
      return {
        symbol: p?.coin ?? '-',
        size: +p?.szi || 0,
        valueUsd: +p?.positionValue || 0,
        avgPrice: +p?.entryPx || 0,
        markPrice: p?.markPx ? +p.markPx : undefined,
        pnl: +p?.unrealizedPnl || 0,
        pnlPct: +p?.returnOnEquity || 0,
        liqPrice: p?.liquidationPx ?? '-',
        marginUsd: +p?.marginUsed || 0,
        marginMode: lev?.type === 'cross' ? 'cross' : 'isolated',
        fundingUsd: invertNumber(p?.cumFunding?.sinceOpen),
        tp: '-',
        sl: '-',

        leverage: lev?.value ?? undefined,
      }
    })
  return rows
}

export const mapAccountSnapshotFromClearinghouse = (raw: any) => [
  {
    ts: raw?.time ?? Date.now(),
    accountValue: +(raw?.marginSummary?.accountValue ?? 0),
    withdrawable: +(raw?.withdrawable ?? 0),
  },
]

export const mapOpenOrders = (rows: any[] = []) => {
  const sideMap: Record<string, 'Buy' | 'Sell'> = { B: 'Buy', S: 'Sell', A: 'Sell' }
  return rows.map((o: any) => ({
    ts: o?.timestamp ?? Date.now(),
    symbol: o?.coin ?? '-',
    side: sideMap[o?.side] ?? o?.side ?? '-',
    type: o?.orderType ?? o?.type ?? '-',
    price: +o?.limitPx || +o?.px || 0,
    size: +o?.sz || +o?.origSz || 0,
    filled: +o?.filled || 0,
    status: 'Open',
    oid: o?.oid || '-',
    triggerPx: +o?.triggerPx || 0,
    triggerCondition: o?.triggerCondition ?? '',
    reduceOnly: !!o?.reduceOnly,
    isTrigger: !!o?.isTrigger,
  }))
}

const formatBuilderFee = (fee: number | string) => {
  if (!fee) return ''
  const prefix = Number(fee) < 0 ? '-' : '+'
  return `${prefix}${Math.abs(Number(fee))} builder`
}

export const mapTrades = (rows: any[] = []) => {
  const sideMap: Record<string, 'Buy' | 'Sell'> = { B: 'Buy', S: 'Sell', A: 'Sell' }
  return rows.map((f: any) => ({
    time: f?.time ?? '-',
    coin: f?.coin ?? '-',
    dir: f?.dir ?? '-',
    sz: +f?.sz || 0,
    px: '$' + f?.px || 0,
    side: sideMap[f?.side] ?? f?.side ?? '-',
    startPosition: +f?.startPosition || 0,
    closedPnl: '$' + f?.closedPnl || 0,
    fee: +f?.fee + ' ' + f?.feeToken + formatBuilderFee(f?.builderFee),
    hash: shortHash(f?.hash),
  }))
}

export const mapCompletedTrades = (rows: any[] = []) => {
  const sideMap: Record<string, 'Buy' | 'Sell'> = { B: 'Buy', S: 'Sell', A: 'Sell' }
  return rows.map((f: any) => ({
    time: f?.time ?? '-',
    coin: f?.coin ?? '-',
    dir: f?.dir ?? '-',
    sz: +f?.sz || 0,
    px: '$' + f?.px || 0,
    side: sideMap[f?.side] ?? f?.side ?? '-',
    startPosition: +f?.startPosition || 0,
    closedPnl: '$' + f?.closedPnl || 0,
    fee:
      +f?.fee + ' ' + f?.feeToken + `(${f?.builderFee < 0 ? '-' + f?.builderFee : '+' + f?.builderFee} builder)` || 0,
    hash: shortHash(f?.hash),
  }))
}

export const mapFunding = (rows: any[] = []) =>
  rows.map((x: any) => ({
    time: x?.time ?? x?.ts ?? '-',
    coin: x?.delta?.coin ?? '-',
    fundingRate: +(x?.delta?.fundingRate ?? 0),
    fundingUSDC: +(x?.delta?.usdc ?? 0),
    size: +(x?.delta?.szi ?? x?.delta?.size ?? 0),
    type: x?.delta?.type ?? '-',
    hash: shortHash(x?.hash),
  }))

export const mapOrderHistory = (rows: any[] = []) => {
  const sideMap: Record<string, 'Buy' | 'Sell'> = { B: 'Buy', S: 'Sell', A: 'Sell' }
  return rows.map((o: any) => ({
    timestamp: o?.order?.timestamp ?? o?.ts ?? '-',
    coin: o?.order?.coin ?? '-',
    side: sideMap[o?.order?.side] ?? o?.order?.side ?? '-',
    orderType: o?.order?.orderType ?? o?.order?.type ?? '-',
    limitPx: +o?.order?.limitPx || 0,
    sz: +o?.order?.sz || +o?.order?.size || 0,
    triggerCondition: o?.order?.triggerCondition ?? '-',
    status: o?.status ?? '-',
    isPositionTpsl: o?.order?.isPositionTpsl ?? '-',
    tif: o?.order?.tif ?? '-',
    oid: o?.order?.oid ?? '-',
  }))
}

export const mapTwap = (rows: any[] = []) =>
  rows.map((t: any) => ({
    time: t?.fill?.time ?? '-',
    coin: t?.fill?.coin ?? '-',
    dir: t?.fill?.dir ?? '-',
    sz: +t?.fill?.sz || 0,
    px: '$' + t?.fill?.px || 0,
    startPosition: +t?.fill?.startPosition || 0,
    fee: +t?.fill?.fee + ' (USDC)' || 0,
    twapId: +t?.twapId || '-',
  }))

export const mapAccountHistory = (rows: any[] = []) =>
  rows.map((t: any) => ({
    time: t?.time ?? '-',
    hash: shortHash(t?.hash),
    token: t?.delta?.token ?? '-',
    fee: t?.delta?.fee || '-',
    type: t?.delta?.type || '-',
    usdc: t?.delta?.usdc ?? '-',
  }))

/** ---------- store ---------- */
type Actions = {
  setPositionsFromClearinghouse: (raw: any) => void
  setOpenOrders: (rows: any[]) => void
  setTwap: (rows: any[]) => void
  setTrades: (rows: any[]) => void
  setCompletedTrades: (rows: any[]) => void
  setFunding: (rows: any[]) => void
  setOrderHistory: (rows: any[]) => void
  setAccountHistory: (rows: any[]) => void
  setAccountFromClearinghouse: (raw: any) => void
  setMany: (payload: Partial<TablesPayload>) => void
  reset: () => void
}

type StoreState = { data: TablesPayload } & Actions

export const usePositionsStore = create<StoreState>((set) => ({
  data: emptyTables(),

  setPositionsFromClearinghouse(raw) {
    const rows = mapPositionsFromClearinghouse(raw)
    set((s) => {
      const tpSlMap = buildTpSlByCoin(s.data.openOrders ?? [])
      const positions = applyTpSlToPositions(rows, tpSlMap)
      return { data: { ...s.data, positions } }
    })
  },

  setOpenOrders(rows) {
    set((s) => {
      const openOrders = rows ?? []
      const tpSlMap = buildTpSlByCoin(openOrders)
      const positions = applyTpSlToPositions(s.data.positions ?? [], tpSlMap)
      return { data: { ...s.data, openOrders, positions } }
    })
  },

  setTwap(rows) {
    set((s) => ({ data: { ...s.data, twap: rows ?? [] } }))
  },

  setTrades(rows) {
    set((s) => ({ data: { ...s.data, trades: rows ?? [] } }))
  },

  setCompletedTrades(rows) {
    set((s) => ({ data: { ...s.data, completedTrades: rows ?? [] } }))
  },

  setFunding(rows) {
    set((s) => ({ data: { ...s.data, funding: rows ?? [] } }))
  },

  setOrderHistory(rows) {
    set((s) => ({ data: { ...s.data, orderHistory: rows ?? [] } }))
  },

  setAccountHistory(rows) {
    set((s) => ({ data: { ...s.data, account: rows ?? [] } }))
  },

  setAccountFromClearinghouse(raw) {
    const rows = mapAccountSnapshotFromClearinghouse(raw)
    set((s) => ({ data: { ...s.data, account: rows } }))
  },

  setMany(payload) {
    set((s) => ({ data: { ...s.data, ...(payload as any) } }))
  },

  reset() {
    set({ data: emptyTables() })
  },
}))

export const usePositionsData = () => usePositionsStore((s) => s.data)

export const usePositionsActions = () =>
  usePositionsStore(
    useShallow((s) => ({
      setPositionsFromClearinghouse: s.setPositionsFromClearinghouse,
      setAccountFromClearinghouse: s.setAccountFromClearinghouse,
      setOpenOrders: s.setOpenOrders,
      setTwap: s.setTwap,
      setTrades: s.setTrades,
      setCompletedTrades: s.setCompletedTrades,
      setFunding: s.setFunding,
      setOrderHistory: s.setOrderHistory,
      setAccountHistory: s.setAccountHistory,
      reset: s.reset,
    })),
  )
