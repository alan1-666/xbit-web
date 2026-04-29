import { useState, useMemo, useEffect } from 'react'
import { useWebSocketChannel } from '@/hooks/hyperliquid/useWebSocketChannel'
import { HistoricalOrder } from '@/types/hyperliquid'
import { _changeTokenAccount } from '@/redux/modules/auth.slice'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'


export function userHistoricalOrders() {
  const [orders, setOrders] = useState<HistoricalOrder[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const walletDex = useSelector(_walletDex)

  const isLogin = useCheckLoginOnArb()

  const channel = 'userHistoricalOrders'

  const params = useMemo(() => {
    if (!isLogin) {
      setIsLoading(false)
      return null
    }
    return {
      type: 'userHistoricalOrders',
      user: walletDex?.walletAddress,
    }
  }, [walletDex, isLogin])

  useEffect(() => {
    if(!isLogin) {
      setOrders([])
    }
  }, [isLogin])


  useWebSocketChannel(channel, params, (data) => {
    setIsLoading(false)
    if (!isLogin) return null
    setOrders(data?.orderHistory)
    
  })

  return {
    orders,
    isLoading,
  }
}
