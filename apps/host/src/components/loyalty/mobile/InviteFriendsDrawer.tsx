import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@components/ui/drawer.tsx'
import InviteFriendsCard from '@components/loyalty/InviteFriendsCard.tsx'
import { SocialSharing } from '@components/loyalty/SocialSharing.tsx'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface InviteFriendsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitationCode: string
  shareUrl: string
}

export const InviteFriendsDrawer = (props: InviteFriendsDrawerProps) => {
  const { t } = useTranslation()
  const { open, onOpenChange, invitationCode, shareUrl } = props
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-none py-3.5 max-w-[768px] mx-auto">
        <DrawerHeader className="pb-4 px-5 flex justify-between">
          <DrawerTitle className="text-white text-left text-[16px] font-[400]">
            {t('nodeAgent.inviteFriends')}
          </DrawerTitle>
          <X
            className="cursor-pointer"
            onClick={() => {
              onOpenChange(false)
            }}
          />
        </DrawerHeader>
        <div className="px-5">
          <InviteFriendsCard invitationCode={invitationCode} shareUrl={shareUrl} />
          <SocialSharing className="mt-6 gap-6" showText />
        </div>
      </DrawerContent>
    </Drawer>
  )
}