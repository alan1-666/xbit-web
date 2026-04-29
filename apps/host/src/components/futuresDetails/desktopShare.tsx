import { useState, useRef, useMemo, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'
import { toPng } from 'html-to-image'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import ListAppShare from '@/components/common/share/listAppShare'
import FuturesShareMobile from './mobileShare'
import { formatBalance, formatVolume, formatPrice } from '@/lib/format'
import { getFuturesCoinIconSrc } from '@/lib/futuresCoinIcon'

export interface DesktopShareProps {
  info: any
  open: boolean
  onClose: (open: boolean) => void
  fileName?: string
  shareType?: 'order' | 'orderHistory' | 'contract'
}

const BACKGROUND_IMAGES = [
  '/images/share/share-bg-1.png',
  '/images/share/share-bg-2.png',
  '/images/share/share-bg-3.png',
  '/images/share/share-bg-4.png',
  '/images/share/share-bg-5.png',
]

const BORDER_GRADIENTS = [
  'linear-gradient(105.01deg, #A53EFF 2.67%, rgba(255, 255, 255, 0.02) 46.87%, rgba(255, 255, 255, 0.0001) 56.9%, #A53EFF 90.81%)',
  'linear-gradient(105.01deg, #00B786 2.67%, rgba(255, 255, 255, 0.02) 46.87%, rgba(255, 255, 255, 0.0001) 56.9%, #00B786 90.81%)',
  'linear-gradient(105.01deg, #9B4100 2.67%, rgba(255, 255, 255, 0.02) 46.87%, rgba(255, 255, 255, 0.0001) 56.9%, #AD2B00 90.81%)',
  'linear-gradient(105.01deg, #063BEA 2.67%, rgba(255, 255, 255, 0.02) 46.87%, rgba(255, 255, 255, 0.0001) 56.9%, #0E6DFF 90.81%)',
  'linear-gradient(105.01deg, #6B0EEA 2.67%, rgba(255, 255, 255, 0.02) 46.87%, rgba(255, 255, 255, 0.0001) 56.9%, #AD24FF 90.81%)',
]

function DesktopShareDesktop({ info, open, onClose, fileName = '', shareType = 'order' }: DesktopShareProps) {
  const { t } = useTranslation()
  const posterRef = useRef<HTMLDivElement>(null)
  const [selectedBg, setSelectedBg] = useState(0)
  const [inviteCode, setInviteCode] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [showLeverage, setShowLeverage] = useState(true)
  const [showPnlAmount, setShowPnlAmount] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [showClosePrice, setShowClosePrice] = useState(true)

  const localFallbackIcon = '/images/logoweb.png'

  const waitForImages = async (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll('img')
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = img.onerror = () => resolve(true)
        setTimeout(() => resolve(true), 4000)
      })
    })
    await Promise.all(promises)
  }

  const SOCIAL_LINKS = useMemo(
    () => [
      {
        icon: '/images/share/icon-web.svg',
        title: 'KairoX',
        url: `https://app.xbit.com/futures/${info?.coin}${inviteCode ? `/@${inviteCode}` : ''}`,
      },
      {
        icon: '/images/share/icon_twitter.svg',
        title: '@KairoX',
        url: 'https://twitter.com/KairoX',
      },
      {
        icon: '/images/share/icon-tele.svg',
        title: '@KairoX',
        url: 'https://t.me/KairoX',
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


  // 保存图片
  const handleSaveImage = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      // 等待所有图片加载完成
      await waitForImages(posterRef.current as HTMLElement)
      // 额外等待确保渲染完成
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const dataUrl = await toPng(posterRef.current as HTMLElement, {
        quality: 1,
        pixelRatio: 2,
        includeQueryParams: true,
        skipFonts: true,
        skipAutoScale: true,
        cacheBust: true,
        
      })
      const link = document.createElement('a')
      link.download = fileName ? `${fileName}.png` : 'Peretual_order_share.png'
      link.href = dataUrl
      link.click()
      toast.success(t('toast.saveSuccess'))
    } catch (error) {
      toast.error(t('toast.saveFailed') || '保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const renderPosterCard = () => (
    <div className="h-full">
      <div
        className="relative p-[1px] rounded-[8px]"
        data-share-poster-root
        style={{
          background: BORDER_GRADIENTS[selectedBg],
        }}
      >
        <div className="relative w-full h-[368px] overflow-hidden rounded-[8px]">
          <img
            src={BACKGROUND_IMAGES[selectedBg]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none"
            style={{ zIndex: 0 }}
          />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ zIndex: 1 }}>
            <img src="/images/kairox-logo.svg" alt="KairoX" className="w-7 h-7" />
            <img src="/images/kairox-logo-text.svg" alt="KairoX" className="h-5" />
          </div>

          <div className="absolute left-6 top-[63px] flex flex-col justify-between" style={{ zIndex: 1 }}>
            <div className="flex flex-col gap-3 h-[220px]">
              <div
                style={{ display: 'flex', alignItems: 'center', height: 32, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}
              >
                <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex-shrink-0">
                  <img
                    src={getFuturesCoinIconSrc(info?.coin)}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = localFallbackIcon
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span className="ml-3 text-white text-[24px] font-bold leading-[32px]">{info?.coin}USDC</span>
                <div style={{ width: 1, height: 12, backgroundColor: '#777A8C', marginLeft: 12, flexShrink: 0 }} />
                <span className="ml-3 text-white text-[20px] leading-[32px]">{dirText}</span>
                {showLeverage && shareType !== 'orderHistory' && (
                  <>
                    <div style={{ width: 1, height: 12, backgroundColor: '#777A8C', marginLeft: 12, flexShrink: 0 }} />
                    <span className="ml-3 text-white text-[20px] leading-[32px]">
                      {info?.leverage?.value || info?.leverage || 40}x
                    </span>
                  </>
                )}
              </div>

              <div
                className={cn(isProfit ? 'text-rise' : 'text-fall')}
                style={{ display: 'flex', alignItems: 'flex-end', paddingTop: 12, paddingBottom: 12 }}
              >
                <span className="text-[64px] font-bold leading-[1]">
                  {shareType !== 'orderHistory'
                    ? info?.pnlPercentage || '--'
                    : formatBalance(info?.unrealizedPnl || '--', {
                        showSign: true,
                        showCurrency: false,
                        roundMode: 'floor',
                      })}
                  {shareType === 'orderHistory' && (
                    <span style={{ marginLeft: 8, fontSize: 16, lineHeight: '32px' }}>
                      <span className="ml-0.5">USDC</span>
                    </span>
                  )}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
                {showPnlAmount && shareType !== 'orderHistory' && (
                  <div style={{ display: 'flex', flexDirection: 'column', marginRight: 32 }}>
                    <span className="text-[#908E98] whitespace-nowrap text-[18px]">
                      {t('futuresDetailsShare.pnlAmount')}
                    </span>
                    <span className="text-white text-[18px]">
                      {formatBalance(info?.unrealizedPnl, {
                        showSign: true,
                        showCurrency: true,
                        roundMode: 'floor',
                      })}
                    </span>
                  </div>
                )}
                {showPrice && (
                  <div style={{ display: 'flex', flexDirection: 'column', marginRight: 32 }}>
                    <span className="text-[#908E98] whitespace-nowrap text-[18px]">
                      {shareType === 'orderHistory'
                        ? t('futuresDetailsOrder.volume')
                        : t('futuresDetailsOrder.openPrice')}
                    </span>
                    <span className="text-white text-[18px]">
                      {info?.entryPx
                        ? formatPrice(info?.entryPx, {
                            showCurrency: true,
                          })
                        : formatVolume(info?.transaction, {
                            showCurrency: true,
                          }) || '--'}
                    </span>
                  </div>
                )}
                {showClosePrice && shareType === 'orderHistory' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="text-[#908E98] whitespace-nowrap text-[18px]">
                      {shareType === 'orderHistory'
                        ? t('futuresDetailsOrder.closePrice')
                        : t('futuresDetailsOrder.markPrice')}
                    </span>
                    <span className="text-white text-[18px]">
                      {formatPrice(info?.markPrice || info?.closePrice || '--', {
                        showCurrency: false,
                        roundMode: 'ceil',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              {inviteCode && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 16,
                    flexWrap: 'nowrap',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="text-[#908E98] text-[16px] whitespace-nowrap">{t('appSettings.referralCode')}</span>
                  <span style={{ marginLeft: 8, color: 'white', fontSize: 20, whiteSpace: 'nowrap' }}>
                    {inviteCode}
                  </span>
                </div>
              )}

              <div className="flex items-center h-5">
                {SOCIAL_LINKS.map((link: { icon: string; title: string; url: string }, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: 20,
                      marginRight: index < SOCIAL_LINKS.length - 1 ? 20 : 0,
                      cursor: 'pointer',
                    }}
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <img src={link.icon} alt={link.title} style={{ width: 14, height: 14, flexShrink: 0 }} />
                    <span
                      style={{ marginLeft: 6, color: 'white', fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap' }}
                    >
                      {link.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#212127] rounded-[12px] p-4 w-[780px] max-w-none overflow-hidden"
        showDialogPrimitiveClose={false}
      >
        <div className="w-full h-full">
          <div ref={posterRef}>{renderPosterCard()}</div>
          <div className="w-full flex gap-3 mt-2">
            <div className="flex-1 rounded-lg p-3 bg-[#2A2A32]">
              <p className="text-[#9D9CA2] text-base mb-3">{t('futuresDetailsShare.selectBgImage')}</p>
              <div className="flex gap-3">
                {BACKGROUND_IMAGES.map((bg, index) => (
                  <div
                    key={index}
                    className={cn(
                      'w-[46px] h-[46px] rounded-md overflow-hidden cursor-pointer transition-all',
                      selectedBg === index ? 'ring-1 ring-[#C8A7FD]' : '',
                    )}
                    onClick={() => setSelectedBg(index)}
                  >
                    <img src={bg} alt="" className="w-full h-full object-cover object-right" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 rounded-lg p-3 bg-[#2A2A32]">
              <p className="text-[#9D9CA2] text-base mb-3">{t('futuresDetailsShare.selectShareInfo')}</p>
              <div className="flex gap-5 flex-wrap">
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

          <div className="flex flex-col items-center gap-2 rounded-t-[8px] mt-2">
            <ListAppShare onSave={handleSaveImage} url={url} saving={isSaving} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const DesktopShare = (props: DesktopShareProps) => {
  const { isDesktop } = useResponsive()
  if (!isDesktop) {
    return <FuturesShareMobile {...props} />
  }
  return <DesktopShareDesktop {...props} />
}

export default DesktopShare
