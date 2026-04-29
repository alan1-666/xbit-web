import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils.ts'

type TooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right' | 'center'
  /** 自定义tooltip内容容器类名，默认提供统一的深色气泡样式 */
  contentClassName?: string
  /** 是否显示箭头，默认为 false */
  showArrow?: boolean
  /** 箭头位置，默认为 'top' (箭头指向上方) */
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right'
  showArrowColor?: string
}

/**
 * Custom tooltip component that displays content on hover.
 * @param content
 * @param children
 * @param align
 * @param contentClassName
 * @param showArrow
 * @param arrowPosition - 箭头位置
 * @constructor
 */
export function Tooltip({
  content,
  children,
  align = 'center',
  contentClassName,
  showArrow = false,
  showArrowColor = '#1F1F23',
  arrowPosition = 'top',
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [showing, setShowing] = useState(false) // 控制是否渲染到 DOM（用于过渡）
  const targetRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  // 进入/离开时控制渲染状态，匹配过渡时长
  useEffect(() => {
    if (visible) {
      setShowing(true)
    } else {
      const timeout = setTimeout(() => setShowing(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [visible])

  // 计算 tooltip 在视口中的固定定位，避免被 overflow 裁剪
  const updatePosition = () => {
    if (!targetRef.current) return
    const rect = targetRef.current.getBoundingClientRect()
    const margin = showArrow ? 10 : 8 // 有箭头时增加间距

    let left = rect.left + rect.width / 2
    if (align === 'left') left = rect.left
    if (align === 'right') left = rect.right

    // 初步 top 在元素上方
    let top = rect.top - margin

    // 若有内容宽度，进行中心/对齐偏移
    const tt = tooltipRef.current
    const width = tt?.offsetWidth ?? 0
    const height = tt?.offsetHeight ?? 0

    if (align === 'center') {
      left = left - width / 2
    } else if (align === 'right') {
      left = left - width
    }

    // 默认显示在下方，若底部空间不足则显示在上方
    const hasBottomSpace = window.innerHeight - rect.bottom >= height + margin
    if (hasBottomSpace) {
      top = rect.bottom + margin
    } else {
      top = rect.top - height - margin
    }

    // 视口边界限制，避免溢出
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (left + width > vw - 8) left = vw - width - 8
    if (left < 8) left = 8
    if (top + height > vh - 8) top = vh - height - 8
    if (top < 8) top = 8

    setCoords({ top, left })
  }

  // 可见时及尺寸变化时更新定位
  useLayoutEffect(() => {
    if (!showing) return
    updatePosition()
    const handle = () => updatePosition()
    window.addEventListener('scroll', handle, true)
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showing, align, showArrow])

  // 获取箭头的 CSS classes
  const getArrowClasses = () => {
    if (!showArrow) return ''

    const baseClasses = `absolute w-0 h-0`

    switch (arrowPosition) {
      case 'top':
        return cn(
          baseClasses,
          '-top-2 left-1/2 transform -translate-x-1/2',
          'border-l-8 border-r-8 border-b-8',
          `!border-l-transparent !border-r-transparent border-b-[${showArrowColor}]`,
        )
      case 'bottom':
        return cn(
          baseClasses,
          '-bottom-2 left-1/2 transform -translate-x-1/2',
          'border-l-8 border-r-8 border-t-8',
          `!border-l-transparent !border-r-transparent border-t-[${showArrowColor}]`,
        )
      case 'left':
        return cn(
          baseClasses,
          '-left-2 top-1/2 transform -translate-y-1/2',
          'border-t-8 border-b-8 border-r-8',
          `!border-t-transparent !border-b-transparent border-r-[${showArrowColor}]`,
        )
      case 'right':
        return cn(
          baseClasses,
          '-right-2 top-1/2 transform -translate-y-1/2',
          'border-t-8 border-b-8 border-l-8',
          `!border-t-transparent !border-b-transparent border-l-[${showArrowColor}]`,
        )
      default:
        return ''
    }
  }

  return (
    <div
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      {children}

      {showing &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{ position: 'fixed', top: coords?.top ?? -9999, left: coords?.left ?? -9999 }}
            className={cn(
              'transition duration-300 p-0 bg-transparent rounded-[4px] text-[calc(12rem/16)] z-[9999] pointer-events-none',
              visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95',
            )}
          >
            <div
              className={cn(
                // 默认的内容样式（抽离公共样式，调用处无需再包一层div）
                'relative bg-[#1F1F23] text-[#FFFFFFCC] text-[12px] leading-[18px] rounded-md px-3 py-2 max-w-[360px] shadow-lg',
                contentClassName,
              )}
            >
              {content}

              {/* 箭头 */}
              {showArrow && (
                <div
                  className={getArrowClasses()}
                  style={{
                    borderColor: `${showArrowColor}`,
                  }}
                />
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
