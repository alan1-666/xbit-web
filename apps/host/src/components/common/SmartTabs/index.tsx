import React, { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ReactComponent as ArrowRightIcon } from '@/components/icon/supervisory/arrow_right.svg'

export type SmartTabOption = {
  label: string | React.ReactNode
  value: string
}

export type SmartTabsProps = {
  value: string
  onChange: (val: string) => void
  options: SmartTabOption[]

  size?: 'sm' | 'md' | 'lg'
  gap?: string

  colorDefault?: string
  colorActive?: string
  colorHover?: string

  border?: boolean
  borderColor?: string

  className?: string
  tabClassName?: string

  /** 新增：是否显示左右箭头 */
  showArrows?: boolean
  /** 新增：点击箭头滚动比例 */
  scrollStepRatio?: number
}

export const SmartTabs: React.FC<SmartTabsProps> = ({
  value,
  onChange,
  options,

  size = 'sm',
  gap = 'gap-2',

  colorDefault = 'text-[#6C6A76]',
  colorActive = 'bg-[#9B2CFC] text-white',
  colorHover = 'hover:text-white',

  border = true,
  borderColor = 'border-[rgba(121,119,144,0.16)] hover:border-[#FBFBFB]',

  className,
  tabClassName,

  showArrows = true,
  scrollStepRatio = 0.8,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const [canScroll, setCanScroll] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const sizeStyles = useMemo(
    () => ({
      sm: 'text-[12px] px-[12px] py-[4px] rounded-md',
      md: 'text-[14px] px-4 py-2 rounded-md',
      lg: 'text-[16px] px-5 py-2.5 rounded-lg',
    }),
    [],
  )

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth > clientWidth + 1

    setCanScroll(overflow)
    setCanScrollLeft(overflow && scrollLeft > 1)
    setCanScrollRight(overflow && scrollLeft + clientWidth < scrollWidth - 1)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => updateScrollState()
    el.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => updateScrollState())
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [options])

  const scrollByStep = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return

    const step = el.clientWidth * scrollStepRatio
    el.scrollBy({
      left: dir === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  return (
    <div className={cn('w-full flex items-center', className)}>
      {/* 左箭头 */}
      {showArrows && canScroll ? (
        <button
          type="button"
          onClick={() => scrollByStep('left')}
          disabled={!canScrollLeft}
          className={cn('relative z-10 shrink-0 px-1', !canScrollLeft && 'opacity-30 cursor-not-allowed')}
          aria-label="scroll left"
        >
          {/* <span className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-[#121319] to-transparent" /> */}
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-[rgba(121,119,144,0.16)] bg-[#121319]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      ) : null}

      {/* tabs 可滚动容器 */}
      <div className="min-w-0 flex-1">
        <div
          ref={scrollRef}
          className={cn('w-full overflow-x-auto whitespace-nowrap scrollbar-hide', 'flex items-center', gap)}
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  'shrink-0 leading-none transition-colors duration-150',
                  sizeStyles[size],
                  border ? `border ${borderColor}` : '',
                  active ? colorActive : colorDefault,
                  !active && colorHover,
                  tabClassName,
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 右箭头 */}
      {showArrows && canScroll ? (
        <button
          type="button"
          onClick={() => scrollByStep('right')}
          disabled={!canScrollRight}
          className={cn('relative z-10 shrink-0 px-1', !canScrollRight && 'opacity-30 cursor-not-allowed')}
          aria-label="scroll right"
        >
          {/* <span className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-[#121319] to-transparent" /> */}
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-[rgba(121,119,144,0.16)] bg-[#121319]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      ) : null}
    </div>
  )
}
