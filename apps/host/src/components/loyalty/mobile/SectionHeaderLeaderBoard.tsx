import MoneyFormatted from '@/components/common/MoneyFormatted'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'
import { useLoyalty } from '../context/LoyaltyContext'

const SectionHeaderLeaderBoard = () => {
  const { status, isLoadingLoyaltyData } = useLoyalty()
  const { t } = useTranslation()
  return (
    <div className="bg-no-repeat flex justify-between items-center bg-cover pb-3 relative h-[130px] w-full">
      <img src="/images/loyalty/bg_leader_board.png" alt="" className="absolute z-0 inset-0 w-full h-[105px]" />
      <div className="relative z-1 pl-4">
        <div className="text-[calc(14rem/16)] font-[300] text-[#C8A7FD]">{t('loyalty.myPoints')}</div>
        <div className="font-[450] text-[calc(20rem/16)]">
          {isLoadingLoyaltyData ? (
            <Skeleton className="w-34 h-6 mt-1" />
          ) : (
            <MoneyFormatted value={status?.totalPoint} unit="" />
          )}
        </div>
      </div>
      <div className="relative z-1">
        <div className="text-[calc(14rem/16)] font-[300] text-[#C8A7FD]">{t('loyalty.myRank')}</div>
        <div className="font-[450] text-[calc(20rem/16)]">
          {isLoadingLoyaltyData ? (
            <Skeleton className="w-34 h-6 mt-1" />
          ) : (
            <div className="">
              {status?.currentRank ? `#${status?.currentRank}` : '--'}
            </div>
          )}
        </div>
      </div>
      <div className="relative z-1 pr-4">
        <img src="/images/loyalty/logo_in_loyalty.png" alt="" className="w-[75.31px] h-[60px]" />
      </div>
    </div>
  )
}

export default SectionHeaderLeaderBoard
