import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { NAVIGATIONS } from '@/lib/navigations'
import { EventModel } from '@/modules/prediction/models/EventModel'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'

interface ElectionEventCardProps {
  event: EventModel
}

export const ElectionEventCard = ({ event }: ElectionEventCardProps) => {
  const dateStr = dayjs(event.endDate || event.startDate)
  const day = dateStr.format('DD')
  const month = dateStr.format('MMM')

  const markets = useMemo(() => {
    if (!event.markets) return []
    return event.markets.filter((market) => market?.active && !market.closed)
  }, [event.markets])

  const displayItems =
    markets.length > 0 ? markets.sort((a, b) => Number(b.outcomePrices?.[0]) - Number(a.outcomePrices?.[0])) : []

  return (
    <div className="group rounded-[8px] bg-[#060606] shadow-none border border-[#79778C29] p-3 xl:p-3.5 transition duration-100 ease-in-out hover:bg-[#1c1d21]! hover:shadow-md lg:hover:scale-[1.01] flex-1 flex flex-col cursor-pointer h-full">
      <div className="flex">
        <Link
          className="flex flex-1 items-center gap-5 hover:[&_.card-title]:decoration-white"
          to={NAVIGATIONS.prediction.eventDetails(event.slug || '')}
          state={{ event }}
        >
          <div className="flex flex-col justify-center gap-px h-9.5 xl:h-10.5 p-0 w-7">
            <p className="text-lg xl:text-2xl leading-5 xl:leading-6 font-semibold text-white">{day}</p>
            <p className="text-sm font-normal whitespace-nowrap text-[#908E98]">{month}</p>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <p className="card-title text-white font-semibold text-sm xl:text-xl leading-5! underline decoration-2 decoration-transparent transition-[text-decoration-color] duration-200 line-clamp-2">
              {event.countryName}
            </p>
            <div className="flex flex-row gap-2 items-center">
              <p className="text-sm font-medium leading-none opacity-50 text-[#b8b8b8]">{event.electionType}</p>
            </div>
          </div>
          <div className="size-9 relative shrink-0 rounded-md overflow-hidden">
            <img
              alt={event?.title || ''}
              loading="lazy"
              className="object-cover absolute h-full w-full inset-0"
              src={event?.image || ''}
            />
          </div>
        </Link>
      </div>

      <ul className="mt-4 p-0 mb-0 transition-[height] duration-600 ease-in-out overflow-hidden space-y-2">
        {displayItems.slice(0, 4).map((market) => (
          <li className="flex flex-col" key={market.id}>
            <div className="flex flex-row rounded-[6px] overflow-hidden py-0.5 hover:[&_.card-item-title]:decoration-white hover:[&_.bar-overlay]:opacity-[0.12]!">
              <Link
                className="flex flex-row flex-1 bg-[#18181B] rounded-[6px] border border-[#2E2E35] hover:border-[#9B2CFC]"
                to={NAVIGATIONS.prediction.marketDetails(event.slug || '', market.slug || '')}
              >
                <div className="relative flex h-[40px] w-full">
                  <div
                    className="absolute top-0 left-0 h-[40px] transition-[width] duration-500 rounded-[6px] bg-[#9B2CFC]"
                    style={{
                      width: `${Number(market.outcomePrices?.[0] || 0) * 100}%`,
                      // backgroundColor: 'rgba(155, 44, 252, 0.3)',
                    }}
                  >
                    <div className="bar-overlay w-full h-full bg-black opacity-0 transition-opacity duration-200 absolute rounded-[6px] top-0 left-0"></div>
                  </div>

                  <div className="flex flex-row absolute gap-[8px] items-center top-0 bottom-0 left-[12px] right-[12px]">
                    <p className="text-sm font-bold text-white block w-[34px]">
                      {(() => {
                        const p = Number(market.outcomePrices?.[0] || 0)
                        return p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`
                      })()}
                    </p>
                    <div className="size-7 relative shrink-0 rounded-full overflow-hidden">
                      <Avatar className="size-7">
                        <AvatarImage src={market.image || event.image || undefined} className="object-cover" />
                      </Avatar>
                    </div>
                    <p className="card-item-title text-sm font-light   text-white underline decoration-2 decoration-transparent overflow-hidden text-ellipsis whitespace-nowrap transition-[text-decoration-color] duration-200">
                      {market.question}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
