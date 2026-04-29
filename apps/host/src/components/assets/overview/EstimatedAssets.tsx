import { Button } from '@components/ui/button.tsx'
import { useContext, useState, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { IconEye, IconEyeSlash } from '@components/icon'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer.tsx'

export const EstimatedAssets = () => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { hideBalance, toggleHideBalance } = useContext(AssetOverviewContext)

  const toggle = (event: MouseEvent) => {
    event.stopPropagation()
    toggleHideBalance(!hideBalance)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild className="cursor-pointer">
        <div className="flex items-end gap-1">
          <div className="flex items-center font-[380] text-[15px] leading-none text-white/70 underline">
            {t('assets.overview.estimatedAssets')}
          </div>
          <button onClick={toggle}>{hideBalance ? <IconEyeSlash /> : <IconEye />}</button>
        </div>
      </DrawerTrigger>
      <DrawerContent
        className="w-full max-w-[786px] mx-auto bg-[url(/images/popup-bg.png)] bg-cover bg-center bg-no-repeat px-3 pb-6"
      >
        <DrawerHeader className="flex justify-between p-0">
          <div className="w-[44px] h-[44px]">
            <img src="/images/assets/Estimatedassets.svg" alt="" className="w-full h-full" />
            {/* <IconWallet2 /> */}
          </div>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="py-4">
          <div className="text-white font-medium text-[calc(18rem/16)] mb-2">
            {t('assets.overview.estimatedAssets')}
          </div>
          <p className="text-[#FFFFFFB2] text-[calc(15rem/16)] mb-4">
            {t('assets.overview.estimatedAssetsDescription')}
          </p>
        </div>
        <Button variant="gradient" className="rounded-full text-[#261236]" type="button" onClick={() => setOpen(!open)}>
          {t('assets.overview.estimatedAssetsAgree')}
        </Button>
      </DrawerContent>
    </Drawer>
  )
}
