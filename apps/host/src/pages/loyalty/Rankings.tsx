import { Language } from '@/@generated/gql/graphql-loyalty'
import MoneyFormatted from '@/components/common/MoneyFormatted'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { LoyaltyProvider, useLoyalty } from '@/components/loyalty/context/LoyaltyContext'
import IconArrowRight from '@/components/loyalty/IconArrowRight'
import { Leaderboard } from '@/components/loyalty/Leaderboard'
import SectionHeaderLeaderBoard from '@/components/loyalty/mobile/SectionHeaderLeaderBoard'
import SeasonDropdownRanking from '@/components/loyalty/SeasonDropdownRanking'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

export const RankingsContent = ({ onOpenChange, open }: { open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const { t } = useTranslation()
  const { status, isLoadingLoyaltyData } = useLoyalty()

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 border-none bg-[#1F1F27] gap-0 max-w-[980.01px] mx-auto">
          <DialogHeader className="px-4 py-3.5 mt-10">
            <div className="flex justify-between flex-row">
              <DialogTitle className="font-[380] text-[calc(20rem/16)] flex items-center">
                {t('loyalty.leaderboard')}
              </DialogTitle>
              <SeasonDropdownRanking />
            </div>

            <div className="flex gap-10">
              <div className="w-34">
                <div className="text-[calc(16rem/16)] font-[300] text-[#C8A7FD]">
                  {t('loyalty.myPoints')}
                </div>
                <div className="font-[380] text-[calc(20rem/16)]">
                  {isLoadingLoyaltyData ? (
                    <Skeleton className="w-34 h-6 mt-1" />
                  ) : (
                    <MoneyFormatted value={status?.totalPoint} unit="" />
                  )}
                </div>
              </div>

              <div className="">
                <div className="text-[calc(16rem/16)] font-[300] text-[#C8A7FD]">{t('loyalty.bottomshet.Ranking')}</div>
                {isLoadingLoyaltyData ? (
                  <Skeleton className="w-34 h-6 mt-1" />
                ) : (
                  <div className="font-[380] text-[calc(20rem/16)]">
                    {status?.currentRank ? `#${status?.currentRank}` : '--'}
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="px-4 pb-6">
            <Leaderboard
              showTop3
              showIcon={false}
              headerTableClassName="bg-[#1F1F27]"
              showTop10={false}
              classNames="h-[378px]"
            />
          </div>
          <div className="group flex mx-auto pb-3 items-center cursor-pointer hover:text-[#C8A7FD]">
            <div className="text-[#6C6A74] text-[14px] font-[400] text-center group-hover:text-[#C8A7FD]">
              {t('loyalty.learnMorePointsRule')}
            </div>
            <IconArrowRight className="ml-1 text-[#6C6A74] group-hover:text-[#C8A7FD]" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const Rankings = () => {
  const { i18n, t } = useTranslation()

  return (
    <>
      <LoyaltyProvider lang={i18n?.language as Language}>
        <div className="relative flex flex-col min-h-screen">
          <HeaderWithBack
            title={t('loyalty.leaderboard')}
            className="bg-[#0a0a0a] sticky top-0 z-50 pb-0 px-2"
            right={<SeasonDropdownRanking />}
            rightClassName="w-fit"
          />
          <SectionHeaderLeaderBoard />

          <div className="pb-6 px-4 flex-1">
            <Leaderboard showIcon={false} classNames="max-h-[calc(100vh-340px)]" showTop10={false} />
          </div>

          <div className="flex mx-auto pb-3 items-center justify-center mb-[70px] cursor-pointer hover:text-[#C8A7FD] group">
            <div className="text-[#6C6A74] text-[14px] font-[400] text-center">{t('loyalty.learnMorePointsRule')} </div>
            {/* <img src="/images/icons/arrow-left.svg" alt="arrow-right" className="rotate-180 size-3 text-[#6C6A74]" /> */}
            <IconArrowRight className="ml-1 text-[#6C6A74] group-hover:text-[#C8A7FD]" />
          </div>
        </div>
      </LoyaltyProvider>
    </>
  )
}
export default Rankings
