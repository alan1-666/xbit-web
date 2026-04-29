import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import ls from '@/lib/local-storage'
import useBanners, { BannerItem } from '@/hooks/useBanners'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { ROUTE_BANNER } from '@/services/symbol.dex.service'
import { useTranslation } from 'react-i18next'
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'

type PcAdBannerItem = {
  id: string
  imageUrl: string
  linkUrl: string
}

type PcAdBannerProps = {
  /**
   * 预留给后续按业务区分（例如 futures / meme / xstocks），
   * 目前逻辑是三个页面共用同一套弹出记录。
   */
  scene?: 'futures' | 'meme' | 'xstocks'
}

// 仅用于「关闭」行为的当天标记；点击广告不应影响后续弹出
const STORAGE_KEY = 'pcAdBanner.closedDate'

const getTodayDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getMsUntilToday8AM = () => {
  const now = new Date()
  const target = new Date()
  target.setHours(8, 0, 0, 0)
  return target.getTime() - now.getTime()
}

const hasClosedToday = () => {
  try {
    const value = ls.get(STORAGE_KEY) as { closedDate?: string } | null
    if (!value || !value.closedDate) {
      return false
    }
    return value.closedDate === getTodayDateString()
  } catch {
    return false
  }
}

const markClosedToday = () => {
  try {
    ls.set(STORAGE_KEY, { closedDate: getTodayDateString() })
  } catch {
    // ignore
  }
}

/**
 * 右下角 PC 广告轮播组件:
 * - 仅 PC 端使用（由上层页面控制只在 PC 场景渲染）
 * - 每天本地时间 8:00 弹出一次
 * - 当天用户点击关闭后，当天不再自动弹出
 * - 未点击/关闭则保持展示
 * - 支持多图轮播 + 指示器，轮播间隔 5s
 * - 点击广告使用新窗口打开链接
 */
const PcAdBanner: React.FC<PcAdBannerProps> = () => {
  const [visible, setVisible] = useState(false)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const { i18n } = useTranslation()
  const isZhLike = i18n.language === 'zh' || i18n.language === 'hk'

  const walletDex = useSelector(_walletDex)

  const { banners, loading } = useBanners('PC')

  const ads: PcAdBannerItem[] = useMemo(() => {
    return banners.map((banner: BannerItem) => {
      let imageUrl = ''

      if (isZhLike && banner.zhImageUrl) {
        imageUrl = banner.zhImageUrl
      } else if (!isZhLike && banner.enImageUrl) {
        imageUrl = banner.enImageUrl
      } else {
        imageUrl = banner.zhImageUrl || banner.enImageUrl || banner.zhImage1Url || banner.enImage1Url || ''
      }

      return {
        id: banner.id,
        imageUrl,
        linkUrl: banner.route,
      }
    })
  }, [banners, isZhLike])

  // 处理每天 8:00 自动弹出 + 当日只弹一次
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (loading || ads.length === 0) {
      return
    }

    if (hasClosedToday()) {
      // 当天已经关闭过，不再自动弹出
      return
    }

    const msUntil8 = getMsUntilToday8AM()

    if (msUntil8 <= 0) {
      // 已经过了今天 8 点，立即弹出
      setVisible(true)
      return
    }

    const timer = window.setTimeout(() => {
      setVisible(true)
    }, msUntil8)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loading, ads])

  // 轮播逻辑（2 秒一张，仅在可见且有多张图时轮播）
  useEffect(() => {
    if (!visible) {
      return
    }

    if (!carouselApi || !ads || ads.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      carouselApi.scrollNext()
    }, 5000)

    return () => {
      window.clearInterval(interval)
    }
  }, [visible, carouselApi, ads])

  const onInitDots = useCallback((api: CarouselApi) => {
    if (!api) {
      return
    }
    setScrollSnaps(api.scrollSnapList())
  }, [])

  const onSelectDots = useCallback((api: CarouselApi) => {
    if (!api) {
      return
    }
    setSelectedIndex(api.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!carouselApi) {
      return
    }

    onInitDots(carouselApi)
    onSelectDots(carouselApi)

    carouselApi.on('reInit', onInitDots)
    carouselApi.on('reInit', onSelectDots)
    carouselApi.on('select', onSelectDots)

    return () => {
      carouselApi.off('select', onSelectDots)
    }
  }, [carouselApi, onInitDots, onSelectDots])

  if (!visible || !ads || ads.length === 0) {
    return null
  }

  const onClose = () => {
    setVisible(false)
    markClosedToday()
  }

  const onClickAd = (item: PcAdBannerItem) => {
    const userAddress = walletDex?.walletAddress || ''

    symbolDexClient
      .mutate({
        mutation: ROUTE_BANNER,
        variables: {
          input: {
            id: item.id,
            user: userAddress,
          },
        },
      })
      .catch(() => {
        // ignore tracking error
      })

    if (typeof window !== 'undefined') {
      window.open(item.linkUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="fixed left-[13px] bottom-[45.5px] z-[120]">
      <div className="relative group">
        {/* 弹窗主体：品牌紫色描边 */}
        <div className="relative w-[300px] h-[150px] rounded-[12px] overflow-hidden">
          <Carousel
            className="h-full"
            opts={{ loop: true }}
            setApi={(api) => {
              setCarouselApi(api)
            }}
          >
            <CarouselContent className="h-full ml-0">
              {ads.map((item) => (
                <CarouselItem key={item.id} className="h-full pl-0">
                  <button
                    type="button"
                    className="block w-full h-full cursor-pointer"
                    onClick={() => {
                      onClickAd(item)
                    }}
                  >
                    <img src={item.imageUrl} alt="" draggable={false} className="w-[300px] h-[150px] object-fill" />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* 指示器 */}
            {scrollSnaps.length > 1 && (
              <div className="pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to banner ${index + 1}`}
                    className={cn(
                      'h-1 rounded-full transition-all',
                      index === selectedIndex ? 'w-3 bg-white' : 'w-1 bg-white/40',
                    )}
                    onClick={() => {
                      carouselApi?.scrollTo(index)
                    }}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </div>

        {/* 关闭按钮：hover banner 时显示（与交易板块一致） */}
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <button
            type="button"
            aria-label="Close banner"
            className="flex text-primary transition-colors pointer-events-auto"
            onClick={onClose}
          >
            <span className="text-xs leading-none">✕</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PcAdBanner
