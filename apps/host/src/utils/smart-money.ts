import type { TradingSessionRow } from '@/services/hypertrader.service'
import type { GetActiveSmartMoneyResp, SmartMoneyResponse, ApiSmartMoneyTrader } from '@/types/hypertrader.types'

export type UserPositionHoldingTime = {
  id: number
  userAddress: string
  coin: string
  timeSum: number // ms
  totalHoldingTime: number // ms
  status: 'open' | 'closed'
  updatedAt: string
  createdAt: string
}

export type HoldingTimeBucketKey = '<1h' | '1-4h' | '4-12h' | '12-24h' | '1-3d' | '3-7d' | '>7d'

export const HOLDING_TIME_BUCKETS: Array<{
  key: HoldingTimeBucketKey
  label: string
  minSec: number
  maxSec: number // exclusive, Infinity 表示无上限
  color?: string
}> = [
  { key: '<1h', label: '<1h', minSec: 0, maxSec: 60 * 60, color: '#667EEA' },
  { key: '1-4h', label: '1-4h', minSec: 60 * 60, maxSec: 4 * 60 * 60, color: '#667EEA' },
  { key: '4-12h', label: '4-12h', minSec: 4 * 60 * 60, maxSec: 12 * 60 * 60, color: '#667EEA' },
  { key: '12-24h', label: '12-24h', minSec: 12 * 60 * 60, maxSec: 24 * 60 * 60, color: '#667EEA' },

  { key: '1-3d', label: '1-3d', minSec: 1 * 24 * 60 * 60, maxSec: 3 * 24 * 60 * 60, color: '#764BA2' },
  { key: '3-7d', label: '3-7d', minSec: 3 * 24 * 60 * 60, maxSec: 7 * 24 * 60 * 60, color: '#F093FB' },

  { key: '>7d', label: '>7d', minSec: 7 * 24 * 60 * 60, maxSec: Number.POSITIVE_INFINITY, color: '#FF6B9D' },
]

export function pickHoldingTimeBucket(seconds: number): HoldingTimeBucketKey {
  const s = Number(seconds) || 0
  const found = HOLDING_TIME_BUCKETS.find((b) => s >= b.minSec && s < b.maxSec)
  return found?.key ?? '>7d'
}

export const buildHoldingTimeHistogram = (
  rows: UserPositionHoldingTime[],
): Array<{ key: HoldingTimeBucketKey; label: string; count: number; color?: string }> => {
  // 只统计已平仓
  const closed = (rows ?? []).filter((r) => r?.status === 'closed')

  const counter = new Map<HoldingTimeBucketKey, number>()
  for (const b of HOLDING_TIME_BUCKETS) counter.set(b.key, 0)

  for (const r of closed) {
    // 使用 timeSum（历史累计持仓时间，毫秒）
    const sec = Number(r?.timeSum ? r?.timeSum * 1000 : 0)
    const k = pickHoldingTimeBucket(sec)
    counter.set(k, (counter.get(k) ?? 0) + 1)
  }

  return HOLDING_TIME_BUCKETS.map((b) => ({
    key: b.key,
    label: b.label,
    count: counter.get(b.key) ?? 0,
    color: b.color,
  }))
}

export const buildTradingSessionRadarData = (row?: TradingSessionRow, t: (key: string) => string ) => {
  const r = row ?? {
    slot0004Count: 0,
    slot0408Count: 0,
    slot0812Count: 0,
    slot1216Count: 0,
    slot1620Count: 0,
    slot2024Count: 0,
  }

  return [
    { label: '00-04', value: r.slot0004Count, desc: t('smartMoney.charts.lateNight') },
    { label: '04-08', value: r.slot0408Count, desc: t('smartMoney.charts.earlyMorning') },
    { label: '08-12', value: r.slot0812Count, desc: t('smartMoney.charts.morning') },
    { label: '12-16', value: r.slot1216Count, desc: t('smartMoney.charts.afternoon') },
    { label: '16-20', value: r.slot1620Count, desc: t('smartMoney.charts.evening') },
    { label: '20-24', value: r.slot2024Count, desc: t('smartMoney.charts.night') },
  ]
}

