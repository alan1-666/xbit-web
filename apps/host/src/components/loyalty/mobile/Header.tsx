import { ProfileCard } from '@components/loyalty/mobile/ProfileCard.tsx'

export interface HeaderProps {
  isConnected: boolean
  avatarUrl: string
  userAddress: string
  invitationCode: string
  totalPoints: number
}

export const Header = (props: HeaderProps) => {
  const { isConnected, avatarUrl, userAddress, invitationCode, totalPoints } = props
  return (
    <div className='px-2'>
      <div className="flex items-center gap-2 mb-4">
        <img src={avatarUrl || '/images/loyalty/avatar.svg'} alt="" className="size-6 rounded-full" />
        <div>{userAddress}</div>
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
