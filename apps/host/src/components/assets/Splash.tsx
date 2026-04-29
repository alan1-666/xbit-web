import { useResponsive } from '@/hooks/useResponsive'
import NewLoginDrawer from '@components/auth/NewLoginDrawer.tsx'
import { Button } from '@components/ui/button.tsx'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './style.css'
import { cn } from '@/lib/utils.ts'

export const Splash = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  const handleClick = () => {
    setShowLoginDrawer(true)
  }

  const handleOpenBrand = () => {
    window.open(window.location.origin, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    window.document.documentElement.style.overscrollBehaviorY = 'none'
    return () => {
      window.document.documentElement.style.overscrollBehaviorY = 'auto'
    }
  }, [])

  if (isDesktop) {
    return (
      <div className="bg-[#0D0D0D] flex-1 bg-[url(/images/assets/bg-splash-assets-pc.webp)] bg-center bg-no-repeat bg-cover size-full">
        <div className="absolute flex flex-col justify-center items-center bottom-[13%] left-1/2 -translate-x-1/2 w-full">
          <div className="text-white app-font-medium text-lg text-center px-3 leading-[1.2]">
            <span
              onClick={handleOpenBrand}
              className="text-[#C8A7FD] cursor-pointer hover:text-[#9945FF] transition-colors"
            >
              KairoX
            </span>
          </div>
          <div className="text-white app-font-light text-sm text-center px-3 leading-[1.1] mt-[16px]">
            {t('assets.splash.sub-pc')}
          </div>
          <div className="w-[325px] mt-[28px]">
            <Button
              variant="gradient"
              className="rounded-full font-[450] text-[16px] h-fit w-full"
              onClick={handleClick}
            >
              {t('assets.futures.connectWallet')}
            </Button>
          </div>
        </div>
        <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-[#0D0D0D] flex-1 h-dvh overflow-hidden max-w-3xl relative mx-auto',
        "bg-[url('/images/assets/bg-splash-assets.webp?v=2')] bg-cover bg-position-[50%_60%] bg-no-repeat bg-scroll md:bg-fixed",
      )}
      style={{
        maxHeight: 'calc(100dvh - 80px)',
      }}
    >
      {/*<img*/}
      {/*  src="/images/assets/bg-splash-assets.webp?v=2"*/}
      {/*  className="object-contain w-screen max-w-3xl custom-translate-y"*/}
      {/*  alt="bg splash assets"*/}
      {/*  loading="lazy"*/}
      {/*/>*/}
      <div className="absolute top-[70%] left-0 -translate-y-[70%] flex gap-3 justify-center items-end w-full">
        <img src="/images/kairox-logo.svg" alt="logo" className="cursor-pointer block w-12 h-11" />
        <img src="/images/kairox-logo-text.svg" alt="logo" className="cursor-pointer block w-27.5 h-8" />
      </div>
      <div className="absolute flex flex-col justify-center items-center bottom-[5vh] left-1/2 -translate-x-1/2 w-full">
        <div className="text-white font-normal text-[17px] text-center px-3 leading-5.5 tracking-[3px]">
          {/*{t('assets.splash.slogan')}*/}
          <span className="text-[#C8A7FD]">KairoX</span>
        </div>
        <div className="text-white font-normal text-[13px] text-center px-3 mt-4 leading-[1.2] tracking-[1.5px]">
          {t('assets.splash.desc')}
        </div>
        <div className="w-3/4 md:w-1/2 mt-[28px]">
          <Button variant="gradient" className="rounded-full font-[450] text-[16px] h-fit w-full" onClick={handleClick}>
            {t('assets.futures.connectWallet')}
          </Button>
        </div>
      </div>
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
    </div>
  )
}
