// stats.tsx
import { useTranslation } from 'react-i18next'
import { useLoyalty } from './context/LoyaltyContext'
import { formatAddressWallet } from '@/lib/string'
import { fShortenNumber } from '@/lib/number'
import { useAppSelector } from '@/redux/store'
import { useActiveWallet } from '@/hooks/useActiveWallet'
import { useQuery } from '@apollo/client'
import { getSmartMoneyInfoV2 } from '@/services/copytrade.service'
import { futureClient } from '@/lib/gql/apollo-client'
import { getAvatarFromAddress, getChainType } from '@/utils/list-coin-helper'
import { useEffect, useMemo, useState } from 'react'
import { RankingIcon } from '../icon/gradient/IconCoins'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'
import { formatPercent } from '@/lib/format'
import { IconRank } from '../icon/solid/IconRank'
import MoneyFormatted from '../common/MoneyFormatted'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'

const ProfileCell = () => {
  const { email, activeChain } = useAppSelector((state) => state.newWallet)
  const activeWallet = useActiveWallet()
  const { isDesktop } = useResponsive()

  const { data, refetch } = useQuery(getSmartMoneyInfoV2, {
    variables: { req: { address: activeWallet?.walletAddress, chain: getChainType(activeChain) } },
    client: futureClient,
    skip: !activeWallet?.walletAddress,
  })

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(activeWallet?.walletAddress).then(setSrc)
  }, [activeWallet?.walletAddress])

  const avatarUrl = useMemo(
    () => (data?.getSmartMoneyInfo?.avatar ? data?.getSmartMoneyInfo?.avatar : src),
    [data, src],
  )

  useEffect(() => {
    if (activeWallet?.walletAddress) {
      refetch()
    }
  }, [activeWallet?.walletAddress])

  return (
    <div className="flex gap-[50px] items-center xl:w-[138px] xl:border-r xl:border-dashed">
      <div className="flex xl:flex-col gap-2 items-center">
        <img
          src={avatarUrl || '/images/loyalty/avatar.svg'}
          alt=""
          data-avatar-type="wallet"
          className={cn('size-[24px] rounded-full', isDesktop && 'size-[52px]')}
        />
        <div className={cn('flex flex-col justify-center text-[calc(12rem/16)] font-[450] text-white')}>
          <p className="leading-none">{email ? email : formatAddressWallet(activeWallet?.walletAddress, 5, 5)}</p>
        </div>
      </div>
    </div>
  )
}

const RankingCell = () => {
  const { t } = useTranslation()
  const { status } = useLoyalty()

  return (
    <div className="flex gap-1.5 xl:gap-3 items-center xl:flex-1 xl:pl-[60px]">
      <div className="relative mb-2">
        <IconRank className="size-6 xl:size-11" />
      </div>
      <div className="flex gap-[10px] items-center text-white">
        <div className="text-[calc(12rem/16)] xl:text-[24px] font-[305] text-center">{t('loyalty.myRank')}:</div>
        <div className="text-[calc(16rem/16)] xl:text-[30px] font-[450]">
          {status?.currentRank ? `#${status?.currentRank}` : '--'}
        </div>
      </div>
    </div>
  )
}

const PointsCell = () => {
  const { t } = useTranslation()
  const { status } = useLoyalty()

  return (
    <div className="flex flex-col gap-2 xl:gap-3 items-start justify-center min-h-px min-w-px pr-5 xl:pl-[60px]">
      <p className="text-[calc(12rem/16)] xl:text-[16px] text-[#908E98]">{t('loyalty.myPoints')}</p>
      <p className="text-[calc(18rem/16)] xl:text-[30px] font-[450] text-white">
        {status?.totalPoint ? <MoneyFormatted value={status.totalPoint} unit="" /> : '--'}
      </p>
    </div>
  )
}

const CurrentShare = () => {
  const { t } = useTranslation()
  const { status } = useLoyalty()

  return (
    <div className="flex flex-col gap-2 xl:gap-3 items-start justify-center min-h-px min-w-px pl-5 xl:pl-[60px]">
      <p className="text-[calc(12rem/16)] xl:text-[16px] text-[#908E98]">{t('loyalty.currentShare')}</p>
      <p className="text-[calc(18rem/16)] xl:text-[30px] font-[450] text-white">
        {status?.pointPercent ? `${formatPercent(status.pointPercent)}` : '--'}
      </p>
    </div>
  )
}

const LoyaltyStats = () => {
  const { isDesktop } = useResponsive()
  return (
    <div
      className={cn(
        'xl:bg-[#141418] box-border grid xl:grid-cols-2 gap-4 items-center px-0 xl:px-8 xl:py-6 rounded-[16px] xl:gap-0 w-full xl:divide-dashed xl:divide-x bg-[linear-gradient(180deg,_#141418_0%,_rgba(20,_20,_24,_0)_100%)]',
        !isDesktop && 'pt-3 px-3',
      )}
    >
      <div className="flex justify-between items-center xl:divide-dashed xl:divide-x">
        <ProfileCell />
        <RankingCell />
      </div>
      <div className="grid grid-cols-2 bg-[#1F1F26] rounded-[6px] p-4 xl:p-0 divide-x divide-dashed xl:bg-transparent">
        <PointsCell />
        <CurrentShare />
      </div>
    </div>
  )
}

export default LoyaltyStats
