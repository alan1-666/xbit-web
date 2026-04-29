import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog.tsx'
import { Drawer, DrawerContent } from '@components/ui/drawer.tsx'
import { useTranslation } from 'react-i18next'
import ListAppShare from '@components/common/share/listAppShare.tsx'
import html2canvas from 'html2canvas'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice.ts'
import { ServiceConfig } from '@/lib/gql/service-config'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '../ui/button'
import { Loading } from '@components/common/Loading.tsx'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import Text from '@components/common/Text.tsx'

export interface ShareXbitDrawerProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const ShareXbitDrawer = (props: ShareXbitDrawerProps) => {
  const { open, setOpen } = props
  const { isDesktop } = useResponsive()
  const userId = useSelector(_userInfo)?.userId
  const [posterImage, setPosterImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasAttempted, setHasAttempted] = useState(false)

  const { t } = useTranslation()
  const posterRef = useRef<HTMLDivElement>(null)
  const { data } = useQuery(GET_USER_REFERRALSNAPSHOT, {
    variables: {
      input: {
        empty: userId,
      },
    },
    skip: !userId || !ServiceConfig.token,
    client: agentDexClient,
  })
  const referralCode = useMemo(() => {
    return data?.referralSnapshot?.user?.invitationCode || ''
  }, [data])

