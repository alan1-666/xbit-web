import { useSubscriptionDex } from '@/lib/mqtt-dex'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'

const SYMBOL_LIST_TOPIC = 'public/symbol/list'

export const useMergedData = (originalData: ISymbolList[], symbolData: ISymbolList[]) => {
  const { symbolListCtxs, meta } = useWebData2()

  return useMemo(() => {
    if (!originalData?.length) return []

    const symbolDataMap = new Map(symbolData.map((item) => [item.symbol, item]))

    return originalData.map((apiItem) => {
      // First merge MQTT data if available
      const mqttRawItem = symbolDataMap.get(apiItem.symbol)
      let mqttItem = mqttRawItem ? { ...mqttRawItem } : apiItem

      // Always keep local favorite state from apiItem to avoid being overridden by realtime data
      if (typeof apiItem.isFavorite !== 'undefined') {
        mqttItem = {
          ...mqttItem,
          isFavorite: apiItem.isFavorite,
        }
      }

      // Then enhance with fresh Hyperliquid webData2 symbolListCtxs if available
      if (symbolListCtxs?.length && meta?.universe?.length) {
        // Find the symbol index in universe
        const symbolIndex = meta.universe.findIndex((u: any) => u.name === apiItem.symbol)
        if (symbolIndex !== -1 && symbolListCtxs[symbolIndex]) {
          const ctx = symbolListCtxs[symbolIndex]
          const markPrice = Number(ctx.markPx || ctx.midPx || 0)
          const prevDayPrice = Number(ctx.prevDayPx || 0)

          if (markPrice && prevDayPrice) {
            // Use same calculation as individual token pages
            const changPxPercent = ((markPrice - prevDayPrice) / prevDayPrice) * 100

            return {
              ...mqttItem,
              currentPrice: markPrice,
              changPxPercent: Number(changPxPercent.toFixed(2)),
            }
          }
        }
      }

      if (mqttItem.fundingRate && !mqttItem.funding) {
        return {
          ...mqttItem,
          funding: mqttItem.funding ?? mqttItem.fundingRate,
        }
      }

      return mqttItem
    })
  }, [originalData, symbolData, symbolListCtxs, meta])
}

interface ISymbolListSubscriptionProps {
  shouldSkip?: boolean
}



export default function useSymbolListSubscription(props: ISymbolListSubscriptionProps) {
  const [symbolData, setSymbolData] = useState<ISymbolList[]>([])
  const { message: symbolListMqtt } = useSubscriptionDex(SYMBOL_LIST_TOPIC, props)
  
  // 使用 ref 存储最新的数据和节流定时器
  const latestDataRef = useRef<ISymbolList[] | null>(null)
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const UPDATE_INTERVAL = 1000 // 限制更新频率为 1000ms

  const parseMessage = useCallback((messageString: string | undefined): any => {
    if (!messageString) return null

    try {
      return JSON.parse(messageString)
    } catch (error) {
      console.error('Error parsing MQTT message:', error)
      return null
    }
  }, [])

  useEffect(() => {
    if (symbolListMqtt?.message) {
      const messageString = symbolListMqtt.message?.toString()
      const parsedData = parseMessage(messageString)

      if (parsedData) {
        // 保存最新数据到 ref
        latestDataRef.current = parsedData
        
        // 如果没有正在进行的节流定时器，立即更新并启动定时器
        if (!throttleTimerRef.current) {
          setSymbolData(parsedData)
          
          throttleTimerRef.current = setTimeout(() => {
            // 定时器结束时，如果有新数据则更新
            if (latestDataRef.current) {
              setSymbolData(latestDataRef.current)
            }
            throttleTimerRef.current = null
          }, UPDATE_INTERVAL)
        }
      }
    }
  }, [symbolListMqtt, parseMessage])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current)
      }
    }
  }, [])

  return {
    symbolData,
  }
}
