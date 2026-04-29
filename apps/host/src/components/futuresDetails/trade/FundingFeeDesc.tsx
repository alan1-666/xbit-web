import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useTranslation } from 'react-i18next'
interface FundingFeeDesc {
  isOpen: boolean
  onOpenChange?: (status: boolean) => void
}

const FundingFeeDesc = ({ isOpen, onOpenChange }: FundingFeeDesc) => {
  const { t } = useTranslation()
  const handleOpenChange = (status: boolean) => {
    if (onOpenChange) {
      onOpenChange(status)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-w-[768px] mx-auto bg-[#232329]  pb-5 pt-0">
        <DrawerHeader>
          <DrawerTitle className="text-left">
            <p className="text-[calc(18rem/16)] py-3">{t('futuresDetails.common.fundingRate')}</p>
          </DrawerTitle>
          <DrawerDescription>
            <div className="text-left text-[calc(15rem/16)] text-[#FFFFFFB2]">
             {t('futuresDetails.tips.fundingFeeDesc')}
            </div>
          </DrawerDescription>
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button
              variant="purpleDefault"
              className="text-white rounded-[50px] h-[44px] text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))] font-bold w-full"
              onClick={() => handleOpenChange(false)}
            >
              {t('futuresDetails.common.iKnow')}
            </Button>
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}
export default FundingFeeDesc
