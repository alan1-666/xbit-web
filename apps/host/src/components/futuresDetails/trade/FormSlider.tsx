import * as React from 'react'
import { HTMLProps, useEffect, useRef, useState } from 'react'
import { SliderGradientCore } from '@components/ui/slider-gradient-core.tsx'
import { cn } from '@/lib/utils.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

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
        isActive && 'bg-[#843BEA]',
      )}
      style={style}
    >
      {isActive && (
        <span className={cn('block rounded-full bg-[#232329] ', isThumb ? 'w-[9px] h-[9px]' : 'w-[5px] h-[5px]')} />
      )}
      {isThumb && (
        <span
          className={
            'absolute top-0 left-0 -z-10 rounded-full blur-xs w-[15px] h-[15px]'
          }
        />
      )}
      <div className={cn('mt-8 text-[10px] font-[330] text-[#908E98]', labelClassName)}>{label || ''}</div>
    </span>
  )
}

interface FormSliderProps {
  sliderValue: number[]
  containerClassName?: HTMLProps<HTMLElement>['className']
  setSliderValue?: React.Dispatch<React.SetStateAction<number[]>>
  onSliderValueChange?: (value: number[]) => void
  showValue?: boolean
  showValueOnDrag?: boolean
  label?: string[]
}

const FormSlider = ({
  sliderValue,
  containerClassName,
  setSliderValue,
  onSliderValueChange,
  showValue,
  showValueOnDrag = true,
  label = [],
}: FormSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderThumbStyle, setSliderThumbStyle] = useState<React.CSSProperties>({ transform: 'none' })
  const sliderThumbWidth = 12
  const activeWallet = useSelector(_activeWallet)

  useEffect(() => {
    if (!containerRef?.current) return

    const containerWidth = containerRef.current?.clientWidth
    let left = (containerWidth / 100) * sliderValue[0] - sliderThumbWidth / 2
    if (left < 0) left = 0
    if (left > containerWidth - sliderThumbWidth) left = containerWidth - sliderThumbWidth - 1
    setSliderThumbStyle({
      transform: `translateX(${left}px)`,
    })
  }, [sliderValue])

  return (
    <div className={cn('relative', containerClassName)} ref={containerRef}>
      <SliderGradientCore
        defaultValue={[1]}
        disabled={!activeWallet?.isConnected}
        max={100}
        step={1}
        className="data-[disabled]:cursor-not-allowed [&[data-disabled]_*]:cursor-not-allowed"
        value={sliderValue}
        showValue={showValue}
        showValueOnDrag={showValueOnDrag}
        onValueChange={(value: number[]) => {
          if (setSliderValue) setSliderValue(value)
          if (onSliderValueChange) {
            onSliderValueChange(value)
          }
        }}
      />
      <div className="flex items-center justify-between absolute left-0 right-0 -top-[4.5px] pointer-events-none">
        <SliderMarker isActive={sliderValue[0] >= 0}  label={label?.[0]} />
        <SliderMarker isActive={sliderValue[0] >= 25} label={label?.[1]}  />
        <SliderMarker isActive={sliderValue[0] >= 50} label={label?.[2]} />
        <SliderMarker isActive={sliderValue[0] >= 75} label={label?.[3]} />
        <SliderMarker isActive={sliderValue[0] === 100} label={label?.[4]} />
      </div>
      <SliderMarker
        isActive={activeWallet?.isConnected}
        className="w-[15px] h-[15px] absolute top-[50%] translate-y-[-50%] left-0 pointer-events-none"
        style={sliderThumbStyle}
        isThumb
      />
    </div>
  )
}

export default FormSlider
