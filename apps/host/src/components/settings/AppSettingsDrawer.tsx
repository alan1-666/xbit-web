import { useEffect, useState } from 'react'
// import { SettingsDrawerHeader } from '@components/settings/SettingsDrawerHeader.tsx'
// import { SettingsVerticalMenu } from '@components/settings/SettingsVerticalMenu.tsx'
// import { useTranslation } from 'react-i18next'
import { AppSettingsPortal } from '@components/settings/AppSettingsPortal.tsx'
// import { LoginDrawer } from '@components/common/LoginDrawer.tsx'
// import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils.ts'
import { Menu } from 'lucide-react'
import { APP_PATH } from '@/lib/constant'
import { useNavigateWithLocation } from '@/hooks/useNavigateWithLocation'
// import PersonalCenterPage from '../personal-center'
import AccountInfo from '../personal-center/AccountInfo'
import FeatureList from '../personal-center/FeatureList'
import { IconSettings } from '../icon/stroke/IconSettings'
import HeaderWithBack from '../header/HeaderWithBack'
import { NewArrowLeftIcon } from '../icon'

export const AppSettingsDrawer = () => {
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigateWithLocation()
  // const location = useLocation()

  const navigateToSystemSettings = () => {
    navigate(APP_PATH.MEME_SETTINGS_SYSTEM_SETTINGS)
  }

  useEffect(() => {
    if (open) {
      window.document.body.style.overflowY = 'hidden'
    } else {
      window.document.body.style.overflowY = ''
    }
  }, [open])

  return (
    <>
      <div onClick={() => setOpen(true)} className="p-2 bg-[#FFFFFF0F] rounded-[8px] cursor-pointer">
        <Menu className="size-4 text-white" />
      </div>
      <AppSettingsPortal isOpen={open} onClose={() => setOpen(false)} direction="left" isFullWidth={true}>
        <div className="flex flex-col h-full relative">
          <HeaderWithBack
            onBack={() => setOpen(false)}
            title={''}
            customIconLeft={<NewArrowLeftIcon className="stroke-white" />}
            className={cn('justify-center sticky bg-[#0a0a0a] z-10 top-0 left-0 right-0  mx-auto h-11 py-2.5 mb-3')}
            titleClassName="ml-0"
            right={
              <div className="w-full flex justify-end">
                <IconSettings onClick={navigateToSystemSettings} className="size-6" />
              </div>
            }
          />
          <AccountInfo />
          <FeatureList />
        </div>
      </AppSettingsPortal>
    </>
  )
}
