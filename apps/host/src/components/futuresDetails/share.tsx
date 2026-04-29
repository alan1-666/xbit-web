import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useState, useEffect, useRef } from 'react'
import { formatAddressWallet } from '@/lib/string'
import { toPng } from 'html-to-image'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import Text from '@/components/common/Text'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'
import ListAppShare from '@/components/common/share/listAppShare'
import Slider from 'react-slick'
interface sharePrpos {
  info: any
  openShare: boolean
  onclose: (openShare: boolean) => void
  fileName?: string
  shareType?: string
}

// 背景图片配置
const BACKGROUND_IMAGES = [
  '/images/share/share-bg-1.png',
  '/images/share/share-bg-2.png',
  '/images/share/share-bg-3.png',
  '/images/share/share-bg-4.png',
  '/images/share/share-bg-5.png',
]

const share = ({ info, openShare, onclose, fileName, shareType }: sharePrpos) => {
  const { t } = useTranslation()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [shareData, setShareData] = useState<any[]>([])
  const [inviteCode, setInviteCode] = useState('')
  const [selectedBg, setSelectedBg] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [showUnrealizedPnL, setShowUnrealizedPnL] = useState(true)
  const [showTotalPnl, setShowTotalPnl] = useState(true)
  const [showTxs, setShowTxs] = useState(true)
  const sliderInstanceRef = useRef<Slider | null>(null)
  const sliderSettings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "35px",
    slidesToShow: 1,
    speed: 500,
    arrows: false,
    beforeChange: (_current: number, next: number) => {
      setSelectedBg(next)
    },
  }

  // 查询用户邀请码
  const getUserInviteCode = async () => {
    try {
      const res = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {},
      })
      const user = res?.data?.referralSnapshot?.user
      setInviteCode(user?.invitationCode || '')
    } catch (error) {}
  }

  const handleClose = () => {
    onclose(false)
  }
  useEffect(() => {
    getUserInviteCode()
  }, [])

  useEffect(() => {
    setShareData(contractData)
  }, [shareType, showUnrealizedPnL, showTotalPnl, showTxs])

  // 统计数据配置
  const contractData: any[] = [
    {
      label: t('futuresDetailsShare.unrealizedPnL'),
      value: formatCurrency(info?.unrealizedPnl),
      show: showUnrealizedPnL,
    },
    {
      label: t('futuresDetailsShare.totalPnl'),
      value: formatCurrency(info?.totalProfit),
      show: showTotalPnl,
    },
    {
      label: t('futuresDetailsShare.txs'),
      value: (
        <div className="text-[calc(14rem/16)]">
          <span className="text-rise">{info?.longCount}</span>
          <span className="text-[#FFFFFF70] size-[0.75em]">/</span>
          <span className="text-fall">{info?.shortCount}</span>
        </div>
      ),
      show: showTxs,
    },
  ]
  // 等待所有图片加载完成
  const waitForImages = async (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll('img')
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = img.onerror = () => resolve(true)
        setTimeout(() => resolve(true), 4000) // 最多等待4秒
      })
    })
    await Promise.all(promises)
  }
  // 保存图片
  const onSave = async () => {
    if (isSaving) return
    try {
      setIsSaving(true)

      // 获取当前显示的卡片
      let targetElement: HTMLElement | null = null
      if (sliderRef.current) {
        const currentSlide = sliderRef.current.querySelector('.slick-current')
        if (currentSlide) {
          targetElement = currentSlide.querySelector('.relative') as HTMLElement
        }
      }
      
      if (!targetElement) {
        toast.error(t('toast.saveFailed') || '保存失败')
        return
      }

      // 等待所有图片加载完成
      await waitForImages(targetElement)
      // 额外等待确保渲染完成
      await new Promise((resolve) => setTimeout(resolve, 500))

      const dataUrl = await toPng(targetElement, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true, // 避免缓存问题
        includeQueryParams: true, // 包含查询参数
        skipFonts: true, // 跳过字体处理，避免跨域 CSS 错误
        skipAutoScale: true,
      })

      const link = document.createElement('a')
      link.download = fileName ? `${fileName}.png` : 'Peretual_share.png'
      link.href = dataUrl
      link.click()
      toast.success(t('toast.saveSuccess'))
    } catch (error) {
      toast.error(t('toast.saveFailed') || '保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const renderCardContent = (bgIndex: number) => {
    return (
      <div className={cn('relative')} style={{ height: '328px' }}>
        <div
          className={cn('relative w-full h-[278px]')}
          style={{
            backgroundImage: `url(${BACKGROUND_IMAGES[bgIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'right',
          }}
        >
          {/* 主要内容区域 */}
          <div className={cn('absolute left-6 flex flex-col justify-between top-[20px]')}>
            <div className={cn('flex flex-col gap-2 h-[180px]')}>
              <div
                style={{
                  textAlign: 'left',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                30D {t('futuresDetailsShare.title')}
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  lineHeight: '50px',
                }}
                className={info?.totalPnl > 0 ? 'text-rise' : 'text-fall'}
              >
                {`${info?.pnlPercentage > 0 ? '+' : ''}${info.pnlPercentage}%`}
              </div>
              <div className="text-[#CACACA] text-[12px] flex items-center">
                <>
                  {t('futuresDetailsShare.address')}{' '}
                  <span className="ml-2">{formatAddressWallet(info?.userAddress)}</span>
                </>
              </div>
              <div className={cn('w-full')}>
                {shareData.map(
                  (item, index) =>
                    item.show && (
                      <div key={index} className="block">
                        <div className="text-left text-[12px] text-[#CACACA] mt-[8px]">
                          <div>{item.label}</div>
                          <div className="text-[12px]">{typeof item.value === 'string' ? item.value : item.value}</div>
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[url('/images/share/footer-share.png')] bg-cover bg-center bg-no-repeat h-[50px] w-full relative">
        <div className='flex ml-3 pt-2.5'>
            <img src="/images/xbit-logo.svg" alt="xbit logo" className="w-[30px] h-[30px]" />
            <div className='ml-2'>
              <img
                src="/images/share/xbit-logo-text-dark.svg"
                alt="xbit logo"
                className="w-[50px] h-[14px]"
              />
              <Text
                text={t('appSettings.shareXBITSubtitle')}
                color="#0A0A0A"
                className="mt-1 whitespace-nowrap"
                fontSize={11}
              />
            </div>
          </div>

          <div className=" absolute right-3 top-1/2 -translate-y-1/2 flex justify-center items-center">
            <QRCodeCanvas
              marginSize={1}
              value={`https://app.xbit.com/${inviteCode ? `/@${inviteCode}` : ''}`}
              size={45}
              imageSettings={{
                src: '/images/share/logo-inside-qr.svg',
                height: 16,
                width: 16,
                excavate: true,
              }}
              level="H"
            />
          </div>
        </div>
      </div>
    )
  }

  const RenderContent = () => {
    return (
      <div className="flex flex-col">
        {/* 选项区域 - 固定不滚动 */}
        <div className="flex-shrink-0 bg-[#232329]">
          <div className={cn('w-full')}>
            {/* 背景选择 */}
            <div className={cn('flex-1 rounded-lg p-3')}>
              <p className="text-[#9D9CA2] text-base mb-3">{t('futuresDetailsShare.selectBgImage')}</p>
              <div className="flex gap-3">
                {BACKGROUND_IMAGES.map((bg, index) => (
                  <div
                    key={index}
                    className={cn(
                      'w-[46px] h-[46px] rounded-md overflow-hidden cursor-pointer transition-all',
                      selectedBg === index ? 'ring-1 ring-[#C8A7FD]' : '',
                    )}
                    onClick={() =>{
                      setSelectedBg(index)
                      if (sliderInstanceRef.current) {
                        sliderInstanceRef.current.slickGoTo(index)
                      }
                    }}
                  >
                    <img src={bg} alt="" className="w-full h-full object-cover object-right" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-lg p-3">
              <p className="text-[#9D9CA2] text-base mb-3">{t('futuresDetailsShare.selectShareInfo')}</p>
              <div className="flex gap-5">
                <CheckboxWithLabel
                  checked={showUnrealizedPnL}
                  onChange={(checked) => setShowUnrealizedPnL(checked as boolean)}
                  label={t('futuresDetailsShare.unrealizedPnL')}
                  containerClassName="align-b"
                  labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                />
                <CheckboxWithLabel
                  checked={showTotalPnl}
                  onChange={(checked) => setShowTotalPnl(checked as boolean)}
                  label={t('futuresDetailsShare.totalPnl')}
                  labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                />
                <CheckboxWithLabel
                  checked={showTxs}
                  onChange={(checked) => setShowTxs(checked as boolean)}
                  label={t('futuresDetailsShare.txs')}
                  labelWrapperClassName="!text-white !text-sm !top-[0px] ml-1"
                />
              </div>
            </div>
          </div>

          {/* 分享按钮区域 */}
          <div className="flex flex-col items-center gap-2 bg-[#79778C16] rounded-t-[8px]">
            <ListAppShare
              onSave={onSave}
              text={t('futuresDetailsShare.30dshare', {
                coin: '$' + info.coin,
                pnlPercentage: info?.pnlPercentage + '%',
              })}
              url={`${window.location.origin}/futures/${info?.coin}${inviteCode ? `/@${inviteCode}` : ''}`}
            />
          </div>
        </div>
      </div>
    )
  }
  return (
    <Drawer open={openShare} onOpenChange={handleClose}>
      {/* <DrawerTrigger asChild>{childrenTrigger}</DrawerTrigger> */}
      <DrawerContent className="w-full bg-[#232329]">
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle>{t('futuresDetailsShare.share')}</DrawerTitle>
          <img src="/images/icons/icon-x.svg" className="w-6 h-6 cursor-pointer" onClick={handleClose} alt="close" />
        </DrawerHeader>
        <div className='flex flex-col overflow-hidden'>
            <div className="flex-1 overflow-y-auto">
              <div 
                className="invite-slider" 
                ref={sliderRef}
              >
                <Slider {...sliderSettings} ref={(slider) => { sliderInstanceRef.current = slider }}>
                  {BACKGROUND_IMAGES.map((_bg, index) => (
                    <div 
                      key={index}
                    >
                      {renderCardContent(index)}
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
            <div className="flex-shrink-0">
              <RenderContent />
            </div>
          </div>
        {/* <RenderContent /> */}
      </DrawerContent>
    </Drawer>
  )
}

export default share
