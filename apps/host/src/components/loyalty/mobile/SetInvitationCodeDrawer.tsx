import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@components/ui/drawer.tsx'
import CardSetInvitationCode from '../CardSetInvitationCode'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface SetInvitationCodeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SetInvitationCodeDrawer = (props: SetInvitationCodeDrawerProps) => {
  const { t } = useTranslation()
  const { open, onOpenChange } = props

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="border-none py-3.5 max-w-[768px] mx-auto min-h-[410px]">
        <DrawerHeader className="pb-4 px-5 flex justify-between">
          <DrawerTitle className="text-white text-left flex items-center font-[400] text-[16px]">
            {t('loyalty.InvitationCode')}
            <span className="flex items-center cursor-pointer">
              <span className="app-font-light text-[#FFC767] text-xs pl-2">
                {t('loyalty.learnMorePointsRule')}
              </span>
              <img src="/images/loyalty/arrow-right.svg" alt="" />
            </span>
          </DrawerTitle>

          <X
            className="cursor-pointer"
            onClick={() => {
              onOpenChange(false)
            }}
          />
        </DrawerHeader>
        <div className="px-5">
          <CardSetInvitationCode onOpenChange={onOpenChange} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}