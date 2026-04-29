import { SearchHistory } from '@/components/common/search/SearchHistory'
import Text from '@/components/common/Text'
import { EmptyList } from '@/components/discover/EmptyList'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SkeletonList } from '@/components/ui/skeleton'
import { NAVIGATIONS } from '@/lib/navigations'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ClosedEventWinner, PredictionStats } from './PredictionStats'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import { removeAccents } from '@/utils/helpers'

interface PredictionListProps {
  data: EventModel[]
  isLoading?: boolean
  setOpen: (value: SetStateAction<boolean>) => void
  saveToHistory?: (item: SearchHistory) => void
  searchText?: string
}

// Helper function to get the latest end date
const getEventEndDate = (event: EventModel) => {
  const allMarkets = event?.markets || []
  const eventEndDate = dayjs(event?.endDate)

  if (allMarkets.length === 0) return eventEndDate.format('MMM D, YYYY')

  const latestEndDate = allMarkets.reduce((latest, market) => {
    const marketEndDate = dayjs(market.endDate)
    return marketEndDate.isAfter(latest) ? marketEndDate : latest
  }, eventEndDate)

  return latestEndDate.format('MMM D, YYYY')
}

export const PredictionList = ({ data, isLoading, setOpen, saveToHistory, searchText }: PredictionListProps) => {
  const { t } = useTranslation()

  const handleNavigate = (event: EventModel) => {
    saveToHistory?.({
      address: event.id || event.slug || '',
      name: event.title || '',
      logo: event.image,
      chainId: 0,
      type: 'prediction',
      slug: event.slug || '',
    })
    setOpen(false)
  }

  if (isLoading) {
    return (
      <div className="mt-3">
        <SkeletonList count={8} classNameItem="h-[54px]" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-1 justify-center flex-col items-center h-full">
        <EmptyList emptyText={t('history.nodata')} />
      </div>
    )
  }

  return (
    // grid grid-cols-2 gap-3 xl:flex xl:flex-col xl:gap-0 xl:space-y-1
    <div className="xl:-mt-2 mt-2 gap-3">
      {data.map((event) => (
        <Link
          key={event.slug || event.id}
          className={cn(
            'flex items-center gap-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors xl:bg-transparent px-2 xl:px-0',
            event.closed && 'opacity-50',
          )}
          onClick={() => handleNavigate(event)}
          to={NAVIGATIONS.prediction.eventDetails(event.slug || '')}
        >
          {/* Event Image */}
          <div className="shrink-0">
            <Avatar className="w-12 h-12 rounded-lg">
              <AvatarImage
                src={event.icon || event.image || '/images/placeholder-event.png'}
                alt={event.title || ''}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg">{event.title?.charAt(0) || 'E'}</AvatarFallback>
            </Avatar>
          </div>

          {/* Event Info */}
          <div className="min-w-0 flex flex-col justify-center flex-1">
            <Text
              text={event.title || ''}
              fontSize={14}
              fontWeight="medium"
              className="line-clamp-1 leading-[calc(1rem*(14/16))]"
              highLightText={searchText}
              highLightColor="#843BEA"
            />

            {/* Show matching market question if different from main title */}
            {(() => {
              if (!event.markets || event.markets.length === 0) return null

              const lowerSearch = removeAccents((searchText || '').toLowerCase())
              const matchingMarket = searchText
                ? event.markets.find((m) => removeAccents(m.question?.toLowerCase() || '').includes(lowerSearch))
                : null

              // Fallback to first market if no specific match
              const marketToShow = matchingMarket || event.markets[0]

              if (marketToShow && marketToShow.question) {
                return (
                  <div className="text-xs text-white/70 mt-1 line-clamp-1">
                    <Text
                      text={marketToShow.question}
                      fontSize={12}
                      className="!text-white/50"
                      highLightText={searchText}
                      highLightColor="#843BEA"
                    />
                  </div>
                )
              }
              return null
            })()}

            {event.endDate && <div className="text-xs text-white/50 mt-0.5">{getEventEndDate(event)}</div>}
          </div>

          {/* Event Stats */}
          {!event.closed && <PredictionStats event={event} />}

          {event.closed && <ClosedEventWinner event={event} />}
        </Link>
      ))}
    </div>
  )
}