type LastOperation = {
  time?: number | null
  coin?: string | null
  side?: string | null // "A" | "B"
  direction?: string | null // "Close Short" / "Spot Dust Conversion"
  size?: number | null
  price?: number | null
  pnl?: number | null
  fee?: number | null
  tradeType?: string | null // "perpetual" | "spot"
}

type ApiLastOperation = NonNullable<ApiSmartMoneyTrader['lastOperation']>

export const formatTimeAgo = (ms?: number | null) => {
  if (!ms) return { cn: '', en: '' }
  const now = Date.now()
  const diff = Math.max(0, now - ms)

  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)

  if (day > 0) return { cn: `${day}天前`, en: `${day}d ago`, hk: `${day}天前` }
  if (hour > 0) return { cn: `${hour}小时前`, en: `${hour}h ago`, hk: `${hour}小時前` }
  if (min > 0) return { cn: `${min}分钟前`, en: `${min}m ago`, hk: `${min}分鐘前` }
  return { cn: '刚刚', en: 'just now', hk: '剛剛' }
}

export const formatPnl = (pnl?: number | null) => {
  if (!pnl) return { cn: '', en: '', hk: '', sign: 0 }
  if (pnl > 0)
    return { cn: ` · 获利+$${Math.abs(pnl).toFixed(2)}`, en: ` · Profit +$${Math.abs(pnl).toFixed(2)}`, hk: ` · 獲利+$${Math.abs(pnl).toFixed(2)}`, sign: 1 }
  return { cn: ` · 亏损-$${Math.abs(pnl).toFixed(2)}`, en: ` · Loss -$${Math.abs(pnl).toFixed(2)}`, hk: ` · 虧損-$${Math.abs(pnl).toFixed(2)}`, sign: -1 }
}

export const formatLastOperation = (op?: ApiLastOperation | null) => {
  if (!op?.time) {
    return {
      latest_activity: { cn: '--', en: '--', hk: '--' },
      latest_activity_time: null as string | null,
    }
  }

  const { cn: agoCn, en: agoEn, hk: agoHK } = formatTimeAgo(op.time)

  const pnlText = formatPnl(op.pnl)

  const coin = op.coin ?? '-'
  const size = typeof op.size === 'number' ? op.size : null
  const dir = (op.direction ?? '').toLowerCase()
  const side = op.side ?? ''

  const isClose = dir.includes('close')
  const isShort = dir.includes('short')
  const isLong = dir.includes('long')

  // 方向兜底
  const inferredOpenShort = !isClose && (isShort || side === 'A' || dir.includes('sell'))
  const inferredOpenLong = !isClose && (isLong || side === 'B' || dir.includes('buy'))

  let actionCn = ''
  let actionEn = ''
  let actionHK = ''

  // 特殊方向：Spot Dust Conversion 这种直接展示
  if (op.direction && !dir.includes('open') && !dir.includes('close') && !isShort && !isLong) {
    actionCn = `交易 ${coin}`
    actionEn = `${op.direction} ${coin}`
    actionHK = `交易 ${coin}`
  } else if (isClose) {
    if (isShort) {
      actionCn = `平仓 空单 ${coin}`
      actionEn = `Close Short on ${coin}`
      actionHK = `平倉 空單 ${coin}`
    } else if (isLong) {
      actionCn = `平仓 多单 ${coin}`
      actionEn = `Close Long on ${coin}`
      actionHK = `平倉 多單 ${coin}`
    } else {
      actionCn = `平仓 ${coin}`
      actionEn = `Close ${coin}`
      actionHK = `平倉 ${coin}`
    }
  } else {
    const qtyCn = size != null ? `${size.toFixed(2)}枚` : ''
    const qtyEn = size != null ? ` ${size.toFixed(2)}` : ''
    const qtyHK = size != null ? `${size.toFixed(2)}枚` : ''
    if (inferredOpenShort) {
      actionCn = `开仓 空单 ${coin} ${qtyCn}`
      actionEn = `Open Short on ${coin} ${qtyEn}`
      actionHK = `开倉 空單 ${coin} ${qtyHK}`
    } else if (inferredOpenLong) {
      actionCn = `开仓 多单 ${coin} ${qtyCn} `
      actionEn = `Open Long on ${coin} ${qtyEn}`
      actionHK = `开倉 多單 ${coin} ${qtyHK}`
    } else {
      actionCn = `交易${qtyCn}${coin}`
      actionEn = `Trade${qtyEn} ${coin}`
      actionHK = `交易${qtyHK}${coin}`
    }
  }

  return {
    latest_activity: {
      cn: `${agoCn} · ${actionCn}  ${pnlText.cn}`,
      en: `${agoEn} · ${actionEn} ${pnlText.en}`.trim(),
      hk: `${agoHK} · ${actionHK} ${pnlText.hk}`
    },
    latest_activity_time: new Date(op.time).toISOString(),
  }
}

