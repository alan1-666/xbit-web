import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { usePortfolioData } from '@/hooks/hyperliquid/usePortfolioData'
import { formatSignedCurrency } from '@/lib/number'
import { cn, fixNumber } from '@/lib/utils'
import { IconEye, IconEyeSlash } from '@components/icon'
import { APP_PATH } from '@/lib/constant'
import { MessageDrawer } from '@components/transfer/drawer/MessageDrawer'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import TradingDashboard from '@/components/futuresDetails/components/TradingDashboard'
import { TradingDashboardProvider } from '@/components/futuresDetails/components/TradingDashboard/context/TradingDashboardContext'
import { PnLAreaChart, ChartData } from '@/components/ui/AssetChart'
import { AssetOverviewContext } from '@/components/assets/overview/AssetOverviewContext'
import { ToastProvider } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import { generateL2BookTiers } from '@/components/futuresDetails/trade/tools'
import { setAllTiers, setUniverse } from '@/redux/modules/futuresMeta.slice'
import { useAppDispatch } from '@/redux/store'
import { getPerpMetaAndAssetCtxs } from '@/api/hyperliquid'
import { ChainIds } from '@/types/enums.ts'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { formatBalance } from '@/lib/format'

// 格式化 x 轴为日期字符串
const formatDateLabel = (timestamp: number): string => {
  const date = new Date(timestamp)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${mm}/${dd}`
}

// 格式化 x 轴为时间字符串 HH:mm
const formatTimeLabel = (timestamp: number): string => {
  const date = new Date(timestamp)
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mi}`
}

// 生成一个去重的刻度格式化器：如果连续刻度的文本相同，则返回空串以隐藏重复标签
const createDedupeTickFormatter = () => {
  let last: string | null = null
  return (value: string) => {
    if (value === last) return ''
    last = value
    return value
  }
}

const truncateToDecimals = (value: number, decimals: number) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  const factor = Math.pow(10, decimals)
  const truncated = Math.trunc(value * factor) / factor
  if (Object.is(truncated, -0)) {
    return 0
  }
  return truncated
}

// 将 Portfolio 历史数据转换为图表数据，按指标与周期切换
const convertPortfolioToChartData = (
  portfolioData: any,
  metric: 'account' | 'pnl',
  period: '1D' | '7D' | '30D' | 'ALL',
): ChartData[] => {
  if (!portfolioData) return []
  const series = metric === 'pnl' ? portfolioData?.pnlHistory : portfolioData?.accountValueHistory
  if (!Array.isArray(series) || series.length === 0) return []

  // 确保数据按时间戳排序
  const sortedSeries = [...series].sort(([a], [b]) => a - b)

  // PnL 直接展示金额，不再转换为百分比

  return sortedSeries.map(([timestamp, value]: [number, string]) => {
    const numeric = parseFloat(value)
    const normalizedValue = metric === 'pnl' ? truncateToDecimals(numeric, 2) : numeric
    return {
      name: period === '1D' ? formatTimeLabel(timestamp) : formatDateLabel(timestamp),
      value: normalizedValue,
    }
  })
}

