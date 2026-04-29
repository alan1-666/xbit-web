import { XStockToken } from '@/types/xstocks.ts'
import { useMemo } from 'react'
import { SortBy, SortByField } from '@/redux/modules/xstocks.slice.ts'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import dayjs from 'dayjs'

type SortFn = (a: XStockToken, b: XStockToken) => number

const sortFns: Record<Exclude<SortByField, 'volume' | 'txs'>, SortFn> = {
  marketCap: (a, b) => (a.marketCap ? +a.marketCap : 0) - (b.marketCap ? +b.marketCap : 0),
  token: (a, b) => (a.symbol ?? '').localeCompare(b.symbol ?? ''),
  price: (a, b) => (a.price ? +a.price : 0) - (b.price ? +b.price : 0),
  liquidity: (a, b) => (a.liquidity ? +a.liquidity : 0) - (b.liquidity ? +b.liquidity : 0),
  change24h: (a, b) => (a.price24hChange ? +a.price24hChange : 0) - (b.price24hChange ? +b.price24hChange : 0),
  volume24h: (a, b) => (a.volume24h ? +a.volume24h : 0) - (b.volume24h ? +b.volume24h : 0),
  holders: (a, b) => (a.numberOfHolder ?? 0) - (b.numberOfHolder ?? 0),
  age: (a, b) => {
    const aTime = a.createdTime ? dayjs(a.createdTime).valueOf() : 0
    const bTime = b.createdTime ? dayjs(b.createdTime).valueOf() : 0
    return bTime - aTime
  },
  favoriteAt: (a, b) => {
    const aTime = a.favoriteAt ? dayjs(a.favoriteAt).valueOf() : 0
    const bTime = b.favoriteAt ? dayjs(b.favoriteAt).valueOf() : 0
    return aTime - bTime
  },
}

const txsSortFns: Record<TimeframeOption, SortFn> = {
  '1m': (a, b) => (a.buyTxs1m ?? 0) + (a.sellTxs1m ?? 0) - ((b.buyTxs1m ?? 0) + (b.sellTxs1m ?? 0)),
  '5m': (a, b) => (a.buyTxs5m ?? 0) + (a.sellTxs5m ?? 0) - ((b.buyTxs5m ?? 0) + (b.sellTxs5m ?? 0)),
  '1h': (a, b) => (a.buyTxs1h ?? 0) + (a.sellTxs1h ?? 0) - ((b.buyTxs1h ?? 0) + (b.sellTxs1h ?? 0)),
  '6h': (a, b) => (a.buyTxs6h ?? 0) + (a.sellTxs6h ?? 0) - ((b.buyTxs6h ?? 0) + (b.sellTxs6h ?? 0)),
  '24h': (a, b) => (a.buyTxs24h ?? 0) + (a.sellTxs24h ?? 0) - ((b.buyTxs24h ?? 0) + (b.sellTxs24h ?? 0)),
}

const volumeSrtFns: Record<TimeframeOption, SortFn> = {
  '1m': (a, b) => (a.volume1m ? +a.volume1m : 0) - (b.volume1m ? +b.volume1m : 0),
  '5m': (a, b) => (a.volume5m ? +a.volume5m : 0) - (b.volume5m ? +b.volume5m : 0),
  '1h': (a, b) => (a.volume1h ? +a.volume1h : 0) - (b.volume1h ? +b.volume1h : 0),
  '6h': (a, b) => (a.volume6h ? +a.volume6h : 0) - (b.volume6h ? +b.volume6h : 0),
  '24h': (a, b) => (a.volume24h ? +a.volume24h : 0) - (b.volume24h ? +b.volume24h : 0),
}

const getSortFn = (sortBy: SortBy, timeframe: TimeframeOption): SortFn | null => {
  const field = sortBy.field
  if (field === 'txs') {
    return txsSortFns[timeframe]
  }
  if (field === 'volume') {
    return volumeSrtFns[timeframe]
  }
  return sortFns[field] || null
}

export const useSortedList = (tokens: XStockToken[], sortBy: SortBy, timeframe: TimeframeOption) => {
  return useMemo(() => {
    const sortFn = getSortFn(sortBy, timeframe)
    const direction = sortBy.direction === 'desc' ? -1 : 1
    if (!sortFn) return tokens
    return tokens.concat([]).sort((a, b) => {
      const result = sortFn(a, b)
      return result * direction
    })
  }, [tokens, sortBy])
}
