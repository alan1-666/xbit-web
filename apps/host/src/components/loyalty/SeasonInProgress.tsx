import { useActiveWallet } from '@/hooks/useActiveWallet'
import { futureClient } from '@/lib/gql/apollo-client'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils'
import { RankingsContent } from '@/pages/loyalty/Rankings'
import { useAppSelector } from '@/redux/store'
import { getSmartMoneyInfoV2 } from '@/services/copytrade.service'
import { getChainType } from '@/utils/list-coin-helper'
import { useQuery } from '@apollo/client'
import { Leaderboard } from '@components/loyalty/Leaderboard.tsx'
import { MyStats } from '@components/loyalty/MyStats.tsx'
import { PointsGroup } from '@components/loyalty/PointsGroup.tsx'
import { Header as DesktopHeader } from '@components/loyalty/desktop/Header.tsx'
import LoyaltyFAQ from '@components/loyalty/faq.tsx'
import { Header as MobileHeader } from '@components/loyalty/mobile/Header.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'
import { useEffect, useState } from 'react'
import SeasonDropdown from './SeasonDropdown'
import { useLoyalty } from './context/LoyaltyContext'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'

export const SeasonInProgress = () => {
  const { isDesktop } = useResponsive()
  const Header = isDesktop ? DesktopHeader : MobileHeader
  const { inviteCode, status } = useLoyalty()
  const { email, activeChain } = useAppSelector((state) => state.newWallet)
  const activeWallet = useActiveWallet()
  const [openDialogRankings, setOpenDialogRankings] = useState(false)

  const { data, refetch } = useQuery(getSmartMoneyInfoV2, {
    variables: { req: { address: activeWallet?.walletAddress, chain: getChainType(activeChain) } },
    client: futureClient,
    skip: !activeWallet?.walletAddress,
  })

  useEffect(() => {
    if (activeWallet?.walletAddress) {
      refetch()
    }
  }, [activeWallet?.walletAddress])

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(activeWallet?.walletAddress).then(setSrc)
  }, [activeWallet?.walletAddress])

  return (
    <div className="relative">
      {isDesktop && <img src="/images/loyalty/bg-header-loyalty.webp" alt="" className="absolute inset-0 z-0" />}

      <div className={cn('w-full max-w-[1200px] mx-auto py-10 space-y-4 relative z-10', !isDesktop && 'pt-2')}>
        <Header
          isConnected={true}
          avatarUrl={data?.getSmartMoneyInfo?.avatar ? data?.getSmartMoneyInfo?.avatar : src}
          userAddress={email ? email : formatAddressWallet(activeWallet?.walletAddress, 5, 5)}
          invitationCode={inviteCode ? inviteCode : '--'}
          totalPoints={status?.totalPoint ?? 0}
        />

        <div
          className={cn(
            'pb-2 pt-0 space-y-4',
            !isDesktop
              ? 'rounded-t-[8px] bg-[linear-gradient(180deg,_#141418_0%,_rgba(20,_20,_24,_0)_100%)]'
              : 'bg-[#141418] rounded-[16px]',
          )}
        >
          <div className={cn('bg-[#1B1B20] rounded-t-[16px] relative', !isDesktop && 'rounded-t-[8px]')}>
            <SeasonDropdown />
          </div>
          <div className={cn('space-y-4', isDesktop && 'px-4')}>
            <PointsGroup
              tradingPoints={status?.tradingPoint ?? 0}
              positionPoints={status?.positionPoint ?? 0}
              fundsPoints={status?.fundPoint ?? 0}
              referralPoints={status?.referralPoint ?? 0}
              totalPoints={status?.totalPoint ?? 0}
            />
            <div className={cn(isDesktop && 'xl:grid-cols-5 grid gap-4')}>
              <div className={cn('col-span-3', !isDesktop && 'rounded-t-[8px]')}>
                <MyStats />
              </div>
              <div className="col-span-2 xl:bg-[#1F1F27] px-4 py-5.5 pb-0 rounded-[16px]">
                <Leaderboard
                  onOpenChange={setOpenDialogRankings}
                  headerTableClassName={isDesktop ? 'bg-[#1F1F27]' : 'bg-[#0e0e0f]'}
                  classNames={cn(!isDesktop && 'max-h-auto')}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={cn(!isDesktop && 'px-4')}>
          <LoyaltyFAQ />
        </div>
      </div>
      <RankingsContent onOpenChange={setOpenDialogRankings} open={openDialogRankings} />
    </div>
  )
}
