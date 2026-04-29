import { memo, useMemo, useEffect, useState, useRef } from 'react'
import type { Trader } from '@/types/hypertrader.types'
import { fmt } from '@/utils/numbers'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { ReactComponent as PnLIcon } from '@/components/icon/smart-money/pnl.svg'
import { ReactComponent as WinRateIcon } from '@/components/icon/smart-money/win_rate.svg'
import { ReactComponent as FollowIcon } from '@/components/icon/smart-money/follow.svg'
import { ReactComponent as MaxDrawdownIcon } from '@/components/icon/smart-money/max_drawdown.svg'
import { ReactComponent as CopySuccessIcon } from '@/components/icon/smart-money/copy_success.svg'
import { formatCurrency, shortAddr, useLangKey } from '@/utils/address'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { useUpdateAddressGroupsForAddress } from '@/hooks/useUpdateAddressGroupsForAddress'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { toast } from 'sonner'
import { useResponsive } from '@/hooks/useResponsive'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'
import { cn, MathFun } from '@/lib/utils'
import { ReactComponent as CopyIcon } from '@/components/icon/smart-money/copy.svg'
import { ReactComponent as UpIcon } from '@/components/icon/smart-money/up-icon.svg'
import { ReactComponent as DownIcon } from '@/components/icon/smart-money/down_icon.svg'
import { formatTimeAgo } from '@/utils/smart-money'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import FavoriteMultiGroupDrawer from './FavoriteGroups/FavoriteMultiGroupDrawer'
import { ProfitTrendChart } from './Chart/ProfitTrendChart'
import { getClearinghouseState, getPortfolioData } from '@/api/hyperliquid'
import { Configs } from '@/const/configs'
import { formatPercent } from '../helper'

const TAG_COLOR_CLASS: Record<string, string> = {
  gold: 'text-[#F5C16C] bg-[#F5C16C]/10',
  green: 'text-[#12C48B] bg-[#12C48B]/10',
  purple: 'text-[#C8A7FD] bg-[#C8A7FD]/10',
  red: 'text-[#E64C68] bg-[#E64C68]/10',
  blue: 'text-[#4DA3FF] bg-[#4DA3FF]/10',
  gray: 'text-white/70 bg-white/10',
}

type Props = {
  id: string
  item: Trader
  onClick?: (addr: string, item: any) => void
  onOpen?:(type: string) => void

  initialFavorited?: boolean
  initialGroupIds?: string[]

  /** 优化模式：800ms debounce 或关闭 popover 时一次性提交 */
  commitMode?: 'debounce' | 'onClose'
  periodDays?: number
  isSearchView?: boolean
  portfolioData?: string
}

