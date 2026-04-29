import { EmblaOptionsType } from 'embla-carousel'
import { isEqual } from 'lodash-es'
import React, { LegacyRef, memo } from 'react'
import './EmblaCarouelStyle.css'

type PropType = {
  slides: number[]
  options?: EmblaOptionsType
  children: ({
    type,
    showCostPrice,
    showTotalBuy,
    showBalance,
  }: {
    type: number
    showCostPrice: boolean
    showTotalBuy: boolean
    showBalance: boolean
  }) => JSX.Element
  emblaRef: LegacyRef<HTMLDivElement>
  showCostPrice: boolean
  showTotalBuy: boolean
  showBalance: boolean
}

const EmblaCarouselPC: React.FC<PropType> = (props) => {
  const { slides, children, emblaRef, showCostPrice, showTotalBuy, showBalance } = props

  return (
    <div className="pc-embla">
      <div className="embla">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((index) => (
              <div className="embla__slide" key={index}>
                <div className="embla__slide__number">
                  {children({ type: index + 1, showCostPrice, showTotalBuy, showBalance })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(
  EmblaCarouselPC,
  (prevProps, nextProps) =>
    isEqual(prevProps.children, nextProps.children) &&
    isEqual(prevProps.slides, nextProps.slides) &&
    isEqual(prevProps.emblaRef, nextProps.emblaRef) &&
    isEqual(prevProps.options, nextProps.options) &&
    isEqual(prevProps.showCostPrice, nextProps.showCostPrice) &&
    isEqual(prevProps.showTotalBuy, nextProps.showTotalBuy) &&
    isEqual(prevProps.showBalance, nextProps.showBalance),
)
