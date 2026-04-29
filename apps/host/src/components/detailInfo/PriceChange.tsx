import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater.ts'
import eventBus from '@/lib/eventBus.ts'
import { cn } from '@/lib/utils.ts'
import { useEffect, useMemo, useState } from 'react'
import { formatPercentage } from '@/utils/helpers'

export interface PriceChangeProps {
  tokenAddress?: string
  initialPrice?: number
  currentPrice?: number
  openTime24h?: number
}

export const PriceChange = (props: PriceChangeProps) => {
  const { initialPrice, currentPrice } = props
  const [ohlcToken, setOhlcToken] = useState<any | null>()

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OHLC_UPDATED, (data: any) => {
      if (data?.data) {
        setOhlcToken(data?.data)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OHLC_UPDATED)
    }
  }, [])

  const price24hChange = useMemo(() => {
    const price = ohlcToken?.close
    if (!price || !initialPrice) return undefined
    // console.log({
    //   price,
    //   openPrice24h: initialPrice,
    //   precent: ((price - initialPrice) / initialPrice) * 100,
    //   time: dayjs().format('HH:mm:ss'),
    // })
    return ((price - initialPrice) / initialPrice) * 100
  }, [initialPrice, currentPrice, ohlcToken])

  const formattedPrice24hChange = useMemo(() => {
    if (price24hChange === undefined) return '--'
    return formatPercentage(Number(price24hChange), true)
  }, [price24hChange])

  return (
    <div className="flex items-center gap-1.5 app-font-medium text-[calc(1rem*(12/16))] leading-[1] whitespace-nowrap mt-[6.5px]">
      <span className="text-[#FFF]/70">24h</span>
      {
        <span
          className={cn(
            'text-white',
            price24hChange !== undefined && price24hChange > 0 && 'text-rise',
            price24hChange !== undefined && price24hChange < 0 && 'text-fall',
          )}
        >
          {formattedPrice24hChange}
        </span>
      }
    </div>
  )
}
