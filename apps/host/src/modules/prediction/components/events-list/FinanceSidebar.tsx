import { AllIcon, DailyIcon, MonthlyIcon, WeeklyIcon } from '../icons'

import { cn } from '@/lib/utils'
import { useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SCROLL_STEP = 120

// Namespaced URL param for finance filters to avoid clashing with generic `tag`
export const FINANCE_TAG_PARAM = 'financeTag'

export const FILTERS = [
  { label: 'prediction.filters.all', icon: AllIcon, value: '', excludeTagId: '21' },
  { label: 'prediction.filters.daily', icon: DailyIcon, value: 'daily', excludeTagId: '21' },
  { label: 'prediction.filters.weekly', icon: WeeklyIcon, value: 'weekly', excludeTagId: '21' },
  { label: 'prediction.filters.monthly', icon: MonthlyIcon, value: 'monthly', excludeTagId: '21' },
]

export const CATEGORIES = [
  {
    label: 'prediction.financeCategories.stocks',
    value: 'stocks',
    excludeTagId: '21',
    iconUrl: '/images/prediction/finnance/equities-2-ea04b2d05c.png',
  },
  {
    label: 'prediction.financeCategories.earnings',
    value: 'earnings',
    excludeTagId: '21',
    iconUrl: '/images/prediction/finnance/equities-8d28bdc2cb.png',
  },
  {
    label: 'prediction.financeCategories.indicies',
    value: 'indicies',
    excludeTagId: '21',
    iconUrl: '/images/prediction/finnance/indicies-008ef3f0b8.png',
  },
  {
    label: 'prediction.financeCategories.commodities',
    value: 'commodities',
    excludeTagId: '21',
    iconUrl: '/images/prediction/finnance/commodites-2a76edec07.png',
  },
  {
    label: 'prediction.financeCategories.forex',
    value: 'forex',
    excludeTagId: '21',
    iconUrl: '/images/prediction/finnance/currencies-481278de46.png',
  },
  {
    label: 'prediction.financeCategories.collectibles',
    value: 'collectibles',
    excludeTagId: '21',
    iconUrl: '/images/prediction/finnance/labubu-aae5dff2c5.png',
  },
  {
    label: 'prediction.financeCategories.acquisitions',
    value: 'acquisitions',
    excludeTagId: '21',
  },
  {
    label: 'prediction.financeCategories.earningsCalls',
    value: 'earnings-calls',
    excludeTagId: '21',
  },
  {
    label: 'prediction.financeCategories.ipo',
    value: 'ipo',
    excludeTagId: '21',
  },
  {
    label: 'prediction.financeCategories.fedRates',
    value: 'fed-rates',
    excludeTagId: '21',
  },
  {
    label: 'prediction.financeCategories.predictionMarkets',
    value: 'prediction-markets',
    excludeTagId: '21',
  },
  {
    label: 'prediction.financeCategories.treasuries',
    value: 'treasuries',
    excludeTagId: '21',
  },
]

interface SidebarProps {
  className?: string
  /** URL param key to store the current filter tag. Defaults to `financeTag` (desktop),
   *  but can be overridden to `tag` on MarketPrediction mobile.
   */
  tagParamKey?: string
}

export const FinanceHorizontalFilter = ({ className, tagParamKey = FINANCE_TAG_PARAM }: SidebarProps) => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTag = searchParams.get(tagParamKey) || ''
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollArrows = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el

    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return

    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaY
    }
  }, [])

  const handleScrollLeft = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
    setTimeout(updateScrollArrows, 150)
  }, [updateScrollArrows])

  const handleScrollRight = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
    setTimeout(updateScrollArrows, 150)
  }, [updateScrollArrows])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    updateScrollArrows()

    const handleScroll = () => updateScrollArrows()
    el.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [updateScrollArrows])

  useEffect(() => {
    const id = window.setTimeout(updateScrollArrows, 0)
    return () => window.clearTimeout(id)
  }, [updateScrollArrows])

  const handleFilterClick = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    if (value) {
      newSearchParams.set(tagParamKey, value)
    } else {
      newSearchParams.delete(tagParamKey)
    }
    // When using generic `tag`, proactively clear any stale financeTag param.
    if (tagParamKey === 'tag') {
      newSearchParams.delete(FINANCE_TAG_PARAM)
    }
    setSearchParams(newSearchParams)
  }

  return (
    <div className={cn('w-full pb-2 sticky top-11 z-10 bg-[#0b0b0b]', className)}>
      <div className="relative flex w-full items-center gap-2">
        <div
          ref={containerRef}
          onWheel={onWheel}
          className="no-scrollbar flex flex-1 min-w-0 gap-2 overflow-x-auto overscroll-contain pl-2 pr-2 scroll-snap-x items-center scroll-pl-3"
        >
          {FILTERS.map((item) => {
            const isActive = item.value === currentTag
            return (
              <div
                key={item.label}
                role="button"
                tabIndex={0}
                onClick={() => handleFilterClick(item.value)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-15 shrink-0 w-fit h-[60px] px-2 gap-1.5 rounded-md cursor-pointer transition-colors',
                  isActive
                    ? 'bg-[#260B46] border border-[#321258] text-text-primary'
                    : 'bg-transparent hover:bg-[#230D43] text-text-secondary',
                )}
              >
                <div className="mb-1">
                  <item.icon className={cn('size-5', isActive ? 'text-text-primary' : 'text-text-secondary')} />
                </div>
                <p className="text-xs font-medium text-center leading-tight whitespace-nowrap">{t(item.label)}</p>
              </div>
            )
          })}

          <div className="h-8 border-r border-white/10 mx-1"></div>

          {CATEGORIES.map((cat) => {
            const isActive = cat.value === currentTag
            return (
              <div
                key={cat.label}
                role="button"
                tabIndex={0}
                onClick={() => handleFilterClick(cat.value)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-15 shrink-0 w-fit h-[60px] px-2 gap-1.5 rounded-md cursor-pointer transition-colors',
                  isActive
                    ? 'bg-[#260B46] border border-[#321258] text-text-primary'
                    : 'bg-transparent hover:bg-[#230D43] text-text-secondary',
                )}
              >
                {cat.iconUrl && (
                  <div className="mb-1">
                    <img src={cat.iconUrl} alt={cat.label} className="size-5" loading="lazy" />
                  </div>
                )}
                <p className={cn('text-xs font-medium text-center leading-tight whitespace-nowrap')}>{t(cat.label)}</p>
              </div>
            )
          })}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            onClick={handleScrollLeft}
            className="absolute top-1/2 left-0 z-5 flex h-full w-8 -translate-y-1/2 items-center justify-center bg-[#0A0A0A]"
          >
            <img src="/images/icons/icon-more.svg" alt="scroll-left" className="size-5 rotate-180" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={handleScrollRight}
            className="absolute top-1/2 right-0 z-5 flex h-full w-8 -translate-y-1/2 items-center justify-end bg-[#0A0A0A]"
          >
            <img src="/images/icons/icon-more.svg" alt="scroll-right" className="size-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export const FinanceSidebar = ({ className }: SidebarProps) => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTag = searchParams.get(FINANCE_TAG_PARAM) || ''

  const handleFilterClick = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    if (value) {
      newSearchParams.set(FINANCE_TAG_PARAM, value)
    } else {
      newSearchParams.delete(FINANCE_TAG_PARAM)
    }
    setSearchParams(newSearchParams)
  }

  return (
    <div className={cn('hidden xl:block w-45 shrink-0 mr-6 pr-3 sticky top-12', className)}>
      <div className="flex flex-col gap-y-1 pb-4 sticky top-32 overflow-y-auto scrollbar-hide h-[calc(100vh-9rem)] [scrollbar-gutter:stable]">
        {FILTERS.map((item) => {
          const isActive = item.value === currentTag
          return (
            <div
              key={item.label}
              role="button"
              tabIndex={0}
              onClick={() => handleFilterClick(item.value)}
              className={cn(
                'flex flex-row justify-between items-center rounded-md px-2 py-2.5 w-full cursor-pointer transition-colors',
                isActive
                  ? 'bg-[#230D43] text-text-primary border-[0.6px] border-[#2E1455]'
                  : 'bg-transparent hover:bg-[#230D43] text-text-secondary border-[0.6px] hover:border-[#2E1455] border-transparent',
              )}
            >
              <div className="flex flex-row items-center gap-x-2.5 flex-1">
                <div className="shrink-0">
                  <item.icon className={cn('size-5', isActive ? 'text-text-primary' : 'text-text-secondary')} />
                </div>
                <p className="text-sm font-semibold">{t(item.label)}</p>
              </div>
            </div>
          )
        })}

        <div className="pb-2 border-b border-white/10 mb-2 w-full"></div>

        {CATEGORIES.map((cat) => {
          const isActive = cat.value === currentTag
          return (
            <div
              key={cat.label}
              role="button"
              tabIndex={0}
              onClick={() => handleFilterClick(cat.value)}
              className={cn(
                'flex flex-row justify-between items-center rounded-md px-2 py-2.5 w-full cursor-pointer transition-colors',
                isActive
                  ? 'bg-[#230D43] text-text-primary border-[0.6px] border-[#2E1455]'
                  : 'bg-transparent hover:bg-[#230D43] text-text-secondary border-[0.6px] hover:border-[#2E1455] border-transparent',
              )}
            >
              <div className="flex flex-row items-center gap-x-2.5 flex-1">
                {cat.iconUrl && (
                  <div className="shrink-0">
                    <img src={cat.iconUrl} alt={cat.label} className="size-5" loading="lazy" />
                  </div>
                )}
                <p className="text-sm font-semibold">{t(cat.label)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
