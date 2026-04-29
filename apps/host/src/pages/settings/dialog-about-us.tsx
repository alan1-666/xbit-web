import LogoXBit from '@/components/header/LogoXBit'
import { ClearCacheDialog } from '@/components/settings/ClearCacheDialog'
import { ContactUsSection } from '@/components/settings/ContactUsSection'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { APP_PATH } from '@/lib/constant'
import { getAppVersion } from '@/utils/helpers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { IconWithValue } from '../meme/discover/desktop/components/IconWithValue'

const DialogAboutUs = () => {
  const { t } = useTranslation()
  const items = [
    {
      key: 'privacy',
      title: t('appSettings.aboutUs.privacyPolicy'),
      href: APP_PATH.PRIVACY_POLICY,
      onClick: () => {
        window.open(APP_PATH.PRIVACY_POLICY, '_blank')
      },
    },
    {
      key: 'terms',
      title: t('appSettings.aboutUs.termsOfService'),
      href: APP_PATH.TERMS_OF_USE,
      onClick: () => {
        // navigate(APP_PATH.TERMS_OF_USE)
         window.open(APP_PATH.TERMS_OF_USE, '_blank')
      },
    },
  ]
  const [openClearCacheDialog, setOpenClearCacheDialog] = useState(false)

  const showLatestVersionToast = () => {
    toast.info(t('appSettings.aboutUs.currentVersion', { version: getAppVersion() }))
  }

  const onCacheCleared = () => {
    toast.success(t('appSettings.aboutUs.clearCacheSuccess'))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconWithValue role="button" icon={<LogoXBit className="size-4" />} value={t('bottomNav.about')} className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <div className="">
          <div className="px-3 py-6 space-y-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="bg-[linear-gradient(90deg,#A53EFF_20%,#00F7A5_100%)] p-[1px] rounded-[14px] size-20">
                <div className="bg-[#141414] rounded-[14px] w-full h-full flex items-center justify-center">
                  <LogoXBit className="size-12" />
                </div>
              </div>
              <div className="text-white font-medium text-[calc(22rem/16)]">XBIT</div>
              <div className="text-[#FFFFFFB2] text-[calc(13rem/16)]">{t('appSettings.aboutUs.slogan')}</div>
              <div className="text-[#FFFFFFB2] text-[calc(16rem/16)] cursor-pointer" onClick={showLatestVersionToast}>
                {getAppVersion()}
              </div>
            </div>
            <div>
              {items.map((item) => (
                <a
                  key={item.key}
                  className="flex items-center justify-between px-3 py-4 border-b border-[#ECECED0A] last:border-b-0 cursor-pointer"
                  //onClick={() => item.onClick?.()}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-[calc(16rem/16)] text-[#FFFFFF] flex-1">{item.title}</span>
                  <span className="text-[calc(14rem/16)] text-[#FFFFFFB2] mr-2">{/**item?.sub*/}</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect opacity="0.01" width="20" height="20" fill="white" />
                    <path
                      d="M8.66192 4.74321L13.5682 9.64947C13.628 9.70925 13.628 9.80616 13.5682 9.86593L8.66192 14.7722C8.54238 14.8917 8.54238 15.0856 8.66192 15.2051L9.31128 15.8545C9.43083 15.974 9.62464 15.974 9.74419 15.8545L15.6245 9.97415C15.744 9.85461 15.744 9.66079 15.6245 9.54125L9.74419 3.66095C9.62464 3.5414 9.43083 3.5414 9.31128 3.66095L8.66192 4.31031C8.54238 4.42985 8.54238 4.62367 8.66192 4.74321Z"
                      fill="#CBCDD4"
                    />
                  </svg>
                </a>
              ))}
            </div>
            <ContactUsSection />
            <ClearCacheDialog
              open={openClearCacheDialog}
              onOpenChange={setOpenClearCacheDialog}
              onCacheCleared={onCacheCleared}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogAboutUs
