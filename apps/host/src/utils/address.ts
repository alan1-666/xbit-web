import { useTranslation } from 'react-i18next'

export const shortAddr = (a: string | undefined, prefix: number = 6, suffix: number = 4) => {
  if (!a) return '--'
  return a.length > 7 ? `${a.slice(0, prefix).toUpperCase()}...${a.slice(-suffix).toUpperCase()}` : a.toUpperCase()
}

export const shortHash = (a: string) => {
  if (!a) return '--'
  return a.length > 10 ? `${a.slice(0, 7)}...${a.slice(-4)}` : a;
}

export const useLangKey = () => {
  const { i18n } = useTranslation()
  if(i18n.language.startsWith('zh')) {
    return 'cn'
  } else if(i18n.language.startsWith('hk')) {
    return 'hk'
  } else {
    return 'en'
  }
}

export const formatCurrency = (value: number | string, currency: string = 'USD', locale: string = 'en-US'): string => {
  const num = Number(value)
  if (isNaN(num)) return `${currency} 0.00`

  return num.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type Position = {
  coin?: string
  szi?: string | number
  positionValue?: string | number
  unrealizedPnl?: string | number
  marginUsed?: string | number
  [key: string]: any
}

export type Resp = {
  assetPositions?: Array<{ position?: Position | null }>;
  marginSummary?: any;
};

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export type PositionsStats = {
  totalAbsPV: number
  longAbsPV: number
  shortAbsPV: number
  perCoin: Record<string, number>

  // PnL / 保证金
  totalUnrealizedPnl: number
  totalMarginUsed: number

  // 账户净值
  accountValue: number
}

export const computePositionsStats = (resp: Resp): PositionsStats => {
  const items = Array.isArray(resp.assetPositions)
    ? resp.assetPositions.map(p => p?.position).filter((x): x is Position => !!x)
    : []

  const out: PositionsStats = {
    totalAbsPV: 0,
    longAbsPV: 0,
    shortAbsPV: 0,
    perCoin: {},
    totalUnrealizedPnl: 0,
    totalMarginUsed: 0,
    accountValue: num(resp.marginSummary?.accountValue),
  }

  for (const x of items) {
    const coin = (x.coin ?? '-').trim() || '-'
    const szi = num(x.szi)
    const absPV = Math.abs(num(x.positionValue))
    const uPnl = num(x.unrealizedPnl)
    const mUsed = num(x.marginUsed)

    if (absPV > 0) {
      out.totalAbsPV += absPV
      if (szi > 0) out.longAbsPV += absPV
      else if (szi < 0) out.shortAbsPV += absPV
      out.perCoin[coin] = (out.perCoin[coin] ?? 0) + absPV
    }

    out.totalUnrealizedPnl += uPnl
    out.totalMarginUsed += mUsed
  }

  return out
}

// 仓位分布 Distribution
export type CoinDistributionItem = {
  coin: string;
  valueUSD: number;
  ratio: number;  // 0~1
};

export const computePositionDistribution = (stats: PositionsStats): CoinDistributionItem[] => {
  const { totalAbsPV, perCoin } = stats
  const entries = Object.entries(perCoin).map(([coin, valueUSD]) => ({
    coin: coin || '-',
    valueUSD,
    ratio: totalAbsPV ? valueUSD / totalAbsPV : 0,
  }))

  entries.sort((a, b) => {
    const diff = b.ratio - a.ratio
    if (diff !== 0) return diff
    return a.coin.localeCompare(b.coin)
  })

  return entries
}

export const buildCoinDistribution = (s: PositionsStats, topN = 5) => {
  const { totalAbsPV, perCoin } = s
  const pairs = Object.entries(perCoin).map(([coin, valueUSD]) => ({
    coin,
    valueUSD,
    pct: totalAbsPV ? valueUSD / totalAbsPV : 0,
  }))
  pairs.sort((a, b) => b.pct - a.pct)

  const head = pairs.slice(0, topN)
  const coveredUSD = head.reduce((sum, x) => sum + x.valueUSD, 0)
  const restUSD = Math.max(0, totalAbsPV - coveredUSD)
  const segments =
    restUSD > 0
      ? [...head, { coin: 'Others', valueUSD: restUSD, pct: totalAbsPV ? restUSD / totalAbsPV : 0 }]
      : head

  return {
    totalAbsUSD: totalAbsPV,
    coveredPct: totalAbsPV ? coveredUSD / totalAbsPV : 0,
    segments, // [{coin,valueUSD,pct}]
  }
}


// 方向偏差 Direction Bias
export const calcDirectionBias = (stats: PositionsStats) => {
  const { totalAbsPV, longAbsPV, shortAbsPV } = stats;
  const longPct = totalAbsPV ? (longAbsPV / totalAbsPV) * 100 : 0;
  const shortPct = totalAbsPV ? (shortAbsPV / totalAbsPV) * 100 : 0;

  const round1 = (x: number) => Math.round(x * 100) / 100;

  return {
    longPct: round1(longPct),
    shortPct: round1(shortPct),
    longAbsUSD: longAbsPV,
    shortAbsUSD: shortAbsPV,
    totalAbsUSD: totalAbsPV,
  };
}

// Unrealized PnL + ROE + ROI
export const computeProfitRatios = (s: PositionsStats) => {
  const unrealizedPnl = s.totalUnrealizedPnl
  const roe = s.totalMarginUsed ? (unrealizedPnl / s.totalMarginUsed) * 100 : 0
  const roi = s.accountValue ? (unrealizedPnl / s.accountValue) * 100 : 0
  return {
    unrealizedPnl,
    roe: +roe.toFixed(4),
    roi: +roi.toFixed(4),
  }
}


