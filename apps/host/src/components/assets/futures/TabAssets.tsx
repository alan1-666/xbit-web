import { getPerpUserHistoryTrades } from '@/api/hyperliquid'
import DesktopShare from '@/components/futuresDetails/desktopShare'
import { xHistoryTrade } from '@/components/futuresDetails/trade/types'
import { IconEmpty } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { cn } from '@/lib/utils'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import { memo, useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export enum SIDE_ENUM {
  LONG = 'Long',
  SHORT = 'Short',
}

const ItemAssetSkeleton = memo(() => {
  return (
    <div className="rounded-[8px] bg-gradient-to-r border border-[#ECECED14] animate-pulse mb-2">
      <div className="p-3 bg-[#FFFFFF05]">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Skeleton className="w-[24px] h-[24px] rounded-full" />
            <div className="">
              <div className="flex gap-2">
                <div className="flex gap-1 items-center">
                  <Skeleton className="w-[60px] h-[14px]" />
                  <Skeleton className="w-[40px] h-[12px] rounded-[2px]" />
                </div>
              </div>
              <Skeleton className="w-[120px] h-[12px] mt-1" />
            </div>
          </div>
          <Skeleton className="w-5 h-5" />
        </div>
      </div>

      <div className="flex gap-2.5 py-2.5 flex-col">
        <div className="px-3 flex justify-between items-center gap-2">
          <div>
            <Skeleton className="w-[60px] h-[11px]" />
            <Skeleton className="w-[80px] h-[15px] mt-1" />
          </div>
          <div className="text-right">
            <Skeleton className="w-[70px] h-[11px]" />
            <Skeleton className="w-[30px] h-[12px] mt-1" />
          </div>
        </div>

        <div className="px-3 grid grid-cols-3 gap-2">
          <div>
            <Skeleton className="w-[50px] h-[11px]" />
            <Skeleton className="w-[60px] h-[12px] mt-1" />
          </div>
          <div className="text-center">
            <Skeleton className="w-[40px] h-[11px] mx-auto" />
            <Skeleton className="w-[50px] h-[12px] mt-1 mx-auto" />
          </div>
          <div className="text-right">
            <Skeleton className="w-[45px] h-[11px] ml-auto" />
            <Skeleton className="w-[55px] h-[12px] mt-1 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
})

export const ItemAsset = memo(({ orderInfo, t }: { orderInfo: xHistoryTrade; t: TFunction }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [info, setInfo] = useState<any>({})
  const isLong = orderInfo.side === 'B'
  const navigate = useNavigate()
  const formattedTime = useMemo(() => dayjs(orderInfo.time).format('YYYY-MM-DD HH:mm:ss'), [orderInfo.time])

  const orderValue = useMemo(() => {
    return (parseFloat(orderInfo.px) * parseFloat(orderInfo.sz)).toFixed(2)
  }, [orderInfo.px, orderInfo.sz])

  const dirText = useMemo(() => {
    switch (orderInfo.dir) {
      case 'Close Long':
        return t('futuresDetails.common.closeLong')
      case 'Close Short':
        return t('futuresDetails.common.closeShort')
      case 'Open Long':
        return t('futuresDetails.common.long')
      case 'Open Short':
        return t('futuresDetails.common.short')
      default:
        return ''
    }
  }, [orderInfo.dir])

  const handleNavigate = (coin: string) => {
    navigate(`/futures/${coin}?tab=history`)
  }

  return (
    <>
      <div
        className={cn(
          'rounded-[8px] bg-gradient-to-r border border-[#ECECED14] cursor-pointer mb-2',
          isLong ? 'gradient-border-long' : 'gradient-border-short',
        )}
      >
        <div className={`p-3 ${isLong ? 'header-item-long' : 'header-item-short'}`}>
          <div className={`flex justify-between items-center `}>
            <div className="flex gap-2 items-center">
              <div className="">
                <div className="flex gap-2">
                  <div className="flex gap-1 items-center">
                    <div
                      className="text-[calc(14rem/16)] leading-[calc(14rem/16)] text-white whitespace-nowrap pr-2"
                      onClick={() => handleNavigate(orderInfo.coin)}
                    >
                      {orderInfo.coin}USD{t('futuresDetails.common.perp')}
                    </div>
                    <div
                      className={`px-1 py-[1px] font-medium text-[10px] rounded-[4px] border-[0.5px] leading-[calc(1rem*(10/16))] pb-[3.8px] border-[#FFFFFFCC] text-[#FFFFFFCC]
                      }`}
                    >
                      {dirText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="font-normal text-[12px] text-white/50 mr-0.5">{formattedTime}</div>
              {(orderInfo.dir === "Close Long" || orderInfo.dir === "Close Short")  && (
                <Button
                  variant={'ghost'}
                  className="p-0 text-[#B9B9B9] cursor-pointer text-[calc(13rem/16)] h-[calc(13rem/16)]"
                  onClick={() => {
                    setOpen(true)
                    setInfo({
                      coin: orderInfo.coin,
                      unrealizedPnl: orderInfo.closedPnl,
                      markPrice: orderInfo.px,
                      transaction: orderValue,
                      dir: orderInfo.dir,
                    })
                  }}
                >
                  <img src="/images/futuresDetail/share-icon.svg" alt="" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 py-2.5 flex-col">
          <div className="px-3  flex justify-between items-center gap-2">
            <div className="space-y-1.5">
              <div className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.realizedPnl')}
              </div>
              <p className="flex  leading-[calc(14rem/16)]">
                <span
                  className={cn(
                    'text-[calc(15rem/16)] font-[600] mr-1',
                    parseFloat(orderInfo.closedPnl) > 0
                      ? 'text-rise'
                      : parseFloat(orderInfo.closedPnl) < 0
                        ? 'text-fall'
                        : 'text-[#FFFFFF]',
                  )}
                >
                  {orderInfo.closedPnl}
                </span>
              </p>
            </div>
            <div className="text-right space-y-1.5">
              <div className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.openInterest')} ({orderInfo.coin})
              </div>
              <p className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)] font-bold">{orderInfo.sz}</p>
            </div>
          </div>
          <div className="px-3 grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <div className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('position.transactionPrice')}
              </div>
              <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] app-font-medium">
                {formatNumberWithCommas(orderInfo.px, 2)}
              </p>
            </div>
            <div className="text-center space-y-1.5">
              <div className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('assets.futures.positionHistory')}
              </div>
              <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] app-font-medium">
                {formatNumberWithCommas(orderValue)}
              </p>
            </div>
            <div className="text-right space-y-1.5">
              <div className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                {t('assets.deposit.fee')} (USDT)
              </div>
              <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] app-font-medium">
                {orderInfo.fee}
              </p>
            </div>
          </div>
        </div>
      </div>
      {open && (
        <DesktopShare open={open} onClose={setOpen} info={info} shareType='orderHistory' />
      )}
    </>
  )
})

