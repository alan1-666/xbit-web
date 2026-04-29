import { Skeleton } from '@/components/ui/skeleton'
import { CopyButton } from '@components/common/copy-button.tsx'
import { SocialSharing } from '@components/loyalty/SocialSharing.tsx'
import { useTranslation } from 'react-i18next'
import { useLoyalty } from '../context/LoyaltyContext'
import { useMemo } from 'react'
import { truncateMiddle } from '@/hooks/useLoyalty'

export interface ProfileCardProps {
  isConnected: boolean
  avatarUrl: string
  userAddress: string
  invitationCode: string
  totalPoints: number
}

export const ProfileCard = (props: ProfileCardProps) => {
  const { t } = useTranslation()
  const { isConnected, totalPoints, invitationCode, userAddress, avatarUrl } = props
  const { shareUrl, isLoadingInviteCode } = useLoyalty()

  // Truncate invitation code if too long
  const displayInvitationCode = useMemo(() => {
    return truncateMiddle(invitationCode, 14)
  }, [invitationCode])

  // Truncate share URL if too long
  const displayShareUrl = useMemo(() => {
    if (!isConnected || invitationCode === '--') return '--'
    return truncateMiddle(shareUrl, 33)
  }, [shareUrl, isConnected, invitationCode])

  return (
    <div className="px-[50px] py-5 bg-[#141418] rounded-[16px] flex items-center">
      <div className="pr-[50px] flex flex-col border-r border-dashed">
        <div className="gap-5 flex flex-col items-center">
          <img
            src={avatarUrl || '/images/loyalty/avatar.svg'}
            alt=""
            data-avatar-type="wallet"
            className="size-14 rounded-full"
          />
          <div className="font-[450] text-[calc(14rem/16)] text-white">{userAddress}</div>
        </div>
      </div>
      <div className="flex items-center justify-between flex-1">
        <div />
        <div className="flex flex-col">
          <div className="font-[305] text-[#989898]">{t('loyalty.yourInviteCode')}</div>
          {!isLoadingInviteCode ? (
            <div className="flex items-center border-[0.6px] bg-[#1D1D23] border-[#2F2F34] min-w-40 rounded-[6px] px-3 py-1 mt-2">
              <div className="flex-1 truncate" title={invitationCode || '--'}>
                {displayInvitationCode || '--'}
              </div>
              <CopyButton text={invitationCode || ''} icon="/images/loyalty/copy2.svg" />
            </div>
          ) : (
            <Skeleton className="w-40 h-[33px]" />
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-[305] text-[#989898]">{t('loyalty.invitationLink')}</div>
          {!isLoadingInviteCode ? (
            <div className="flex items-center border-[0.6px] bg-[#1D1D23] border-[#2F2F34] min-w-80 rounded-[6px] px-3 py-1 mt-2">
              <div className="flex-1 truncate" title={isConnected ? (invitationCode ? shareUrl : '--') : '--'}>
                {displayShareUrl}
              </div>
              <CopyButton text={isConnected ? (invitationCode ? shareUrl : '') : ''} icon="/images/loyalty/copy2.svg" />
            </div>
          ) : (
            <Skeleton className="w-72 h-[33px]" />
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-[305] text-[#989898]">{t('loyalty.inviteFriends.shareTo')}</div>
          <SocialSharing />
        </div>
      </div>
    </div>
  )
}
