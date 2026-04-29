// SeasonEnd.tsx
import { RankingsContent } from '@/pages/loyalty/Rankings'
import { Leaderboard } from '@components/loyalty/Leaderboard.tsx'
import LoyaltyFAQ from '@components/loyalty/faq.tsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoyalty } from './context/LoyaltyContext'
import LoyaltyStats from './stats'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

export const SeasonEnd = () => {
  const { t } = useTranslation()
  const { selectedSeason } = useLoyalty()
  const [openDialogRankings, setOpenDialogRankings] = useState(false)
  const { isDesktop } = useResponsive()

  return (
    <div className={cn('w-full max-w-[1200px] mx-auto py-10 pt-2', isDesktop && 'pt-14')}>
      {isDesktop && <img src="/images/loyalty/bg-header-loyalty.webp" alt="" className="absolute inset-0 z-0" />}
      <div className="space-y-4 relative z-1">
        <div className="flex items-center gap-2.5 px-3">
          <div className="text-white font-[450] text-[calc(18rem/16)]">{selectedSeason?.name || '--'}</div>
          <div className="bg-[#2B2B33] text-[#908E98] px-2 py-1 rounded-[4px] text-[calc(13rem/16)]">
            {t('loyalty.ended')}
          </div>
        </div>
        <div className="mb-5">
          <LoyaltyStats />
        </div>

        <div className="px-3">
          <Leaderboard
            onOpenChange={setOpenDialogRankings}
            showTop3={isDesktop}
            showIcon={!isDesktop}
            isEnded
            classNames={cn(!isDesktop && 'max-h-auto')}
          />
          <div className="mt-3"></div>
          <LoyaltyFAQ />
        </div>
      </div>

      <RankingsContent onOpenChange={setOpenDialogRankings} open={openDialogRankings} />
    </div>
  )
}
