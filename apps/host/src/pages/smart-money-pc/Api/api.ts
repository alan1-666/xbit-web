import useSWR from 'swr'
import axios from 'axios'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import type { GetActiveSmartMoneyResp, SmartMoneyResponse, SmartMoneySortField } from '@/types/hypertrader.types'
import { adaptActiveSmartMoneyToLegacy } from '@/utils/smart-money'
import {
  getActiveSmartMoneyGql,
  getTraderTagsByAddressGql,
  analyzeSmartMoneyStrategyGql,
  getSmartMoneyRoiGql,
  type GetTraderTagsByAddressResp,
  type AnalyzeSmartMoneyStrategyResp,
  type TraderTag,
  type SmartMoneyStrategy,
  getRecentActiveSmartMoneyGql,
  getSmartMoneyMetrics30dGql,
  getMyFollowedSmartMoneyGql,
} from '@/services/hypertrader.service'

const API_BASE =
  import.meta.env.VITE_SMART_MONEY_API_BASE_URL?.replace(/\/+$/, '') || 'https://unstable-smart-money.the-x.link'
// const API_BASE = import.meta.env.VITE_SMART_MONEY_API_BASE_URL?.replace(/\/+$/, '') || 'http://54.168.206.59:3000';

/**
 * GET /api/v1/smart-money/latest
 * 可选参数：period_days, limit, page
 */
