import { TokenStatisticDto } from '@/@generated/gql/graphql-core.ts'
import { MemeDto } from '@/@generated/gql/graphql-meme2.ts'
import { futureClient } from '@/lib/gql/apollo-client'
import { useSubscription } from '@/lib/mqtt'
import { getTokenPrice, getTokensPrices } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums'
import { TokenMarketStats, TokenTrending } from '@/types/token.ts'
import { useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { chunk } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useActiveChainId } from '@hooks/useActiveChain.ts'

type PriceData = {
  [x: string]: string
  usd_price: string
  price: string
  price24hChange: string
}

export const initialTokenMarketStats: TokenMarketStats = {
  chainId: 0,
  createdTime: '',
  firstPrice: '0',
  initLiquidity: '0',
  internalMarketProgress: '',
  liquidity: '0',
  marketcap: '0',
  marketcap5m: '0',
  numberOfHolder: 0,
  price: '0',
  price1hAgo: '0',
  price1hChange: '',
  price1mAgo: '0',
  price1mChange: '',
  price24hAgo: '0',
  price24hChange: '',
  price5mAgo: '0',
  price5mChange: '',
  price6hAgo: '0',
  price6hChange: '',
  token: '',
  updatedAt: '',
  volume1h: '0',
  volume1m: '0',
  volume24h: '0',
  volume5m: '0',
  volume6h: '0',
}
//useTokenPriceOneTime for single token price
export function useTokenPriceOneTime(token: string, initialPrice: string = '0') {
  const isFoundPrice = useRef(false)
  const [price, setPrice] = useState<number>(parseFloat(initialPrice))
  const { message, client } = useSubscription(`public/prices/usd/${token}`, {
    shouldSkip: isFoundPrice.current,
  })
  useEffect(() => {
    const msg = message?.message?.toString()
    const data: PriceData = msg ? JSON.parse(msg) : null
    if (data && !isFoundPrice.current) {
      const rawPrice = data?.usd_price || data?.price || initialPrice
      const parsedPrice = parseFloat(rawPrice)
      if (!isNaN(parsedPrice)) {
        setPrice((prevState) => parsedPrice ?? prevState)
        isFoundPrice.current = true
        // Unsubscribe after first price is received
        if (client?.connected) {
          client.unsubscribe(`public/prices/usd/${token}`)
        }
      }
    }
  }, [message, token])
  return price
}

export default function useTokenPrice(token: string, initialPrice: string = '0') {
  const [price, setPrice] = useState<number | string>(initialPrice)
  const { message } = useSubscription(`public/prices/usd/${token}`)

  useEffect(() => {
    const msg = message?.message?.toString()
    const data: PriceData = msg ? JSON.parse(msg) : null
    if (data && data?.usd_price) {
      setPrice(data?.usd_price)
    }
  }, [message])
  return price ?? initialPrice
}

export function useNewTokenPrice(token: string | undefined, chainId: number | undefined, initialPrice: string = '0') {
  const [price, setPrice] = useState<number | string>(initialPrice)
  const { message } = useSubscription(`public/kline/ohlc_1s/${chainId}/${token}`, {
    shouldSkip: !token || !chainId
  })

  useEffect(() => {
    const msg = message?.message?.toString()
    const data: PriceData = msg ? JSON.parse(msg) : null
    if (data && data?.p) {
      setPrice(data?.p)
    }
  }, [message])
  useEffect(() => {
    if(token) {
      setPrice(initialPrice)
    }
  }, [token])
  return price ?? initialPrice
}

