import { ChevronRight } from 'lucide-react'
import CardWithGradient from '../common/CardWithGradient'
import './style.css'
import { getUserFunding } from '@/api/hyperliquid'
import { memo, useEffect, useState, useRef } from 'react'
import { IUserFunding } from '@/api/hyperliquid/types'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Skeleton } from '../ui/skeleton'
import { useVirtualizer } from '@tanstack/react-virtual'
import { USER_ADDRESS } from './type'

interface IPFundingHistoryItem {
  item: IUserFunding
  onCardClick?: () => void
  className?: string
}

const FundingHistoryItem = ({ onCardClick, item, className }: IPFundingHistoryItem) => {
  const {
    delta: { coin, fundingRate, nSamples, szi, type, usdc },
    time,
  } = item

  return (
    <CardWithGradient
      isHoverScaleCard={false}
      onCardClick={onCardClick}
      bgColor={Number(usdc) < 0 ? 'purple' : 'green'}
      className='mb-3'
      header={
        <div className="flex items-center justify-between">
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
            <ChevronRight className="ml-1" size={20} />
          </div>
          <div className="text-[calc(1rem*(12/16))] text-[#FFFFFF80]">{dayjs(time).format('DD-MM HH:mm:ss')}</div>
        </div>
      }
      content={
        <div className="relative z-1 p-[12px] flex justify-between pb-[14px]">
          <div className="flex flex-col">
            <span className="text-[calc(1rem*(14/16))] text-[#FFFFFF80] mb-1">数量 ({coin})</span>
            <span className="text-[calc(1rem*(14/16))] text-white font-bold">{szi}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[calc(1rem*(14/16))] text-[#FFFFFF80] mb-1">资金费率</span>
            <span className="text-[calc(1rem*(14/16))] text-white font-bold">{fundingRate}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[calc(1rem*(14/16))] text-[#FFFFFF80] mb-1">支付 (USDC)</span>
            <span
              className={`text-[calc(1rem*(14/16))] font-bold ${Number(usdc) > 0 ? 'text-[#00FFB4]' : 'text-[#AB57FF]'}`}
            >
              {usdc}
            </span>
          </div>
        </div>
      }
    />
  )
}

const FundingHistory = () => {
  const { data, isPending, mutateAsync } = getUserFunding()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      await mutateAsync(USER_ADDRESS)
    }
    fetchData()
  }, [mutateAsync])

  const rowVirtualizer = useVirtualizer({
    count: data?.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 140,
    overscan: 5,
  })

  return (
    <div ref={containerRef} className="flex flex-col py-3 h-[calc(100vh-180px)] overflow-auto _hidescrollbar">
      {isPending ? (
        <div className="">
          {Array.from({ length: 15 }).map((_, index) => (
            <Skeleton className="h-[128px] w-full rounded-lg mb-3" key={index} />
          ))}
        </div>
      ) : (
        <div className="relative space-y-2 flex" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full mb-3"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                padding: '4px 0',
              }}
            >
              <FundingHistoryItem item={data![virtualItem.index]} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(FundingHistory)
