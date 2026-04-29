import React, { useRef, useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import useSWRMutation from 'swr/mutation'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { FiStar } from 'react-icons/fi'
import { useQueries, useQuery, keepPreviousData } from '@tanstack/react-query'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { ReactComponent as ShareIcon } from '@/components/icon/smart-money/share.svg'
import { ReactComponent as AiIcon } from '@/components/icon/smart-money/ai.svg'
import { ReactComponent as RightArrowIcon } from '@/components/icon/smart-money/right_arrow.svg'
import { ButtonGhost } from './components/ButtonGhost'
import { SmartButton } from './components/SmartButton'
import { fetchHyperliquidData } from './Api/hyperliquid'
import { fetchMetrics30d, fetchSmartMoneyAnalysis, fetchSmartMoneyRoi } from './Api/api'
import { PositionsTabs } from './components/PositionsTabs'
import { ProfitTrendChart } from './components/Chart/ProfitTrendChart'
import { LeverageUsagePieChart } from './components/Chart/LeverageUsagePieChart'
import { AIDialog } from './components/AIDialog'
import { FavoriteMultiGroupPopover } from './components/FavoriteGroups/FavoriteMultiGroupPopover'
import {
  formatCurrency,
  computePositionsStats,
  computePositionDistribution,
  calcDirectionBias,
  computeProfitRatios,
  type Resp,
} from '@/utils/address'
import {
  usePositionsActions,
  mapOpenOrders,
  mapTrades,
  mapFunding,
  mapOrderHistory,
  mapTwap,
  mapAccountHistory,
} from './store/usePositionsStore'
import { toast } from 'sonner'
import { useGetUserPositionHoldingTime } from '@/hooks/useGetUserPositionHoldingTime'
import { useGetTradingSession } from '@/hooks/useGetTradingSession'
import { TradingSessionRadarChart } from './components/Chart/TradingSessionRadarChart'
import { HoldingTimePie } from './components/Chart/HoldingTimePie'
import type { TradingSessionTab } from '@/services/hypertrader.service'
import { useTraderTagsByAddress } from '@/hooks/useTraderTagsByAddress'
import { useAnalyzeSmartMoneyStrategy } from '@/hooks/useAnalyzeSmartMoneyStrategy'
import { useLangKey } from '@/utils/address'
import { Loading } from '@components/common/Loading.tsx'
import {
  getLeverageBuckets,
  LeverageBucketRow,
  getChartTabMapping,
  TAG_COLOR_CLASS,
  GuardArgs,
  SmartMoneyAnalyzeResp,
} from './types'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { useBatchCreateAddresses } from '@/hooks/useBatchCreateAddresses'
import { useGetFollowerCount } from '@/hooks/useGetFollowerCount'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { useGetFlowAddressOnGroup } from '@/hooks/useGetFlowAddressOnGroup'
import { useSmartMoneyAIConclusion } from '@/hooks/useSmartMoneyAIConclusion'
import { useSmartMoneyDeepAnalysis } from '@/hooks/useSmartMoneyDeepAnalysis'
import { EditableAddressLabel } from '@/components/EditableAddressLabel'
import { useGetAddress } from '@/hooks/useGetAddress'
import { useUpdateAddress } from '@/hooks/useUpdateAddress'
import { getErrorMessage } from '@/utils/smart-money'
import FavoriteMultiGroupDrawer from './components/FavoriteGroups/FavoriteMultiGroupDrawer'
import AICard from './components/mobile/AICard'
import { cn, MathFun } from '@/lib/utils'
import { useSmartMoneyRoi } from '@/hooks/useSmartMoneyRoi'
import { fmt } from '@/utils/numbers'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'
import { useFetchMetrics30d } from './hooks'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

const Tag = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="grid place-items-center rounded-full bg-[#2A283B] px-2.5 py-1 text-xs text-[#D6A3FF]">
      {children}
    </span>
  )
}

export type AddressGroupInput = {
  id: string
  name: string
  isDefault: boolean
}

