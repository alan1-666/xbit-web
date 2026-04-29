import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { IconClockStroke } from '@components/icon'
import { IconChart } from '@components/icon/stroke/IconChart.tsx'
import { IconStar } from '@components/icon/stroke/IconStar.tsx'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WatchlistTopBarList } from '@pages/meme/discover/desktop/components/WatchlistTopBarList.tsx'
import { RecentTopBarTokensList } from '@pages/meme/discover/desktop/components/RecentTopBarTokensList.tsx'
import { HoldingTopBarList } from '@pages/meme/discover/desktop/components/HoldingTopBarList.tsx'
import { useTranslation } from 'react-i18next'
import DialogLayoutSettings from '@/pages/settings/dialog-layouts-settings'
import { useLocation } from 'react-router-dom'
import {
  useHoldingTopBarTokens,
  useRecentTopBarTokens,
  useWatchlistTopBarTokens,
} from '@/pages/meme/discover/desktop/hooks/useTopBarTokens'
import ls from '@/lib/local-storage'

type TopBarActiveType = 'favorites' | 'holding' | 'recent'

type TopBarIcon = {
  id: TopBarActiveType
  icon: React.ReactNode
  activeIcon: React.ReactNode
  tooltip: string
}

const icons: TopBarIcon[] = [
  {
    id: 'recent',
    icon: <IconClockStroke className="size-4 cursor-pointer text-white/50" aria-label="Icon Clock" />,
    activeIcon: <IconClockStroke className="size-4 cursor-pointer text-white" aria-label="Icon Clock" />,
    tooltip: 'topbar.recent',
  },
  {
    id: 'favorites',
    icon: <IconStar className="size-4 cursor-pointer text-white/50" aria-label="Icon Star" />,
    activeIcon: <IconStar className="size-4 cursor-pointer text-white" aria-label="Icon Star" />,
    tooltip: 'topbar.watchlist',
  },
  {
    id: 'holding',
    icon: <IconChart className="size-4 cursor-pointer text-white/50" />,
    activeIcon: <IconChart className="size-4 cursor-pointer text-white" />,
    tooltip: 'topbar.holding',
  },
]

const SCROLL_STEP = 120
const KEY = 'TopBar_ActiveType'

export const TopBar = () => {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const { tokens, isFetching: watchlistTopBarTokensLoading } = useWatchlistTopBarTokens()
  const { data: recentTopBarTokens, isFetching: recentTopBarTokensLoading } = useRecentTopBarTokens()
  const { data: holdingTopBarTokens, isFetching: holdingTopBarTokensLoading } = useHoldingTopBarTokens()
  const [activeType, setActiveType] = useState<TopBarActiveType>(ls.get(KEY) || 'recent')
  const { t } = useTranslation()

  const containerRef = useRef<HTMLDivElement>(null)

  const updateScrollArrows = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el

    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1) // -1 to avoid float issues
  }, [])

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return

    // Translate vertical scroll into horizontal scroll if vertical is dominant
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaY
      e.preventDefault()
    }
  }, [])

  const handleScrollLeft = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
  }, [])

  const handleScrollRight = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
  }, [])

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
    // small timeout so children render before measuring
    const id = window.setTimeout(updateScrollArrows, 0)
    return () => window.clearTimeout(id)
  }, [activeType, updateScrollArrows])

  const hasAutoSwitched = useRef(false)
  const userHasSelected = useRef(false)
  const initialDataLoaded = useRef(false)

  const loading = useMemo(
    () => !watchlistTopBarTokensLoading && !recentTopBarTokensLoading && !holdingTopBarTokensLoading,
    [watchlistTopBarTokensLoading, recentTopBarTokensLoading, holdingTopBarTokensLoading],
  )

  useEffect(() => {
    if (loading && !initialDataLoaded.current) {
      initialDataLoaded.current = true
    }
  }, [loading])

  useEffect(() => {
    if (!loading) {
      return
    }

    if (!initialDataLoaded.current || hasAutoSwitched.current || userHasSelected.current) {
      return
    }

    if (holdingTopBarTokens.length === 0 && recentTopBarTokens.length === 0 && tokens.length === 0) {
      setActiveType('recent')
      hasAutoSwitched.current = true
      return
    }

    const currentTab = ls.get(KEY) || 'recent'

    if (currentTab === 'recent' && recentTopBarTokens.length === 0) {
      if (tokens.length > 0) {
        setActiveType('favorites')
      } else if (holdingTopBarTokens.length > 0) {
        setActiveType('holding')
      }
      hasAutoSwitched.current = true
    } else if (currentTab === 'favorites' && tokens.length === 0) {
      if (recentTopBarTokens.length > 0) {
        setActiveType('recent')
      } else if (holdingTopBarTokens.length > 0) {
        setActiveType('holding')
      }
      hasAutoSwitched.current = true
    } else if (currentTab === 'holding' && holdingTopBarTokens.length === 0) {
      if (recentTopBarTokens.length > 0) {
        setActiveType('recent')
      } else if (tokens.length > 0) {
        setActiveType('favorites')
      }
      hasAutoSwitched.current = true
    } else {
      hasAutoSwitched.current = true
    }
  }, [loading])

  useEffect(() => {
    ls.set(KEY, activeType)
  }, [activeType])

  const handleTabClick = (tabId: TopBarActiveType) => {
    setActiveType(tabId)
    userHasSelected.current = true
  }

  return (
    <div className="flex max-w-full border-x-0 border-[6px] border-[#0A0A0A] px-4 bg-[#141418] relative">
      <div className="py-1.5">
        <div className="flex items-center gap-2.5 text-[#B9B9B9] pr-2.5 mr-2.5 border-r border-[#ECECED2E]">
          <TooltipProvider delayDuration={50}>
            {icons.map((item) => (
              <div key={item.id} className="flex items-center">
                <Tooltip>
                  <TooltipTrigger onClick={() => handleTabClick(item.id)}>
                    {item.id === activeType ? item.activeIcon : item.icon}
                  </TooltipTrigger>
                  <TooltipContent>{t(item.tooltip)}</TooltipContent>
                </Tooltip>
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>

      <div
        ref={containerRef}
        onWheel={onWheel}
        className="flex-1 overflow-x-auto no-scrollbar"
        style={{
          WebkitTouchCallout: 'none',
        }}
      >
        {activeType === 'favorites' && <WatchlistTopBarList />}
        {activeType === 'recent' && <RecentTopBarTokensList />}
        {activeType === 'holding' && <HoldingTopBarList />}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={handleScrollLeft}
          className="h-[28px] w-14 bg-[#141418] absolute z-5 top-1/2 -translate-y-1/2 left-[96px] flex items-center justify-center"
        >
          <img src="/images/icons/ic-arrow-right-simple.svg" alt="scroll-left" className="rotate-180" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={handleScrollRight}
          className="h-[28px] w-14 bg-[#141418] absolute z-5 top-1/2 -translate-y-1/2 right-0 flex items-center justify-center"
        >
          <img src="/images/icons/ic-arrow-right-simple.svg" alt="scroll-right" />
        </button>
      )}
    </div>
  )
}
