import { _walletDex } from '@/redux/modules/newWallet.slice'
import { WebData2 } from '@/types/hyperliquid'
import { isEqual } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useCheckLoginOnArb } from './useCheckLoginOnArb'
import { useWebSocketChannel } from './useWebSocketChannel'

interface FuturesPosition {
  coin: string
  szi: string
  leverage: {
    type: 'cross' | 'isolated'
    value: number
  }
  entryPx: string
  positionValue: string
  unrealizedPnl: string
  returnOnEquity: string
  liquidationPx: string
  marginUsed: string
  maxLeverage: number
  cumFunding: {
    allTime: string
    sinceOpen: string
    sinceChange: string
  }
}

export function useGetFuturesAccountBalance() {
  const [webData2, setWebData2] = useState<WebData2>({})
  const walletDex = useSelector(_walletDex)

  const balance = useRef(0)

  const isLogin = useCheckLoginOnArb()

  const channel = 'webData2'

  const params = useMemo(() => {
    if (!isLogin) return null
    return {
      type: 'webData2',
      user: walletDex?.walletAddress,
    }
  }, [walletDex, isLogin])

  useWebSocketChannel(channel, params, (data) => {
    if (!isLogin) return null
    setWebData2((prev) => {
      return isEqual(prev, data) ? prev : data
    })
  })

  const assetPositions = webData2?.clearinghouseState?.assetPositions ?? []

  const positions: FuturesPosition[] = assetPositions.map((item: any) => {
    return {
      ...item.position,
    }
  })

  useEffect(() => {
    if (webData2 && webData2?.clearinghouseState?.crossMarginSummary?.accountValue) {
      const accountValue = webData2.clearinghouseState?.crossMarginSummary?.accountValue
      const toalUnrealizedPnl = positions.reduce((a, b) => a + Number(b.unrealizedPnl), 0)
      balance.current = accountValue - toalUnrealizedPnl
    }
  }, [positions, webData2])

  useEffect(() => {
    if(!isLogin) {
      setWebData2({})
    }
  }, [isLogin])

  return {
    webData2,
    positions,
    balance: balance.current,
  }
}