const TabAssets = () => {
  const { t } = useTranslation()
  const walletDex = useSelector(_walletDex)
  const userAddress = walletDex?.walletAddress

  const parentRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(600)

  const { data: histories = [], isLoading } = useQuery({
    queryKey: ['history_orders', userAddress],
    queryFn: () => getPerpUserHistoryTrades(userAddress!),
    enabled: useCheckLoginOnArb(),
    select: (rawOrders) => {
      return rawOrders.filter((item: any) => {
        return ['Close Long', 'Close Short', 'Open Long', 'Open Short'].indexOf(item.dir) > -1
      })
    },
  })

  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight
      const headerHeight = 200
      const footerHeight = 100
      const availableHeight = viewportHeight - headerHeight - footerHeight
      setContainerHeight(Math.max(400, availableHeight))
    }

    calculateHeight()
    window.addEventListener('resize', calculateHeight)
    return () => window.removeEventListener('resize', calculateHeight)
  }, [])

  const virtualizer = useVirtualizer({
    count: histories.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
    paddingStart: 10,
    paddingEnd: 10,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 mb-80 p-[10px] rounded-t-[10px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <ItemAssetSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (histories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center my-[30%]">
        <IconEmpty />
        <span className="text-[#FFFFFF80] text-[0.75rem]">{t('assets.futures.noDataYet')}</span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-t-[10px]')}>
      <div
        ref={parentRef}
        className="overflow-auto _hidescrollbar"
        style={{
          height: `${containerHeight}px`,
          contain: 'strict',
        }}
      >
        <div
          className="_hidescrollbar"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <ItemAsset orderInfo={histories[virtualItem.index]} t={t} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TabAssets