// useTokensPrice for multiple tokens
export function useTokensPrice(
  tokens: string[],
  initialPrice: string = '0',
  timeout: number = 1000,
  pollingInterval: number = 0, // Set to 0 to disable polling, or any ms value to enable
) {
  const timer = useRef<NodeJS.Timeout | null>(null)
  const pollingTimer = useRef<NodeJS.Timeout | null>(null)

  // Initialize with zeros matching tokens length
  const [prices, setPrices] = useState<number[]>(() => Array(tokens.length).fill(parseFloat(initialPrice) || 0))

  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())

  // Remove duplicates
  const uniqueTokens = useMemo(() => Array.from(new Set(tokens)), [tokens])

  // Build topics for subscription
  const topics = useMemo(() => uniqueTokens.map((token) => `public/prices/usd/${token}`), [uniqueTokens])

  // Reset prices array when tokens array changes length
  useEffect(() => {
    // If tokens length changed, reset the prices array
    if (tokens.length !== prices.length) {
      setPrices(Array(tokens.length).fill(parseFloat(initialPrice) || 0))
    }
  }, [tokens.length, initialPrice])

  // Subscribe to MQTT topics
  const { message, client } = useSubscription(topics, {
    shouldSkip: !uniqueTokens.length,
  })

  // Process incoming messages with debounce
  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = setTimeout(() => {
      const msg = message?.message?.toString()
      const data: PriceData = msg ? JSON.parse(msg) : null

      if (data) {
        const rawPrice = data?.usd_price || data?.price || initialPrice
        const price = parseFloat(rawPrice)

        if (!isNaN(price)) {
          const tokenIndex = tokens.findIndex((t) => t === data.token)
          if (tokenIndex !== -1) {
            setPrices((prevPrices) => {
              const newPrices = [...prevPrices]
              newPrices[tokenIndex] = price
              return newPrices
            })
            setLastUpdateTime(Date.now())
          }
        }
      }
    }, timeout)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [message, tokens, timeout, initialPrice])

  // Set up polling interval if enabled
  useEffect(() => {
    // Skip if polling is disabled or no tokens
    if (pollingInterval <= 0 || uniqueTokens.length === 0) return

    const pollData = () => {
      // Check if we need to force refresh
      const now = Date.now()
      const timeSinceLastUpdate = now - lastUpdateTime

      // Force refresh if we haven't received updates in pollingInterval time
      if (timeSinceLastUpdate >= pollingInterval) {
        // Re-publish to the topics to trigger updates
        uniqueTokens.forEach((token) => {
          // If client supports publishing, request a refresh
          if (client?.connected) {
            // You might need to modify this based on your MQTT setup
            // This assumes you can publish to a request topic to trigger updates
            client.publish(
              `request/prices/usd/${token}`,
              JSON.stringify({
                requestTime: now,
                requestType: 'refresh',
              }),
            )
          }
        })
      }
    }

    // Set up the polling interval
    pollingTimer.current = setInterval(pollData, pollingInterval)

    return () => {
      if (pollingTimer.current) clearInterval(pollingTimer.current)
    }
  }, [pollingInterval, uniqueTokens, lastUpdateTime, client])

  return prices
}

export const useTokenInfo = (original: TokenTrending) => {
  const [token, setToken] = useState<TokenTrending>(original)
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(`public/token_statistic/${activeChainId}/${original.token}`)
  useEffect(() => {
    const msg = message?.message?.toString()
    if (msg) {
      const data: TokenTrending = JSON.parse(msg)
      setToken((prevState) => ({ ...prevState, ...data }))
    }
  }, [message])
  return token
}

export const useTokenStatistic = <T extends TokenStatisticDto | MemeDto>(original: T) => {
  const [token, setToken] = useState<T>(original)
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(`public/token_statistic/${activeChainId}/${original?.token}`)
  useEffect(() => {
    const msg = message?.message?.toString()
    if (msg) {
      const data: T = JSON.parse(msg)
      const totalTransactions = data.totalTransactions
      setToken((prevState) => {
        const buyTxs5m = totalTransactions?.numberOfPurchases5m ?? prevState.buyTxs5m
        const buyTxs1h = totalTransactions?.numberOfPurchases1h ?? prevState.buyTxs1h
        const buyTxs6h = totalTransactions?.numberOfPurchases6h ?? prevState.buyTxs6h
        const buyTxs24h = totalTransactions?.numberOfPurchases24h ?? prevState.buyTxs24h
        const sellTxs5m = totalTransactions?.numberOfSales5m ?? prevState.sellTxs5m
        const sellTxs1h = totalTransactions?.numberOfSales1h ?? prevState.sellTxs1h
        const sellTxs6h = totalTransactions?.numberOfSales6h ?? prevState.sellTxs6h
        const sellTxs24h = totalTransactions?.numberOfSales24h ?? prevState.sellTxs24h
        const txs5m = buyTxs5m && sellTxs5m ? buyTxs5m + sellTxs5m : prevState.txs5m
        const txs1h = buyTxs1h && sellTxs1h ? buyTxs1h + sellTxs1h : prevState.txs1h
        const txs6h = buyTxs6h && sellTxs6h ? buyTxs6h + sellTxs6h : prevState.txs6h
        const txs24h = buyTxs24h && sellTxs24h ? buyTxs24h + sellTxs24h : prevState.txs24h
        return {
          ...prevState,
          ...data,
          buyTxs5m: buyTxs5m,
          buyTxs1h: buyTxs1h,
          buyTxs6h: buyTxs6h,
          buyTxs24h: buyTxs24h,
          sellTxs5m: sellTxs5m,
          sellTxs1h: sellTxs1h,
          sellTxs6h: sellTxs6h,
          sellTxs24h: sellTxs24h,
          txs5m: txs5m,
          txs1h: txs1h,
          txs6h: txs6h,
          txs24h: txs24h,
        }
      })
    }
  }, [message])
  return token
}