export async function fetchSmartMoneyLatest(
  params: {
    period_days?: number
    limit?: number
    page?: number
  } = {},
): Promise<SmartMoneyResponse> {
  const q = new URLSearchParams()
  if (params.period_days != null) q.set('period_days', String(params.period_days))
  if (params.limit != null) q.set('limit', String(params.limit))
  if (params.page != null) q.set('page', String(params.page))

  const url = `${API_BASE}/api/v1/smart-money/active?${q.toString()}`
  // const url = `${API_BASE}/api/v1/smart-money/latest?${q.toString()}`;
  const res = await fetch(url, { headers: { 'content-type': 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = (await res.json()) as SmartMoneyResponse
  if (json?.success === false) throw new Error(json.message || 'Request failed')
  return json
}

type AIAnalyzeResponse = {
  success: boolean
  message?: string
  data: Record<string, unknown>
}

export const fetchSmartMoneyAnalysis = async (url: string, { arg }: { arg: string }) => {
  if (!arg) throw new Error('address missing')
  const res = await axios.get(`${API_BASE}${url}/${arg}`)
  return res.data
}

export async function fetchActiveSmartMoney(params: {
  periodDays?: number
  recentDays?: number
  page?: number
  pageSize?: number
  userAddress?: string
  tagIds?: number[]
  sortBy?: SmartMoneySortField
}): Promise<SmartMoneyResponse> {
  const res = await hypertraderClient.query<GetActiveSmartMoneyResp>({
    query: getActiveSmartMoneyGql,
    variables: {
      periodDays: params.periodDays,
      recentDays: params.recentDays ?? 1,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
      userAddress: params.userAddress,
      tagIds: params.tagIds,
      sortBy: params.sortBy ?? 'NET_PNL',
    },
    fetchPolicy: 'network-only',
  })

  return adaptActiveSmartMoneyToLegacy(res.data)
}

export const fetchTraderTagsByAddress = async (userAddress: string): Promise<TraderTag[]> => {
  const addr = userAddress.trim()
  if (!addr) return []

  try {
    const res = await hypertraderClient.query<GetTraderTagsByAddressResp>({
      query: getTraderTagsByAddressGql,
      variables: { userAddress: addr },
      fetchPolicy: 'network-only',
    })
    return res.data?.getTraderTagsByAddress ?? []
  } catch (e) {
    console.warn('[tags] fallback', e)
    return []
  }
}

export async function fetchAnalyzeSmartMoneyStrategy(userAddress: string): Promise<SmartMoneyStrategy | null> {
  const addr = userAddress.trim()
  if (!addr) return null

  const res = await hypertraderClient.query<AnalyzeSmartMoneyStrategyResp>({
    query: analyzeSmartMoneyStrategyGql,
    variables: { userAddress: addr },
    fetchPolicy: 'network-only',
  })

  return res.data?.analyzeSmartMoneyStrategy ?? null
}

export type GetSmartMoneyRoiResp = {
  getSmartMoneyRoi: {
    success: boolean
    message?: string | null
    data?: {
      userAddress: string
      roi: number
      periodDays: number
    } | null
  }
}

export type getTopTraderResp = {
  getRecentActiveSmartMoney: GetRecentActiveSmartMoney
}

export type GetRecentActiveSmartMoney = {
  success: boolean
  message: string
  data: TopTrader[]
  pagination: Pagination
}

export type TopTrader = {
  userAddress: string
  roi: number
  netPnl: number
  avgWinRate: number
  maxDrawdown: number
  periodDays: number
  sharpeRatio: any
  profitLossRatio: number
  profitFactor: number
  totalVolume: number
  avgDailyVolume: number
  tradingDays: number
  totalTrades: number
  uniqueCoinsCount: any
  avgTradesPerDay: number
  totalLongPnl: number
  totalShortPnl: number
  winningPnlTotal: number
  losingPnlTotal: number
  kolLabels: any
  kolLabelsDescription: any
  followerCount: number
  remarkName: any
  groupIds: any
  lastOperation: LastOperation
  tags?: Tag[]
}

export type LastOperation = {
  time: number
  coin: string
  side: string
  direction: string
  size: number
  price: number
  pnl: number
  fee: number
  tradeType: string
}

export type Tag = {
  category: string
  name: string
  nameCn: string
  color: string
  priority: number
  description: string
}

export type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type SmartMoneyMetrics30dResp = {
  getSmartMoneyMetrics30d: GetSmartMoneyMetrics30d
}

export type GetSmartMoneyMetrics30d = {
  success: boolean
  message: string
  data: Metrics30d
}

export type Metrics30d = {
  userAddress: string
  roe30d: number
  winRate30d: number
  sharpeRatio30d: any
  maxDrawdown30d: number
  totalPnl30d: number
  profitFactor: number
  periodDays: number
}

export async function fetchSmartMoneyRoi(userAddress: string) {
  const addr = userAddress.trim()
  if (!addr) return null

  const res = await hypertraderClient.query<GetSmartMoneyRoiResp>({
    query: getSmartMoneyRoiGql,
    variables: { userAddress: addr },
    fetchPolicy: 'network-only',
  })

  const payload = res.data?.getSmartMoneyRoi
  if (!payload?.success) {
    throw new Error(payload?.message || 'Fetch ROI failed')
  }

  return payload.data ?? null
}

export async function fetchTopTrader() {
  const res = await hypertraderClient.query<getTopTraderResp>({
    query: getRecentActiveSmartMoneyGql,
    fetchPolicy: 'network-only',
  })
  return res.data?.getRecentActiveSmartMoney
}

export async function fetchMetrics30d(userAddress: string) {
  const res = await hypertraderClient.query<SmartMoneyMetrics30dResp>({
    query: getSmartMoneyMetrics30dGql,
    fetchPolicy: 'network-only',
    variables: { userAddress: userAddress },
  })

  return res.data
}

export async function fetchFollowedSmartMoney(params: {
  periodDays?: number
  recentDays?: number
  page?: number
  pageSize?: number
  userAddress?: string
  tagIds?: number[]
  sortBy?: SmartMoneySortField
}) {
  const res = await hypertraderClient.query<GetActiveSmartMoneyResp>({
    query: getMyFollowedSmartMoneyGql,
    fetchPolicy: 'network-only',
    variables: { 
      periodDays: params.periodDays,
      recentDays: params.recentDays ?? 1,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
      userAddress: params.userAddress,
      tagIds: params.tagIds,
      sortBy: params.sortBy ?? 'NET_PNL',
    },
  })

  return adaptActiveSmartMoneyToLegacy(res.data)
}