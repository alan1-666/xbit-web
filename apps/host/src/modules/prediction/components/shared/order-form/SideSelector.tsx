import { cn } from '@/lib/utils.ts'
import { useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from './OrderFormData.ts'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

type Side = 'buy' | 'sell'

interface UnderlineState {
  left: number
  width: number
  scaleX: number
}

const INITIAL_UNDERLINE: UnderlineState = { left: 0, width: 0, scaleX: 1 }

export const SideSelector = () => {
  const { t, i18n } = useTranslation()
  const { control, setValue } = useFormContext<OrderFormData>()
  const watchedSide = useWatch({ control, name: 'side' })
  const side: Side = watchedSide === 'buy' || watchedSide === 'sell' ? watchedSide : 'buy'

  const buyRef = useRef<HTMLButtonElement>(null)
  const sellRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const [underline, setUnderline] = useState<UnderlineState>(INITIAL_UNDERLINE)

  // Recalculate underline position when layout or language changes
  const recalc = useCallback(() => {
    const buyEl = buyRef.current
    const sellEl = sellRef.current
    const container = containerRef.current
    if (!buyEl || !sellEl || !container) return

    const buyRect = buyEl.getBoundingClientRect()
    const sellRect = sellEl.getBoundingClientRect()
    const parentRect = container.getBoundingClientRect()
    const maxWidth = Math.max(buyRect.width, sellRect.width, 1)
    const rect = side === 'buy' ? buyRect : sellRect
    const left = rect.left - parentRect.left
    const width = rect.width

    setUnderline({
      left,
      width: maxWidth,
      scaleX: width / maxWidth,
    })
  }, [side])

  // Use rAF to avoid layout thrashing; ResizeObserver for layout changes
  useLayoutEffect(() => {
    const scheduleRecalc = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        recalc()
      })
    }

    scheduleRecalc()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleRecalc) : null
    const container = containerRef.current
    const buyEl = buyRef.current
    const sellEl = sellRef.current
    if (resizeObserver) {
      container && resizeObserver.observe(container)
      buyEl && resizeObserver.observe(buyEl)
      sellEl && resizeObserver.observe(sellEl)
    }

    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current)
      resizeObserver?.disconnect()
    }
  }, [recalc])

  // Re-measure when language changes (RTL/LTR or label length)
  useEffect(() => {
    recalc()
  }, [i18n.language, recalc])

  const handleSelect = useCallback(
    (value: Side) => {
      setValue('side', value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    },
    [setValue],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handleSelect('buy')
          buyRef.current?.focus()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSelect('sell')
          sellRef.current?.focus()
          break
        default:
          break
      }
    },
    [handleSelect],
  )

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={`${t('prediction.orderForm.buy')} / ${t('prediction.orderForm.sell')}`}
      className="relative flex flex-1 items-center gap-5 pb-1 text-base"
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buyRef}
        type="button"
        role="tab"
        aria-selected={side === 'buy'}
        tabIndex={side === 'buy' ? 0 : -1}
        className={cn(
          'cursor-pointer transition-colors',
          side === 'buy' ? 'text-white font-semibold' : 'text-[#908E98]',
        )}
        onClick={() => handleSelect('buy')}
      >
        {t('prediction.orderForm.buy')}
      </button>
      <button
        ref={sellRef}
        type="button"
        role="tab"
        aria-selected={side === 'sell'}
        tabIndex={side === 'sell' ? 0 : -1}
        className={cn(
          'cursor-pointer transition-colors',
          side === 'sell' ? 'text-white font-semibold' : 'text-[#908E98]',
        )}
        onClick={() => handleSelect('sell')}
      >
        {t('prediction.orderForm.sell')}
      </button>
      <div
        className="absolute bottom-0 left-0 h-px origin-left bg-white will-change-transform"
        style={{
          width: underline.width,
          transform: `translateX(${underline.left}px) scaleX(${underline.scaleX})`,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-hidden
      />
    </div>
  )
}