export const adaptActiveSmartMoneyToLegacy = (resp: GetActiveSmartMoneyResp): SmartMoneyResponse => {
  const r = 'getActiveSmartMoney' in resp ? resp.getActiveSmartMoney : resp.getMyFollowedSmartMoney

  return {
    success: r.success,
    message: r.message,
    data: (r.data ?? []).map((it) => {
      const fallback = formatLastOperation(it.lastOperation ?? null)

      return {
        user_address: it.userAddress,
        roi: it.roi,
        net_pnl: it.netPnl,
        avg_win_rate: it.avgWinRate,
        max_drawdown: it.maxDrawdown,
        period_days: it.periodDays,
        profit_factor: it.profitFactor ?? null, 
        sharpe_ratio: it.sharpeRatio ?? null,
        profit_loss_ratio: it.profitLossRatio ?? null,
        total_volume: it.totalVolume ?? null,
        avg_daily_volume: it.avgDailyVolume ?? null,
        trading_days: it.tradingDays ?? null,
        total_trades: it.totalTrades ?? null,
        unique_coins_count: it.uniqueCoinsCount ?? null,
        avg_trades_per_day: it.avgTradesPerDay ?? null,

        // 优先用服务端字段，否则用 lastOperation 生成
        latest_activity: it.latestActivity ?? fallback.latest_activity,
        latest_activity_time: it.latestActivityTime ?? fallback.latest_activity_time,

        kol_labels: it.kolLabels ?? null,
        kol_labels_description: it.kolLabelsDescription ?? null,

        tags: it.tags ?? null,
        // 把 lastOperation 透传给页面使用
        last_operation: it.lastOperation ?? null,
        follower_count: it.followerCount ?? null,
        
        totalLongPnl: it.totalLongPnl,
        totalShortPnl: it.totalShortPnl,
        winningPnlTotal: it.winningPnlTotal,
        losingPnlTotal: it.losingPnlTotal,
        
        groupIds: it.groupIds,
        remarkName: it.remarkName,
        portfolioData: it.portfolioData
      }
    }),
    pagination: {
      page: r.pagination?.page ?? 1,
      page_size: r.pagination?.pageSize ?? 100,
      total: r.pagination?.total ?? 0,
      total_pages: r.pagination?.totalPages ?? 1,
    },
  }
}

export function throttle<T extends (...args: any[]) => void>(fn: T, wait = 800) {
  let last = 0
  let timer: number | null = null

  return (...args: Parameters<T>) => {
    const now = Date.now()
    const remaining = wait - (now - last)
    if (remaining <= 0) {
      if (timer) window.clearTimeout(timer)
      timer = null
      last = now
      fn(...args)
      return
    }
    if (!timer) {
      timer = window.setTimeout(() => {
        last = Date.now()
        timer = null
        fn(...args)
      }, remaining)
    }
  }
}

export type ExportJsonItem = {
  address: string
  name: string
}

// 仅做 EVM 地址校验
// 如果后面还会支持 Solana 等，把这个校验改成可选或多链
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

/**
 *  - 支持 \n 分行
 *  - 支持 : 或 ： 作为 address 与 name 的分隔符
 *  - 支持 “addr： 备注” / “addr:备注” / “addr: 备注”
 */

