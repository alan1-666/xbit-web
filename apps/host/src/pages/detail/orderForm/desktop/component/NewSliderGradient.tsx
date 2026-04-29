import * as React from 'react'
import { HTMLProps, useEffect, useRef, useState } from 'react'
import { SliderGradientCore } from '@components/ui/slider-gradient-core.tsx'
import { cn } from '@/lib/utils.ts'

type SliderMarkerProps = {
  style?: React.CSSProperties
  className?: string
  isActive?: boolean
  label?: string
  isThumb?: boolean
  labelClassName?: string
}

const SliderMarker = ({ isActive, className, style, label, isThumb, labelClassName }: SliderMarkerProps) => {
  return (
    <span
      className={cn(
        'bg-[#514F57] pointer-events-none flex items-center justify-center h-[9px] w-[9px] rounded-full focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative z-1',
        className,
        isActive && 'bg-[linear-gradient(90deg,#9035FF,#EE69FF)]',
      )}
      style={style}
    >
      {isActive && (
        <span className={cn('block rounded-full bg-[#232329] ', isThumb ? 'w-[9px] h-[9px]' : 'w-[5px] h-[5px]')} />
      )}
      {isThumb && (
        <span
          className={
            'absolute top-0 left-0 -z-10 rounded-full blur-xs w-[15px] h-[15px] bg-[linear-gradient(90deg,#9035FF,#EE69FF)]'
          }
        />
      )}
      <div className={cn('mt-8 text-[10px] font-[330] text-white/70', labelClassName)}>{label}</div>
    </span>
  )
}

interface SliderGradientProps {
  sliderValue: number[]
  containerClassName?: HTMLProps<HTMLElement>['className']
  setSliderValue?: React.Dispatch<React.SetStateAction<number[]>>
  onSliderValueChange?: (value: number[]) => void
  showValue?: boolean
  showValueOnDrag?: boolean
  label?: string[]
}

const NewSliderGradient = ({
  sliderValue,
  containerClassName,
  setSliderValue,
  onSliderValueChange,
  showValue,
  showValueOnDrag = true,
  label,
}: SliderGradientProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderThumbStyle, setSliderThumbStyle] = useState<React.CSSProperties>({ transform: 'none' })
  const sliderThumbWidth = 12

  useEffect(() => {
    if (!containerRef?.current) return

    const containerWidth = containerRef.current?.clientWidth
    let left = 0
    if (sliderValue[0] >= 0)
      left = (containerWidth / 100 / 2) * sliderValue[0] - sliderThumbWidth / 2 + containerWidth / 2
    if (sliderValue[0] < 0) left = (containerWidth / 100 / 2) * (100 - -sliderValue[0]) - sliderThumbWidth / 2
    if (left > containerWidth - sliderThumbWidth) left = containerWidth - sliderThumbWidth - 1
    setSliderThumbStyle({
      transform: `translateX(${left}px)`,
    })
  }, [sliderValue])

  return (
    <div className={cn('relative', containerClassName)} ref={containerRef}>
      <SliderGradientCore
        defaultValue={[0]}
        max={100}
        min={-100}
        step={1}
        value={sliderValue}
        showValue={showValue}
        showValueOnDrag={showValueOnDrag}
        onValueChange={(value: number[]) => {
          if (setSliderValue) setSliderValue(value)
          if (onSliderValueChange) {
            onSliderValueChange(value)
          }
        }}
        isCustomTrackStyle={true}
      />
      <div className="flex items-center justify-between absolute left-0 right-0 top-[-4px] pointer-events-none">
        <SliderMarker isActive={sliderValue[0] <= -100} label={label?.[0]} labelClassName="ml-4" />
        <SliderMarker isActive={sliderValue[0] <= -50} label={label?.[1]} />
        <SliderMarker isActive={true} label={label?.[2]} />
        <SliderMarker isActive={sliderValue[0] >= 50} label={label?.[3]} />
        <SliderMarker isActive={sliderValue[0] === 100} label={label?.[4]} labelClassName="mr-4" />
      </div>
      <SliderMarker
        isActive
        className="w-[15px] h-[15px] absolute top-[50%] translate-y-[-50%] left-0 pointer-events-none"
        style={sliderThumbStyle}
        isThumb
      />
    </div>
  )
}

export default NewSliderGradient
