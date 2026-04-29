import * as React from 'react'
import { HTMLProps, useEffect, useRef, useState } from 'react'
import { SliderGradientCore } from '@components/ui/slider-gradient-core.tsx'
import { cn } from '@/lib/utils.ts'

type SliderMarkerProps = {
  style?: React.CSSProperties
  className?: string
  isActive?: boolean
  isThumb?: boolean
}

const SliderMarker = ({ isActive, className, style, isThumb, labelClassName }: SliderMarkerProps) => {
  return (
    <span
      className={cn(
        'bg-[#514F57] pointer-events-none flex items-center justify-center rounded-full focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative z-1',
        // 普通标记点
        !isThumb && 'h-[10px] w-[10px]',
        // Thumb 样式
        isThumb && 'w-[15px] h-[15px] bg-transparent border-2 border-[#843BEA] ',
        className,
        !isThumb && isActive && 'bg-[#843BEA]',
      )}
      style={style}
    >
      {!isThumb && isActive && (
        <span className="block rounded-full w-[5px] h-[5px] bg-[#843BEA]" />
      )}
      {isThumb && (
        <>
          <span className="block rounded-full w-[11px] h-[11px] bg-[#232329] shadow-[0_0_10px_rgba(132,59,234,0.5)] " />
        </>
      )}
    </span>
  )
}

interface LeverageSliderProps {
  sliderValue: number[]
  maxValue?: number
  minValue?: number
  milestones?: number[]
  containerClassName?: HTMLProps<HTMLElement>["className"]
  setSliderValue?: React.Dispatch<React.SetStateAction<number[]>>
  onSliderValueChange?: (value: number[]) => void
}

const LeverageSlider = ({
  sliderValue,
  maxValue = 40,
  minValue = 1,
  milestones = [0, 10, 25, 40],
  containerClassName,
  setSliderValue,
  onSliderValueChange
}: LeverageSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderThumbStyle, setSliderThumbStyle] = useState<React.CSSProperties>({ transform: 'none' })
  const sliderThumbWidth = 15 // Thumb 宽度

  // 判断是否为第一个里程碑
  const isFirstMilestone = (value: number) => value === milestones[0]
  
  // 判断是否为最后一个里程碑
  const isLastMilestone = (value: number) => value === milestones[milestones.length - 1]

  // 获取标记点的定位样式
  const getMarkerStyle = (value: number): React.CSSProperties => {
    if (isFirstMilestone(value)) {
      return { left: '0%', transform: 'translateX(0)' }
    }
    
    if (isLastMilestone(value)) {
      return { right: '0%', left: 'auto', transform: 'translateX(0)' }
    }
    
    // 中间的里程碑，按比例定位
    const position = ((value - minValue) / (maxValue - minValue)) * 100
    return { 
      left: `${position}%`, 
      transform: 'translateX(-50%)' 
    }
  }

  // 获取文本的定位样式
  const getTextStyle = (value: number): React.CSSProperties => {
    if (isFirstMilestone(value)) {
      return { left: '0%', transform: 'translateX(0)' }
    }
    
    if (isLastMilestone(value)) {
      return { right: '0%', left: 'auto', transform: 'translateX(0)' }
    }
    
    // 中间的里程碑，按比例定位
    const position = ((value - minValue) / (maxValue - minValue)) * 100
    return { 
      left: `${position}%`, 
      transform: 'translateX(-50%)' 
    }
  }

  // 判断标记点是否激活
  const isMarkerActive = (milestoneValue: number) => {
    const currentValue = sliderValue[0]
    
    // 第一个里程碑（最左）
    if (isFirstMilestone(milestoneValue)) {
      return currentValue >= minValue
    }
    
    // 最后一个里程碑（最右）
    if (isLastMilestone(milestoneValue)) {
      return currentValue >= maxValue
    }
    
    // 中间的里程碑
    return currentValue >= milestoneValue
  }

  useEffect(() => {
    if (!containerRef?.current) return

    const containerWidth = containerRef.current.clientWidth
    const valueRange = maxValue - minValue
    
    // 计算滑块当前位置的百分比
    const percentage = (sliderValue[0] - minValue) / valueRange
    
    // 计算 thumb 中心点应该出现的位置
    const thumbCenter = percentage * containerWidth
    
    // 计算 thumb 左边距，让中心点对齐
    let left = thumbCenter - (sliderThumbWidth / 2)
    
    // 边界检查
    if (left < 0) left = 0
    if (left > containerWidth - sliderThumbWidth) left = containerWidth - sliderThumbWidth
    
    setSliderThumbStyle({
      transform: `translateX(${left}px)`,
    })
  }, [sliderValue, maxValue, minValue])

  return (
    <div className={cn("relative", containerClassName)} ref={containerRef}>
      <SliderGradientCore
        defaultValue={[minValue]}
        min={minValue}
        max={maxValue}
        step={1}
        value={sliderValue}
        onValueChange={(value: number[]) => {
          setSliderValue?.(value)
          onSliderValueChange?.(value)
        }}
      />
      
      {/* 里程碑标记点 - 按实际位置定位 */}
      <div className="absolute left-0 right-0 -top-[4.5px] pointer-events-none h-4">
        {milestones.map((m, i) => {
          const isActive = isMarkerActive(m)
          
          return (
            <div
              key={i}
              className="absolute"
              style={getMarkerStyle(m)}
            >
              <SliderMarker isActive={isActive} />
            </div>
          )
        })}
      </div>

      {/* 滑块的当前 thumb */}
      <SliderMarker
        isActive
        className="absolute top-[50%] translate-y-[-50%] left-0 pointer-events-none z-10"
        style={sliderThumbStyle}
        isThumb
      />

      {/* 里程碑文本标签 - 按实际位置定位 */}
      <div className="absolute top-0.5 left-0 right-0 h-5">
        {milestones.map((milestone, index) => {
          return (
            <div
              key={index}
              className="absolute"
              style={getTextStyle(milestone)}
            >
              <span
                className={cn(
                  "text-[10px] font-[330] text-[#908E98] whitespace-nowrap inline-block",
                  isFirstMilestone(milestone) && "text-left",
                  isLastMilestone(milestone) && "text-right",
                  !isFirstMilestone(milestone) && !isLastMilestone(milestone) && "text-center"
                )}
              >
                {milestone}x
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LeverageSlider