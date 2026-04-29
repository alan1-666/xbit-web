import { NAVIGATIONS } from '@/lib/navigations'
import { useSportsFutures } from '../../hooks/useSportEventsBySlug'
import { FuturesCardSkeleton } from './FuturesCardSkeleton'
import { FuturesMarketCard } from './FuturesMarketCard'

export const SportsFuturesView = () => {
  const { events, isLoading } = useSportsFutures()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-10">
        {[...Array(6)].map((_, index) => {
          let spanClass = 'col-span-1 lg:col-span-6'
          if (index === 0) {
            spanClass = 'col-span-1 lg:col-span-12'
          } else if (index >= 1 && index <= 3) {
            spanClass = 'col-span-1 lg:col-span-4'
          } else if (index >= 4 && index <= 5) {
            spanClass = 'col-span-1 lg:col-span-6'
          }
          return (
            <div key={index} className={spanClass}>
              <FuturesCardSkeleton />
            </div>
          )
        })}
      </div>
    )
  }

  if (!events || events.length === 0) {
    return <div className="text-gray-500 py-10 text-center">No futures markets available for this sport.</div>
  }

  const mainEvent = events[0]
  const scrollEvents = events.slice(1, 4)
  const remainingEvents = events.slice(4)

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Main Event (Index 0) */}
      {mainEvent && (
        <div className="w-full">
          <FuturesMarketCard
            title={mainEvent.title || ''}
            outcomes={mainEvent.processedOutcomes}
            link={NAVIGATIONS.prediction.eventDetails(mainEvent.slug || '')}
            className="w-full"
            enableExpand={true}
            initialCount={5}
            showIcon={true}
            showProgressBar={true}
          />
        </div>
      )}

      {/* Horizontal Scroll (Indexes 1-3) - Mobile Only */}
      {scrollEvents.length > 0 && (
        <div className="flex xl:hidden gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4">
          {scrollEvents.map((event) => (
            <div key={event.slug} className="flex-none w-[85%] sm:w-[350px] snap-start h-auto self-stretch">
              <FuturesMarketCard
                title={event.title || ''}
                outcomes={event.processedOutcomes}
                link={NAVIGATIONS.prediction.eventDetails(event.slug || '')}
                className="h-full"
                enableExpand={false}
                initialCount={5}
                showIcon={false}
                showProgressBar={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Grid (Indexes 1-3) - Desktop Only */}
      {scrollEvents.length > 0 && (
        <div className="hidden xl:grid grid-cols-12 gap-4">
          {scrollEvents.map((event) => (
            <div key={event.slug} className="col-span-4 self-stretch">
              <FuturesMarketCard
                title={event.title || ''}
                outcomes={event.processedOutcomes}
                link={NAVIGATIONS.prediction.eventDetails(event.slug || '')}
                className="h-full"
                enableExpand={false}
                initialCount={5}
                showIcon={false}
                showProgressBar={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Remaining Events (Indexes 4+) */}
      {remainingEvents.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {remainingEvents.map((event) => (
            <div key={event.slug} className="col-span-1 xl:col-span-6">
              <FuturesMarketCard
                title={event.title || ''}
                outcomes={event.processedOutcomes}
                link={NAVIGATIONS.prediction.eventDetails(event.slug || '')}
                className=""
                enableExpand={false}
                initialCount={5}
                showIcon={true}
                showProgressBar={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