export const useTokenPriceInfo = (token: string) => {
  const [tokenStatistic, setTokenStatistic] = useState<TokenMarketStats>(initialTokenMarketStats)
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(`public/token_statistic/${activeChainId}/${token}`)
  // const { data: fallbackData } = useFallbackPrice(token, tokenStatistic.price !== '0')

  useEffect(() => {
    const msg = message?.message?.toString()
    const data: TokenMarketStats = msg ? JSON.parse(msg) : null
    if (data && parseFloat(data?.price ?? '0') > 0) {
      setTokenStatistic((prevState) => data ?? prevState)
    }
  }, [message])

  useEffect(() => {
    // Reset tokenStatistic if token changes
    setTokenStatistic(initialTokenMarketStats)
  }, [token])

  // For test
  const createdTime = tokenStatistic?.createdTime
  const internalMarketProgress = tokenStatistic?.internalMarketProgress

  if (dayjs(createdTime).isValid()) {
    const createdTimeDiff = dayjs().diff(dayjs(createdTime), 'seconds')
    if (createdTimeDiff <= 300 && Number(internalMarketProgress) > 1) {
      // Data error
      // console.log('tokenStatistic error', tokenStatistic)
    }
  }

  return tokenStatistic
}

export const XGetTokenPrice = (address: string, initialPrice: number = 0) => {
  const [price, setPrice] = useState<number>(0)
  const { data: priceData } = useQuery(getTokenPrice, {
    variables: {
      input: {
        address: address,
      },
    },
  })
  useEffect(() => {
    setPrice((prevState) => {
      const rawPrice = priceData?.getTokenDetail?.price || initialPrice
      const parsedPrice = parseFloat(rawPrice)
      return !isNaN(parsedPrice) ? parsedPrice : prevState
    })
  }, [priceData])
  return price
}

export async function XGetTokensPrice(tokens: string[], chainId: ChainIds) {
  const { data, loading } = await futureClient.query({
    query: getTokensPrices,
    variables: {
      tokens,
      chainId,
    },
  })
  return { data: data?.getPrices || [], loading }
}

// export function useTokensPriceChunk(tokens: string[], chunkSize: number = 100) {
//   const tokenChunks = chunk(tokens, chunkSize);
//   return useQueries({
//     queries: tokenChunks.map((chunk) => ({
//       queryKey: ['tokens-price', chunk],
//       queryFn: () => XGetTokensPrice(chunk),
//       staleTime: 1000 * 60 * 5,
//     })),
//   })
// }

export function useTokensPriceChunk({
  tokens,
  chunkSize = 100,
  chainId,
}: {
  tokens: string[]
  chunkSize?: number
  chainId: ChainIds
}) {
  const tokenChunks = chunk(tokens, chunkSize)
  return Promise.all(tokenChunks.map((chunk) => XGetTokensPrice(chunk, chainId)))
}

export const useMemeTokenPrice = (token: string, initialPrice: number) => {
  const [price, setPrice] = useState<number>(initialPrice)
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(`public/token_statistic/${activeChainId}/${token}`, {
    shouldSkip: !token,
  })
  useEffect(() => {
    const msg = message?.message?.toString()
    const data: TokenMarketStats = msg ? JSON.parse(msg) : null
    if (data && parseFloat(data?.price ?? '0') > 0) {
      const newPrice = data?.price
      if (newPrice) {
        const parsedPrice = parseFloat(newPrice)
        if (!isNaN(parsedPrice)) {
          setPrice((prevState) => parsedPrice ?? prevState)
        }
      }
    }
  }, [message])
  return price
}
