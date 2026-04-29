import { useSubscription } from '@/lib/mqtt'
import { useEffect, useState } from 'react'
import { useActiveChainId } from '@hooks/useActiveChain.ts'

const useItemTokenOHLC = ({
  address,
  initChangePercent,
  initMarketcap,
  initLiquidity = 0,
  initVolume24h,
}: {
  address: string
  initChangePercent?: number
  initMarketcap?: number
  initVolume24h?: number
  initLiquidity?: number
}) => {
  const [price, setPrice] = useState({
    price: 0,
    price24hChange: initChangePercent,
    marketcap: initMarketcap,
    volume24h: initVolume24h,
    liquidity: initLiquidity,
  })
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(`public/token_statistic/${activeChainId}/${address}`, {
    shouldSkip: !address,
  })
  useEffect(() => {
    const msg = message?.message?.toString()
    if (msg) {
      const data = JSON.parse(msg)
      setPrice({
        price: data.price ? data.price : price.price,
        price24hChange: data.price24hChange ? data.price24hChange : price.price24hChange,
        marketcap: data.marketcap ? data.marketcap : price.marketcap,
        volume24h: data.volume24h ? data.volume24h : price.volume24h,
        liquidity: data?.liquidity ? data.liquidity : price.liquidity,
      })
    }
  }, [message])
  return { price }
}

export default useItemTokenOHLC
