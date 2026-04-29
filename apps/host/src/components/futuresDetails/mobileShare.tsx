import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { toPng } from 'html-to-image'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import { DOT_IMAGES } from '@/components/common/ShareTokenDetail'
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'
import Text from '@/components/common/Text'
import { QRCodeCanvas } from 'qrcode.react'
import ListAppShare from '@/components/common/share/listAppShare'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { formatBalance, formatVolume, formatPrice } from '@/lib/format'
import EmblaCarousel from '@/pages/detail/EmblaCarouel/EmblaCarousel'
import { DotButton, useDotButton } from '@/pages/detail/EmblaCarouel/EmblaCarouselDotButton'
import { toast } from 'sonner'
import { getFuturesCoinIconSrc } from '@/lib/futuresCoinIcon'

export interface FuturesShareMobileProps {
  info: any
  open: boolean
  onClose: (open: boolean) => void
  fileName?: string
  shareType?: 'order' | 'orderHistory' | 'contract'
}

const SLIDE_COUNT = 5
const SLIDES = Array.from(Array(SLIDE_COUNT).keys())
const OPTIONS: EmblaOptionsType = { containScroll: false, loop: true }

const FuturesShareMobile = ({ info, open, onClose, fileName = '', shareType = 'order' }: FuturesShareMobileProps) => {
  const { t } = useTranslation()
  const posterRefs = useRef<(HTMLDivElement | null)[]>([])
  const selectedIndexRef = useRef(0)

  const [inviteCode, setInviteCode] = useState('')
  const [showLeverage, setShowLeverage] = useState(true)
  const [showPnlAmount, setShowPnlAmount] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [showClosePrice, setShowClosePrice] = useState(true)
  const [saving, setSaving] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS)
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

  const localFallbackIcon = '/images/logoweb.png'

  const waitForImages = useCallback(async (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll('img')
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = img.onerror = () => resolve(true)
        setTimeout(() => resolve(true), 4000)
      })
    })
    await Promise.all(promises)
  }, [])

  const SOCIAL_LINKS = useMemo(
    () => [
      {
        icon: '/images/share/icon-web.svg',
        title: 'XBIT.com',
        url: `https://app.xbit.com/futures/${info?.coin}${inviteCode ? `/@${inviteCode}` : ''}`,
      },
      {
        icon: '/images/share/icon_twitter.svg',
        title: '@XBITDEX',
        url: 'https://twitter.com/XBITDEX',
      },
      {
        icon: '/images/share/icon-tele.svg',
        title: '@XBIT_DEX',
        url: 'https://t.me/XBIT_DEX',
      },
    ],
    [info?.coin, inviteCode],
  )

  const getUserInviteCode = async () => {
    try {
      const res = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {},
      })
      const user = res?.data?.referralSnapshot?.user
      setInviteCode(user?.invitationCode || '')
    } catch {
      /* empty */
    }
  }

  useEffect(() => {
    if (open) getUserInviteCode()
  }, [open])

  useEffect(() => {
    return () => setSaving(false)
  }, [open])

  const dirText = useMemo(() => {
    if (info?.side === 'B') return t('futuresDetails.common.long')
    if (info?.side === 'A') return t('futuresDetails.common.short')
    switch (info?.dir) {
      case 'Close Long':
        return t('futuresDetails.common.closeLong')
      case 'Close Short':
        return t('futuresDetails.common.closeShort')
      case 'Open Long':
        return t('futuresDetails.common.long')
      case 'Open Short':
        return t('futuresDetails.common.short')
      default:
        return t('futuresDetails.common.long')
    }
  }, [info?.dir, info?.side, t])

  const isProfit = useMemo(() => {
    if (shareType === 'orderHistory') {
      return Number(info?.unrealizedPnl || info?.closedPnl || 0) > 0
    }
    return Number(info?.unrealizedPnl || info?.pnlPercentage || 0) > 0
  }, [info, shareType])

  const url = `${window.location.origin}/futures/${info?.coin}${inviteCode ? `/@${inviteCode}` : ''}`

  /** 与 ShareTokenDetail.onSave 一致：整卡 ref + waitForImages + 1s + toPng + a[download] */
  const onSave = async () => {
    const currentPosterRef = posterRefs.current[selectedIndexRef.current]
    if (!currentPosterRef) {
      console.error('Poster ref not found for index:', selectedIndexRef.current)
      return
    }

    try {
      setSaving(true)
      await waitForImages(currentPosterRef)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const dataUrl = await toPng(currentPosterRef, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: false,
        includeQueryParams: true,
        // 避免遍历跨域样式表 cssRules（SecurityError: Cannot access rules）
        skipFonts: true,
        skipAutoScale: true,
        width: currentPosterRef.offsetWidth,
        height: currentPosterRef.offsetHeight,
      })

      const link = document.createElement('a')
      link.download = fileName ? `${fileName}.png` : `Peretual_order_share.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      toast.error(t('toast.saveFailed') || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const renderItem = ({
    type,
  }: {
    type: number
    showCostPrice: boolean
    showTotalBuy: boolean
    showBalance: boolean
  }) => {
    const arrayIndex = type - 1
    return (
      <div
        className="w-[350px] md:w-[450px]"
        ref={(el) => {
          posterRefs.current[arrayIndex] = el
        }}
      >
        <div
          className={cn(
            `relative h-[300px] bg-cover bg-top bg-no-repeat px-2 py-3 md:px-3`,
            type === 1 && "bg-[url('/images/share/h5-bg-share-1.webp')]",
            type === 2 && "bg-[url('/images/share/h5-bg-share-2.webp')]",
            type === 3 && "bg-[url('/images/share/h5-bg-share-3.webp')]",
            type === 4 && "bg-[url('/images/share/h5-bg-share-4.webp')]",
            type === 5 && "bg-[url('/images/share/h5-bg-share-5.webp')]",
          )}
        >
          <div className="mt-3 gap-2.5">
            <div
              className="flex items-center gap-x-1.5"
              style={{ flexWrap: 'nowrap', overflow: 'hidden' }}
            >
              <div className="w-5 h-5 rounded-full bg-white overflow-hidden flex-shrink-0">
                <img
                  src={getFuturesCoinIconSrc(info?.coin)}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = localFallbackIcon
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="text-white text-[14px] font-bold leading-[24px]">{info?.coin}USDC</span>
              <div style={{ width: 1, height: 12, backgroundColor: '#777A8C', marginLeft: 8, flexShrink: 0 }} />
              <span className="text-white text-[14px] leading-[24px]">{dirText}</span>
              {showLeverage && shareType !== 'orderHistory' && (
                <>
                  <div style={{ width: 1, height: 12, backgroundColor: '#777A8C', marginLeft: 8, flexShrink: 0 }} />
                  <span className="text-white text-[14px] leading-[24px]">
                    {info?.leverage?.value || info?.leverage || 40}x
                  </span>
                </>
              )}
            </div>

            <div
              className={cn(isProfit ? 'text-rise' : 'text-fall', 'mt-4 mb-3')}
              style={{ display: 'flex', alignItems: 'flex-end' }}
            >
              <span className="text-[28px] font-bold leading-[1]">
                {shareType !== 'orderHistory'
                  ? info?.pnlPercentage || '--'
                  : formatBalance(info?.unrealizedPnl || '--', {
                      roundMode: 'floor',
                      showSign: true,
                    })}
                {shareType === 'orderHistory' && (
                  <span className="ml-2 leading-8 size-[14px]">
                    <span className="ml-0.5">USDC</span>
                  </span>
                )}
              </span>
            </div>
            <div className="mt-2 flex gap-6 flex-wrap">
              {showPrice && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#CCCADB] text-[14px] leading-4">
                    {shareType === 'orderHistory'
                      ? t('futuresDetailsOrder.volume')
                      : t('futuresDetailsOrder.openPrice')}
                  </span>
                  <span className="text-white text-[14px] leading-4">
                    {info?.entryPx
                      ? formatPrice(info?.entryPx, { showCurrency: true })
                      : formatVolume(info?.transaction, { showCurrency: true }) || '--'}
                  </span>
                </div>
              )}
              {showClosePrice && shareType === 'orderHistory' && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#CCCADB] text-[14px] leading-4">
                    {shareType === 'orderHistory'
                      ? t('futuresDetailsOrder.closePrice')
                      : t('futuresDetailsOrder.markPrice')}
                  </span>
                  <span className="text-white text-[14px] leading-4">
                    {formatPrice(info?.markPrice || info?.closePrice || '--', { showCurrency: true })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-1 mt-7">
              <Text
                text={t('assets.shareHolding.inviteCode')}
                color="#CCCADB"
                fontSize={16}
                fontWeight="light"
                className={cn('leading-4')}
              />
              <Text text={inviteCode || '--'} fontSize={15} fontWeight="medium" className={cn('leading-4')} />
            </div>
          </div>

          <div className={'absolute left-3 bottom-3 space-y-4 font-[330] text-[14px] leading-none text-[#FBFBFB]'}>
            {SOCIAL_LINKS.map((link: { icon: string; title: string; url: string }, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1.5 cursor-pointer text-[12px] app-font-regular"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  window.open(link.url, '_blank')
                }}
              >
                <img src={link.icon} alt="" className="size-[14px]" />
                <span>{link.title}</span>
              </div>
            ))}
          </div>

          <div>
            {type === 2 && <img src="/images/share/h5-logo-1.svg" alt="" className="absolute right-0 bottom-2" />}
            {type === 3 && <img src="/images/share/h5-logo-2.svg" alt="" className="absolute right-0 bottom-2" />}
            {type === 1 && <img src="/images/share/h5-logo-3.svg" alt="" className="absolute right-0 bottom-2" />}
            {type === 5 && (
              <img src="/images/share/h5-logo-4.webp" alt="" className="w-[225px] absolute right-0 bottom-0" />
            )}
            {type === 4 && (
              <img src="/images/share/h5-logo-5.webp" alt="" className="w-[225px] absolute right-0 bottom-0" />
            )}
          </div>
        </div>

        <div className="bg-[url('/images/share/footer-share.webp')] bg-cover bg-center bg-no-repeat h-[81px] w-full relative">
          <img src="/images/xbit-logo.svg" alt="xbit logo" className="w-[48px] h-[42px] absolute left-5 top-5" />
          <img
            src="/images/share/xbit-logo-text-dark.svg"
            alt="xbit logo"
            className="w-[80px] h-[28px] absolute left-21 top-5"
          />
          <Text
            text={t('appSettings.shareXBITSubtitle')}
            color="#0A0A0A"
            className="absolute top-[47px] left-[84px] md:top-[45px] md:left-[85px]"
            fontSize={11}
          />

          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center">
            <QRCodeCanvas
              marginSize={1}
              value={`https://app.xbit.com/${inviteCode ? `/@${inviteCode}` : ''}`}
              width={75}
              height={70}
              size={60}
              imageSettings={{
                src: '/images/share/logo-inside-qr.svg',
                height: 20,
                width: 20,
                excavate: true,
              }}
              level="H"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="mx-auto max-h-[86vh] w-full max-w-[768px] bg-[#212127]">
        <DrawerHeader className="flex w-full items-center justify-between px-3 py-3">
          <DrawerTitle>{t('futuresDetailsShare.share')}</DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="h-6 w-6 cursor-pointer"
            onClick={() => onClose(false)}
            alt="close"
          />
        </DrawerHeader>
        <div className="_hidescrollbar h-full w-full overflow-y-auto py-2 overflow-x-hidden">
          <div className="m-auto flex h-fit w-[350px] items-center justify-center md:w-[450px] relative">
            <EmblaCarousel
              slides={SLIDES}
              options={OPTIONS}
              children={renderItem}
              selectedIndexRef={selectedIndexRef}
              emblaRef={emblaRef}
              emblaApi={emblaApi}
              selectedIndex={selectedIndex}
              showCostPrice
              showTotalBuy
              showBalance
            />
          </div>
          <div className="mt-4 w-full mx-3">
            <Text text={t('futuresDetailsShare.selectBgImage')} color="#908E98" fontSize={14} />
            <div className="flex gap-[20px] mt-[12px] flex-wrap">
              {scrollSnaps.map((_, index) => (
                <DotButton
                  key={index}
                  onClick={() => onDotButtonClick(index)}
                  className={`rounded-[6px] overflow-hidden border transition-all duration-300 w-[48px] h-[48px] ${
                    index === selectedIndex ? 'border-[#C8A7FD] border' : 'border-transparent '
                  }`}
                >
                  <img src={DOT_IMAGES[index]} alt="" className="size-full object-cover" />
                </DotButton>
              ))}
            </div>
            <div className="mt-[20px]">
              <Text text={t('futuresDetailsShare.selectShareInfo')} color="#908E98" fontSize={14} className="mb-2" />
              <div className="flex gap-4 mt-[12px] flex-wrap">
                {shareType !== 'orderHistory' && (
                  <>
                    <CheckboxWithLabel
                      checked={showLeverage}
                      onChange={(checked) => setShowLeverage(checked as boolean)}
                      label={t('position.leverage')}
                      containerClassName="align-b"
                      labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                    />
                    <CheckboxWithLabel
                      checked={showPnlAmount}
                      onChange={(checked) => setShowPnlAmount(checked as boolean)}
                      label={t('futuresDetailsShare.pnlAmount')}
                      labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                    />
                    <CheckboxWithLabel
                      checked={showPrice}
                      onChange={(checked) => setShowPrice(checked as boolean)}
                      label={t('futuresDetailsOrder.openPrice')}
                      labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                    />
                  </>
                )}
                {shareType === 'orderHistory' && (
                  <>
                    <CheckboxWithLabel
                      checked={showPrice}
                      onChange={(checked) => setShowPrice(checked as boolean)}
                      label={t('futuresDetailsOrder.volume')}
                      labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                    />
                    <CheckboxWithLabel
                      checked={showClosePrice}
                      onChange={(checked) => setShowClosePrice(checked as boolean)}
                      label={t('futuresDetailsOrder.closePrice')}
                      labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto py-2 flex items-center justify-center">
          <div className="bg-[#79778C29] rounded-[8px] w-full mx-3">
            <ListAppShare onSave={onSave} url={url} saving={saving} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default FuturesShareMobile
