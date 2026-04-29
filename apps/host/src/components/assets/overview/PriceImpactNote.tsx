import { IconHelp } from '@components/icon'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@components/ui/drawer.tsx'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
const PriceImpactNote = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <IconHelp className="size-3 cursor-pointer" />
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>{t('exchange.priceImpact')}</DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3 text-[14px] font-light text-white/80">{t('exchange.priceImpactTooltip')}</div>
      </DrawerContent>
    </Drawer>
  )
}

export default PriceImpactNote
