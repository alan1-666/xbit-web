import Tag from '@/components/common/Tag'
import DesktopShare from '@/components/futuresDetails/desktopShare'

import {
  CollapsedBaseItem,
  CollapsedCardWithGradient,
  CollapsedCoinItem,
  CollapsedPnlItem,
} from '@/components/futuresDetails/trade/CollapsedCard.tsx'
import MarketPriceCloseButton from '@/components/futuresDetails/trade/MyPositionList/MarketPriceCloseButton'
import TpslButton from '@/components/futuresDetails/trade/MyPositionList/TpslButton'
import { formatPrice } from '@/components/futuresDetails/trade/tools'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatNumberWithCommas, formatPercentage } from '@/utils/helpers'
import { Button } from '@components/ui/button.tsx'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EnhancedPosition } from './Futures'
import './styles.css'
import { selectPricePrecisionBySymbol } from '@/redux/modules/futuresMeta.slice'
import { useAppSelector } from '@/redux/store'


interface ItemPositionProps {
  item: EnhancedPosition
  szMap: Record<string, number>
}

// Skeleton component for loading state
export const ItemPositionSkeleton = () => {
  return (
    <div className="rounded-[8px] bg-[#1A1A1A] border border-[#ECECED14]">
      {/* Header skeleton */}
      <div className="flex justify-between items-center p-3">
        <div className="flex gap-2">
          <Skeleton className="w-[24px] h-[24px] rounded-full" />
          <div className="flex gap-1 items-center">
            <Skeleton className="h-[14px] w-16" />
            <Skeleton className="h-[20px] w-20 rounded-[2px]" />
          </div>
        </div>
        <Skeleton className="h-[12px] w-32" />
      </div>

      {/* PnL and Open Interest skeleton */}
      <div className="flex justify-between items-center p-3">
        <div>
          <Skeleton className="h-[11px] w-20 mb-1.5" />
          <Skeleton className="h-[15px] w-32" />
        </div>
        <div className="text-right">
          <Skeleton className="h-[11px] w-24 mb-1.5" />
          <Skeleton className="h-[15px] w-20" />
        </div>
      </div>

      {/* Grid data skeleton */}
      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={cn(index % 3 === 1 ? 'text-center' : index % 3 === 2 ? 'text-right' : '')}>
            <Skeleton className="h-[11px] w-16 mb-1.5" />
            <Skeleton className="h-[15px] w-20" />
          </div>
        ))}
      </div>

      {/* Action buttons skeleton */}
      <div className="flex justify-between items-center gap-3 p-3 border-t border-[#ECECED14]">
        <Skeleton className="h-8 w-[120px] rounded-full" />
        <Skeleton className="h-8 w-[120px] rounded-full" />
        <div className="flex items-center justify-center gap-1">
          <Skeleton className="w-[20px] h-[20px] rounded-full" />
          <Skeleton className="h-[13px] w-12" />
        </div>
      </div>
    </div>
  )
}

