import { useResponsive } from '@hooks/useResponsive.ts'
import { Suspense } from 'react'
import { InviteFriendsDialog } from '@components/loyalty/desktop/InviteFriendsDialog.tsx'
import { InviteFriendsDrawer } from '@components/loyalty/mobile/InviteFriendsDrawer.tsx'

export interface InviteFriendsPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitationCode: string
  shareUrl: string
}

export const InviteFriendsPopup = (props: InviteFriendsPopupProps) => {
  const { isDesktop } = useResponsive()
  const Component = isDesktop ? InviteFriendsDialog : InviteFriendsDrawer
  return (
    <Suspense>
      <Component {...props} />
    </Suspense>
  )
}
