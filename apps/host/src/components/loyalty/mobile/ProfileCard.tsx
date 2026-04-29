import { CopyButton } from '@components/common/copy-button.tsx'
import { useMemo } from 'react'
import { fShortenNumber } from '@/lib/number.ts'
import { useTranslation } from 'react-i18next'
import { useLoyalty } from '../context/LoyaltyContext'
import { Skeleton } from '@/components/ui/skeleton'
import MoneyFormatted from '@/components/common/MoneyFormatted'
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
  const { isConnected, totalPoints, invitationCode } = props
  const { selectedSeason, isLoading } = useLoyalty()

  const displayedInvitationCode = useMemo(() => {
    if (!isConnected) return '--'
    return invitationCode
  }, [isConnected, invitationCode])
  
  const fullInvitationLink = useMemo(() => {
    if (!isConnected) return '--'
    if (invitationCode === '--') return invitationCode
    return `${window.location.origin}/@${invitationCode}`
  }, [isConnected, invitationCode])

  // Truncate invitation code for display
  const truncatedInvitationCode = useMemo(() => {
    return truncateMiddle(displayedInvitationCode, 15)
  }, [displayedInvitationCode])

  // Truncate invitation link for display
  const truncatedInvitationLink = useMemo(() => {
    return truncateMiddle(fullInvitationLink, 25)
  }, [fullInvitationLink])

  const displayedTotalPoints = useMemo(() => {
    if (!isConnected) return '--'
    return <MoneyFormatted value={totalPoints} unit='' />
  }, [isConnected, totalPoints])

  return (
    <div className="">
      <div className="relative bg-no-repeat w-full bg-auto p-3 pb-4 bg-[#231A30] shadow-[inset_1px_1px_4px_0px_#8858C857] rounded-[10px]">
        <img src="/images/loyalty/backdrop-blur.png" alt="" className="absolute inset-0 z-0" />
        <img src="/images/loyalty/logo.png" alt="" className="absolute right-1 top-0" />
        <div className="relative z-10">
          {isLoading ? (
            <Skeleton className='w-28 h-5 mb-5' />
          ) : (
            <div className="text-[calc(18rem/16)] font-[380] mb-5">
              {t('loyalty.card.titleSeason', { seasonName: selectedSeason?.name || '' })}
            </div>
          )}
          <div className="text-[calc(14rem/16)] font-[305] text-[#E4CAFF]">{t('loyalty.myTotalPoints')}</div>
          <div className="text-[calc(36rem/16)] font-[450] mb-6">{displayedTotalPoints}</div>

          <div className="flex items-center gap-2 mb-3">
            <div className="text-[calc(14rem/16)] font-[305] text-[#E4CAFF] w-[92px] shrink-0">
              {t('loyalty.yourInviteCode')}
            </div>
            <div className="flex flex-1 items-center gap-2 border-[0.6px] border-[#443455] rounded-[6px] px-3 py-1.5 min-w-0">
              <div 
                className="flex-1 truncate text-[calc(14rem/16)]"
                title={displayedInvitationCode}
              >
                {truncatedInvitationCode}
              </div>
              <CopyButton text={displayedInvitationCode} icon="/images/loyalty/copy2.svg" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[calc(14rem/16)] font-[305] text-[#E4CAFF] w-[92px] shrink-0">
              {t('loyalty.invitationLink')}
            </div>
            <div className="flex flex-1 items-center gap-2 border-[0.6px] border-[#443455] rounded-[6px] px-3 py-1.5 min-w-0">
              <div 
                className="flex-1 truncate text-[calc(14rem/16)]"
                title={fullInvitationLink}
              >
                {truncatedInvitationLink}
              </div>
              <CopyButton text={fullInvitationLink} icon="/images/loyalty/copy2.svg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}