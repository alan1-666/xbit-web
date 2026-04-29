import { Avatar, AvatarImage } from '@components/ui/avatar.tsx'
import { SearchEvent } from '@/@generated/gql/graphql-prediction.ts'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'

export interface SearchItemProps {
  event: SearchEvent
}

export const SearchItem = (props: SearchItemProps) => {
  const { event } = props
  const market = useMemo(() => {
    const markets = event.markets
      .filter((market) => !market.closed)
      .sort((a, b) => (b.lastTradePrice || 0) - (a.lastTradePrice || 0))
    return markets.length > 0 ? markets[0] : undefined
  }, [event])
  return (
    <div className="relative group">
      <Link to={NAVIGATIONS.prediction.eventDetails(event.slug || '')} state={{ event }} className="absolute inset-0" />
      <div className="py-4 rounded-lg w-full relative z-10 pointer-events-none">
        <div className="absolute -left-4 top-0 h-full w-[calc(100%+32px)] rounded-lg pointer-events-none"></div>
        <div className="flex items-start gap-4 relative group-active:scale-[99.5%] transition-transform duration-200">
          <Avatar className="size-12">
            <AvatarImage src={event.image || undefined} className="object-cover" />
          </Avatar>
          <div className="flex-1 min-w-0 flex-col gap-1.25 flex">
            <p className="text-[15px] font-medium mb-0.5 text-pretty line-clamp-3">{event.title}</p>
            <div className="w-full hidden lg:block pointer-events-none">
              <div className="flex gap-2.5 items-center flex-wrap pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="text-neutral-200"
                  >
                    <g fill="currentColor">
                      <path
                        d="m6,0C2.691,0,0,2.691,0,6s2.691,6,6,6,6-2.691,6-6S9.309,0,6,0Zm2.564,8.244c-.148.169-.356.256-.565.256-.175,0-.351-.061-.493-.186l-2-1.75c-.163-.143-.256-.348-.256-.564v-2.75c0-.414.336-.75.75-.75s.75.336.75.75v2.41l1.744,1.526c.312.273.344.747.071,1.058Z"
                        stroke-width="0"
                      ></path>
                    </g>
                  </svg>
                  <p className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">
                    Ends {dayjs(event.endDate).fromNow(false)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 my-auto">
            <div className="flex flex-col justify-between items-end">
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-text text-right whitespace-nowrap text-[22px]">
                    {market?.lastTradePrice ? (market.lastTradePrice * 100).toFixed(0) : '<1'}%
                  </p>
                </div>
                <p className="text-xs font-normal leading-none text-text-secondary ml-0.5 whitespace-nowrap text-right">
                  {market?.groupItemTitle}
                </p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className="shrink-0 text-text-secondary group-hover:text-text-primary transition -translate-x-0.5 group-hover:translate-x-0"
            >
              <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
                <polyline points="4.25 10.25 8.5 6 4.25 1.75"></polyline>
              </g>
            </svg>
          </div>
        </div>
        <div className="w-full lg:hidden mt-2 flex pl-16 pointer-events-none">
          <div className="flex gap-2.5 items-center flex-wrap pointer-events-none">
            <p className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">$139m Vol.</p>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className="text-red-400"
              >
                <g fill="currentColor">
                  <path
                    d="m6.492.184c-.282-.245-.701-.245-.983,0-.174.151-4.258,3.733-4.258,7.071,0,2.617,2.131,4.745,4.75,4.745s4.75-2.128,4.75-4.745C10.75,3.917,6.666.334,6.492.184Zm-2.206,8.594c0-.99.995-2.228,1.714-2.963.719.736,1.714,1.973,1.714,2.963,0,.95-.769,1.722-1.714,1.722s-1.714-.772-1.714-1.722Z"
                    stroke-width="0"
                  ></path>
                </g>
              </svg>
              <p className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">$8m today</p>
            </div>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className="text-neutral-200"
              >
                <g fill="currentColor">
                  <path
                    d="m7.924,1.753c-.451-.467-.917-.951-1.341-1.475-.285-.353-.881-.353-1.166,0-.424.524-.89,1.008-1.341,1.475-1.389,1.441-2.826,2.932-2.826,5.501,0,2.617,2.131,4.745,4.75,4.745s4.75-2.128,4.75-4.745c0-2.569-1.437-4.06-2.826-5.501Zm-1.924,7.747c-1.241,0-2.25-1.007-2.25-2.245,0-.414.336-.75.75-.75s.75.336.75.75c0,.411.336.745.75.745s.75.336.75.75-.336.75-.75.75Z"
                    stroke-width="0"
                  ></path>
                </g>
              </svg>
              <p className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">$3m Liq.</p>
            </div>
            <a
              className="flex items-center gap-1 group/comments pointer-events-auto"
              href="/event/who-will-trump-nominate-as-fed-chair#commentsInner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className="text-neutral-200 group-hover/comments:text-neutral-300 transition"
              >
                <g fill="currentColor">
                  <path
                    d="m9.25.501H2.75C1.233.501,0,1.735,0,3.251v3.5c0,1.517,1.233,2.75,2.75,2.75h.25v1.75c0,.291.168.556.432.679.102.047.21.071.318.071.172,0,.343-.059.48-.174l2.792-2.326h2.229c1.517,0,2.75-1.233,2.75-2.75v-3.5c0-1.517-1.233-2.75-2.75-2.75Z"
                    stroke-width="0"
                  ></path>
                </g>
              </svg>
              <p className="text-[13px] text-neutral-400 font-medium whitespace-nowrap group-hover/comments:text-neutral-700 transition">
                325
              </p>
            </a>
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className="text-neutral-200"
              >
                <g fill="currentColor">
                  <path
                    d="m6,0C2.691,0,0,2.691,0,6s2.691,6,6,6,6-2.691,6-6S9.309,0,6,0Zm2.564,8.244c-.148.169-.356.256-.565.256-.175,0-.351-.061-.493-.186l-2-1.75c-.163-.143-.256-.348-.256-.564v-2.75c0-.414.336-.75.75-.75s.75.336.75.75v2.41l1.744,1.526c.312.273.344.747.071,1.058Z"
                    stroke-width="0"
                  ></path>
                </g>
              </svg>
              <p className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">Ends in 12 months</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
