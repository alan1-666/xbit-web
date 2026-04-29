import { EmblaCarouselType, EmblaEventType, EmblaOptionsType } from 'embla-carousel'
import { isEqual } from 'lodash-es'
import React, { LegacyRef, memo, RefObject, useCallback, useEffect, useRef } from 'react'
import './EmblaCarouelStyle.css'

const TWEEN_FACTOR_BASE = 0.05

const numberWithinRange = (number: number, min: number, max: number): number => Math.min(Math.max(number, min), max)

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
  selectedIndexRef?: RefObject<number>
  emblaRef: LegacyRef<HTMLDivElement>
  emblaApi: EmblaCarouselType | undefined
  selectedIndex: number
  showCostPrice: boolean
  showTotalBuy: boolean
  showBalance: boolean
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const {
    slides,
    children,
    selectedIndexRef,
    emblaRef,
    emblaApi,
    selectedIndex,
    showCostPrice,
    showTotalBuy,
    showBalance,
  } = props

  const tweenFactor = useRef(0)
  const tweenNodes = useRef<HTMLElement[]>([])

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.embla__slide__number') as HTMLElement
    })
  }, [])

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])

  const tweenScale = useCallback((emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()
    const slidesInView = emblaApi.slidesInView()
    const isScrollEvent = eventName === 'scroll'

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slidesInSnap = engine.slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target()

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target)

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress)
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            }
          })
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
        const scale = numberWithinRange(tweenValue, 0, 1).toString()
        const tweenNode = tweenNodes.current[slideIndex]
        tweenNode.style.transform = `scale(${scale})`
      })
    })
  }, [])

  useEffect(() => {
    if (selectedIndexRef) {
      selectedIndexRef.current = selectedIndex
    }
  }, [selectedIndex])

  useEffect(() => {
    if (!emblaApi) return

    setTweenNodes(emblaApi)
    setTweenFactor(emblaApi)
    tweenScale(emblaApi)

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale)
  }, [emblaApi, tweenScale])

  return (
    <div className="">
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
  EmblaCarousel,
  (prevProps, nextProps) =>
    isEqual(prevProps.children, nextProps.children) &&
    isEqual(prevProps.slides, nextProps.slides) &&
    isEqual(prevProps.selectedIndexRef, nextProps.selectedIndexRef) &&
    isEqual(prevProps.emblaRef, nextProps.emblaRef) &&
    isEqual(prevProps.emblaApi, nextProps.emblaApi) &&
    isEqual(prevProps.selectedIndex, nextProps.selectedIndex) &&
    isEqual(prevProps.options, nextProps.options) &&
    isEqual(prevProps.showCostPrice, nextProps.showCostPrice) &&
    isEqual(prevProps.showTotalBuy, nextProps.showTotalBuy) &&
    isEqual(prevProps.showBalance, nextProps.showBalance),
)
