import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import useBanners, { BannerItem } from '@/hooks/useBanners'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { ROUTE_BANNER } from '@/services/symbol.dex.service'
import { useTranslation } from 'react-i18next'
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Skeleton } from '@components/ui/skeleton.tsx'

type MobileAdBannerItem = {
  id: string
  imageUrl: string
  linkUrl: string
}

type MobileAdBannerSize = 'small' | 'large'

type MobileAdBannerProps = {
  /**
   * 广告高度尺寸，不同页面可以传不同尺寸：
   * - small：较扁的横幅
   * - large：较高的主推位
   *
   * 规则：
   * - large：指示器在底部中间
   * - small：指示器在右下角
   */
  size?: MobileAdBannerSize
  /**
   * 自定义样式，覆盖或追加外层容器样式
   */
  className?: string
}

const sizeClassMap: Record<MobileAdBannerSize, string> = {
  small: 'aspect-[5/1]',
  large: 'aspect-[3/1]',
}

/**
 * 移动端广告位组件
 *
 * 特性：
 * - 宽度 100%，高度通过 size 区分两种尺寸
 * - 大小控制指示器位置：large -> 中间，small -> 右下角
 * - 固定展示，不能关闭
 * - 支持多图轮播 + 指示器，轮播间隔 5s
 * - 点击广告使用新窗口打开链接
 */
const MobileAdBanner: React.FC<MobileAdBannerProps> = (props) => {
  const { size = 'large', className } = props

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const { i18n } = useTranslation()
  const isZhLike = i18n.language === 'zh' || i18n.language === 'hk'

  const walletDex = useSelector(_walletDex)

  const { banners, loading } = useBanners('H5')

  const ads: MobileAdBannerItem[] = useMemo(() => {
    return banners.reduce((items, banner: BannerItem) => {
      const imageUrl =
        size === 'small'
          ? isZhLike
            ? banner.zhImage1Url
            : banner.enImage1Url
          : isZhLike
            ? banner.zhImageUrl
            : banner.enImageUrl

      if (!imageUrl) {
        return items
      }

      items.push({
        id: banner.id,
        imageUrl,
        linkUrl: banner.route,
      })
      return items
    }, [] as MobileAdBannerItem[])
  }, [banners, size, isZhLike])

  useEffect(() => {
    if (typeof window === 'undefined') {
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
  }, [carouselApi, ads])

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

  if (loading) {
    return (
      <div className="px-2.5">
        <Skeleton className={cn('w-full', sizeClassMap[size], className)} />
      </div>
    )
  }

  if (!ads || ads.length === 0) {
    return null
  }

  const onClickAd = (item: MobileAdBannerItem) => {
    if (typeof window === 'undefined') {
      return
    }

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

    window.open(item.linkUrl, '_blank', 'noopener,noreferrer')
  }

  const isLarge = size === 'large'

  const indicatorPositionClassName = cn(
    'pointer-events-auto absolute bottom-4 flex gap-2',
    isLarge && 'left-1/2 -translate-x-1/2',
    !isLarge && 'right-4',
  )

  return (
    <div className={cn('w-full', className)} id="app_banner">
      <div className={cn('relative w-full rounded-md overflow-hidden', sizeClassMap[size])}>
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
                  <img src={item.imageUrl} alt="" draggable={false} className="w-full h-full object-cover" />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>

          {scrollSnaps.length > 1 && (
            <div className={indicatorPositionClassName}>
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
    </div>
  )
}

export default MobileAdBanner
