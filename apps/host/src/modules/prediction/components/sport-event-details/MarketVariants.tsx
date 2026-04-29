import { useCallback, useMemo, MouseEvent } from 'react'
import { cn } from '@/lib/utils.ts'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'

export interface MarketVariantProps {
  markets: MarketBase[]
  onChange?: (option: MarketBase) => void
  selectedMarket: MarketBase
}

export const MarketVariants = (props: MarketVariantProps) => {
  const { markets, selectedMarket, onChange } = props
  const selectedIndex = useMemo(() => {
    return markets.findIndex((market) => market.slug === selectedMarket.slug)
  }, [markets, selectedMarket])
  const totalOptions = markets.length
  const itemWidth = 80 // width of each option including margin
  const containerWidth = itemWidth * totalOptions // assuming each option has a width of 20

  const handleOnSelect = useCallback((market: MarketBase, event: MouseEvent) => {
    onChange?.(market)
    event.stopPropagation()
  }, [])

  if (markets.length === 0) return null

  return (
    <div className="border-t">
      <div className="w-full relative flex items-center justify-center">
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-impartal" />
      </div>
      <div
        className="flex items-center flex-1 justify-center transition"
        style={{ transform: `translateX(${containerWidth / 2 - itemWidth / 2 - selectedIndex * itemWidth}px)` }}
      >
        {markets.map((option) => (
          <div
            key={option.slug}
            className={cn(
              'w-20 h-10 flex items-center justify-center cursor-pointer',
              selectedMarket.slug === option.slug
                ? 'text-white font-medium'
                : 'text-white/60 font-normal text-[calc(14rem/16)]',
            )}
            onClick={(event) => handleOnSelect(option, event)}
          >
            {option.line}
          </div>
        ))}
      </div>
    </div>
  )
}
