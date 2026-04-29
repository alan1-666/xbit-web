import { ProfileCard } from '@components/loyalty/desktop/ProfileCard.tsx'
import { useTranslation } from 'react-i18next'
import ProgressLine from '../ProgressLine'

export interface HeaderProps {
  isConnected: boolean
  avatarUrl: string
  userAddress: string
  invitationCode: string
  totalPoints: number
  seasonName?: string
}

export const Header = (props: HeaderProps) => {
  const { t } = useTranslation()
  const { isConnected, avatarUrl, userAddress, invitationCode, totalPoints } = props

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[calc(48rem/16)] font-[450] mb-5">
            {t('loyalty.card.titleSeason', { seasonName: t('loyalty.pointsThisSeason') })}
          </div>
          <div className="text-[calc(28rem/16)] font-[380]">{t('loyalty.headerSubtitle')}</div>
        </div>
        <ProgressLine
          milestones={[
            { points: 1000, label: t('Activityrewards.point') + ' 1000' },
            { points: 5000, label: t('Activityrewards.point') + ' 5000' },
            { points: 10000, label: t('Activityrewards.point') + ' 10000' },
          ]}
          className='max-w-[444px]'
        />
      </div>
      <ProfileCard
        isConnected={isConnected}
        avatarUrl={avatarUrl}
        userAddress={userAddress}
        invitationCode={invitationCode}
        totalPoints={totalPoints}
      />
    </div>
  )
}
