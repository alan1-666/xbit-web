import React, { useRef } from 'react'

import { ReactComponent as ArrowRightIcon } from '@/components/icon/supervisory/arrow_right.svg'
import { ReactComponent as FollowerIcon } from '@/components/icon/supervisory/follower.svg'
import { ReactComponent as UserHeadIcon } from '@/components/icon/supervisory/user_head.svg'

type CoinCardListItem = {
  icon: string
  symbol: string
  follower: number | string
  value: number | string
}

export const CoinCardList: React.FC<{ list: CoinCardListItem[] }> = ({ list }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleRightScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: scrollRef.current.clientWidth * 0.8,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className='w-full flex items-center gap-2' >
      
      <div
        ref={scrollRef}
        className="overflow-x-auto whitespace-nowrap flex gap-3 py-1 scrollbar-hide"
      >
        {list?.map((item, index) => (
          <div
            key={item.symbol + index}
            className="
              inline-flex items-center gap-2 
              rounded-xl px-3 py-2 
              text-[#FBFBFB] text-xs 
              border border-[rgba(121,119,144,0.16)]
              shrink-0
            "
          >
            <UserHeadIcon className="w-4 h-4" />

            <span className="text-sm font-medium">
              {item?.symbol?.toUpperCase() ?? '-'}
            </span>

            <div className="text-xs flex items-center gap-1">
              <FollowerIcon className="w-4 h-4" />
              <span>{item.follower}</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleRightScroll}>
        <ArrowRightIcon className="w-3.5 h-3.5 shrink-0 cursor-pointer hover:opacity-80" />
      </button>

    </div>
  )
}
