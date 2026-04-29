import { ChainIds } from '@/types/enums'
import { getBlockchainLogo2 } from '@/utils/helpers'
import {
  AllIcon,
  DailyIcon,
  ETFIcon,
  HourlyIcon,
  MonthlyIcon,
  PreMarketIcon,
  Time15MinIcon,
  Time4HourIcon,
  Time5MinIcon,
  WeeklyIcon,
} from '../icons'

import { cn } from '@/lib/utils'
import { useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SCROLL_STEP = 120

/** Persist crypto filter across tab switches (parent MarketOverviewList navigates and loses URL params) */
const CRYPTO_FILTER_STORAGE_KEY = 'prediction.cryptoFilterTag'

/** URL param for crypto filter - namespaced to avoid conflict with tag (trending/related) and financeTag */
export const CRYPTO_TAG_PARAM = 'cryptoTag'

export const getStoredCryptoTag = (): string | null => {
  try {
    return sessionStorage.getItem(CRYPTO_FILTER_STORAGE_KEY)
  } catch {
    return null
  }
}

export const setStoredCryptoTag = (tag: string): void => {
  try {
    if (tag) {
      sessionStorage.setItem(CRYPTO_FILTER_STORAGE_KEY, tag)
    } else {
      sessionStorage.removeItem(CRYPTO_FILTER_STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

const FILTERS = [
  { label: 'prediction.filters.all', icon: AllIcon, value: '' },
  { label: 'prediction.filters.5min', icon: Time5MinIcon, value: '5M' },
  { label: 'prediction.filters.15min', icon: Time15MinIcon, value: '15M' },
  { label: 'prediction.filters.hourly', icon: HourlyIcon, value: '1H' },
  { label: 'prediction.filters.4hour', icon: Time4HourIcon, value: '4h' },
  { label: 'prediction.filters.daily', icon: DailyIcon, value: 'daily' },
  { label: 'prediction.filters.weekly', icon: WeeklyIcon, value: 'weekly' },
  { label: 'prediction.filters.monthly', icon: MonthlyIcon, value: 'monthly' },
  { label: 'prediction.filters.preMarket', icon: PreMarketIcon, value: 'pre-market' },
  { label: 'prediction.filters.etf', icon: ETFIcon, value: 'etf' },
]

const TOKENS = [
  {
    label: 'prediction.tokens.bitcoin',
    chainId: ChainIds.BTC,
    value: 'bitcoin',
  },
  {
    label: 'prediction.tokens.ethereum',
    chainId: ChainIds.Ethereum,
    value: 'ethereum',
  },
  {
    label: 'prediction.tokens.solana',
    chainId: ChainIds.Solana,
    value: 'solana',
  },
  {
    label: 'prediction.tokens.xrp',
    img: '/images/xrp.webp',
    value: 'xrp',
  },
  {
    label: 'prediction.tokens.dogecoin',
    img: '/images/doge.webp',
    value: 'dogecoin',
  },
  {
    label: 'prediction.tokens.microstrategy',
    img: '/images/microstrategy.webp',
    value: 'microstrategy',
  },
]

export const VALID_CRYPTO_TAGS = new Set([
  ...FILTERS.map((f) => f.value),
  ...TOKENS.map((t) => t.value),
])

interface SidebarProps {
  className?: string
  /** URL param key to store the current filter tag. Defaults to `cryptoTag` (desktop),
   *  but can be overridden to `tag` on MarketPrediction mobile.
   */
  tagParamKey?: string
}

export const CryptoHorizontalFilter = ({ className, tagParamKey = CRYPTO_TAG_PARAM }: SidebarProps) => {
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
    setStoredCryptoTag(value)
    const newSearchParams = new URLSearchParams(searchParams)
    if (value) {
      newSearchParams.set(tagParamKey, value)
    } else {
      newSearchParams.delete(tagParamKey)
    }
    // When using generic `tag`, proactively clear any stale cryptoTag param.
    if (tagParamKey === 'tag') {
      newSearchParams.delete(CRYPTO_TAG_PARAM)
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
                  'flex flex-col items-center justify-center min-w-15 shrink-0 w-fit h-15 px-2 gap-1.5 rounded-md cursor-pointer transition-colors',
                  isActive ? 'bg-[#260B46] border border-[#321258] text-text-primary' : 'bg-transparent hover:bg-white/5 text-text-secondary',
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

          {TOKENS.map((token) => {
            const isActive = token.value === currentTag
            return (
              <div
                key={token.label}
                role="button"
                tabIndex={0}
                onClick={() => handleFilterClick(token.value)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-15 shrink-0 w-fit h-[60px] px-2 gap-1.5 rounded-md cursor-pointer transition-colors',
                  isActive
                    ? 'bg-[#260B46] border border-[#321258] text-text-primary'
                    : 'bg-transparent hover:bg-white/5 text-text-secondary',
                )}
              >
                <img
                  alt={`${token.label} logo`}
                  width="20"
                  height="20"
                  className="rounded-md mb-1"
                  src={token?.chainId ? getBlockchainLogo2(token.chainId) : token?.img}
                />
                <p className="text-xs font-medium text-center leading-tight whitespace-nowrap">{t(token.label)}</p>
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

export const CryptoSidebar = ({ className }: SidebarProps) => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTag = searchParams.get(CRYPTO_TAG_PARAM) || ''

  const handleFilterClick = (value: string) => {
    setStoredCryptoTag(value)
    const newSearchParams = new URLSearchParams(searchParams)
    if (value) {
      newSearchParams.set(CRYPTO_TAG_PARAM, value)
    } else {
      newSearchParams.delete(CRYPTO_TAG_PARAM)
    }
    setSearchParams(newSearchParams)
  }

  return (
    <div className={cn('hidden xl:block w-45 shrink-0 mr-6 pr-3 sticky top-12', className)}>
      <div className="flex flex-col gap-y-1 pb-4 overflow-y-auto scrollbar-hide h-[calc(100vh-9rem)] [scrollbar-gutter:stable]">
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

        {TOKENS.map((token) => {
          const isActive = token.value === currentTag
          return (
            <div
              key={token.label}
              role="button"
              tabIndex={0}
              onClick={() => handleFilterClick(token.value)}
              className={cn(
                'flex flex-row justify-between items-center rounded-md px-2 py-2.5 w-full cursor-pointer transition-colors',
                isActive
                  ? 'bg-[#230D43] text-text-primary border-[0.6px] border-[#2E1455]'
                  : 'bg-transparent hover:bg-[#230D43] text-text-secondary border-[0.6px] hover:border-[#2E1455] border-transparent',
              )}
            >
              <div className="flex flex-row items-center gap-x-2.5 flex-1">
                <div className="shrink-0">
                  <img
                    alt={`${token.label} logo`}
                    width="20"
                    height="20"
                    className="size-5 rounded-md shrink-0"
                    src={token?.chainId ? getBlockchainLogo2(token.chainId) : token?.img}
                  />
                </div>
                <p className="text-sm font-semibold">{t(token.label)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
