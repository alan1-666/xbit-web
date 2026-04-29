import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { shortAddr, useLangKey } from '@/utils/address'
import { Configs } from '@/const/configs'
import { cn } from '@/lib/utils'
import type { FollowedLatestPosition } from '@/hooks/useGetFollowedAddressesLatestPositions'
import { formatFinishTime, getTradeTag } from '@/utils/smart-money'
import { PositionTag } from './PositionTag'
import { fmt, formatSizeCompact, toNum, formatUsdCompact, fmtPctWithComma, formatUsdCompactAdd } from '@/utils/numbers'
import { useResponsive } from '@/hooks/useResponsive'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'

function getPnlRate(entryPx: number, szi: number, leverage: number, pnl: number) {
  if (entryPx === 0 || szi === 0 || leverage === 0 || !pnl) return 0
  const rate = pnl / ((szi * entryPx) / leverage)
  return rate * 100
}

export const AddressCard: React.FC<{ data: FollowedLatestPosition; onClick?: () => void }> = ({ data, onClick }) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const lang = useLangKey()
  const sziNum = toNum(data.szi)
  const isLong = sziNum > 0

  const tagText = getTradeTag(data.dir, sziNum)
  const tagCls = isLong ? 'text-[#00E497]' : 'text-[#FF1B49]'
  const isClose = String(data.dir).toLowerCase().includes('close')

  const leverageTypeText = data.leverageType === 'cross' ? t('smartMoney.addressDetail.cross') : t('smartMoney.addressDetail.isolated')
  const leverageValueText = data.leverageValue ? `${data.leverageValue}X` : '-'

  const positionValueText = formatUsdCompact(toNum(data.szi) * toNum(data.entryPx))
  const sizeText = formatSizeCompact(sziNum)

  const coin = (data.coin || '').toUpperCase()
  const iconUrl = `${Configs.getHyperliquidConfig().imgUrl}/${coin}.svg`

  return (
    <div
      className={cn(
        'w-full rounded-lg bg-[#0a0a0a] pb-2.5 text-[#FBFBFB] border border-[rgba(121, 119, 144, 0.16)]',
        'cursor-pointer hover:opacity-95 transition',
      )}
      onClick={onClick}
      role="button"
    >
      {/* Row 1: avatar + address | tag */}
      <div className="flex items-start justify-between gap-3 p-2.5 bg-[#18181B]">
        <div className="flex items-center gap-2 min-w-0">
          <WalletAvatar
            data-avatar-type="wallet"
            address={data.address}
            className="w-7 h-7 shrink-0"
          />
          {/* 下划线 + truncate */}
          <span className={cn("text-sm font-medium", isDesktop ? "" : "underline")}>{shortAddr(data.address)}</span>
        </div>

        {/* 状态 */}
        <PositionTag dir={data.dir} startPosition={data.startPosition} szi={data.szi} className="shrink-0" />
      </div>

      {/* Row 2: coin + leverage | positionValue | szi badge */}
      <div className="mt-3 grid grid-cols-3 gap-2 justify-center px-2.5">
        {/* coin & leverage */}
        <div className="flex items-center gap-2 border border-[#2A2A2F] rounded-md px-2 py-1 min-w-0">
          <img
            src={iconUrl}
            className="size-4 rounded-full bg-white"
            onError={(e) => {
              e.currentTarget.src = '/images/kairox-logo-rounded.svg'
            }}
            alt={coin}
          />
          <span className="text-sm font-medium">{coin}</span>

          <span className=" text-xs rounded bg-[#4C3A68] px-1.5 py-0.5 text-[#B392F0] font-semibold">
            {leverageValueText}
          </span>
        </div>

        {/* position value */}
        <div className="flex items-center justify-center border border-[#2A2A2F] rounded-md px-2 py-1">
          <span className="text-sm font-semibold tabular-nums">{positionValueText}</span>
        </div>

        {/* szi badge */}
        <div className="flex items-center justify-center border border-[#2A2A2F] rounded-md px-2 py-1">
          <div
            className={cn(
              'h-6 min-w-6 px-2 rounded-full flex items-center gap-[6px]',
              isLong ? 'text-[#00E497]' : 'text-[#FF1B49]',
            )}
            title={String(data.szi)}
          >
            <img
              src={iconUrl}
              className="size-4 rounded-full bg-white shrink-0"
              onError={(e) => {
                e.currentTarget.src = '/images/kairox-logo-rounded.svg'
              }}
              alt={coin}
            />
            <span className="text-xs font-semibold tabular-nums whitespace-nowrap">{sizeText}</span>
          </div>
        </div>
      </div>

      {/* Row 3: entry / liq */}
      <div className="px-2.5 mt-2 mb-4.5 flex items-center justify-between text-xs text-[#908E9A]">
        <div className="flex gap-1 min-w-0">
          <span>{t('smartMoney.supervisory.averageEntryPrice')}</span>
          <span className="text-[#FBFBFB] font-medium tabular-nums">${fmt.fmtMoney(toNum(data.entryPx))}</span>
        </div>
        <div className="h-4 w-[1px] bg-[#3A3A3F]" />
        {isClose ? (
          <div className="flex gap-1 min-w-0">
            <span>Pnl</span>
            <span className={`font-medium tabular-nums text-[${toNum(data.closedPnl) > 0 ? '#00E497' : '#FF1B49'}]`}>
              {formatUsdCompact(data.closedPnl)}
              &nbsp;(
              {fmtPctWithComma(
                getPnlRate(toNum(data.entryPx), sziNum, toNum(data.leverageValue), toNum(data.closedPnl)),
                2,
              )}
              )
            </span>
          </div>
        ) : (
          <div className="flex gap-1 min-w-0">
            <span>{t('smartMoney.supervisory.liquidationPrice')}</span>
            <span className="text-[#FBFBFB] font-medium tabular-nums">${fmt.fmtMoney(toNum(data.liquidationPx))}</span>
          </div>
        )}
      </div>

      {/* Row 4: leverageType + margin */}
      <div className="px-2.5 mt-2 flex items-center justify-between text-xs text-[#908E9A]">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#2A2A2F] px-1.5 py-0.5 text-[10px]">{leverageTypeText}</span>
          {/* <span>
            仓位保证金
            <span className="text-[#908E9A] font-medium tabular-nums">{formatUsdCompact(data.marginUsed)}</span>
          </span> */}
        </div>

        <div className="text-[#908E9A]">
          {lang === 'cn' ? formatFinishTime(data.time).cn : formatFinishTime(data.time).en}
        </div>
      </div>
    </div>
  )
}
