import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { cn } from '@/lib/utils.ts'
import { SportMarketItemRegistration } from '@/modules/prediction/components/sport-event-details/SportMarketItemRegistration.tsx'
import { EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { MouseEvent, ReactNode, useCallback, useEffect, useMemo } from 'react'

export interface MarketVariantsProps {
  markets: MarketBase[]
  currentMarket: MarketBase | undefined
  onChange: (market: MarketBase) => void
  getLabel?: (market: MarketBase) => ReactNode
}

const MarketVariantsImpl = (props: MarketVariantsProps) => {
  const { markets, currentMarket, onChange, getLabel } = props
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    dragFree: false,
  })

  // Sync scroll to selection
  const onScrollSelect = useCallback((api: EmblaCarouselType) => {
    const index = api.selectedScrollSnap()
    const selectedMarket = markets[index]
    if (selectedMarket && selectedMarket.slug !== currentMarket?.slug) {
        onChange?.(selectedMarket)
    }
  }, [markets, currentMarket, onChange])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onScrollSelect)
    emblaApi.on('reInit', onScrollSelect)
    return () => {
        emblaApi.off('select', onScrollSelect)
        emblaApi.off('reInit', onScrollSelect)
    }
  }, [emblaApi, onScrollSelect])

  // Find index of current market
  const selectedIndex = useMemo(() => {
    return markets.findIndex((market) => market.slug === currentMarket?.slug)
  }, [markets, currentMarket])

  // Scroll to selected item if it changes externally or initially
  useEffect(() => {
    if (emblaApi && selectedIndex !== -1) {
        // Only scroll if not already there (prevent fighting)
        if (emblaApi.selectedScrollSnap() !== selectedIndex) {
            emblaApi.scrollTo(selectedIndex)
        }
    }
  }, [emblaApi, selectedIndex])

  const handleOnSelect = useCallback((market: MarketBase, event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    onChange?.(market)
  }, [onChange])

  if (markets.length < 2) return null

  return (
    <div className="border-t">
       {/* Triangle Pointer */}
      <div className="w-full relative flex items-center justify-center pointer-events-none">
        <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-10 border-t-impartal" />
      </div>
      
      {/* Carousel Container */}
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex touch-pan-y">
            {markets.map((option) => (
              <div
                key={option.slug}
                className={cn(
                  'flex-[0_0_80px] min-w-0 h-10 flex items-center justify-center cursor-pointer select-none',
                  currentMarket?.slug === option.slug
                    ? 'text-white font-medium'
                    : 'text-white/60 font-normal text-[calc(14rem/16)]',
                )}
                onClick={(event) => handleOnSelect(option, event)}
              >
                {getLabel ? getLabel(option) : option.line}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export const MarketVariants2 = (props: MarketVariantsProps) => {
  return (
    <SportMarketItemRegistration slot="variants">
      <MarketVariantsImpl {...props} />
    </SportMarketItemRegistration>
  )
}
