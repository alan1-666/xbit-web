import { Drawer, DrawerContent, DrawerHeader } from '@components/ui/drawer.tsx'
import { toJpeg } from 'html-to-image'
import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import ListAppShareScreen from '../common/share/listAppShareScreen'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
}

const ShareDrawer = ({ open, setOpen, title }: Props) => {
  const { t } = useTranslation()
  const location = window.location.href
  const posterRef = useRef<HTMLDivElement>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string>('')

  const captureMainContent = async () => {
    const mainContentElement = document.getElementById('main-content')
    if (mainContentElement) {
      const rect = mainContentElement.getBoundingClientRect()

      if (rect.width > 0 && rect.height > 0) {
        try {
          const isDesktop = window.innerWidth >= 768

          const baseOptions = {
            quality: 0.5,
            pixelRatio: 2,
            skipFonts: true,
            useCORS: true,
            allowTaint: false,
          }

          if (isDesktop) {
            const centerStart = (window.innerWidth - 768) / 2
            const dataUrl = await toJpeg(mainContentElement, {
              ...baseOptions,
              width: 768,
              height: rect.height,
              style: {
                transform: `translateX(-${centerStart}px)`,
                transformOrigin: 'top left',
              },
            })

            setScreenshotUrl(dataUrl)
          } else {
            const dataUrl = await toJpeg(mainContentElement, {
              ...baseOptions,
              width: rect.width,
              height: rect.height,
            })

            setScreenshotUrl(dataUrl)
          }
        } catch (error) {
          console.error('Error capturing screenshot:', error)
        } finally {
        }
      }
    }
  }

  useEffect(() => {
    if (open) {
      const mainContentElement = document.getElementById('main-content')
      if (mainContentElement) {
        mainContentElement.offsetHeight
      }

      captureMainContent()
    } else {
      setScreenshotUrl('')
    }
  }, [open])

  const onSave = async () => {
    if (!posterRef.current) return

    try {
      const dataUrl = await toJpeg(posterRef.current, {
        quality: 1,
        pixelRatio: 1,
      })

      const link = document.createElement('a')
      link.download = 'share.png'
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error saving image:', error)
    }
  }

  return (
    <>
      {open &&
        createPortal(
          <div
            style={{ zIndex: 60 }}
            className="fixed inset-0 flex items-start pt-[64px] justify-center pointer-events-none px-3"
          >
            <div
              ref={posterRef}
              className="rounded-[8px] bg-[#232329] bg-[url(/images/share-bg.png)] bg-cover bg-center bg-no-repeat border-gradient border-[0.5px] flex items-center flex-col justify-center"
              style={{
                width: 'calc(100% - 24px)',
                maxHeight: 'calc(100vh - 97px - 181px)',
                maxWidth: 'calc(768px - 24px)',
              }}
            >
              <div
                className="h-[78px] min-h-[78px] w-full bg-gradient-to-r from-[#1E1726 ] via-[#122620]
               to-[#00F3C11A] flex items-center justify-between pl-[19px] pr-[15px] relative"
              >
                <div>
                  <img src="/images/logo-with-text.svg" alt="logo" />
                  <p className="text-[0.813rem] mt-2.5 font-medium">{t('shareBottomSheet.dexSlogan', 'DEX 毫秒级行情 极速成交')}</p>
                </div>
                <div className="w-[54px] h-[54px] bg-white rounded-[4px] flex items-center justify-center">
                  <QRCodeCanvas value={location} size={48} marginSize={0} level="M" className="rounded-[2px]" />
                </div>
                <span
                  style={{
                    height: '1px',
                    background: `linear-gradient(90deg, #A53EFF 20%, #00F7A5 100%)`,
                  }}
                  className=" absolute bottom-0 left-0 block right-0 h-[5px] rounded-b-[4px] pointer-events-none"
                ></span>
              </div>
              <div className="flex-1 w-full overflow-hidden relative">
                <div
                  className="w-full h-full bg-black"
                  style={{
                    backgroundImage: `url(${screenshotUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat',
                    aspectRatio: '351/456',
                  }}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="w-full max-w-[768px] mx-auto max-h-[80vh] bg-[#232329]">
          <div className="px-4 pb-4">
            <ListAppShareScreen onSave={() => onSave()} setOpen={setOpen} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ShareDrawer
