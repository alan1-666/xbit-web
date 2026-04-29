export type SmartMoneySortField = 'ROI' | 'NET_PNL' | 'AVG_WIN_RATE'

export type ApiSmartMoneyTag = {
  category: string
  name: string
  nameCn?: string | null
  color?: string | null
  priority?: number | null
  description?: string | null
}

export type ApiSmartMoneyTrader = {
  userAddress: string
  roi: number
  netPnl: number
  avgWinRate: number
  maxDrawdown: number
  periodDays: number
  profitFactor?: number | null
  sharpeRatio?: number | null
  profitLossRatio?: number | null
  totalVolume?: number | null
  avgDailyVolume?: number | null
  tradingDays?: number | null
  totalTrades?: number | null
  uniqueCoinsCount?: number | null
  avgTradesPerDay?: number | null

  latestActivity?: { en?: string | null; cn?: string | null } | null
  latestActivityTime?: string | null

  kolLabels?: string[] | null
  kolLabelsDescription?: string[] | null

  tags?: ApiSmartMoneyTag[] | null

  followerCount?: number | null

  remarkName?: string | null
  groupIds?: string[] | null
  
  lastOperation?: {
    time: number
    coin: string
    side: 'A' | 'B' | string 
    direction: string 
    size: number
    price: number
    pnl: number
    fee: number
    tradeType: 'perpetual' | 'spot' | string
  } | null

  totalLongPnl: number | string | null
  totalShortPnl: number | string | null
  winningPnlTotal: number | string | null
  losingPnlTotal: number | string | null
  portfolioData: string | null
}

export type ApiPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type GetActiveSmartMoneyResp =
  | {
      getActiveSmartMoney: {
        success: boolean
        message?: string | null
        data: ApiSmartMoneyTrader[]
        pagination: ApiPagination
      }
    }
  | {
      getMyFollowedSmartMoney: {
        success: boolean
        message?: string | null
        data: ApiSmartMoneyTrader[]
        pagination: ApiPagination
      }
    }

/**
 * 适配原有参数：
 * - user_address / net_pnl / avg_win_rate / max_drawdown / latest_activity / total_trades
 * - pagination.total_pages
 */
export type Trader = {
  user_address: string
  roi: number
  net_pnl: number
  avg_win_rate: number
  max_drawdown: number
  period_days: number
  profit_factor: number | null
  sharpe_ratio?: number | null
  profit_loss_ratio?: number | null
  total_volume?: number | null
  avg_daily_volume?: number | null
  trading_days?: number | null
  total_trades?: number | null
  unique_coins_count?: number | null
  avg_trades_per_day?: number | null

  latest_activity?: { en?: string | null; cn?: string | null; hk?: string | null } | null
  latest_activity_time?: string | null

  kol_labels?: string[] | null
  kol_labels_description?: string[] | null

  tags?: ApiSmartMoneyTag[] | null
  follower_count?: number | null
  last_operation?: {
    time: number
    coin: string
    side: 'A' | 'B' | string 
    direction: string 
    size: number
    price: number
    pnl: number
    fee: number
    tradeType: 'perpetual' | 'spot' | string
  } | null

  totalLongPnl: string | number | null
  totalShortPnl: string | number | null

  groupIds: string[] | null
  remarkName: string
  portfolioData?: string
}

export type SmartMoneyResponse = {
  success: boolean
  message?: string | null
  data: Trader[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

/* export const adaptActiveSmartMoneyToLegacyV1 = (resp: GetActiveSmartMoneyResp): SmartMoneyResponse => {
  const r = 'getActiveSmartMoney' in resp ? resp.getActiveSmartMoney : resp.getMyFollowedSmartMoney

  return {
    success: r.success,
    message: r.message,
    data: (r.data ?? []).map((it) => ({
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

      latest_activity: it.latestActivity ?? null,
      latest_activity_time: it.latestActivityTime ?? null,

      kol_labels: it.kolLabels ?? null,
      kol_labels_description: it.kolLabelsDescription ?? null,

      tags: it.tags ?? null,
      follower_count: it.followerCount ?? null,
    })),
    pagination: {
      page: r.pagination?.page ?? 1,
      page_size: r.pagination?.pageSize ?? 100,
      total: r.pagination?.total ?? 0,
      total_pages: r.pagination?.totalPages ?? 1,
    },
  }
} */

