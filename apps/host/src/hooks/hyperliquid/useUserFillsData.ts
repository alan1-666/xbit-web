import { useState, useMemo, useEffect } from 'react'
import { useWebSocketChannel } from '@/hooks/hyperliquid/useWebSocketChannel'
import { WsUserFill } from '@/types/hyperliquid'
import { _changeTokenAccount } from '@/redux/modules/auth.slice'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'


export function useUserFillsData() {
  const [fills, setFills] = useState<WsUserFill[]>([])

  const walletDex = useSelector(_walletDex)

  const isLogin = useCheckLoginOnArb()

  const channel = 'userFills'

  const params = useMemo(() => {
    if (!isLogin) return null
    return {
      type: 'userFills',
      user: walletDex?.walletAddress,
      aggregateByTime: true,
    }
  }, [walletDex, isLogin])

  useEffect(() => {
    if(!isLogin) {
      setFills([])
    }
  }, [isLogin])

  useWebSocketChannel(channel, params, (data) => {
    if (!isLogin) return null
    setFills(data?.fills)
  })

  return {
    fills,
  }
}