const ItemPosition = ({ item, szMap }: ItemPositionProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState<boolean>(false)
  const [info, setInfo] = useState<any>({})

  const [isExpand, setIsExpand] = useState<boolean>(true)

  // useImperativeHandle(ref, () => ({
  //   expand: () => {
  //     setIsExpand(true)
  //   },
  //   collapse: () => {
  //     setIsExpand(false)
  //   },
  // }))
  const pricePrecision = useAppSelector(selectPricePrecisionBySymbol(item.symbol));

  const liqPx = useMemo(() => {
    return parseFloat(item.liqPrice.toString()).toFixed(pricePrecision)
  }, [item.liqPrice, pricePrecision])

  const tpPx = useMemo(() => {
    if (!item.positionInfo.tpPrice) return ''
    return parseFloat(formatPrice(item.positionInfo.tpPrice, szMap[item.symbol])).toString()
  }, [item.positionInfo.tpPrice, szMap])

  const slPx = useMemo(() => {
    if (!item.positionInfo.slPrice) return ''
    return parseFloat(formatPrice(item.positionInfo.slPrice, szMap[item.symbol])).toString()
  }, [item.positionInfo.slPrice, szMap])

  const szi = Math.abs(parseFloat(item.size))

  return (
    <>
      {!isExpand ? (
        <CollapsedCardWithGradient isPositive={item.side === 'B'} onClickExpand={() => setIsExpand(true)}>
          <CollapsedCoinItem coin={item.symbol} leverage={item.leverage} />
          <CollapsedBaseItem label={`${t('futuresDetails.common.quantity')} (${item.symbol})`} value={szi.toString()} />
          <CollapsedPnlItem pnl={item.unrealizedPnl.toString()} roe={item.pnlPercent.toFixed(2)} />
        </CollapsedCardWithGradient>
      ) : (
        <div
          className={cn(
            `rounded-[8px] cursor-pointer overflow-hidden`,
            item.side === 'B' ? 'gradient-border-long' : 'gradient-border-short',
          )}
          // onClick={() => {
          //   if (!disableNavigte) {
          //     navigate(APP_PATH.FUTURES + `/${item.symbol}?tab=position`)
          //   }
          // }}
        >
          <div
            className={`flex justify-between items-center p-3 ${item.side === 'B' ? 'header-item-long' : 'header-item-short'}`}
          >
            <div className="flex gap-2">
              {/* <ImgWithFallback
                src={`${Configs.getHyperliquidConfig().imgUrl}/${item.symbol}.svg`}
                srcFallback="/images/logo-pair-fallback.webp"
                sharedClassName="size-7"
                loadedClassName="bg-[#fff] rounded-full"
              /> */}
              <div className="flex gap-1 items-center">
                <div className="font-medium text-[12px] leading-none text-white whitespace-nowrap">
                  {item.symbol}USD {t('futuresDetails.common.perp')}
                </div>
                <Tag
                  label={item.side === 'B' ? t('futuresDetails.common.long') : t('futuresDetails.common.short')}
                  color={item.side === 'B' ? '#00FFB4' : '#F25461'}
                  containerClassName="rounded-[4px] px-1 py-0.5"
                />
                <div className="px-1 py-[2.5px] font-medium text-[11px] rounded-[2px]  leading-[calc(1rem*(11/16))] pb-[5px] text-[#AB57FF] bg-[#AB57FF1A] capitalize whitespace-nowrap">
                  {`${item.type === 'cross' ? t('position.cross') : t('position.isolated')} ${item.leverage}x`}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {item.positionInfo?.timestamp && (
                <span className="text-[calc(12rem/16)] leading-[calc(12rem/16)] text-[#FFFFFF80]">
                  {dayjs(item.positionInfo?.timestamp).format('MM-DD HH:mm:ss')}
                </span>
              )}
              <div
                className="flex items-center justify-center gap-1 font-normal text-[13px] leading-none text-white/50 cursor-pointer ml-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(true)
                  setInfo({
                    openPrice: item.positionInfo.entryPx,
                    markPrice: item.positionInfo.markPrice,
                    coin: item.symbol,
                    unrealizedPnl:
                      Number(item.positionInfo.unrealizedPnl) >= 0
                        ? `+ ${item.positionInfo.unrealizedPnl}`
                        : item.positionInfo.unrealizedPnl,
                    pnlPercentage: Number(item.pnlPercent).toFixed(2),
                  })
                }}
              >
                <img
                  src="/images/icons/share.svg"
                  alt="share"
                  className="w-[20px] h-[20px] cursor-pointer hover:scale-[1.1]"
                />
                {/* {t('position.share')} */}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center p-3">
            <div>
              <div className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.pnl')} (USDT)
              </div>
              <div
                className={`mt-1.5 text-[calc(14rem/16)] leading-[calc(14rem/16)] app-font-medium ${Number(item.unrealizedPnl) >= 0 ? 'text-rise ' : 'text-fall'}`}
              >
                {item.unrealizedPnl >= 0 ? '+' : ''} {formatNumberWithCommas(`${item.unrealizedPnl}`, 8)} (
                {formatPercentage(Number(item.pnlPercent))})
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.size')} ({item.symbol})
              </div>
              <div className="mt-1.5 text-[calc(14rem/16)] leading-[calc(14rem/16)] app-font-medium text-white text truncate max-w-[115px]">
                {szi}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[14px] px-3 pb-3">
            <div>
              <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.holdingValue')} (USDT)
              </p>
              <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] app-font-medium">
                {item.positionValue}
              </p>
            </div>
            <div className="text-center">
              <div className="font-normal text-[11px] leading-[12px] text-white/50">{t('position.margin')} (USDT)</div>
              <div className="mt-1.5 font-semibold text-[15px] leading-none text-white">
                {formatNumberWithCommas(`${item.positionInfo.marginUsed}`, 8)}
              </div>
            </div>
            <div className="text-right flex flex-col justify-end">
              <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.liquidationPrice')}
              </p>
              <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] app-font-medium">
                {formatNumberWithCommas(`${liqPx}`, 5)}
              </p>
            </div>

            <div>
              <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.entryPrice')}
              </p>
              <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] app-font-medium">
                {formatNumberWithCommas(`${item.entryPrice}`)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.markPrice')}
              </p>
              <p className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)] app-font-medium">
                {formatNumberWithCommas(`${item.markPrice}`)}
              </p>
            </div>
            <div className="flex justify-end">
              <div>
                <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                  {t('position.fundingRate')} (USD)
                </p>
                <p
                  className={cn(
                    'text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] app-font-medium text-right',
                    parseFloat(item.positionInfo?.cumFunding?.sinceOpen) > 0
                      ? 'text-rise'
                      : parseFloat(item.positionInfo?.cumFunding?.sinceOpen) < 0
                        ? 'text-fall'
                        : 'text-[#FFFFFF]',
                  )}
                >
                  {formatNumberWithCommas(item.positionInfo?.cumFunding?.sinceOpen)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center gap-3 p-3 border-t border-[#ECECED14]">
            <div className="flex items-center gap-3">
              <TpslButton
                info={{
                  ...item.positionInfo,
                  tpPrice: tpPx,
                  slPrice: slPx,
                }}
                childrenTrigger={
                  <Button
                    // variant="borderGradient"
                    size="sm"
                    className="min-w-[130px] relative sm:min-w-[120px] rounded-full bg-gradient-to-r from-[#E149F8]/10 via-[#9945FF]/10 to-[#00F3AB]/10 font-medium text-[12px] leading-none text-[#FFFFFF]  gradient-border-focus "
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    {item?.positionInfo.tpPrice || item?.positionInfo.slPrice ? (
                      <div className="flex justify-end flex-col items-end position-relative">
                        <p className="text-[#FFFFFF] text-[calc(8rem/16)] bg-[#141414] leading-[calc(12rem/16)] absolute top-[-6px] left-4 px-1 py-0.5 rounded-[4px]">
                          {`${t('position.takeProfit')}/${t('position.stopLoss')}`}
                        </p>
                        <p className="text-[calc(12rem/16)] leading-[calc(14rem/16)] flex items-center">
                          <span className="text-rise">{tpPx ? formatNumberWithCommas(tpPx) : '-'}</span>
                          <span className="text-[#FFFFFF] mx-0.5 text-[calc(10rem/16)]">/</span>
                          <span className="text-fall">{slPx ? formatNumberWithCommas(slPx) : '-'}</span>
                          <img className="ml-0.5" src="/images/futuresDetail/edit-icon.svg" alt="icon edit" />
                        </p>
                      </div>
                    ) : (
                      <>{`${t('position.takeProfit')}${t('position.stopLoss')}`}</>
                    )}
                  </Button>
                }
              />
              <MarketPriceCloseButton info={item?.positionInfo} />
            </div>
            <Button
              variant={'ghost'}
              className="p-0 text-[#FFFFFF80]  h-[calc(16rem/16)]"
              onClick={() => {
                setIsExpand(false)
              }}
            >
              <img src="/images/futuresDetail/card-arrow-down2.svg" className="rotate-180" alt="icon arrow down" />
            </Button>
          </div>
        </div>
      )}
      {open && (
        <DesktopShare open={open} onClose={setOpen} info={info} shareType='order' />
      )}
    </>
  )
}

export default ItemPosition
