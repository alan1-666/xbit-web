import { CopyButton } from '@components/common/copy-button.tsx'
import { useTranslation } from 'react-i18next'

export interface InviteFriendsCardProps {
  invitationCode: string
  shareUrl: string
}

const InviteFriendsCard = (props: InviteFriendsCardProps) => {
  const { t } = useTranslation()
  const { invitationCode, shareUrl } = props
  
  return (
    <div className="w-full space-y-6">
      {/* Invite Code */}
      <div className="flex flex-col gap-[12px] w-full">
        <div className="text-[14px] text-[#908E9A] leading-none">
          {t('loyalty.yourInviteCode2')}
        </div>
        <div className="bg-[#2B2B35] flex items-center justify-between h-[44px] px-[12px] rounded-[6px] w-full">
          <div className="text-[14px] font-medium text-white">{invitationCode}</div>
          <div className="flex items-center gap-[29px]">
            <CopyButton icon="/images/loyalty/copy2.svg" text={invitationCode} />
          </div>
        </div>
      </div>
      {/* Invite Link */}
      <div className="flex flex-col gap-[12px] w-full">
        <div className="text-[14px] text-[#908E9A] leading-none">
          {t('loyalty.yourInviteLink')}
        </div>
        <div className="bg-[#2B2B35] flex items-center justify-between h-[44px] px-[12px] rounded-[6px] w-full">
          <div className="text-[14px] font-medium text-white w-[200px]">{shareUrl}</div>
          <CopyButton icon="/images/loyalty/copy2.svg" text={shareUrl} />
        </div>
      </div>
    </div>
  )
}

export default InviteFriendsCard