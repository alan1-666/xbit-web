import { useCallback, useEffect, useMemo, useRef } from 'react'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { setData } from '@/redux/modules/symbolList.slide'

type UseRecommendedContractsOptions = {
  /**
   * 是否开启每小时刷新 openInterest 列表（默认开启）
   */
  enableHourlyRefresh?: boolean
  /**
   * 返回的推荐合约数量（默认 8）
   */
  limit?: number
}

export const useRecommendedContracts = (options?: UseRecommendedContractsOptions) => {
  const dispatch = useAppDispatch()
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openInterestList = useAppSelector((state: RootState) => {
    return state.symbolListSlice.lists.openInterest
  })

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
        // 忽略刷新失败，继续使用现有缓存/已有数据
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

        onRefreshOpenInterestList().finally(() => {
          scheduleNext()
        })
      }, ONE_HOUR_MS)
    }

    // 先触发一次，避免首次进入时数据过旧；随后每小时刷新
    onRefreshOpenInterestList().finally(() => {
      scheduleNext()
    })

    return () => {
      cancelled = true
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [onRefreshOpenInterestList, options?.enableHourlyRefresh])

  const recommendedContracts = useMemo(() => {
    if (!openInterestList?.length) {
      return []
    }

    const limit = options?.limit || 8

    // 按持仓额 USD 价值排序
    const sortedList = [...openInterestList].sort((a, b) => {
      const openInterestValueA = Number(a.openInterest || 0)
      const priceA = Number(a.currentPrice || 0)
      const usdValueA = openInterestValueA * priceA

      const openInterestValueB = Number(b.openInterest || 0)
      const priceB = Number(b.currentPrice || 0)
      const usdValueB = openInterestValueB * priceB

      return usdValueB - usdValueA
    })

    return sortedList.slice(0, limit)
  }, [openInterestList, options?.limit])

  return {
    recommendedContracts,
    isLoading: !openInterestList?.length,
  }
}