// 计算最大回撤（百分比）。
// 主路径：使用 pnlHistory 与 accountValueHistory 在同一时间戳对齐，按“历史峰值 PnL 对应的 AV”作为分母计算回撤。
// 兜底路径：若上述计算得到 0，则退化为仅用 accountValueHistory 扫描（peak-to-trough）。
const computeMaxDrawdown = (portfolioData: any): number => {
  if (!portfolioData) return 0
  let maxDrawdown = 0

  const hasAv = Array.isArray(portfolioData.accountValueHistory) && portfolioData.accountValueHistory.length > 0
  const hasPnl = Array.isArray(portfolioData.pnlHistory) && portfolioData.pnlHistory.length > 0

  if (hasAv && hasPnl) {
    const avByTs = new Map(
      portfolioData.accountValueHistory.map(([t, v]: [number, string]) => [t as number, parseFloat(v as string)]),
    )
    const pnlSorted = [...portfolioData.pnlHistory]
      .map(([t, p]: [number, string]) => [t as number, parseFloat(p as string)] as [number, number])
      .sort(([a], [b]) => a - b)

    let peakPnl = Number.NEGATIVE_INFINITY
    let peakAccountValueAtPeakPnl = 0
    for (const [timestamp, pnlNow] of pnlSorted) {
      const accountValueNow = avByTs.get(timestamp)
      if (pnlNow >= peakPnl) {
        // 刷新历史新高；若该时刻 AV 不可用或<=0，则仍刷新峰值，但分母保持不变
        peakPnl = pnlNow
        peakAccountValueAtPeakPnl =
          typeof accountValueNow === 'number' && accountValueNow > 0 ? accountValueNow : peakAccountValueAtPeakPnl
      } else if (peakAccountValueAtPeakPnl > 0) {
        const ddPercent = ((peakPnl - pnlNow) / peakAccountValueAtPeakPnl) * 100
        if (ddPercent > maxDrawdown) maxDrawdown = ddPercent
      }
    }
  }

  // 兜底：若主路径算得 0，则用 AV 序列做一次 peak-to-trough 扫描
  if (maxDrawdown === 0 && hasAv) {
    const avSorted = [...portfolioData.accountValueHistory]
      .map(([t, v]: [number, string]) => [t as number, parseFloat(v as string)] as [number, number])
      .sort(([a], [b]) => a - b)
    let peakAccountValueSeen = 0
    for (const [, accountValueRaw] of avSorted) {
      const accountValueNow = typeof accountValueRaw === 'number' ? accountValueRaw : Number(accountValueRaw)
      if (!Number.isFinite(accountValueNow)) continue
      if (accountValueNow > peakAccountValueSeen) {
        peakAccountValueSeen = accountValueNow
      } else if (peakAccountValueSeen > 0 && accountValueNow >= 0) {
        const ddPercent = ((peakAccountValueSeen - accountValueNow) / peakAccountValueSeen) * 100
        if (ddPercent > maxDrawdown) maxDrawdown = ddPercent
      }
    }
  }

  return maxDrawdown
}

interface FuturesAssetProps {
  walletBalances?: {
    sol: Record<string, number>
    eth: Record<string, number>
    arbEth: Record<string, number>
    arbUsdc: Record<string, number>
    solUsd: Record<string, number>
    ethUsd: Record<string, number>
    arbEthUsd: Record<string, number>
    arbUsdcUsd: Record<string, number>
  }
}

