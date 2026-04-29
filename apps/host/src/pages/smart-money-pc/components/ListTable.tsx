import { memo, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslation } from 'react-i18next'
import { ReactComponent as HeadIcon } from '@/components/icon/smart-money/head.svg'
import { ReactComponent as PnLIcon } from '@/components/icon/smart-money/pnl.svg'
import { ReactComponent as WinRateIcon } from '@/components/icon/smart-money/win_rate.svg'
import { ReactComponent as FollowIcon } from '@/components/icon/smart-money/follow.svg'
import { ReactComponent as MaxDrawdownIcon } from '@/components/icon/smart-money/max_drawdown.svg'
import { fmt } from '@/utils/numbers'
import { shortAddr, useLangKey } from '@/utils/address'
import type { Trader } from '@/types/hypertrader.types'
import { throttle } from '@/utils/smart-money'
import { toast } from 'sonner'

const TAG_COLOR_CLASS: Record<string, string> = {
  gold: 'text-[#F5C16C] bg-[#F5C16C]/10',
  green: 'text-[#12C48B] bg-[#12C48B]/10',
  purple: 'text-[#C8A7FD] bg-[#C8A7FD]/10',
  red: 'text-[#E64C68] bg-[#E64C68]/10',
  blue: 'text-[#4DA3FF] bg-[#4DA3FF]/10',
  gray: 'text-white/70 bg-white/10',
}

type Props = {
  data: Trader[]
  rowHeight?: number
  onRowClick?: (addr: string, item: Trader) => void
  onEndReached?: () => void
}

const COLS = 'minmax(320px,2fr) 1fr 1fr 1fr 1fr 1fr'

export const ListTable = memo(function ListTable({ data, rowHeight = 56, onRowClick, onEndReached }: Props) {
  const { t } = useTranslation()
  const lang = useLangKey()
  const parentRef = useRef<HTMLDivElement | null>(null)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<number | null>(null)

  const onEndReachedThrottled = useMemo(() => throttle(() => onEndReached?.(), 800), [onEndReached])

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
    onChange: (v) => {
      const [last] = v.getVirtualItems().slice(-1)
      if (last && last.index >= data.length - 10) onEndReachedThrottled()
    },
  })

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

  return (
    <div className="px-4 pb-10">
      <div className="pb-10 rounded-xl overflow-hidden border border-[#2B2B35]  bg-[#121214]">
        {/* header */}
        <div
          className="grid h-12 items-center px-4 bg-black/30 text-white/60 text-xs tabular-nums"
          style={{ gridTemplateColumns: COLS, columnGap: '12px' }}
        >
          <div>{t('smartMoney.latestTrader.address')}</div>
          <div className="flex items-center justify-center gap-1 text-[#605E6A] text-xs">
            <PnLIcon className="w-3.5 h-3.5" />
            <span className="text-center">{t('smartMoney.latestTrader.realizedPnL')}</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-[#605E6A] text-xs">
            <WinRateIcon className="w-3.5 h-3.5" />
            <span className="text-center">{t('smartMoney.latestTrader.winRate')}</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-[#605E6A] text-xs">
            <MaxDrawdownIcon className="w-3.5 h-3.5" />
            <span className="text-center">{t('smartMoney.latestTrader.maxDrawdown')}</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-[#605E6A] text-xs">
            <FollowIcon className="w-4 h-4" />
            <span className="text-center">{t('smartMoney.latestTrader.follow')}</span>
          </div>
          <div className="text-center text-[16px]">ROI</div>
        </div>

        {/* rows */}
        <div ref={parentRef} className="h-[calc(100vh-160px)] overflow-auto">
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((vi) => {
              const item = data[vi.index]
              if (!item) return null

              return (
                <div
                  key={vi.key}
                  className="absolute left-0 right-0"
                  style={{ transform: `translateY(${vi.start}px)` }}
                >
                  <div
                    className="grid h-14 items-center px-5 text-sm border-b border-white/5 hover:bg-white/5 cursor-pointer tabular-nums"
                    style={{ gridTemplateColumns: COLS, columnGap: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick?.(item.user_address, item)
                    }}
                  >
                    {/* 地址 + 收藏分组 */}
                    <div className="flex items-center gap-2 min-w-0">
                      {/* <div onClick={(e) => e.stopPropagation()}>
                        <FavoriteGroupsButton
                          addressId={item.user_address}
                          initialGroupIds={item.group_ids ?? []}
                          initialFavorited={(item.group_ids?.length ?? 0) > 0}
                          commitMode="debounce"
                        />
                      </div> */}

                      <HeadIcon className="h-6 w-6 shrink-0" />
                      <span
                        className="text-white/90 truncate"
                        onClick={(e) => {
                          e.stopPropagation()
                          copy(e, item.user_address)
                        }}
                      >
                        {shortAddr(item.user_address)}
                      </span>

                      <div className="flex items-center gap-1 flex-wrap max-h-[56px] overflow-hidden">
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

                    <div className="text-center" style={{ color: (item.net_pnl ?? 0) >= 0 ? '#21E09D' : '#EA3B4F' }}>
                      {fmt.money(item.net_pnl)}
                    </div>
                    <div className="text-center">{fmt.pct(item.avg_win_rate)}</div>
                    <div className="text-center">{fmt.pct(item.max_drawdown)}</div>
                    <div className="text-center">{fmt.compact(item.follower_count)}</div>
                    <div className="text-center" style={{ color: item.roi < 0 ? '#EA3B4F' : '#21E09D' }}>
                      {fmt.pct(item.roi)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})
