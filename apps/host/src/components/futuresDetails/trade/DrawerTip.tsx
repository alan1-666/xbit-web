import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface DrawerTipProps {
  isOpen: boolean
  title: string
  desc: string
  onOpenChange?: (status: boolean) => void
}

const DrawerTip = ({ isOpen, title, desc, onOpenChange }: DrawerTipProps) => {
  const { t } = useTranslation()
  const handleOpenChange = (status: boolean) => {
    if (onOpenChange) {
      onOpenChange(status)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>

      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{title}</div>
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-3">
          <div className="text-[calc(1rem*(15/16))] leading-[calc(1rem*(22/16))] text-[#FFFFFFB2]">
            {desc}
          </div>

          <div className="flex justify-center items-center flex-row gap-2.5 mt-9 mb-8">
						<Button variant="gradient" className="h-[44px] text-[#261236] rounded-[50px] text-[calc(1rem*(18/16))]" onClick={() => handleOpenChange(false)}>
							{t('futuresDetails.common.iKnow')}
						</Button>
					</div>
          
        </div>
      </DrawerContent>
    </Drawer>
  )
}
export default DrawerTip