const AddressDetail = () => {
  const { isDesktop } = useResponsive()
  const { address } = useParams<{ address: string }>()
  const userId = useSelector(_userInfo)?.userId
  const qc = useQueryClient()
  const { t } = useTranslation()
  const [activeChartTab, setActiveChartTab] = useState<string>('profitTrend')
  const [AIDialogVisible, setAIDialogVisible] = useState<boolean>(false)
  const [shouldFetchAI, setShouldFetchAI] = useState(false)
  const shouldFetch = shouldFetchAI && !!address
  const [tradingTab, setTradingTab] = useState<TradingSessionTab>('ALL')
  const [isPnL, setIsPnL] = useState<boolean>(true)
  const userAddress = address ?? ''
  const lang = useLangKey()
  const navigate = useNavigate()
  const location = useLocation()
  
  const activeWallet = useSelector(_activeWallet)

  const { periodDays, seletecteType, tagIds } = location.state || {}

  // 收藏分组相关状态
  const commitMode = 'onClose'
  const [openGroup, setOpenGroup] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  // const initialGroups = [] as AddressGroupInput[]
  // const initialFavorited = false
  const [selectedGroups, setSelectedGroups] = useState<AddressGroupInput[]>([])
  const [isFavorited, setIsFavorited] = useState(false)
  const pendingRef = useRef<AddressGroupInput[]>(selectedGroups)
  const lastCommittedRef = useRef<AddressGroupInput[]>(selectedGroups)
  const selectedGroupsRef = useRef<AddressGroupInput[]>(selectedGroups)

  // Provider
  const { groupList, createAndSelectGroup } = useAddressGroups()
  const { batchCreateAddresses } = useBatchCreateAddresses()
  const {
    remarkName,
    loading: currentAddressLoading,
    error: currentAddressError,
    refetch: refetchCurrentAddress,
  } = useGetAddress({ address: userAddress, enabled: true })

  const { updateAddress, loading: saving } = useUpdateAddress()

  const debounceTimerRef = useRef<number | null>(null)

  const LEVERAGE_BUCKETS = useMemo(() => getLeverageBuckets(t), [t])
  const ChartTabMapping = useMemo(() => getChartTabMapping(t), [t])

  const display = useMemo(() => {
    return {
      address: userAddress,
      remarkName: remarkName ?? null,
    }
  }, [userAddress, remarkName])

  useEffect(() => {
    selectedGroupsRef.current = selectedGroups
  }, [selectedGroups])

  const { data: initialSelectedGroups, loading: initGroupLoading } = useGetFlowAddressOnGroup({
    flowAddress: userAddress,
    enabled: !!userAddress,
  })

  const initSelectedKey = useMemo(() => {
    return (initialSelectedGroups ?? [])
      .map((g) => String(g.id))
      .sort()
      .join(',')
  }, [initialSelectedGroups])

  useEffect(() => {
    const normalized = (initialSelectedGroups ?? []).map((g) => ({
      id: String(g.id),
      name: g.name,
      isDefault: !!g.isDefault,
    }))

    // 只有当 key 真的变化才同步（避免重复 setState）
    const nextKey = normalized
      .map((g) => g.id)
      .sort()
      .join(',')
    const prevKey = lastCommittedRef.current
      .map((g) => g.id)
      .sort()
      .join(',')
    if (nextKey === prevKey) return

    setSelectedGroups(normalized)
    setIsFavorited(normalized.length > 0)
    pendingRef.current = normalized
    lastCommittedRef.current = normalized
  }, [initSelectedKey])

  // 工具：去重 + 稳定化
  const normalize = (arr: string[]) => Array.from(new Set(arr.map(String)))

  // 批量提交更新分组
  // const onUpdateFavoriteGroups = async ({ id: userAddress, groupIds }: { id: string; groupIds: string[] }) => {
  //   if (!userId) return
  //   await batchCreateAddresses({
  //     addressId: userAddress,
  //     groupIds,
  //   })
  // }

  const {data: metrics, loading, error} = useFetchMetrics30d(address)

  const normalizeGroups = (arr: AddressGroupInput[]) => {
    const map = new Map<string, AddressGroupInput>()
    for (const g of arr) {
      const id = String(g?.id ?? '')
      if (!id) continue
      map.set(id, { id, name: g.name ?? '', isDefault: !!g.isDefault })
    }
    return Array.from(map.values())
  }

  const commit = async (groups: AddressGroupInput[]) => {
    if (!userAddress) {
      return console.error('No user address to commit groups!')
    }

    const normalized = normalizeGroups(groups)
    const groupIds = normalized.map((g) => String(g.id)).filter(Boolean)
    const params = {
      input: {
        addresses: [
          {
            address: userAddress,
            groupIds,
          },
        ],
      },
    }
    try {
      await batchCreateAddresses(params)
      lastCommittedRef.current = normalized
    } catch (e) {
      const rollback = lastCommittedRef.current
      setSelectedGroups(rollback)
      setIsFavorited(rollback.length > 0)
      pendingRef.current = rollback
      console.error(e)
    }
  }

  const handleCreate = async (name: string) => {
    try {
      const created = await createAndSelectGroup(name, { isDefault: false })

      if (!created?.id) {
        toast.error(t('smartMoney.createGroupFailed'))
        return
      }

      const newGroup: AddressGroupInput = {
        id: String(created.id),
        name: created.name ?? name,
        isDefault: false,
      }

      setSelectedGroups((prev) => {
        const next = normalizeGroups([...prev, newGroup])
        setIsFavorited(next.length > 0)
        pendingRef.current = next
        return next
      })
    } catch (err: any) {
      const msg = getErrorMessage(err, '创建分组失败')
      toast.error(msg)
      console.error('createAndSelectGroup failed:', err)
    }
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current)
    }
  }, [])

  // 点击收藏
  const onTogglePopover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    // setGroupAnchorEl(e.currentTarget)
    setOpenGroup((v) => !v)
  }

  const {
    trigger,
    data: AIData,
    isMutating: isAILoading,
    error: onAIError,
  } = useSWRMutation('/api/v1/smart-money/analyze', fetchSmartMoneyAnalysis)

  const {
    data: AIConclusionResp,
    loading: isAIConclusionLoading,
    error: isAIConclusionError,
  } = useSmartMoneyAIConclusion({
    address,
    analysisDays: 7,
    enabled: !!address,
  })

  // const { data: AIData, isLoading: isAILoading, error: onAIError } = useSWR(
  //   shouldFetch ? `/api/v1/smart-money/analyze/${address}` : null,
  //   () => fetchSmartMoneyAnalysis(address),
  // )

  const followerQ = useGetFollowerCount({ userAddress: address, skipCondition: !userAddress })
  const followerCount = followerQ.data?.count ?? 0

  const {
    reset,
    setPositionsFromClearinghouse,
    setAccountFromClearinghouse,
    setOpenOrders,
    setTrades,
    setFunding,
    setOrderHistory,
    setTwap,
    setAccountHistory,
  } = usePositionsActions()

  useEffect(() => {
    if (address) reset()
  }, [address, reset])

  const ChartTab = () =>
    ChartTabMapping.map((item) => (
      <button
        key={item.key}
        onClick={() => setActiveChartTab(item.key)}
        className={clsx(
          'h-8 rounded-lg px-3 py-1.5 text-sm',
          activeChartTab === item.key
            ? 'bg-[#472468] text-[#C8A7FD]'
            : 'bg-[#201E27] text-[#908E9A] hover:text-[#C8A7FD]',
        )}
      >
        {t(item.label)}
      </button>
    ))

  const chQ = useQuery({
    queryKey: ['hl', 'clearinghouseState', address],
    queryFn: () => fetchHyperliquidData(address!, 'clearinghouseState', undefined, { toastOnError: true }),
    enabled: !!userAddress,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (chQ.data) {
      setPositionsFromClearinghouse(chQ.data)
      setAccountFromClearinghouse(chQ.data)
    }
  }, [chQ.data, setPositionsFromClearinghouse, setAccountFromClearinghouse])

  const clearinghouseData = chQ.data as Resp | {}

  const { contractAccountValue, marginUsageRate, assetPositions, leverageBuckets, avgLeverage } = useMemo(() => {
    const raw = chQ.data as any | undefined

    if (!raw) {
      return {
        contractAccountValue: 0,
        marginUsageRate: 0,
        assetPositions: [] as any[],
        leverageBuckets: [] as LeverageBucketRow[],
        avgLeverage: 0,
      }
    }

    const crossAccountValue = Number(raw?.crossMarginSummary?.accountValue ?? 0)
    const marginAccountValue = Number(raw?.marginSummary?.accountValue ?? 0)
    const totalMarginUsed = Number(raw?.marginSummary?.totalMarginUsed ?? 0)
    const withdrawable = Number(raw?.withdrawable ?? 0)

    const rate = marginAccountValue > 0 ? (totalMarginUsed / marginAccountValue) * 100 : 0

    const assetPositions = Array.isArray(raw?.assetPositions) ? raw.assetPositions : []

    // 取每个持仓的 leverage 倍数（按 “持仓数” 统计分布）
    const leverages: number[] = assetPositions
      .map((ap: any) => Number(ap?.position?.leverage?.value ?? 0))
      .filter((n: number) => Number.isFinite(n) && n > 0)

    const avgLeverage = leverages.length > 0 ? leverages.reduce((a, b) => a + b, 0) / leverages.length : 0

    // 分桶统计（count = 持仓数）
    const map = new Map<string, LeverageBucketRow>()
    for (const b of LEVERAGE_BUCKETS) {
      map.set(b.key, { key: b.key, name: b.label, color: b.color, risk: b.risk, count: 0 })
    }

    for (const lv of leverages) {
      const bucket =
        LEVERAGE_BUCKETS.find((b) => lv >= b.from && lv < b.to) ?? LEVERAGE_BUCKETS[LEVERAGE_BUCKETS.length - 1]
      const row = map.get(bucket.key)!
      row.count += 1
    }

    const leverageBuckets = Array.from(map.values()).filter((x) => x.count > 0)

    return {
      contractAccountValue: marginAccountValue,
      marginUsageRate: rate,
      assetPositions,
      leverageBuckets,
      avgLeverage,
    }
  }, [chQ.data])

  const { isLoading: chLoading, error: chError } = chQ

  const openOrdersQ = useQuery({
    queryKey: ['hl', 'frontendOpenOrders', address],
    queryFn: () => fetchHyperliquidData(address!, 'frontendOpenOrders'),
    enabled: !!address,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    openOrdersQ.data && setOpenOrders(mapOpenOrders(openOrdersQ.data))
  }, [openOrdersQ.data, setOpenOrders])

  const twapOrdersQ = useQuery({
    queryKey: ['hl', 'userTwapSliceFills', address],
    queryFn: () => fetchHyperliquidData(address!, 'userTwapSliceFills'),
    enabled: !!address,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    twapOrdersQ.data && setTwap(mapTwap(twapOrdersQ.data))
  }, [twapOrdersQ.data, setTwap])

  const tradesOrdersQ = useQuery({
    queryKey: ['hl', 'userFills', address],
    queryFn: () => fetchHyperliquidData(address!, 'userFills', { aggregateByTime: true }),
    enabled: !!address,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    tradesOrdersQ.data && setTrades(mapTrades(tradesOrdersQ.data))
  }, [tradesOrdersQ.data, setTrades])

  const fundingOrdersQ = useQuery({
    queryKey: ['hl', 'userFunding', address],
    queryFn: () => fetchHyperliquidData(address!, 'userFunding', { startTime: 1704038400 }), // 2024/01/01 0:00:00 GMT+0
    enabled: !!address,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    fundingOrdersQ.data && setFunding(mapFunding(fundingOrdersQ.data))
  }, [fundingOrdersQ.data, setFunding])

  const orderHistoryQ = useQuery({
    queryKey: ['hl', 'historicalOrders', address],
    queryFn: () => fetchHyperliquidData(address!, 'historicalOrders'),
    enabled: !!address,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    orderHistoryQ.data && setOrderHistory(mapOrderHistory(orderHistoryQ.data))
  }, [orderHistoryQ.data, setOrderHistory])

  const accountHistoryQ = useQuery({
    queryKey: ['hl', 'userNonFundingLedgerUpdates', address],
    queryFn: () => fetchHyperliquidData(address!, 'userNonFundingLedgerUpdates', { startTime: 1735660800 }), // 2025/01/01 0:00:00 GMT+0
    enabled: !!address,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    accountHistoryQ.data && setAccountHistory(mapAccountHistory(accountHistoryQ.data))
  }, [accountHistoryQ.data, setAccountHistory])

  const perfQ = useQuery({
    queryKey: ['hl', 'portfolio', address],
    queryFn: () => fetchHyperliquidData(address!, 'portfolio'),
    enabled: !!address,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  const perfData = perfQ.data

  const stats = useMemo(
    () => (clearinghouseData ? computePositionsStats(clearinghouseData) : null),
    [clearinghouseData],
  )
  const dist = useMemo(() => (stats ? computePositionDistribution(stats) : []), [stats])
  const bias = useMemo(() => (stats ? calcDirectionBias(stats) : null), [stats])

  // 未实现盈亏 + ROE + ROI
  const pnl = useMemo(() => (stats ? computeProfitRatios(stats) : null), [stats])

  const formatCompactUSD = (v: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(v || 0)

  const { longPct, shortPct, longAbsUSD, shortAbsUSD, totalAbsUSD } = bias || { longPct: 0, shortPct: 0 }
  const longText = longAbsUSD ? formatCompactUSD(longAbsUSD) : '$0'
  const shortText = shortAbsUSD ? formatCompactUSD(shortAbsUSD) : '$0'

  const {
    data: holdingRows,
    loading: holdingLoading,
    error: holdingError,
  } = useGetUserPositionHoldingTime({
    userAddress,
    skipCondition: !userAddress,
  })

  const {
    data: tradingData,
    loading: tradingLoading,
    error: tradingError,
  } = useGetTradingSession({
    userAddress: userAddress,
    tab: tradingTab,
    enabled: !!userAddress,
  })

  const ChartLoading = () => (
    <div className="grid h-full w-full place-items-center">
      <Loading className="size-20" />
    </div>
  )

  const ChartError = (msg = 'Request failed') => (
    <div className="grid h-full w-full place-items-center text-sm text-[#E64C68]">{msg}</div>
  )

  const guard = ({ loading, error, hasData, children }: GuardArgs) => {
    if (loading) return <ChartLoading />
    if (error) return ChartError()
    if (!hasData) return <EmptyList />
    return <>{children}</>
  }

  const renderChart = (key: string) => {
    switch (key) {
      case 'profitTrend': {
        return guard({
          loading: perfQ.isLoading,
          error: perfQ.error,
          hasData: !!perfData,
          children: <ProfitTrendChart rawData={perfData} />,
        })
      }

      case 'holdingTime': {
        return guard({
          loading: holdingLoading,
          error: holdingError,
          hasData: Array.isArray(holdingRows) && holdingRows.length > 0,
          children: <HoldingTimePie rows={holdingRows} />,
        })
      }

      // case 'holdingTime': {
      //   return guard({
      //     loading: holdingLoading,
      //     error: holdingError,
      //     hasData: !!holdingRows?.length,
      //     children: <HoldingTimeChart rows={holdingRows} />,
      //   })
      // }

      case 'leverageUsage': {
        if (chLoading) {
          return (
            <div className="grid h-full w-full place-items-center">
              <Loading className="size-20" />
            </div>
          )
        }
        if (chError) return <div className="p-4 text-[#E64C68]">Request failed</div>
        if (!leverageBuckets?.length) return <EmptyList />

        return <LeverageUsagePieChart data={leverageBuckets} avgLeverage={avgLeverage} />
      }

      case 'tradingSession': {
        return guard({
          loading: tradingLoading,
          error: tradingError,
          hasData: Array.isArray(tradingData) ? tradingData.length > 0 : !!tradingData,
          children: (
            <TradingSessionRadarChart data={tradingData} loading={false} tab={tradingTab} onTabChange={setTradingTab} />
          ),
        })
      }

      default:
        return null
    }
  }

  const tagsQ = useTraderTagsByAddress({ userAddress, enabled: !!userAddress })
  const strategyQ = useAnalyzeSmartMoneyStrategy({ userAddress, enabled: !!userAddress })

  if (tagsQ.isLoading || strategyQ.isLoading) {
    console.warn('Loading TraderTags...')
  }

  if (tagsQ.isError || strategyQ.isError) {
    console.error('Error loading TraderTags')
  }

  const tags = tagsQ.data ?? []
  const strategy = strategyQ.data
  const strategyResult = lang === 'cn' ? strategy?.strategyCn : strategy?.strategyEn

  const onAIBtnClick = () => {
    // setShouldFetchAI(true)

    if (!address) return
    setAIDialogVisible(true)
    trigger(address)
  }

  const deepAnalysisQ = useSmartMoneyDeepAnalysis({
    address,
    analysisDays: 7,
    language: lang,
    enabled: AIDialogVisible && !!address,
  })

  const { data: ROIData, isLoading: isROILoading, refetch, isFetching } = useSmartMoneyRoi(address)
  const roiData = ROIData?.roi ?? 0

  const copy = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      toast.success(t('toast.copiedSuccess'))
    } catch {
      // 兼容老浏览器
      const ta = document.createElement('textarea')
      ta.value = address
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      toast.success(t('toast.copiedSuccess'))
    }
  }

  const onDrawerClose = async (groups: AddressGroupInput[], isFavorited: boolean) => {
    if (isDesktop) commit(groups)
    setIsFavorited(isFavorited)
    await followerQ.refetch()
  }

  const onPopoverClose = async () => {
    setOpenGroup(false)
    const latest = selectedGroupsRef.current

    try {
      await commit(latest)
      await followerQ.refetch()
    } catch (e) {
      console.error(e)
      const rollback = lastCommittedRef.current
      setSelectedGroups(rollback)
      setIsFavorited(rollback.length > 0)
      pendingRef.current = rollback
      console.error(e)
    }
  }

  const onPopoverChange = (nextIds: string[]) => {
    const idSet = new Set(nextIds.map(String))

    const nextGroups: AddressGroupInput[] = (groupList ?? [])
      .filter((g: any) => idSet.has(String(g.value ?? g.id ?? '')))
      .map((g: any) => ({
        id: String(g.value ?? g.id ?? ''),
        name: g.label ?? g.name ?? '',
        isDefault: !!g.isDefault,
      }))

    console.log('Next selected groups:', nextGroups)

    const normalized = normalizeGroups(nextGroups)
    console.log('Normalized selected groups:', normalized)

    setSelectedGroups(normalized)
    setIsFavorited(normalized.length > 0)
    pendingRef.current = normalized
  }

  const onSaveRemark = async (nextText: string) => {
    if (!userAddress) return

    try {
      await updateAddress({
        address: userAddress,
        remarkName: nextText.trim() || null,
      })

      toast.success(t('notice.confirmSaved'))
      await refetchCurrentAddress(userAddress)
    } catch (e) {
      const msg = getErrorMessage(e, t('toast.saveFailed'))
      console.error(msg)
    }
  }

  const renderStrategyText = () => {
    if (isAIConclusionLoading) {
      return (
        <div className="flex items-center justify-center py-6 h-12">
          <Loading className="size-16" />
        </div>
      )
    }

    if (isAIConclusionError) {
      return <div className="flex items-center justify-center py-4 text-sm text-[#E64C68]">AI 总结生成失败</div>
    }

    if (!AIConclusionResp?.success || !AIConclusionResp?.data) {
      return <EmptyList />
    }

    const text = lang === 'cn' ? AIConclusionResp?.data?.strategy_cn : AIConclusionResp?.data?.strategy_en

    if (!text?.trim()) {
      return <EmptyList />
    }

    return <div className="leading-6 whitespace-pre-line text-white/80">{text}</div>
  }

  const renderSummary = () => {
    return (
      <>
        <div className={cn('w-full rounded-xl border-white/5 backdrop-blur', isDesktop ? 'bg-[#121319]' : '')}>
          <div className="mx-auto flex w-full items-center justify-between p-5">
            <div className="flex items-center gap-3">
              {isDesktop && (
                <div className="flex items-center gap-3">
                  <WalletAvatar
                    data-avatar-type="wallet"
                    address={address}
                    className="block h-12 w-12 object-cover select-none"
                  />
                  <EditableAddressLabel
                    address={display.address}
                    remarkName={display.remarkName}
                    onCopy={copy}
                    onSave={onSaveRemark}
                    needToast={!isFavorited}
                  />

                  {/* tags */}
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => {
                      const colorCls = TAG_COLOR_CLASS[t.color ?? ''] ?? TAG_COLOR_CLASS.gray

                      return (
                        <span
                          key={`${t.category}-${t.name}`}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${colorCls}`}
                          title={t.description ?? ''}
                        >
                          {lang === 'cn' ? t.nameCn : t.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {!isDesktop && (
                <div className="flex items-center gap-3">
                  <WalletAvatar
                    rounded={false}
                    data-avatar-type="wallet"
                    address={address}
                    className="block h-12 w-12 object-cover select-none rounded-[8px]"
                  />
                  <div className="inline-flex flex-col justify-center items-start gap-1.5">
                    <div className="inline-flex justify-start items-center gap-1.5">
                      <div className="flex justify-center items-center gap-2.5">
                        <EditableAddressLabel
                          address={display.address}
                          remarkName={display.remarkName}
                          onCopy={copy}
                          onSave={onSaveRemark}
                          needToast={!isFavorited}
                        />
                      </div>
                    </div>
                    <div className="inline-flex justify-start items-start gap-2">
                      {tags.map((t) => {
                        const colorCls = TAG_COLOR_CLASS[t.color ?? ''] ?? TAG_COLOR_CLASS.gray

                        return t.category ? (
                          <div
                            className="px-2 py-1 bg-[#212127] rounded-full flex justify-center items-center"
                            key={`${t.category}-${t.name}`}
                          >
                            <div
                              className={cn(
                                "text-center justify-center text-[9px] font-normal font-['Geist'] leading-[10px]",
                                colorCls,
                              )}
                            >
                              {lang === 'cn' ? t.nameCn : t.name}
                            </div>
                          </div>
                        ) : (
                          <span></span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <>
                {isDesktop && (
                  <>
                    <ButtonGhost
                      ref={btnRef}
                      icon={
                        <FiStar
                          size={16}
                          className={isFavorited ? 'text-[#FBFBFB]' : ''}
                          fill={isFavorited ? 'currentColor' : 'none'}
                        />
                      }
                      label={followerCount > 0 ? followerCount.toString() : '0'}
                      onClick={onTogglePopover}
                    />
                    <FavoriteMultiGroupPopover
                      open={openGroup}
                      anchorEl={btnRef.current}
                      groupList={groupList}
                      selectedValues={selectedGroups.map((g) => String(g.id ?? ''))}
                      onChange={onPopoverChange}
                      onCreate={handleCreate}
                      onClose={onPopoverClose}
                      width={400}
                    />
                  </>
                )}
                {!isDesktop && (
                  <FavoriteMultiGroupDrawer
                    followerCount={followerCount}
                    initialSelectedGroups={initialSelectedGroups}
                    address={userAddress}
                    onChange={onDrawerClose}
                  />
                )}
              </>
              {isDesktop && <ButtonGhost icon={<ShareIcon className="h-5 w-5" />} />}
            </div>
          </div>
          {/* AI 总结卡片 */}
          <div className="mt-4 pb-4">
            {isDesktop && (
              <div className="flex items-center justify-between px-5">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <AiIcon className="h-3.5 w-5 text-[#C8A7FD]" />
                    <span className="text-lg text-[#C8A7FD]">{t('smartMoney.addressDetail.AISummary')}</span>
                  </div>
                  <div className="text-sm leading-6 text-white/80">{renderStrategyText()}</div>
                </div>
                <div className="group relative inline-block h-9 w-68 text-right">
                  <SmartButton
                    leftIcon={<AiIcon className="h-3 w-4 text-[#C8A7FD]" />}
                    rightIcon={<RightArrowIcon className="h-4 w-4" />}
                    onClick={() => onAIBtnClick()}
                  >
                    {t('smartMoney.addressDetail.AIInDepthStrategy')}
                  </SmartButton>
                </div>
              </div>
            )}

            {!isDesktop && (
              <div className="px-3">
                <AICard summary={renderStrategyText()} address={userAddress} />
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  const renderAccountValue = () => {
    return (
      <>
        <div className="text-sm text-white/60">{t('smartMoney.addressDetail.contractAccountValue')}</div>
        {chError ? (
          <div className="p-4 text-[#E64C68]">Error: {(chError as any)?.message ?? 'Request failed'}</div>
        ) : null}
        {chLoading ? (
          <div className="grid h-10 w-full place-items-center">
            <Loading className="size-10" />
          </div>
        ) : (
          <div className="text-2xl font-semibold tracking-wide sm:text-xl">
            {contractAccountValue ? formatCurrency(contractAccountValue) : '--'}
          </div>
        )}

        <div className={cn(!isDesktop ? 'w-full p-3 mt-3 rounded-lg bg-[#18181B]' : '')}>
          <div className="mt-5 flex items-end gap-2">
            <div className="mb-1 text-xs text-white/40">{t('smartMoney.addressDetail.marginUsageRatio')}</div>
            <div className="mb-1 text-xs text-white/80">{marginUsageRate.toFixed(2)}%</div>
          </div>

          {/* Progress */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#6F3FF5]" style={{ width: `${marginUsageRate}%` }} />
          </div>
        </div>

        {/* 方向偏差 */}
        <div className={cn(!isDesktop ? 'w-full p-3 mt-3 rounded-lg bg-[#18181B]' : 'mt-5')}>
          <div className="text-sm text-white/60">{t('smartMoney.addressDetail.directionalBias')}</div>
          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="absolute top-0 left-0 h-full bg-[#12C48B]" style={{ width: `${longPct}%` }} />
            <div className="absolute top-0 right-0 h-full bg-[#E64C68]" style={{ width: `${shortPct}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <div className="text-[#12C48B]">
              {/* <span className="font-medium pr-1">Long</span> */}
              {longPct}%
            </div>
            <div className="text-[#E64C68]">
              {shortPct}%{/* <span className="font-medium pl-1">Short</span> */}
            </div>
          </div>
        </div>

        {/* 仓位分布 */}
        <div className={cn(!isDesktop ? 'w-full p-3 mt-3 rounded-lg bg-[#18181B]' : 'mt-5')}>
          <div className="text-sm text-white/60">{t('smartMoney.addressDetail.positionDistribution')}</div>

          {/* 进度条 */}
          <div className="relative mt-2 flex h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#12C48B]"
              style={{ width: `${Math.max(0, Math.min(100, +longPct.toFixed(2)))}%` }}
            />
            <div
              className="h-full bg-[#E64C68]"
              style={{ width: `${Math.max(0, Math.min(100, +shortPct.toFixed(2)))}%` }}
            />
          </div>

          {/* 数值 */}
          <div className="mt-1 flex items-center justify-between text-xs">
            <div className="text-[#12C48B]">{longText}</div>
            <div className="text-[#E64C68]">{shortText}</div>
          </div>
        </div>

        {/* 未实现盈亏 */}
        <div className={cn(!isDesktop ? 'w-full py-3 mt-3' : 'mt-5')}>
          <div className="flex justify-between">
            <div className="text-sm text-white/60">{t('smartMoney.addressDetail.unrealizedPnl')}</div>
            <div className={`text-xs text-[${pnl?.unrealizedPnl < 0 ? '#E64C68' : '#12C48B'}]`}>
              {fmt.pct(roiData)} ROI
            </div>
            {/* <div className="text-[#E64C68] text-xs">{pnl?.roe || 0} % ROE</div> */}
          </div>
          <div className={`mt-1 font-semibold text-[${pnl?.unrealizedPnl < 0 ? '#E64C68' : '#12C48B'}]`}>
            {pnl?.unrealizedPnl ? formatCurrency(pnl?.unrealizedPnl) : '$0'}
          </div>
        </div>
      </>
    )
  }

  const renderCharts = () => {
    return (
      <>
        <div className="w-full px-3 py-4">
          <div className={cn(isDesktop ? 'inline-block' : 'grid grid-cols-4 gap-1', 'rounded-lg bg-[#201E27] p-1')}>
            <ChartTab />
          </div>
        </div>

        {/* Chart 区域 */}
        <div className="px-3 pb-2">
          <div className="h-[360px] overflow-visible rounded-b-xl">{renderChart(activeChartTab)}</div>
        </div>
      </>
    )
  }

  const renderPositions = () => {
    return <PositionsTabs address={address ?? ''} />
  }

  const renderDesktop = () => {
    return (
      <div className="w-full bg-[#0A0A0A] p-5 text-white">
        {/* 顶部导航 */}

        {renderSummary()}

        {/* 页面主体 */}
        <div className="mx-auto w-full pb-16">
          {/* 上半区：左侧资产卡 + 右侧图表卡 */}
          <div className="mt-5 flex gap-4">
            {/* 左：资产面板 */}
            <div className="w-[320px] rounded-xl border border-white/10 bg-[#121319] p-5">{renderAccountValue()}</div>

            {/* 右：图表卡片 */}
            <div className="flex-1 rounded-xl border border-white/10 bg-[#121319]">{renderCharts()}</div>
          </div>

          {/* 下半区：表格卡片 */}
          <div className="mt-4 rounded-xl border border-white/10 bg-[#121319]">
            {/* <PositionsTabs address={address ?? ''} /> */}
            {renderPositions()}
          </div>
        </div>

        {AIDialogVisible ? (
          <AIDialog
            open={AIDialogVisible}
            loading={deepAnalysisQ.isLoading}
            error={deepAnalysisQ.error}
            data={deepAnalysisQ.data}
            onOpenChange={setAIDialogVisible}
          />
        ) : null}
      </div>
    )
  }

  const renderMobile = () => {
    const totalPnl30d = metrics ? `${formatCurrency(metrics.totalPnl30d)} (${metrics.roe30d.toFixed(2)}%)` : '-'

    return (
      <div className="h-[100vh] flex flex-col">
        <div className="sticky top-0 z-50 bg-[#0A0A0A]">
          <div className="w-full h-11 px-3 relative flex items-center">
            <button className="absolute left-3" 
              onClick={() => {
                navigate('/futures/smart-money', {
                  state: {
                    periodDays,
                    seletecteType,
                    tagIds
                  }
                })

              }}
            >
              <img src="/images/smart-money/back.svg" />
            </button>

            <div className="mx-auto text-white text-lg font-medium">{t('header.smart-money')}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-3">
          <div className={cn('w-full rounded-xl border-white/5 backdrop-blur')}>
            <div className="mx-auto flex w-full items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <WalletAvatar
                    rounded={false}
                    data-avatar-type="wallet"
                    address={address}
                    className="block h-12 w-12 object-cover select-none rounded-[8px]"
                  />
                  <div className="inline-flex flex-col justify-center items-start gap-1.5">
                    <div className="inline-flex justify-start items-center gap-1.5">
                      <div className="flex justify-center items-center gap-2.5">
                        <EditableAddressLabel
                          address={display.address}
                          remarkName={display.remarkName}
                          onCopy={copy}
                          onSave={onSaveRemark}
                          needToast={!isFavorited}
                        />
                      </div>
                    </div>
                    <div className="inline-flex justify-start items-start gap-2">
                      {tags.map((t) => {
                        const colorCls = TAG_COLOR_CLASS[t.color ?? ''] ?? TAG_COLOR_CLASS.gray

                        return t.category ? (
                          <div
                            className="px-2 py-1 bg-[#212127] rounded-full flex justify-center items-center"
                            key={`${t.category}-${t.name}`}
                          >
                            <div
                              className={cn(
                                "text-center justify-center text-[9px] font-normal font-['Geist'] leading-[10px]",
                                colorCls,
                              )}
                            >
                              {lang === 'cn' ? t.nameCn : t.name}
                            </div>
                          </div>
                        ) : (
                          <span></span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {activeWallet.isConnected && <div className="flex items-center gap-3">
                <>
                  <FavoriteMultiGroupDrawer
                    followerCount={followerCount}
                    initialSelectedGroups={initialSelectedGroups}
                    address={userAddress}
                    onChange={onDrawerClose}
                    showCount={false}
                    filledColor="#AB70FF"
                  />
                </>
              </div>}
            </div>

            <div className="px-3">
              <div className="w-full p-1 rounded-lg inline-flex flex-col justify-start items-center overflow-hidden border">
                <div className="self-stretch px-3 py-2 flex flex-col justify-start items-start">
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className=" justify-start text-white text-sm font-normal font-['Geist'] leading-4">
                      {t('smartMoney.accountAssets')}
                    </div>
                    <div className="p-0.5 rounded-md  flex justify-start items-center gap-0.5 border">
                      <button
                        className={cn(
                          'h-6 px-3 py-1 rounded-md flex justify-center items-center',
                          isPnL ? 'bg-white' : '',
                        )}
                        onClick={() => setIsPnL(true)}
                      >
                        <div
                          className={cn(
                            "text-center justify-center text-xs font-medium font-['Geist'] leading-5",
                            isPnL ? 'text-[#0A0A0A]' : 'text-[#908E98]',
                          )}
                        >
                          PnL
                        </div>
                      </button>
                      <button
                        className={cn(
                          'h-6 px-3 py-1 rounded-md flex justify-center items-center',
                          !isPnL ? 'bg-white' : '',
                        )}
                        onClick={() => setIsPnL(false)}
                      >
                        <div
                          className={cn(
                            "text-center justify-center text-xs font-normal font-['Geist'] leading-5",
                            !isPnL ? 'text-[#0A0A0A]' : 'text-[#908E98]',
                          )}
                        >
                          {t('smartMoney.aiAnalysis')}
                        </div>
                      </button>
                    </div>
                  </div>

                  {isPnL && (
                    <div className='w-full'>
                      <div className="justify-start text-white text-xl font-semibold font-['Geist'] leading-7">
                        {contractAccountValue ? formatCurrency(contractAccountValue) : '--'}
                      </div>
                      <div className="w-full rounded-lg">
                        <div className="mt-5 flex items-end justify-between gap-2">
                          <div className="mb-1 text-xs text-white/40">
                            {t('smartMoney.addressDetail.marginUsageRatio')}
                          </div>
                          <div className="mb-1 text-xs text-white/80 font-['Geist']">{marginUsageRate.toFixed(2)}%</div>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-[#6F3FF5]" style={{ width: `${marginUsageRate}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="w-full py-2 inline-flex justify-between items-center overflow-hidden">
                          <div className="text-center justify-start text-[#908E98] text-xs font-normal font-['Geist'] leading-3">
                            {t('smartMoney.pnl30dTotal')}
                          </div>
                          <div className={cn("text-right justify-start text-sm font-normal font-['Geist'] leading-3", metrics&&metrics.totalPnl30d > 0 ? "text-[#00CE89]" : "text-[#F65333]")}>
                            {totalPnl30d}
                          </div>
                        </div>
                        <div className="w-full py-2 inline-flex justify-between items-center overflow-hidden">
                          <div className="text-center justify-start text-[#908E98] text-xs font-normal font-['Geist'] leading-3">
                            {t('smartMoney.pnl30dUnrealized')}
                          </div>
                          <div className={cn("text-right justify-start text-sm font-normal font-['Geist'] leading-3", pnl&&pnl.unrealizedPnl > 0 ? "text-[#00CE89]" : "text-[#F65333]")}>
                            {pnl?.unrealizedPnl ? formatCurrency(pnl?.unrealizedPnl) : '$0'}
                          </div>
                        </div>
                        <div className="w-full py-2 inline-flex justify-between items-center overflow-hidden">
                          <div className="text-center justify-start text-[#908E98] text-xs font-normal font-['Geist'] leading-3">
                            {t('smartMoney.winRate30d')}
                          </div>
                          <div className="text-right justify-start text-white text-sm font-normal font-['Geist'] leading-3">
                            {metrics?.winRate30d ? `${metrics.winRate30d.toFixed(2)}%` : '-'}
                          </div>
                        </div>
                        <div className="w-full py-2 inline-flex justify-between items-center overflow-hidden">
                          <div className="text-center justify-start text-[#908E98] text-xs font-normal font-['Geist'] leading-3">
                            {t('smartMoney.sharpe30d')}
                          </div>
                          <div className="text-right justify-start text-white text-sm font-normal font-['Geist'] leading-3">
                            {metrics?.sharpeRatio30d ? `${metrics.sharpeRatio30d.toFixed(2)}%` : '-'}
                          </div>
                        </div>
                        <div className="w-full py-2 inline-flex justify-between items-center overflow-hidden">
                          <div className="text-center justify-start text-[#908E98] text-xs font-normal font-['Geist'] leading-3">
                            {t('smartMoney.maxDrawdown30d')}
                          </div>
                          <div className="text-right justify-start text-white text-sm font-normal font-['Geist'] leading-3">
                            {metrics?.maxDrawdown30d ? `${metrics.maxDrawdown30d}%` : '-'}
                          </div>
                        </div>
                        <div className="w-full py-2 inline-flex justify-between items-center overflow-hidden">
                          <div className="text-center justify-start text-[#908E98] text-xs font-normal font-['Geist'] leading-3">
                            {t('smartMoney.profitFactor30d')}
                          </div>
                          <div className="text-right justify-start text-white text-sm font-normal font-['Geist'] leading-3">
                            {metrics? metrics.profitFactor ?? '-' : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPnL && (
                    <div className="w-full">
                      {/* AI 总结卡片 */}
                      <div className="mt-4 pb-4">
                        <div className="">
                          <AICard summary={renderStrategyText()} address={userAddress} enableToExpand={false} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full px-3">
            {/* 方向偏差 */}
            <div className="w-full p-3 mt-3 rounded-lg bg-[#18181B]">
              <div className="text-sm text-white/60">{t('smartMoney.addressDetail.directionalBias')}</div>
              <div className="w-full inline-flex justify-between items-start">
                <div className="justify-center text-[#00CE89] text-xs font-medium font-['Geist'] leading-3">{t('smartMoney.addressDetail.long')}</div>
                <div className="justify-center text-[#F65333] text-xs font-medium font-['Geist'] leading-3">{t('smartMoney.addressDetail.short')}</div>
              </div>
              <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="absolute top-0 left-0 h-full bg-[#00CE89]" style={{ width: `${longPct}%` }} />
                <div className="absolute top-0 right-0 h-full bg-[#F65333]" style={{ width: `${shortPct}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <div className="text-white">
                  {/* <span className="font-medium pr-1">Long</span> */}
                  {longPct}%
                </div>
                <div className="text-white">
                  {shortPct}%{/* <span className="font-medium pl-1">Short</span> */}
                </div>
              </div>
            </div>

            {/* 仓位分布 */}
            <div className="w-full p-3 mt-3 rounded-lg bg-[#18181B]">
              <div className="text-sm text-white/60">{t('smartMoney.addressDetail.positionDistribution')}</div>
              <div className="w-full inline-flex justify-between items-start">
                <div className="justify-center text-[#00CE89] text-xs font-medium font-['Geist'] leading-3">{t('smartMoney.addressDetail.long')}</div>
                <div className="justify-center text-[#F65333] text-xs font-medium font-['Geist'] leading-3">{t('smartMoney.addressDetail.short')}</div>
              </div>
              {/* 进度条 */}
              <div className="relative mt-2 flex h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#00CE89]"
                  style={{ width: `${Math.max(0, Math.min(100, +longPct.toFixed(2)))}%` }}
                />
                <div
                  className="h-full bg-[#F65333]"
                  style={{ width: `${Math.max(0, Math.min(100, +shortPct.toFixed(2)))}%` }}
                />
              </div>

              {/* 数值 */}
              <div className="mt-1 flex items-center justify-between text-xs">
                <div className="text-white">{longText}</div>
                <div className="text-white">{shortText}</div>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <div className="text-white">{Math.max(0, Math.min(100, +longPct.toFixed(2)))}%</div>
                <div className="text-white">{Math.max(0, Math.min(100, +shortPct.toFixed(2)))}%</div>
              </div>
            </div>
          </div>

          {renderCharts()}
          {renderPositions()}

        </div>

        <div className="flex flex-col gap-2.5 w-full p-3 border-t-[0.5px] border-[#FFFFFF1A] bg-[#0A0A0A]">
          <div className="grid grid-cols-2 gap-2">
            <button className="h-11 bg-[#212127] rounded-full flex items-center justify-center"
              onClick={() => {
                toast.info(t('personalCenter.featureList.comingSoon'))
              }}
            >
              <span className="text-white text-base font-normal">
                {t('smartMoney.backtest')}
              </span>
            </button>

            <button className="h-11 bg-[#843BEA] rounded-full flex items-center justify-center"
              onClick={() => {
                toast.info(t('personalCenter.featureList.comingSoon'))
              }}
            >
              <span className="text-white text-base font-semibold">
                {t('smartMoney.copyTrade')}
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{isDesktop ? renderDesktop() : renderMobile()}</>
}

export default AddressDetail