export const TraderCard = memo(function TraderCard({
  item,
  onClick,
  id,
  initialFavorited = false,
  initialGroupIds = [],
  commitMode = 'debounce',
  periodDays,
  isSearchView = false,
  portfolioData,
  onOpen
}: Props) {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const lang = useLangKey()

  const activeWallet = useSelector(_activeWallet)

  const [chartData, setChartData] = useState()

  useEffect(() => {
    if (!item.user_address || isDesktop) return
    const loadData = async () => {
      try {
        if (portfolioData) {
          try {
            const parsed = JSON.parse(portfolioData)
            setChartData(parsed)
            return
          } catch (err) {
            console.error('JSON parse error:', err)
            const data = await getPortfolioData(item.user_address)
            setChartData(data)
          }
        }

        const data = await getPortfolioData(item.user_address)
        setChartData(data)
      } catch (err) {
        console.log('retrieve chart data error:', err)
      }
    }

    loadData()
  }, [item.user_address, portfolioData, isDesktop])

  const pnlPositive = (item.net_pnl ?? 0) >= 0
  const pnlColor = pnlPositive ? '#21E09D' : '#EA3B4F'
  const userId = useSelector(_userInfo)?.userId
  const [copied, setCopied] = useState(false)

  let latestActivity = ''

  if (item.latest_activity) {
    if (lang === 'cn' || lang === 'hk') {
      latestActivity = item.latest_activity[lang] ?? '--'
    } else {
      latestActivity = item.latest_activity.en ?? '--'
    }
  } else {
    latestActivity = '--'
  }

  let operationTime = ''
  if (item.last_operation) {
    const formatedTime = formatTimeAgo(item.last_operation.time)
    if (lang === 'cn' || lang === 'hk') {
      operationTime = formatedTime[lang] ?? '--'
    } else {
      operationTime = formatedTime.en ?? '--'
    }
  }

  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const [favoriteGroupIds, setFavoriteGroupIds] = useState<string[]>((initialGroupIds ?? []).map(String))
  const [isFavorited, setIsFavorited] = useState<boolean>(item.groupIds && item.groupIds.length > 0 ? true : false)
  const [positions, setPositions] = useState<any[]>([])
  // Provider
  const { groupList, createAndSelectGroup } = useAddressGroups()
  const { updateAddressGroupsForAddress } = useUpdateAddressGroupsForAddress()

  const debounceTimerRef = useRef<number | null>(null)
  const pendingRef = useRef<string[]>(favoriteGroupIds) // 正在等待提交的最新值
  const lastCommittedRef = useRef<string[]>(favoriteGroupIds) // 最近一次已提交成功，用于失败回滚
  const copiedTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current)
    }
  }, [])

  const initialKey = useMemo(
    () => (initialGroupIds?.length ? [...initialGroupIds].map(String).sort().join(',') : ''),
    [initialGroupIds],
  )

  useEffect(() => {
    const next = (initialGroupIds ?? []).map(String)
    setFavoriteGroupIds(next)
    setIsFavorited(next.length > 0 || initialFavorited)
    pendingRef.current = next
    lastCommittedRef.current = next
  }, [initialFavorited, initialKey])

  // 工具：去重 + 稳定化
  const normalize = (arr: string[]) => Array.from(new Set(arr.map(String)))

  // 批量提交更新分组
  const onUpdateFavoriteGroups = async ({ id, groupIds }: { id: string; groupIds: string[] }) => {
    if (!userId) return
    await updateAddressGroupsForAddress({
      addressId: id,
      userId,
      groupIds,
    })
  }

  const commit = async (groupIds: string[]) => {
    const normalized = normalize(groupIds)
    try {
      await onUpdateFavoriteGroups({ id, groupIds: normalized })
      lastCommittedRef.current = normalized
    } catch (e) {
      // 提交失败：回滚 UI 到上一次成功提交的状态
      const rollback = lastCommittedRef.current
      setFavoriteGroupIds(rollback)
      setIsFavorited(rollback.length > 0)
      pendingRef.current = rollback
      console.error(e)
    }
  }

  const scheduleCommit = (next: string[]) => {
    pendingRef.current = normalize(next)

    if (commitMode !== 'debounce') return
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = window.setTimeout(() => {
      commit(pendingRef.current)
    }, 800)
  }

  const flushCommit = async () => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    await commit(pendingRef.current)
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current)
    }
  }, [])

  const onTogglePopover = () => setOpen((v) => !v)

  // 创建分组（真实 id）+ 自动勾选 + 触发提交
  const handleCreate = async (name: string) => {
    const created = await createAndSelectGroup(name, { isDefault: false })
    if (!created?.id) return

    const gid = String(created.id)
    setFavoriteGroupIds((prev) => {
      const next = normalize([...prev, gid])
      setIsFavorited(next.length > 0)
      scheduleCommit(next)
      return next
    })
  }

  const copy = async (e: any, addr: string | null) => {
    e.stopPropagation()
    if (!addr) return

    try {
      await navigator.clipboard.writeText(addr)
      toast.success(t('toast.copiedSuccess'))
    } catch {
      const ta = document.createElement('textarea')
      ta.value = addr
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      toast.success(t('toast.copiedSuccess'))
    }

    setCopied(true)
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = window.setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const highlightLastUsdPnL = (text: string) => {
    const re = /([+-]\s*\$[\d,]+(?:\.\d+)?)(?!.*[+-]\s*\$[\d,]+(?:\.\d+)?)/
    const m = text.match(re)
    if (!m || m.index == null) return text
    const amount = m[1]
    const start = m.index
    const color = amount.trim().startsWith('-') ? '#EA3B4F' : '#21E09D'
    return (
      <>
        {text.slice(0, start)}
        <span style={{ color }}>{amount}</span>
        {text.slice(start + amount.length)}
      </>
    )
  }

  const getPeriodKey = (periodDays: number): 'day' | 'week' | 'month' | undefined => {
    switch (periodDays) {
      case 1:
        return 'day'
      case 7:
        return 'week'
      case 30:
        return 'month'
      default:
        return undefined
    }
  }

  useEffect(() => {
    if (!item.user_address || isDesktop) return

    const fetchPositions = async () => {
      try {
        const { assetPositions } = await getClearinghouseState(item.user_address)
        setPositions(assetPositions.slice(0, 3).map((item: any) => item.position))
      } catch (err) {
        console.error('getClearinghouseState error:', err)
      }
    }

    fetchPositions()
  }, [item.user_address, isDesktop])

  const renderMobile = () => {
    const lineColor = item.net_pnl > 0 ? '#00CE89' : '#F65333'

    return (
      <div className="rounded-lg cursor-pointer transition-all min-h-[200px]" role="button">
        <div
          className="relative w-full h-16"
          onClick={(e) => {
            e.stopPropagation()
            onClick?.(item.user_address, item)
          }}
        >
          <div className="absolute inset-0 rounded-t-[8px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-10 overflow-hidden py-2 px-3">
            <div className="absolute top-[5px] left-0 right-0 h-[52px] rounded-[8px_12px_0_0] bg-[linear-gradient(15.02deg,rgba(255,204,1,1)_57.73%,rgba(255,255,255,1)_102.84%)] z-[1] text-right pr-[5%]">
              <div className="absolute top-0 right-0 z-[4] w-[22%] h-[52px] flex items-center justify-center text-[#0a0a0a] whitespace-nowrap pb-[5px]">
                <div className="flex flex-col items-start">
                  <div className="text-[10px] font-medium text-[#0a0a0a] leading-[10px]">ROE</div>
                  <div className="text-[18px] font-semibold text-[#0a0a0a] leading-[18px]">
                    {formatPercent(item.roi)}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-0 left-0 right-0 h-[70px] z-[2]">
              <img src="/images/smart-money/card_background.svg" className="w-full h-full object-cover" />
              <div className="flex items-center gap-3 min-w-0 absolute top-0 left-0 right-0 py-2 px-3">
                <div className={cn('h-9 w-9 overflow-hidden bg-[#7D3AF2] shrink-0 rounded-[3px]')}>
                  <WalletAvatar
                    data-avatar-type="wallet"
                    address={item.user_address}
                    className="block h-full w-full aspect-square object-cover select-none"
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-white/90 font-medium text-sm truncate max-w-[180px] mb-2 flex items-center gap-1">
                    <span
                      className="truncate"
                      onClick={(e) => {
                        e.stopPropagation()
                        copy(e, item.user_address)
                      }}
                    >
                      {item.remarkName ? item.remarkName : shortAddr(item.user_address).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      className="ml-1 shrink-0 text-white/40 hover:text-white"
                      onClick={(e) => copy(e, item.user_address)}
                      title={t('button.copy')}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </button>
                    {copied ? <CopySuccessIcon className="w-4 h-4 shrink-0" /> : null}
                  </div>

                  <div className="flex items-center gap-1 flex-nowrap overflow-visible whitespace-nowrap text-[10px]">
                    <div className="inline-flex justify-start items-center gap-2">
                      <div className="h-3.5 py-0.5 rounded flex justify-start items-center gap-0.5">
                        <div
                          className={cn(
                            "text-center justify-center text-[10px] font-normal font-['Geist'] leading-[10px] mr-0.5",
                            item.last_operation?.direction.toUpperCase() === 'OPEN LONG' ||
                              item.last_operation?.direction.toUpperCase() === 'CLOSE SHORT'
                              ? 'text-[#00CE89]'
                              : 'text-[#F65333]',
                          )}
                        >
                          {item.last_operation?.direction.toUpperCase() === 'OPEN LONG' ||
                          item.last_operation?.direction.toUpperCase() === 'CLOSE SHORT'
                            ? t('futuresDetails.common.long')
                            : t('futuresDetails.common.short')}
                        </div>
                        <div
                          className={cn(
                            'relative rounded-sm overflow-hidden',
                            item.last_operation?.direction.toUpperCase() === 'OPEN LONG' ||
                              item.last_operation?.direction.toUpperCase() === 'CLOSE SHORT'
                              ? 'w-4 h-4'
                              : 'w-3 h-3',
                          )}
                        >
                          {item.last_operation?.direction.toUpperCase() === 'OPEN LONG' ||
                          item.last_operation?.direction.toUpperCase() === 'CLOSE SHORT' ? (
                            <UpIcon className="w-4 h-4" />
                          ) : (
                            <DownIcon className="w-3 h-3 " />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-start items-center gap-1">
                        <div className="w-1 h-1 bg-[#605E68] rounded-full"></div>
                        <div className="text-center justify-center text-[#908E98] text-[10px] font-normal font-['Geist'] leading-[10px]">
                          {operationTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative top-[-5px] rounded-[8px] bg-[#18181B] p-3">
          <div
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(item.user_address, item)
            }}
          >
            <div className="self-stretch flex items-center h-12.5">
              <div className="flex-1 flex flex-col items-start gap-2">
                <div className="flex items-end gap-1.5">
                  <div className="text-[#908E98] text-sm font-normal leading-4">
                    {isSearchView ? t('assets.funding.totalPnl') : t('smartMoney.pnlInDays', { x: periodDays })}
                  </div>
                </div>
                <div
                  className={cn(
                    'text-xl font-semibold leading-4',
                    item.net_pnl > 0 ? 'text-[#00CE89]' : 'text-[#F65333]',
                  )}
                >
                  {item.net_pnl != null && `${item.net_pnl > 0 ? '+' : '-'}${formatCurrency(Math.abs(item.net_pnl))}`}
                </div>
              </div>

              <div className="flex-1 flex justify-end">
                {chartData && (
                  <ProfitTrendChart
                    rawData={chartData}
                    showChartTabs={false}
                    activeRange={getPeriodKey(periodDays || 3)}
                    lineColor={lineColor}
                  />
                )}
              </div>
            </div>

            <div className="inline-flex justify-start items-center gap-7 my-3">
              <div className="flex justify-start items-center gap-1">
                <div className="justify-start text-neutral-400 text-[10px] font-light font-['Geist'] leading-[10px]">
                  {t('smartMoney.addressDetail.long')}:
                </div>
                <div
                  className={cn(
                    "justify-start text-xs font-light font-['Geist'] leading-3",
                    item?.totalLongPnl && Number(item.totalLongPnl) > 0
                      ? 'text-[#00CE89]'
                      : Number(item.totalLongPnl) === 0
                        ? ''
                        : 'text-[#F65333]',
                  )}
                >
                  {item.totalLongPnl !== null && item.totalLongPnl !== undefined
                    ? Number(item.totalLongPnl) > 0
                      ? `+${formatCurrency(item.totalLongPnl)}`
                      : Number(item.totalLongPnl) === 0
                        ? '$0'
                        : `${formatCurrency(item.totalLongPnl)}`
                    : '-'}
                </div>
              </div>
              <div className="flex justify-start items-center gap-1">
                <div className="justify-start text-neutral-400 text-[10px] font-light font-['Geist'] leading-[10px]">
                  {t('smartMoney.addressDetail.short')}:
                </div>
                <div
                  className={cn(
                    "justify-start text-xs font-light font-['Geist'] leading-3",
                    item?.totalShortPnl && Number(item.totalShortPnl) > 0
                      ? 'text-[#00CE89]'
                      : Number(item.totalShortPnl) === 0
                        ? ''
                        : 'text-[#F65333]',
                  )}
                >
                  {item.totalShortPnl !== null && item.totalShortPnl !== undefined
                    ? Number(item.totalShortPnl) > 0
                      ? `+${formatCurrency(item.totalShortPnl)}`
                      : Number(item.totalShortPnl) === 0
                        ? '$0'
                        : `${formatCurrency(item.totalShortPnl)}`
                    : '-'}
                </div>
              </div>
            </div>

            <div className="w-full px-3 py-2 bg-[#212127] rounded-lg flex justify-between items-center">
              <div className="inline-flex flex-col justify-start items-start gap-2" 
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen?.('MaxDrawdown')
                }}
              >
                <div className="justify-end text-[#908E98] text-[10px] font-light font-['Geist'] underline leading-[10px]">
                  {isSearchView
                    ? t('smartMoney.latestTrader.maxDrawdown')
                    : t('smartMoney.drawdownRate', { x: periodDays })}
                </div>
                <div className="justify-start text-sm font-normal font-['Geist'] leading-4">
                  {item.max_drawdown < 0 ? '-' : fmt.pct(item.max_drawdown)}
                </div>
              </div>
              <div className="inline-flex flex-col justify-center items-start gap-2">
                <div className="justify-start text-[#908E98] text-[10px] font-light font-['Geist'] leading-[10px]">
                  {isSearchView ? t('smartMoney.totalTrades') : t('smartMoney.tradeCount', { x: periodDays })}
                </div>
                <div className="justify-start text-sm font-normal font-['Geist'] leading-4">{item.total_trades}</div>
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-2" 
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen?.('ProfitFactor')
                }}
              >
                <div className="justify-start text-[#908E98] text-[10px] font-light font-['Geist'] underline leading-[10px]">
                  {t('smartMoney.profitFactor')}
                </div>
                <div className="justify-start text-sm font-normal font-['Geist'] leading-4">
                  {item.profit_factor ?? '-'}
                </div>
              </div>
              <div className="inline-flex flex-col justify-start items-end gap-2" 
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen?.('SharpeRatio')
                }}
              >
                <div className="justify-start text-[#908E98] text-[10px] font-light font-['Geist'] underline leading-[10px]">
                  {t('smartMoney.sharpeRatio')}
                </div>
                <div className="justify-start text-sm font-normal font-['Geist'] leading-4">
                  {item.sharpe_ratio?.toFixed(2) ?? '-'}
                </div>
              </div>
            </div>

            {positions.length > 0 && (
              <div className="inline-flex justify-start items-center gap-1 mt-3">
                <div className="text-right justify-start text-[#908E98] text-[10px] font-normal font-['Geist'] leading-5">
                  {t('smartMoney.currentPositions')}
                </div>
                {positions.map((item, index) => (
                  <div className="p-1 rounded flex justify-start items-center gap-1">
                    <div data-name="Bitcoin (BTC)" className="w-3 h-3 relative rounded-3xl">
                      <img
                        src={`${Configs.getHyperliquidConfig().imgUrl}/${item.coin}.svg`}
                        className="size-3 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = '/images/kairox-logo-rounded.svg'
                        }}
                      />
                    </div>
                    <div
                      className={cn(
                        "w-10 justify-center text-[10px] font-normal font-['Geist'] leading-[10px]",
                        Number(item.returnOnEquity) > 0 ? 'text-[#00CE89]' : 'text-[#F65333]',
                      )}
                    >
                      {MathFun.mul(item.returnOnEquity, 100).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeWallet.isConnected && (
            <div className="w-full rounded-bl-lg rounded-br-lg inline-flex justify-start items-center gap-2 mt-3">
              <button
                data-size="Default"
                className="flex-1 h-8  bg-[#212127] rounded-md flex justify-center items-center"
                onClick={() => {
                  toast.info(t('personalCenter.featureList.comingSoon'))
                }}
              >
                <div className="text-center justify-center text-white text-sm font-normal font-['Geist'] leading-5">
                  {t('smartMoney.backtest')}
                </div>
              </button>
              <button
                data-size="Default"
                className="flex-1 h-8 px-3 py-1 bg-[#843BEA] rounded-md flex justify-center items-center"
                onClick={() => {
                  toast.info(t('personalCenter.featureList.comingSoon'))
                }}
              >
                <div className="text-center justify-center text-white text-sm font-medium font-['PingFang_SC'] leading-5">
                  {t('smartMoney.copyTrade')}
                </div>
              </button>
              <div className="w-8 h-8 px-2 bg-white/5 rounded-md flex justify-center items-center gap-2 overflow-hidden">
                <FavoriteMultiGroupDrawer
                  address={item.user_address}
                  showCount={false}
                  initialFavorited={item.groupIds && item.groupIds.length > 0 ? true : false}
                  groupIds={item.groupIds}
                  filledColor="#FBFBFB"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderDesktop = () => {
    return (
      <div
        className="
        rounded-lg p-4 cursor-pointer transition-all
        min-h-[200px]
      hover:border-[#C8A7FD]/40
        shadow-[0_0_0_1px_rgba(255,255,255,.02)]
        bg-[linear-gradient(180deg,#17171B_0%,#0A0A0A_100%)]
        hover:bg-none hover:bg-[#2A283B]
      "
        role="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(item.user_address, item)
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* 头像 */}
            <div className="h-9 w-9 rounded-full overflow-hidden bg-[#7D3AF2] shrink-0 ">
              <WalletAvatar
                data-avatar-type="wallet"
                address={item.user_address}
                className="block h-full w-full aspect-square object-cover select-none"
              />
            </div>

            <div className="min-w-0">
              <div className="text-white/90 font-medium text-sm truncate max-w-[180px] mb-2 flex items-center gap-1">
                <span
                  className="truncate"
                  onClick={(e) => {
                    e.stopPropagation()
                    copy(e, item.user_address)
                  }}
                >
                  {shortAddr(item.user_address).toUpperCase()}
                </span>
                <button
                  type="button"
                  className="ml-1 shrink-0 text-white/40 hover:text-white"
                  onClick={(e) => copy(e, item.user_address)}
                  title={t('button.copy')}
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
                {copied ? <CopySuccessIcon className="w-4 h-4 shrink-0" /> : null}
              </div>

              <div className="flex items-center gap-1 flex-nowrap overflow-visible whitespace-nowrap">
                {item.tags?.map((t) => {
                  const colorCls = TAG_COLOR_CLASS[t.color ?? ''] ?? TAG_COLOR_CLASS.gray

                  return t.category ? (
                    <span
                      key={`${t.category}-${t.name}`}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${colorCls}`}
                      title={t.description ?? ''}
                    >
                      {lang === 'cn' ? t.nameCn : t.name}
                    </span>
                  ) : (
                    <span></span>
                  )
                })}
              </div>
            </div>
          </div>

          {isDesktop && (
            <div className="shrink-0 text-right flex items-baseline self-start -translate-y-1">
              <div className="text-white/40 text-md  mr-1">ROI</div>
              <div className="text-[22px] font-semibold" style={{ color: item.roi < 0 ? '#EA3B4F' : '#21E09D' }}>
                {fmt.pct(item.roi)}
              </div>
            </div>
          )}
        </div>

        {isDesktop && <div className="mt-3 border-t-[0.5px] border-[rgba(121,119,144,0.16)]" />}

        <div>
          {isDesktop && (
            <div className="mt-3">
              <div className="text-white/45 text-xs mb-1">{t('smartMoney.latestTrader.recentActivity')}</div>
              <div className="text-[13px]">
                <span className={clsx('text-[13px]', 'text-white/85')}>
                  {latestActivity ? highlightLastUsdPnL(latestActivity) : '--'}
                </span>
              </div>
            </div>
          )}

          {!isDesktop && (
            <div className="mt-3">
              <div className="text-white/45 text-sm font-normal font-['Geist'] leading-4 mb-1">ROI</div>
              <div
                className="text-xl font-extrabold font-['Geist'] leading-5"
                style={{ color: item.roi < 0 ? '#EA3B4F' : '#21E09D' }}
              >
                <span className={clsx('text-xl font-extrabold font-["Geist"] leading-5')}>{fmt.pct(item.roi)}</span>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
            <div>
              <div className="flex items-center gap-1 text-white/45 text-xs">
                <PnLIcon className="w-3.5 h-3.5" />
                <span>{t('smartMoney.latestTrader.realizedPnL')}</span>
              </div>
              <div className="mt-1 font-medium truncate" style={{ color: pnlColor }}>
                {fmt.money(item.net_pnl)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-white/45 text-xs">
                <WinRateIcon className="w-3.5 h-3.5" />
                <span>{t('smartMoney.latestTrader.winRate')}</span>
              </div>
              <div className="mt-1 text-white/85 font-medium">{fmt.pct(item.avg_win_rate)}</div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-white/45 text-xs">
                <MaxDrawdownIcon className="w-3.5 h-3.5" />
                <span>{t('smartMoney.latestTrader.maxDrawdown')}</span>
              </div>
              <div className="mt-1 text-white/85 font-medium">
                {item.max_drawdown < 0 ? '-' : fmt.pct(item.max_drawdown)}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-white/45 text-xs">
                <FollowIcon className="w-4 h-4" />
                <span>{t('smartMoney.latestTrader.follow')}</span>
              </div>
              <div className="mt-1 text-white/85 font-medium">{item.follower_count ?? '--'}</div>
            </div>
          </div>
        </div>

        {!isDesktop && <div className="mt-3 border-t-[0.5px] border-[rgba(121,119,144,0.16)]" />}

        {!isDesktop && (
          <div className="mt-3">
            <div className="text-white/45 text-xs mb-1">{t('smartMoney.latestTrader.recentActivity')}</div>
            <div className="text-[13px]">
              <span className={clsx('text-[13px]', 'text-white/85')}>{highlightLastUsdPnL(latestActivity)}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return isDesktop ? renderDesktop() : renderMobile()
})

export const TraderCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Avatar + name + ROE badge */}
      <div className="flex items-center gap-2.5 relative">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />

        {/* Name & sub info */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-[110px] h-3 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
            <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7.5 h-3 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
            <div className="w-[60px] h-2 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          </div>
        </div>

        {/* ROE badge */}
        <div className="flex flex-col items-end gap-1">
          <div className="w-6 h-2 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-[70px] h-4.5 rounded-md bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
      </div>

      {/* PnL section */}
      <div className="flex justify-between items-end gap-2.5">
        <div className="flex flex-col gap-1.5">
          <div className="w-[53px] h-2.5 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-[165px] h-5 rounded-md bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
        <div className="w-[116px] h-10 rounded-md bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
      </div>

      {/* Long / Short breakdown */}
      <div className="flex gap-7">
        <div className="flex items-center gap-1">
          <div className="w-7 h-2.5 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-[75px] h-2.5 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-7 h-2.5 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-[65px] h-2.5 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
      </div>

      {/* 4-stat row */}
      <div className="flex justify-between px-3 py-2">
        <div className="flex flex-col gap-1">
          <div className="w-9 h-2 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-10 h-3 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-12 h-2 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-7 h-3 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-9 h-2 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-6 h-3 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-9 h-2 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-8 h-3 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
      </div>

      {/* Current positions */}
      <div className="flex items-center gap-1.5">
        <div className="w-10 h-2.5 rounded-sm bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        <div className="flex gap-1">
          <div className="w-[56px] h-5 rounded-full bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-[60px] h-5 rounded-full bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
          <div className="w-[58px] h-5 rounded-full bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="w-[72px] h-8 rounded-md bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        <div className="flex-1 h-8 rounded-md bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse" />
      </div>
    </div>
  )
}
