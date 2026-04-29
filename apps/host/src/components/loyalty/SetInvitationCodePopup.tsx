import { useResponsive } from '@hooks/useResponsive.ts'
import { Suspense } from 'react'
import SetInvitationCodeDialog from './desktop/SetInvitationCodeDialog'
import { SetInvitationCodeDrawer } from './mobile/SetInvitationCodeDrawer'

export interface SetInvitationCodePopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SetInvitationCodePopup = (props: SetInvitationCodePopupProps) => {
  const { isDesktop } = useResponsive()
  const Component = isDesktop ? SetInvitationCodeDialog : SetInvitationCodeDrawer
  return (
    <Suspense>
      <Component {...props} />
    </Suspense>
  )
}
