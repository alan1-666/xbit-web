import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchActiveSmartMoney, fetchFollowedSmartMoney } from '@/pages/smart-money-pc/Api/api'
import type { SmartMoneyResponse, Trader, SmartMoneySortField } from '@/types/hypertrader.types'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'

const isFullAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s)

export const useSmartMoneyInfinite = (opts: {
  address?: string
  periodDays?: number
  recentDays?: number
  pageSize?: number
  tagIds?: number[]
  sortBy?: SmartMoneySortField
}) => {
  const { address, periodDays = 3, recentDays = 1, pageSize = 100, tagIds, sortBy = 'NET_PNL' } = opts

  const activeWallet = useSelector(_activeWallet)
  const isConnected = activeWallet?.isConnected

  const normalizedAddress = (address ?? '').trim()
  const fullAddress = isFullAddress(normalizedAddress)

  const stableTagIds = useMemo(
    () => (tagIds?.length ? [...tagIds].filter(Number.isFinite).sort((a, b) => a - b) : []),
    [tagIds],
  )

  const query = useInfiniteQuery({
    queryKey: [
      isConnected ? 'smart-money-followed' : 'smart-money-active',
      periodDays,
      recentDays,
      pageSize,
      sortBy,
      fullAddress ? normalizedAddress : '',
      stableTagIds,
    ],

    initialPageParam: 1,

    queryFn: ({ pageParam }) => {
      const params = {
        periodDays,
        recentDays,
        page: pageParam ?? 1,
        pageSize,
        userAddress: fullAddress ? normalizedAddress : undefined,
        tagIds: stableTagIds.length ? stableTagIds : undefined,
        sortBy,
      }

      return isConnected ? fetchFollowedSmartMoney(params) : fetchActiveSmartMoney(params)
    },

    getNextPageParam: (last) => {
      const { page, total_pages } = last.pagination ?? { page: 1, total_pages: 1 }
      return page < total_pages ? page + 1 : undefined
    },

    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })

  const flat = useMemo(
    () => {
      return (query.data?.pages ?? []).flatMap((p: SmartMoneyResponse) => p.data ?? ([] as Trader[]))
    },
    [query.data?.pages],
  )

  // 非 fullAddress：前端 contains 兜底（只过滤已加载数据）
  const list = useMemo(() => {
    if (!normalizedAddress) return flat
    if (fullAddress) return flat // 后端已过滤，前端不重复过滤
    const key = normalizedAddress.toLowerCase()
    return flat.filter((t) =>
      String(t.user_address ?? '')
        .toLowerCase()
        .includes(key),
    )
  }, [flat, normalizedAddress, fullAddress])

  return { ...query, list, searchMode: fullAddress ? 'server_exact' : normalizedAddress ? 'client_contains' : 'none' }
}
