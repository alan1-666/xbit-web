import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { symbolDexClient } from '@/lib/gql/apollo-client'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { GET_SYMBOL_LIST, GET_HOT_SEARCHES } from '@/services/symbol.dex.service'
import { setData } from '@/redux/modules/symbolList.slide'
import { Configs } from '@/const/configs'
import { chains, chainsIds } from '@/components/futuresDetails/tokenSearchDrawer/MemeList'
import { TYPE_CHAIN } from '@/lib/blockchain'
import ls from '@/lib/local-storage'

type UseFuturesHotSearchTextOptions = {
  /**
   * 热搜板块类型
   * - "CONTRACT": 合约/加密货币
   * - "MEME": Meme 板块
   * - "USTOCK": 美股板块
   */
  board?: 'CONTRACT' | 'MEME' | 'USTOCK'
  /**
   * 当 openInterest 列表为空时的兜底合约
   */
  fallbackSymbol?: string
  /**
   * 是否开启每小时刷新 openInterest 列表（默认开启）
   */
  enableHourlyRefresh?: boolean
}

export interface HotSearchToken {
  id: string
  board: 'CONTRACT' | 'MEME' | 'USTOCK'
  mode: string
  symbol: string
  chainId: string
  tokenContract: string
  tokenName: string
  displayText: string
  showFlame: boolean
}
export const useFuturesHotSearchText = (options?: UseFuturesHotSearchTextOptions) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hotSymbolFromApi, setHotSymbolFromApi] = useState<string>('')
  const [token, setToken] = useState<HotSearchToken | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  // supportedRouteChains
  const memeChain = useMemo(() => {
    if (Configs.supportedRouteChains().includes(activeChain)) return activeChain as TYPE_CHAIN
    return TYPE_CHAIN.BSC
  }, [activeChain])

  const openInterestList = useAppSelector((state: RootState) => {
    return state.symbolListSlice.lists.openInterest
  })

  // Get the trending search currency configured in the backend
  const fetchHotSearchFromApi = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data } = await symbolDexClient.query({
        query: GET_HOT_SEARCHES,
        variables: {
          input: {
            board: options?.board || 'CONTRACT',
            ...(options?.board !== 'CONTRACT' && { chainId: chainsIds[memeChain], })
          },
        },
        fetchPolicy: 'network-only',
      })

      const hotSearchData = data?.getHotSearches?.data || []
      if (hotSearchData.length > 0) {
        // Prioritize using the first trending search configuration
        const firstHotSearch = hotSearchData[0]
        setToken(firstHotSearch)
        setHotSymbolFromApi(firstHotSearch.symbol || '')
      } else {
        setHotSymbolFromApi('')
        setToken(null)
      }
    } catch (error) {
      // Clear the value when the interface fails, using fallback logic
      setHotSymbolFromApi('')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [options?.board, memeChain])

  const onRefreshOpenInterestList = useCallback(() => {
    return symbolDexClient
      .query({
        query: GET_SYMBOL_LIST,
        variables: {
          input: {
            condition: 'openInterest',
          },
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        const symbolData = data?.getSymbolList?.list || []
        dispatch(
          setData({
            condition: 'openInterest',
            data: symbolData,
          }),
        )
      })
      .catch(() => {
        // Ignore refresh failures, continue using existing cache/data
      })
  }, [dispatch])

  useEffect(() => {
    const enableHourlyRefresh = options?.enableHourlyRefresh !== false
    if (!enableHourlyRefresh) {
      return
    }

    const ONE_HOUR_MS = 60 * 60 * 1000
    let cancelled = false

    const scheduleNext = () => {
      if (cancelled) {
        return
      }

      refreshTimerRef.current = setTimeout(() => {
        if (cancelled) {
          return
        }

        // Simultaneously refresh the trending topics configuration and the openInterest list.
        Promise.all([fetchHotSearchFromApi(), onRefreshOpenInterestList()]).finally(() => {
          scheduleNext()
        })
      }, ONE_HOUR_MS)
    }

    // Trigger once initially to avoid stale data on first entry; then refresh every hour
    Promise.all([fetchHotSearchFromApi(), onRefreshOpenInterestList()]).finally(() => {
      scheduleNext()
    })

    return () => {
      cancelled = true
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [fetchHotSearchFromApi, onRefreshOpenInterestList, options?.enableHourlyRefresh])

  const topSymbolByOpenInterest = useMemo(() => {
    if (!openInterestList?.length) {
      return ''
    }

    const sortedList = [...openInterestList].sort((a, b) => {
      const openInterestValueA = Number(a.openInterest || 0)
      const priceA = Number(a.currentPrice || 0)
      const usdValueA = openInterestValueA * priceA

      const openInterestValueB = Number(b.openInterest || 0)
      const priceB = Number(b.currentPrice || 0)
      const usdValueB = openInterestValueB * priceB

      return usdValueB - usdValueA
    })

    return sortedList[0]?.symbol || ''
  }, [openInterestList])

  const hotSymbol = useMemo(() => {
    // Prioritize using the trending search configured in the backend
    if (hotSymbolFromApi) {
      return hotSymbolFromApi
    }

    // Next, use the top openInterest symbol
    if (topSymbolByOpenInterest) {
      return topSymbolByOpenInterest
    }

    // Finally, use the fallback contract
    return options?.fallbackSymbol || ''
  }, [hotSymbolFromApi, topSymbolByOpenInterest, options?.fallbackSymbol])

  const hotSearchText = useMemo(() => {
    return token ? `🔥 ${token?.symbol}` : null
  }, [token])

  return {
    hotSymbol,
    hotSearchText,
    token,
    isLoading,
  }
}
