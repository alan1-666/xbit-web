'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface CustomSliderProps {
  showValue?: boolean
  showValueOnDrag?: boolean
  isCustomTrackStyle?: boolean
}

const SliderGradientCore = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & CustomSliderProps
>(({ className, showValue, isCustomTrackStyle, showValueOnDrag = false, ...props }, ref) => {
  const valueFormatted = props?.value?.[0] ? Math.round(props?.value?.[0]) : 0
  const [showTooltip, setShowTooltip] = useState(false)

  // 处理拖拽开始
  const handlePointerDown = (e: React.PointerEvent) => {
    // e.preventDefault()
    if (showValueOnDrag) {
      setShowTooltip(true)
    }
  }

  // 处理拖拽结束
  const handlePointerUp = (e: React.PointerEvent) => {
    // e.preventDefault()
    if (showValueOnDrag) {
      setTimeout(() => {
        setShowTooltip(false)
      }, 500)
    }
  }

  // 处理值变化
  const handleValueChange = (value: number[]) => {
    if (showValueOnDrag) {
      setShowTooltip(true)
    }
    props.onValueChange?.(value)
  }
  // 处理触摸开始 - 额外的触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    // 阻止默认行为和冒泡
    e.preventDefault()
    e.stopPropagation()
  }

  // 决定是否显示提示 - 修复逻辑
  const shouldShowTooltip = showValueOnDrag && showTooltip

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('relative flex w-full touch-none select-none items-center *:cursor-pointer', className)}
      {...props}
      onValueChange={handleValueChange}
    >
      <SliderPrimitive.Track className="absolute h-[12px] w-full grow overflow-hidden rounded-full bg-transparent">
        <div className="absolute top-[5px] w-full h-[2.5px] rounded-full bg-[#474553]"></div>
        {isCustomTrackStyle ? (
          <div
            className="absolute top-[5px] h-[2.5px] bg-[#843bea] rounded-full"
            style={
              {
                left: (props.value?.[0] ?? 0) >= 0 ? '50%' : `${50 + ((props.value?.[0] ?? 0) / 200) * 100}%`,
                width: `${Math.abs((props.value?.[0] ?? 0) / 200) * 100}%`,
              } as React.CSSProperties
            }
          />
        ) : (
          <SliderPrimitive.Range className="absolute top-[5px] h-[2.5px] bg-[#843bea]" />
        )}
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="flex items-center justify-center h-[12px] w-[12px] p-[12px] -m-[12px] bg-transparent rounded-full focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative z-10"
        style={{
          // 移动端触摸优化
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          // 确保触摸响应
          cursor: !props?.disabled ? 'pointer' : 'not-allowed',
        }}
        aria-label="thumb slider"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
      >
        {/*<span className="block rounded-full w-[8px] h-[8px] bg-[#232329]" />*/}
        {shouldShowTooltip && (
          <span
            className={cn(
              'absolute top-0 left-[50%] translate-y-[-25px] translate-x-[-50%] bg-[#6A2AE0]  text-white leading-[1] inline-block px-[4.5px] py-[1px] text-[calc(1rem*(11/16))] rounded-[2px] pointer-events-none app-font-medium shadow-lg transition-all duration-200',
              // isDragging ? "scale-110" : "scale-100"
            )}
          >
            {valueFormatted}%{/* 小三角箭头 - 渐变版本 */}
            <span
              className="absolute top-full left-[50%] translate-x-[-50%] w-[8px] h-[4px] bg-[#6A2AE0]"
              style={{
                clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
              }}
            ></span>
          </span>
        )}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
})
SliderGradientCore.displayName = SliderPrimitive.Root.displayName

export { SliderGradientCore }
