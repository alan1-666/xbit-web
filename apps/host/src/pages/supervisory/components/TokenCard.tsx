import { ReactComponent as FollowerIcon } from '@/components/icon/supervisory/follower.svg'
import { Configs } from '@/const/configs'
import type { AssetCtx } from '@/hooks/useHyperliquidActiveAssetCtx'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { fmt } from '@/utils/numbers'
import { useTranslation } from 'react-i18next'

const greenText = 'text-[#00E497]'
const greenBg = 'bg-[rgba(0,228,151,0.12)]'
const redText = 'text-[#FF1B49]'
const redBg = 'bg-[rgba(255,27,73,0.12)]'
const subText = 'text-[#908E9A]'

export const TokenCard = ({ token, assetCtx }: { token: any; assetCtx?: AssetCtx }) => {
  const { isDesktop } = useResponsive()

  const coin = (token?.coin ?? token?.tokenName ?? '').toUpperCase()
  const { t } = useTranslation()

  // WS 实时：价格 + 24h涨跌幅
  const price = assetCtx?.markPx
  const changePct = assetCtx?.changePct
  const isUp = (changePct ?? 0) >= 0

  const flow = Number(token?.totalDiffPositionValue ?? 0)
  const flowIsNeg = flow < 0
  const flowText = `${flowIsNeg ? '-' : '+'}$${Math.abs(flow).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

  const avgLev = Number(token?.avgLeverage ?? 0)
  const longAvgLeverage = Number(token?.longAvgLeverage ?? 0)
  const shortAvgLeverage = Number(token?.shortAvgLeverage ?? 0)

  const longV = Number(token?.longPositionValue ?? 0)
  const shortV = Number(token?.shortPositionValue ?? 0)
  const total = Math.max(longV + shortV, 0)
  const longPct = total > 0 ? (longV / total) * 100 : 0
  const shortPct = total > 0 ? (shortV / total) * 100 : 0

  return (
    <div className={cn('w-full mb-3', isDesktop ? 'rounded-md p-1' : 'rounded-lg')}>
      <div className={cn('flex items-center gap-3', !isDesktop ? 'px-2 py-3 bg-[#18181B] rounded-t-lg' : '')}>
        <img
          src={`${Configs.getHyperliquidConfig().imgUrl}/${coin}.svg`}
          className="size-9 rounded-full bg-white/5"
          onError={(e) => {
            e.currentTarget.src = '/images/kairox-logo-rounded.svg'
          }}
          alt={`${coin}-logo`}
        />

        <div className="flex-1 flex justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-base font-semibold text-white truncate">{coin || '-'}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">${fmt.fmtUsd(price)}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${isUp ? greenText : redText} ${isUp ? greenBg : redBg}`}
              >
                {fmt.fmtPct(changePct)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className={cn(!isDesktop ? 'text-right' : 'mr-12')}>
              <p className={`text-[13px] font-semibold ${subText}`}>{t('smartMoney.supervisory.24HCapitalInflow')}</p>
              <span className={`text-[13px] ${flowIsNeg ? redText : greenText}`}>{flowText}</span>
            </div>

            {isDesktop && (
              <div>
                <div className="mt-1 flex items-center justify-between text-xs gap-6">
                  <div className={`flex items-center gap-1 ${greenText}`}>
                    <FollowerIcon className="w-3 h-3" />
                    <span>{t('smartMoney.supervisory.averageLeverage')} {longAvgLeverage ? `${longAvgLeverage.toFixed(1)}X` : '--'}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${redText}`}>
                    <FollowerIcon className="w-3 h-3" />
                    <span>{t('smartMoney.supervisory.averageLeverage')} {shortAvgLeverage ? `${shortAvgLeverage.toFixed(1)}X` : '--'}</span>
                  </div>
                </div>

                <div className="mt-2 h-2 w-60 rounded-full bg-white/10 relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-[#12C48B]" style={{ width: `${longPct}%` }} />
                  <div className="absolute right-0 top-0 h-full bg-[#E64C68]" style={{ width: `${shortPct}%` }} />
                </div>

                <div className="mt-1 flex items-center justify-between text-xs">
                  <div className={greenText}>${longV.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className={redText}>${shortV.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isDesktop && (
        <div className="w-full px-2 py-3">
          <div className="mt-1 flex items-center justify-between text-xs gap-6">
            <div className={`flex items-center gap-1 ${greenText}`}>
              <FollowerIcon className="w-3 h-3" />
              <span>{t('smartMoney.supervisory.averageLeverage')} {longAvgLeverage ? `${longAvgLeverage.toFixed(1)}X` : '--'}</span>
            </div>
            <div className={`flex items-center gap-1 ${redText}`}>
              <FollowerIcon className="w-3 h-3" />
              <span>{t('smartMoney.supervisory.averageLeverage')} {shortAvgLeverage ? `${shortAvgLeverage.toFixed(1)}X` : '--'}</span>
            </div>
          </div>

          <div className="mt-2 h-2 w-full rounded-full bg-white/10 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-[#12C48B]" style={{ width: `${longPct}%` }} />
            <div className="absolute right-0 top-0 h-full bg-[#E64C68]" style={{ width: `${shortPct}%` }} />
          </div>

          <div className="mt-1 flex items-center justify-between text-xs">
            <div className={greenText}>${longV.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div className={redText}>${shortV.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      )}
    </div>
  )
}
