import { ChevronRight } from 'lucide-react'
import Tag from '../common/Tag'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { getUserHistoricalOrders } from '@/api/hyperliquid'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Skeleton } from '../ui/skeleton'
import { IUserHistoricalOrder } from '@/api/hyperliquid/types'
import { Avatar, AvatarFallback } from '../ui/avatar'
import dayjs from 'dayjs'
import { ModeOptionsEmun, USER_ADDRESS } from './type'

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'filled':
      return '已成交'
    case 'open':
      return '未成交'
    case 'canceled':
      return '已取消'
    default:
      return '未知状态'
  }
}

const getSideLabel = (side: 'A' | 'B') => {
  return side === 'A' ? '市价买入' : '市价卖出'
}

const HistoricalCommissionItem = ({ item }: { item: IUserHistoricalOrder }) => {
  const {
    order: { coin, orderType, origSz, side, timestamp, limitPx, reduceOnly, isTrigger, triggerPx, isPositionTpsl },
    status,
  } = item

  // Format timestamp
  const formattedTime = dayjs(timestamp).format('MM-DD HH:mm')

  // Determine the status color
  const statusColor = status === 'filled' ? 'text-[#00FFB4]' : status === 'open' ? 'text-[#00FFF6]' : 'text-[#FFFFFF80]'

  // Determine side color
  const sideColor = side === 'B' ? '#AB57FF' : '#00FFB4'

  return (
    <div
      className="rounded-[8px] bg-[url(/images/cryptoTransactionHistory/mask-group-historical-commission.png)] 
                bg-cover bg-no-repeat bg-[#ECECED14] relative 
                overflow-hidden cursor-pointer mb-2.5 bg-position-[1px]"
    >
      <div className="p-[12px] pb-[10px]">
        <div className="pb-2.5 flex justify-between items-center">
          <div className="flex items-center">
            <div className="pr-2">
              <Avatar className={cn('size-[calc(1rem*(30/16))]')}>
                <AvatarFallback
                  className={cn(
                    'size-[calc(1rem*(30/16))] text-[calc(14rem/16)] rounded-full object-cover bg-[#111111] flex items-center justify-center capitalize select-none',
                  )}
                >
                  {coin?.slice(0, 2).toLowerCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-[calc(1rem*(14/16))] font-[500] text-white">{coin}USD永续</span>
            <ChevronRight className="ml-1 text-[#B9B9B9]" size={20} />
          </div>
          <div className={cn('text-[calc(1rem*(13/16))]', statusColor)}>{getStatusLabel(status)}</div>
        </div>
        <div className="flex gap-2">
          <Tag
            label={getSideLabel(side)}
            color={sideColor}
            containerClassName="!rounded-[2px] text-[calc(1rem*(10/16))]"
          />
          <Tag
            label={`${reduceOnly ? '减仓' : '全仓'} ${'100x'}`}
            color="#00FFF6"
            containerClassName="!border-transparent bg-[#00FFF633] rounded-[4px] px-1 py-1 text-[calc(1rem*(10/16))] leading-2 !rounded-[2px]"
          />
          <p className="text-[calc(1rem*(12/16))] font-[500] text-[#FFFFFF80]">{formattedTime}</p>
        </div>
      </div>

      <div className="bg-[#ECECED0A] rounded-[8px] p-[12px]">
        <div className="grid grid-cols-2">
          <div className="flex gap-1 flex-col">
            <p className="text-[calc(1rem*(11/16))] text-[#FFFFFF80]">委托数量({coin})</p>
            <p className="text-[calc(1rem*(13/16))] text-white font-[500]">{origSz}</p>

            {isTrigger && triggerPx && (
              <div className="mt-3">
                <div className="flex gap-1 flex-col justify-end">
                  <p className="text-[calc(1rem*(11/16))] text-[#FFFFFF80]">
                    {isPositionTpsl ? '止盈 / 止损' : '触发价格'}
                  </p>
                  <p className="text-[calc(1rem*(13/16))] text-[#FFFFFF80] font-[500]">
                    {isPositionTpsl ? (
                      <>
                        <span className="text-[#00FFB4]">{triggerPx}</span>/
                        <span className="text-[#AB57FF]">{limitPx}</span>
                      </>
                    ) : (
                      <span>{triggerPx}</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <div className="flex gap-1 flex-col">
              <p className="text-[calc(1rem*(11/16))] text-[#FFFFFF80]">价格({orderType})</p>
              <p className="text-[calc(1rem*(13/16))] text-white font-[500]">{limitPx || 'Market'}</p>
            </div>
            <div className="flex gap-1 flex-col text-right">
              <p className="text-[calc(1rem*(11/16))] text-[#FFFFFF80]">状态</p>
              <p className="text-[calc(1rem*(13/16))] text-white font-[500]">{status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface IPHistoricalCommission {
  modeOption: ModeOptionsEmun
}

const HistoricalCommission = ({ modeOption }: IPHistoricalCommission) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [filteredData, setFilteredData] = useState<IUserHistoricalOrder[]>([])
  const { data, isPending, mutateAsync } = getUserHistoricalOrders()

  useEffect(() => {
    const fetchData = async () => {
      try {
        await mutateAsync(USER_ADDRESS)
      } catch (error) {
        console.error('Không thể lấy dữ liệu đơn hàng:', error)
      }
    }
    fetchData()
  }, [mutateAsync])

  useEffect(() => {
    if (data) {
      if (modeOption === ModeOptionsEmun.LONG) {
        setFilteredData(data.filter((item) => item.order.side === 'A'))
      } else if (modeOption === ModeOptionsEmun.SHORT) {
        setFilteredData(data.filter((item) => item.order.side === 'B'))
      } else {
        setFilteredData(data)
      }
    }
  }, [modeOption, data])

  const rowVirtualizer = useVirtualizer({
    count: filteredData?.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 180,
    overscan: 5,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  })

  return (
    <div ref={containerRef} className="flex flex-col py-3 h-[calc(100vh-180px)] overflow-auto _hidescrollbar">
      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-[180px] w-full rounded-lg" key={index} />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <HistoricalCommissionItem item={filteredData[virtualItem.index]} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-white">没有历史委托数据</div>
      )}
    </div>
  )
}

export default HistoricalCommission
