import { useCandleOneDay, TickerSnapshot } from '@/hooks/hyperliquid/useCandleOneDay'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { cn, showRate } from '@/lib/utils.ts'
import { clearExpiredCache, selectCachedCandleData, setCandleCache, Candle } from '@/redux/modules/candleCacheSlice.slice'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'

import { useAppSelector, useAppDispatch } from '@/redux/store'
import { SEARCH_SYMBOL_ENDPOINT } from '@/services/symbol.dex.service'
import { formatMoney, formatNumberWithCommas,formatPriceBySymbol } from '@/utils/helpers'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type DetailStatisticProps = {
  containerClassName?: string
}



export interface ISymbolList {
  volume: string
  symbol: string
}

const StatisticItem = memo<{
  label: string
  value: string
  className?: string
}>(({ label, value, className }) => (
  <p className={cn("flex items-center justify-between mb-1.5", className)}>
    <span className="text-[#605E68]">{label}</span>
    <span className="text-[#FFFFFF]">{value}</span>
  </p>
))

StatisticItem.displayName = 'StatisticItem'

const PriceDisplay = memo<{
  price: string
  change: string
  priceClassName?: string
  labelClassName?: string
}>(({ price, change, priceClassName, labelClassName }) => (
  <div className='flex items-center mb-1'>
    <p className={cn("text-[#FFFFFF] text-[calc(25rem/16)] mr-4 leading-[calc(25rem/16)] font-bold", priceClassName)}>
      {price}
    </p>
    <p className={cn('text-[calc(14rem/16)] py-1 px-2.5 rounded-[4px] leading-[calc(14rem/16)]', parseFloat(change) >= 0 ? 'bg-[var(--tab-buy-bg)]' : 'bg-[var(--tab-sell-bg)]')}>{showRate(change) === '≈0%' ? '--' : showRate(change)}</p>
  </div>
))

PriceDisplay.displayName = 'PriceDisplay'

const DetailStatistic = memo<DetailStatisticProps>(({ containerClassName }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { baseCoin, markPrice, change } = useAppSelector(symbolInfoSelector)
  
  const cachedCandleData = useAppSelector((state) => {
    if (!baseCoin) return null
    return selectCachedCandleData(baseCoin)(state)
  })

  
  const { ticker } = useCandleOneDay(baseCoin)

  const [candleData, setCandleData] = useState<Candle | undefined>(
    cachedCandleData || undefined
  )
  const [symbolList, setSymbolList] = useState<ISymbolList[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchTimeRef = useRef<number>(0)

  useEffect(() => {
    if (baseCoin && cachedCandleData) {
      setCandleData(cachedCandleData)
    } else {
      setCandleData(undefined)
    }
  }, [baseCoin, cachedCandleData])

  // Clear expired cache periodically
  useEffect(() => {
    const clearExpiredInterval = setInterval(() => {
      dispatch(clearExpiredCache())
    }, 90000)

    return () => clearInterval(clearExpiredInterval)
  }, [dispatch])

  const fetchSymbolList = useCallback(async () => {
    // 防止频繁请求，设置最小间隔为5秒
    const now = Date.now()
    if (now - lastFetchTimeRef.current < 5000) {
      return
    }
    lastFetchTimeRef.current = now
    if (!baseCoin) return
    try {
      setIsLoading(true)
      const { data } = await symbolDexClient.query({
        query: SEARCH_SYMBOL_ENDPOINT,
        variables: {
          input: {
            filter: baseCoin.toUpperCase(),
          },
        },
      })
      setSymbolList(data?.searchSymbol?.list || [])
    } catch (error) {
      console.error('Error fetching symbol list:', error)
    } finally {
      setIsLoading(false)
    }
  }, [baseCoin])

  // 初始加载和baseCoin变化时获取数据
  useEffect(() => {
    fetchSymbolList()
  }, [baseCoin, fetchSymbolList])
  
  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    // 设置新的定时器，每10秒获取一次数据
    timerRef.current = setInterval(() => {
      fetchSymbolList()
    }, 10000)
    // 组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [fetchSymbolList])

  

  useEffect(() => {
    if (ticker && (baseCoin === ticker.s)) {
       setCandleData(ticker)
      // Cache the new data in Redux store
      if (baseCoin) {
        dispatch(setCandleCache({ baseCoin, data: ticker}))
      }
    }
  }, [ticker, dispatch])
  
  // 获取当前币种的数据
  const currentCoinData = useMemo(() => {
    return symbolList.find(item => item.symbol === baseCoin)
  }, [symbolList, baseCoin])
  
  const formattedValues = useMemo(() => {
    if (!candleData) {
      return {
        currentPrice: '--',
        markPriceValue: formatPriceBySymbol(`${markPrice || ''}`,baseCoin),
        highPrice: '--',
        lowPrice: '--',
        volume: '--',
        change: '--'
      }
    }
    return {
      currentPrice: formatPriceBySymbol(`${candleData?.c}`,baseCoin),
      markPriceValue: formatPriceBySymbol(`${markPrice || ''}`,baseCoin),
      highPrice: formatPriceBySymbol(`${candleData?.h}` ,baseCoin),
      lowPrice: formatPriceBySymbol(`${candleData?.l}`,baseCoin),
      volume: formatPriceBySymbol(`${candleData?.v}`,baseCoin),
      change: change
    }
  }, [candleData, markPrice, change])

  // Memoize container className
  const containerCls = useMemo(() => 
    cn('flex items-center justify-between mb-[12px]', containerClassName),
    [containerClassName]
  )

  return (
    <div className={containerCls}>
      <div>
        <PriceDisplay 
          price={formattedValues?.currentPrice ?? '--'}
          change={formattedValues?.change ?? '--'}
        />
        
        <p className="text-rise text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">
          <span className="text-[#605E68] mr-1.5">{t('futuresDetails.common.markPrice')}</span>
          <span className="text-[#605E68]">{formattedValues.markPriceValue}</span>
        </p>
      </div>

      <div className="w-[157px] pl-[13px] text-[calc(11rem/16)] leading-[calc(11rem/16)]">
        <StatisticItem 
          label={t('futuresDetails.common.highestPrice')} 
          value={formattedValues.highPrice}
        />
        
        <StatisticItem 
          label={t('futuresDetails.common.lowestPrice')} 
          value={formattedValues.lowPrice}
        />
        
        <StatisticItem 
          label={t('futuresDetails.common.24hVolume')} 
          value={(currentCoinData?.volume && formattedValues?.currentPrice) 
            ? formatMoney(Number(currentCoinData?.volume), true) : '--'}
          className="mb-0" // Remove margin for last item
        />
      </div>
    </div>
  )
})

DetailStatistic.displayName = 'DetailStatistic'

export default memo(DetailStatistic)