export function exportContentToJson(content?: string | null): ExportJsonItem[] {
  if (!content) return []

  // 1) 先把“中文逗号”也当成分隔（防御性）
  // 2) 再用 英文逗号 或 换行 分段（混用也OK）
  const chunks = content
    .replace(/，/g, ',')
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean)

  const items: ExportJsonItem[] = []

  for (const raw of chunks) {
    // 支持 ":" / "：" / " : " / " ： "
    const idx = raw.search(/[:：]/)
    let address = raw
    let name = ''

    if (idx >= 0) {
      address = raw.slice(0, idx).trim()
      name = raw.slice(idx + 1).trim()
    } else {
      address = raw.trim()
      name = ''
    }

    // 防御：有些服务端可能把全角空格/不可见字符带进来
    address = address.replace(/\s+/g, '').trim()
    name = name.trim()

    items.push({ address, name })
  }

  return items
}

export const toNum = (v: any) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const formatUsd = (v: any, digits = 2) => {
  const n = toNum(v)
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  return `${sign}$${abs.toFixed(digits)}`
}

export const formatCompactUsd = (v: any) => {
  const n = toNum(v)
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}K`
  return `${sign}$${abs.toFixed(2)}`
}

export const clampPct = (v: number) => Math.max(0, Math.min(100, v))

export const formatFinishTime = (ts: number) => {
  if (!ts) return { cn: '', en: '' }

  // 兼容秒 / 毫秒
  const timeMs = ts < 1e12 ? ts * 1000 : ts
  let diff = Math.max(0, Date.now() - timeMs)

  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)

  if (day > 0) return { cn: `${day}天前`, en: `${day}d ago` }
  if (hour > 0) return { cn: `${hour}小时${min % 60}分前`, en: `${hour}h${min % 60}m ago` }
  if (min > 0) return { cn: `${min}分${sec % 60}秒前`, en: `${min}m${sec % 60}s ago` }
  return { cn: `${sec}秒前`, en: `${sec}s ago` }
}

export const getTradeTag = (startPosition: any, szi: any) => {
  const sp = Number(startPosition)
  const sz = Number(szi)

  // 多头逻辑
  if (sp === 0 && sz > 0) return '开多-建仓'
  if (sp > 0 && sz > 0) return '开多-加仓'
  if (sp > 0 && sz < 0 && sp !== -sz) return '平多-减仓'
  if (sp > 0 && sz < 0 && sp === -sz) return '平多-平仓'

  // 空头逻辑
  if (sp === 0 && sz < 0) return '开空-建仓'
  if (sp < 0 && sz < 0) return '开空-加仓'
  if (sp < 0 && sz > 0 && sp !== -sz) return '平空-减仓'
  if (sp < 0 && sz > 0 && sp === -sz) return '平空-平仓'

  return '--'
}

export function getApolloErrorMessage(err: any, fallback = '操作失败') {
  // ApolloError: err.graphQLErrors / err.networkError
  const gqlMsg = err?.graphQLErrors?.[0]?.message
  if (gqlMsg) return String(gqlMsg)

  const gqlReason = err?.graphQLErrors?.[0]?.extensions?.details?.reason
  if (gqlReason) return String(gqlReason)

  const netMsg = err?.networkError?.result?.errors?.[0]?.message
  if (netMsg) return String(netMsg)

  const msg = err?.message
  if (msg) return String(msg)

  return fallback
}

export function getErrorMessage(err: any, fallback = '操作失败!') {
  if (!err) return fallback

  // 情况 1：接口直接返回错误数组（你截图里的情况）
  if (Array.isArray(err) && err[0]?.message) {
    return err[0].message
  }

  // 情况 2：Apollo GraphQL error
  if (err.graphQLErrors?.length) {
    return err.graphQLErrors[0]?.message ?? fallback
  }

  // 情况 3：普通 Error
  if (typeof err.message === 'string') {
    return err.message
  }

  // 情况 4：兜底
  return fallback
}


export function isCloseAction(dir?: string) {
  return !!dir && dir.toLowerCase().includes('close')
}

export function getDisplayPnl({
  dir,
  closedPnl,
  unrealizedPnl,
}: {
  dir?: string
  closedPnl?: string | number
  unrealizedPnl?: string | number
}) {
  if (isCloseAction(dir)) {
    return {
      type: 'closed',
      value: Number(closedPnl ?? 0),
    }
  }

  return {
    type: 'unrealized',
    value: Number(unrealizedPnl ?? 0),
  }
}