const FuturesAsset = ({}: FuturesAssetProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { accountValue, availableFund, positions, webData2 } = useWebData2()
  // 移除冗余的 balanceFutures，统一使用 useWebData2 的数据
  const { weekData, dayData, monthData, allTimeData, loading: portfolioLoading } = usePortfolioData()

  // 使用 AssetOverviewContext 中的共享数据
  const { hideBalance, toggleHideBalance, futuresBalance } = useContext(AssetOverviewContext)

  // 数据加载状态检查
  const isDataLoading = portfolioLoading || !webData2 || Object.keys(webData2).length === 0

  const [openDrawer, setOpenDrawer] = useState(false)
  // 图表筛选：指标 与 周期
  const [activeMetric, setActiveMetric] = useState<'account' | 'pnl'>('account')
  const [activePeriod, setActivePeriod] = useState<'1D' | '7D' | '30D' | 'ALL'>('7D')

  const balance = Number(accountValue) || 0

  // 根据选择的时间段获取对应的 Portfolio 数据，添加数据验证
  const currentPortfolioData = useMemo(() => {
    const dataMap = {
      '1D': dayData,
      '7D': weekData,
      '30D': monthData,
      ALL: allTimeData,
    }

    const selectedData = dataMap[activePeriod] || weekData

    // 验证数据完整性
    if (selectedData && (!selectedData.accountValueHistory || !selectedData.pnlHistory)) {
      console.warn(`Portfolio data incomplete for period: ${activePeriod}`, selectedData)
    }

    return selectedData
  }, [activePeriod, dayData, weekData, monthData, allTimeData])

  // 转换 Portfolio 数据为图表数据
  const chartData = useMemo(() => {
    return convertPortfolioToChartData(currentPortfolioData, activeMetric, activePeriod)
  }, [currentPortfolioData, activeMetric, activePeriod])

  // 右上角 PnL 汇总已移除

  // 计算账户统计数据 - 顶部数据统计使用总数据，不跟随图表周期切换
  const accountStats = useMemo(() => {
    const crossMarginSummary = webData2?.clearinghouseState?.crossMarginSummary
    const totalUnrealizedPnl = positions.reduce((sum: number, pos: any) => sum + Number(pos.unrealizedPnl || 0), 0)
    // 使用正确的保证金使用率计算公式：1 - withdrawable/accountValue
    const withdrawable = Number(webData2?.clearinghouseState?.withdrawable || 0)
    const accountValue = Number(crossMarginSummary?.accountValue || 0)
    const marginUsageRate = accountValue > 0 ? (1 - withdrawable / accountValue) * 100 : 0
    // 始终使用 allTimeData 获取总数据统计，不跟随图表周期切换
    const totalVolume = allTimeData?.vlm ? parseFloat(allTimeData.vlm) : 0

    // 获取总的 PnL 值（使用全时段数据）
    let totalPnl = 0
    if (allTimeData?.pnlHistory && allTimeData.pnlHistory.length > 0) {
      // 按时间戳排序后取最后一个值（将数据规范为 [number, number]）
      const sortedPnlHistory = [...allTimeData.pnlHistory]
        .map(([t, p]) => [Number(t), parseFloat(String(p))] as [number, number])
        .sort(([a], [b]) => a - b)
      const latestPnlPair = sortedPnlHistory[sortedPnlHistory.length - 1]
      totalPnl = latestPnlPair ? latestPnlPair[1] : 0
    }

    // 获取总的账户权益（使用全时段 accountValueHistory 最新值）
    let latestAccountValue = 0
    if (allTimeData?.accountValueHistory && allTimeData.accountValueHistory.length > 0) {
      const sortedAvHistory = [...allTimeData.accountValueHistory]
        .map(([t, v]) => [Number(t), parseFloat(String(v))] as [number, number])
        .sort(([a], [b]) => a - b)
      const latestAvPair = sortedAvHistory[sortedAvHistory.length - 1]
      latestAccountValue = latestAvPair ? latestAvPair[1] : 0
    }

    // 计算总的最大回撤（百分比）
    const maxDrawdown = computeMaxDrawdown(allTimeData)

    return {
      totalValue: latestAccountValue,
      availableBalance: availableFund || 0,
      unrealizedPnl: totalUnrealizedPnl,
      totalPnl: totalPnl,
      totalVolume,
      maxDrawdown,
      marginUsageRate,
    }
  }, [balance, availableFund, positions, webData2, allTimeData])

  const assetsNav = [
    {
      key: 'deposit',
      icon: 'asset-deposit.svg',
      title: t('assets.overview.deposit'),
    },
    {
      key: 'withdraw',
      icon: 'asset-withdraw.svg',
      title: t('assets.withdraw.withdrawLabel'),
    },
    {
      key: 'transfer',
      icon: 'asset-swap.svg',
      title: t('assets.transfer'),
    },
  ]

  const fetchPerpMetadata = async () => {
    try {
      const data = await getPerpMetaAndAssetCtxs()

      const universe = data[0]?.universe
      const contexts = data[1]

      const allTiers: any = {}

      if (universe.length) {
        for (let i = 0; i < universe.length; i++) {
          const coin = universe[i].name
          const szDecimals = universe[i].szDecimals
          const ctx = contexts[i]
          const rawMid = ctx.midPx ?? ctx.markPx
          if (!rawMid) continue
          const price = parseFloat(rawMid)
          allTiers[coin] = generateL2BookTiers(coin, price, szDecimals)
        }
        dispatch(setAllTiers(allTiers))

        dispatch(setUniverse(universe))
      }
    } catch (err: any) {}
  }

  useEffect(() => {
    fetchPerpMetadata()
  }, [])

  return (
    <ToastProvider>
      <div className="bg-[#0A0A0A] min-h-screen">
        {/* 顶部标题栏 */}
        <div className="p-4 bg-[#0D0D0F] border border-[rgba(121,119,144,0.16)] rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-white/70 text-sm">{t('futuresAsset.title')}</span>
            <button onClick={() => toggleHideBalance(!hideBalance)}>
              {hideBalance ? (
                <IconEyeSlash className="w-4 h-4 text-white/70" />
              ) : (
                <IconEye className="w-4 h-4 text-white/70" />
              )}
            </button>
          </div>
          {/* 顶部数据统计 */}
          <div className="flex justify-between items-center mb-4 text-xs">
            <div className="w-full flex justify-between">
              <div className="flex-1">
                <span className="text-[#625F77] mb-1">{t('futuresAsset.labels.totalValue')}</span>
                <div className="text-[#FCFCFC] text-xl font-semibold mt-1">
                  {hideBalance
                    ? '****'
                    : formatBalance(futuresBalance, {
                        showCurrency: true,
                        roundMode: 'floor',
                      })}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[#625F77]">{t('futuresAsset.labels.availableBalance')}</span>
                <div className="text-[#FCFCFC] text-xl font-semibold mt-1">
                  {hideBalance
                    ? '****'
                    : formatBalance(accountStats.availableBalance, {
                        showCurrency: true,
                        roundMode: 'floor',
                      })}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[#625F77]">{t('futuresAsset.labels.unrealizedPnl')}</span>
                {(() => {
                  const formatted = formatSignedCurrency(accountStats.unrealizedPnl, {
                    decimal: 2,
                    round: 'down',
                    hide: hideBalance,
                  })
                  return <div className={cn('text-xl font-semibold mt-1', formatted.className)}>{formatted.text}</div>
                })()}
              </div>
              <div className="flex-1">
                <span className="text-[#625F77]">{t('futuresAsset.labels.totalPnl')}</span>
                {(() => {
                  const formatted = formatSignedCurrency(accountStats.totalPnl, {
                    decimal: 2,
                    round: 'down',
                    hide: hideBalance,
                  })
                  return <div className={cn('text-xl font-semibold mt-1', formatted.className)}>{formatted.text}</div>
                })()}
              </div>
              <div className="flex-1">
                <span className="text-[#625F77]">{t('futuresAsset.labels.totalVolume')}</span>
                <div className="text-[#FCFCFC] text-xl font-semibold mt-1">
                  {hideBalance ? '****' : `$${fixNumber(accountStats.totalVolume, 2)}`}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[#625F77]">{t('futuresAsset.labels.maxDrawdown')}</span>
                <div className="text-[#FCFCFC] text-xl font-semibold mt-1">
                  {hideBalance ? '****' : `${accountStats.maxDrawdown.toFixed(2)}%`}
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {assetsNav.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => {
                  dispatch(
                    exchangeActions.openExchangeDialog({
                      defaultTab: item.key as 'deposit' | 'withdraw' | 'transfer',
                    }),
                  )
                }}
              >
                <div className="flex items-center justify-center py-2 px-4 bg-[#2B2B35] rounded-lg">
                  <img src={`/images/icons/${item.icon}`} alt={item.title} className="w-5 h-5 mr-2" />
                  <span className="text-primary text-sm">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex gap-4 h-[360px] mb-4">
          {/* 左侧信息面板 */}
          <div className="w-64 bg-[#0D0D0F] border border-[rgba(121,119,144,0.16)] rounded-lg p-4">
            <div className="space-y-4">
              {/* 当前持仓 */}
              <div className="text-[#FCFCFC] text-base mb-5">{t('futuresAsset.labels.currentPositions')}</div>
              <div className="w-full bg-[#18181B] rounded-lg p-3 gap-2">
                <div className="text-[#797790] text-sm">{t('futuresAsset.labels.accountTotalValue')}</div>
                <div className="text-[#FCFCFC] text-lg font-semibold">
                  {hideBalance ? '****' : `$${fixNumber(accountStats.totalValue, 2)}`}
                </div>
              </div>
              <div className="w-full bg-[#18181B] rounded-lg p-3 gap-2">
                <div className="text-[#797790] text-sm">{t('futuresAsset.labels.marginUsageRate')}</div>
                <div className="flex items-center text-[#FCFCFC] text-lg font-semibold gap-1">
                  <div className="w-full h-1.5 bg-gray-700 rounded-full">
                    <div
                      className={cn(
                        'h-1.5 rounded-full',
                        accountStats.marginUsageRate > 80
                          ? 'bg-[#FF4548]'
                          : accountStats.marginUsageRate > 60
                            ? 'bg-[#FFA500]'
                            : 'bg-[#00D889]',
                      )}
                      style={{ width: `${Math.min(accountStats.marginUsageRate, 100)}%` }}
                    ></div>
                  </div>
                  <span
                    className={cn(
                      'text-xs',
                      accountStats.marginUsageRate > 80
                        ? 'text-[#FF4548]'
                        : accountStats.marginUsageRate > 60
                          ? 'text-[#FFA500]'
                          : 'text-[var(--rise)]',
                    )}
                  >
                    {accountStats.marginUsageRate.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="w-full bg-[#18181B] rounded-lg p-3 text-xs">
                <div className="text-[#797790] text-sm mb-4">{t('futuresAsset.labels.directionBias')}</div>
                <div className="">
                  <div className="flex justify-between">
                    <div className="text-white">{t('futuresAsset.labels.longPositions')}</div>
                    <div className="text-white">{t('futuresAsset.labels.shortPositions')}</div>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--fall)] rounded-full my-2">
                    <div
                      className="h-1.5 bg-[var(--rise)] rounded-full"
                      style={{
                        width: `${
                          positions.length > 0
                            ? (positions.filter((p: any) => p.side === 'B').length / positions.length) * 100
                            : 50
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-[#FCFCFC]">
                      {fixNumber(
                        positions
                          .filter((p: any) => p.side === 'B')
                          .reduce((sum: number, p: any) => sum + Math.abs(Number(p.positionValue || 0)), 0),
                        2,
                      )}
                    </div>
                    <div className="text-[#FCFCFC]">
                      {fixNumber(
                        positions
                          .filter((p: any) => p.side === 'A')
                          .reduce((sum: number, p: any) => sum + Math.abs(Number(p.positionValue || 0)), 0),
                        2,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧图表区域 */}
          <div className="flex-1 flex flex-col bg-[#0D0D0F] border border-[rgba(121,119,144,0.16)] rounded-lg p-4">
            {/* 图表区域 */}
            <div className="flex justify-between">
              {/* 图表标签：指标 与 周期 */}
              <div className="flex gap-4 mb-4">
                {/* 指标切换 */}
                <div className="flex bg-[rgba(66,38,100,0.40)]">
                  {(
                    [
                      { key: 'account', label: t('futuresAsset.metric.account') },
                      { key: 'pnl', label: t('futuresAsset.metric.pnl') },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      className={cn(
                        'px-3 py-1 text-sm rounded-md transition-colors',
                        activeMetric === tab.key
                          ? 'bg-[#472468] text-[#D6A3FF] font-medium'
                          : 'text-[#FCFCFC]/60 hover:text-[#FCFCFC]/80',
                      )}
                      onClick={() => setActiveMetric(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* 右侧：周期切换（移动到原 PnL 汇总位置） */}
              <div className="flex h-8 border border-[#2A283B] rounded-md">
                {(['1D', '7D', '30D', 'ALL'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={cn(
                      'px-3 text-sm rounded-md transition-colors',
                      activePeriod === tab
                        ? 'bg-[#2A283B] text-[#FCFCFC] font-medium rounded-sm'
                        : 'text-[#FCFCFC]/60 hover:text-[#FCFCFC]/80',
                    )}
                    onClick={() => setActivePeriod(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* 图表 */}
            <div className="flex-1">
              {isDataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white/60">{t('detail.common.loading')}</div>
                </div>
              ) : chartData.length > 0 ? (
                <PnLAreaChart
                  data={chartData}
                  height={280}
                  className="w-full h-full"
                  yTickFormatter={(v) => `$${fixNumber(v, 2)}`}
                  xTickFormatter={activePeriod === '7D' ? createDedupeTickFormatter() : undefined}
                  xInterval={activePeriod === '30D' ? 2 : activePeriod === 'ALL' ? 4 : undefined}
                  chartType={activeMetric === 'account' ? 'asset' : 'pnl'}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white/60">{t('assets.futures.noDataYet')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 底部订单 */}
        {/* TODO 展示全部币种？ */}
        <div className="w-full bg-[#0D0D0F] border border-[rgba(121,119,144,0.16)] rounded-lg p-4 mb-4">
          <TradingDashboardProvider>
            <TradingDashboard baseCoin={'BTC'} isActive={true} />
          </TradingDashboardProvider>
        </div>

        {/* 提币确认弹窗 */}
        <MessageDrawer
          open={openDrawer}
          type={'error'}
          buttonTitle={t('assets.transfers.goToTransfer')}
          text={t('assets.transfers.transferDescription')}
          onClose={() => {
            navigate(`${APP_PATH.CRYPTO_DEPOSIT}?source=futures&action=withdraw`)
            setOpenDrawer(false)
          }}
        />

        {/* Dialog Components */}
      </div>
    </ToastProvider>
  )
}

export default FuturesAsset