  // 等待图片加载
  const waitForImages = async (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll('img')
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = img.onerror = () => resolve(true)
        setTimeout(() => resolve(true), 3000) // 3秒超时
      })
    })
    await Promise.all(promises)
  }

  // 生成海报
  const generatePoster = async (): Promise<string | null> => {
    if (!posterRef.current) return null

    setIsLoading(true)
    try {
      // 等待所有图片加载完成
      await waitForImages(posterRef.current)

      // 等待QRCode渲染
      await new Promise((resolve) => setTimeout(resolve, 500))

      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })

      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('生成海报失败:', error)
      return null
    } finally {
      setIsLoading(false)
      setHasAttempted(true)
    }
  }

  // 弹窗打开时生成海报
  useEffect(() => {
    if (open && referralCode && !posterImage && !isLoading) {
      const timer = setTimeout(async () => {
        const image = await generatePoster()
        setPosterImage(image)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open, referralCode, posterImage, isLoading])

  // 重置状态
  useEffect(() => {
    if (!open) {
      setPosterImage(null)
      setIsLoading(false)
      setHasAttempted(false)
    }
  }, [open])

  const handleDownload = async () => {
    if (posterImage) {
      const link = document.createElement('a')
      link.download = 'Share Xbit.png'
      link.href = posterImage
      link.click()
    }
  }

  const url = useMemo(() => {
    const currentDomain = window.location.origin
    return referralCode ? `${currentDomain}/@${referralCode}` : currentDomain
  }, [referralCode])

  // Hidden poster generation area (reused by both Dialog and Drawer)
  const posterGenerationArea = (
    <div ref={posterRef} className="w-[360px] mx-auto fixed -top-[9999px] -left-[9999px]">
      <div className="relative">
        <img src="/images/share/xbit-share.png" className="size-full max-h-[50vh] overflow-hidden" alt="" />
        <div
          className="absolute top-0 left-0 right-0 text-center sfont-bold text-[calc(20rem/16)] text-white"
          style={{ paddingTop: '36px', paddingLeft: '12px', paddingRight: '12px' }}
        >
          <div>{t('appSettings.shareXBITSlogan')}</div>
          <div>{t('appSettings.shareXBITSubSlogan')}</div>
        </div>
      </div>
      <div className="bg-[url('/images/share/footer-share.webp')] bg-cover bg-center bg-no-repeat h-[81px] w-full relative">
        <img src="/images/xbit-logo.svg" alt="xbit logo" className="w-[48px] h-[42px] absolute left-5 top-5" />
        <img
          src="/images/share/xbit-logo-text-dark.svg"
          alt="xbit logo"
          className="w-[80px] h-[24px] absolute left-21 top-5"
        />

        <Text
          text={t('appSettings.shareXBITSubtitle')}
          color="#0A0A0A"
          className="absolute top-[40px] left-[80px] md:top-[41px] md:left-[85px] whitespace-nowrap"
          fontSize={11}
        />

        <div className=" absolute right-3 top-1/2 -translate-y-1/2 flex justify-center items-center">
          <QRCodeCanvas
            marginSize={1}
            value={`https://app.xbit.com/${referralCode ? `/@${referralCode}` : ''}`}
            width={75}
            height={70}
            size={isDesktop ? 68 : 52}
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
      {/* <div className="bg-[#141414]">
        <div
          className="w-full flex items-center gap-3.5 bg-[linear-gradient(90deg,_rgba(153,_69,_255,_0.1)_0%,_rgba(255,_255,_255,_0.08)_50%,_rgba(0,_243,_193,_0.1)_100%)] justify-between"
          style={{
            padding: '10px',
          }}
        >
          <div className="flex flex-row gap-3">
            <img className="w-10" src="/images/xbit-logo.svg" alt="logo xbit" />
            <div className="flex flex-col items-start pb-1 justify-between">
              <img src="/images/logo-xbit-text.svg" alt="logo xbit text" className="h-6" />
              <span className="app-font-regular text-[calc(1rem*(10/16))] text-[#FFFFFFB2] leading-4 tracking-[1.2px] mt-1">
                {t('detail.myPositions.decentralizedExchange')}
              </span>
            </div>
          </div>
          <QRCodeCanvas value={url} size={isDesktop ? 68 : 42} marginSize={1} level="M" className="" />
        </div>
      </div> */}
    </div>
  )

  // Content area (reused by both Dialog and Drawer)
  const contentArea = (
    <>
      {posterGenerationArea}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loading />
          <div className="text-white text-[14px]">{t('appSettings.sharePoster')}</div>
        </div>
      ) : posterImage ? (
        <div className={cn(isDesktop && 'h-fit')}>
          <div className="w-full flex justify-center">
            <img
              src={posterImage}
              alt="Generated Poster"
              className={cn(
                'max-w-[340px] w-full h-auto rounded-lg shadow-lg',
                isDesktop && 'max-w-[410px] max-h-[640px]',
              )}
            />
          </div>
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="w-max mx-auto">
              <ListAppShare onSave={handleDownload} text={t('appSettings.shareXBITText')} url={url} />
            </div>
          </div>
        </div>
      ) : hasAttempted ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-[#9CA3AF] text-[14px] mb-4">{t('appSettings.posterFailed')}</div>
          <Button
            variant={'purpleDefault'}
            onClick={async () => {
              const image = await generatePoster()
              setPosterImage(image)
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#9945FF] to-[#00F3AB] text-white rounded-lg text-[14px]"
          >
            {t('appSettings.reGenerate')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <Loading />
          <div className="text-white text-[14px]">{t('appSettings.sharePoster')}</div>
        </div>
      )}
    </>
  )

  // Desktop: Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="bg-[#141414] border-[#ECECED14] max-w-[680px] p-0 pb-3 max-h-[90vh] overflow-y-auto w-full flex flex-col"
          showDialogPrimitiveClose={false}
        >
          <div className="flex items-center justify-between py-3 border-b">
            <div className="w-[70px]"></div>
            <div className={'text-lg font-normal text-center flex-1'}>{t('futuresDetailsShare.share')}</div>
            <div className="w-[70px] justify-end flex pr-3">
              <img
                src={'/images/icons/close.svg'}
                alt="icon close"
                className="size-[16px] cursor-pointer"
                onClick={() => {
                  setOpen(false)
                }}
              />
            </div>
          </div>
          {contentArea}
        </DialogContent>
      </Dialog>
    )
  }

  // Mobile: Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="bg-[#141414] max-w-[768px] mx-auto px-3  space-y-4 max-h-[95vh]">
        <DialogTitle className="flex items-center gap-3 justify-between pt-3">
          <div className="text-[calc(16rem/16)] font-semibold text-center">{t('futuresDetailsShare.share')}</div>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt="close"
          />
        </DialogTitle>
        {contentArea}
      </DrawerContent>
    </Drawer>
  )
}
