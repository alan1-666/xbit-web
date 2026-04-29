import useEmblaCarousel from 'embla-carousel-react'
import dayjs from 'dayjs'
import { EmblaCarouselType } from 'embla-carousel'
import { useCallback, useEffect, useState } from 'react'
import { useSportLiveGames } from '@/modules/prediction/hooks/useSportLiveGames'
import { useSportTeamsByEvents } from '@/modules/prediction/hooks/useSportTeams'
import { TickerItemContainer } from '../TickerItemContainer'

const TickerSection = () => {
  const { data } = useSportLiveGames({ fromNow: true })
  const { teams } = useSportTeamsByEvents(data)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onSelect(emblaApi)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  if (!data || data.length === 0) return null

  return (
    <div className="shrink-0 border-b border-border bg-card/50 backdrop-blur-sm z-20 w-full">
      <div className="flex items-stretch h-24">
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className={`w-8 shrink-0 flex items-center justify-center border-r border-border hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10 bg-card`}
        >
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform rotate-180 text-muted-foreground"
          >
            <path
              d="M1 9L5 5L1 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Carousel viewport */}
        <div className="overflow-hidden grow select-none" ref={emblaRef}>
          <div className="flex h-full items-center touch-pan-y backface-hidden">
            <div className="flex flex-col justify-center items-center min-w-[80px] px-4 border-r border-border/40 h-full shrink-0 bg-muted/10">
              <span className="text-[10px] font-bold text-foreground">{dayjs().format('ddd').toUpperCase()}</span>
              <span className="text-[10px] text-muted-foreground">{dayjs().format('MMM D')}</span>
            </div>

            {data.map((event) => (
              <TickerItemContainer key={event.id} event={event} teams={teams} />
            ))}
          </div>
        </div>

        {/* Right Navigation Button */}
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className={`w-8 shrink-0 flex items-center justify-center border-l border-border hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10 bg-card`}
        >
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform rotate-0 text-muted-foreground"
          >
            <path
              d="M1 9L5 5L1 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TickerSection
