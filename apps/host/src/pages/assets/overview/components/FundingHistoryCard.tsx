import { IconChevronRight } from '@components/icon'
import { TabFundingRecords } from '@components/assets/overview/TabFundingRecords.tsx'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'

export const FundingHistoryCard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const seeMore = () => {
    navigate(APP_PATH.ASSETS + '/funding-records')
  }
  return (
    <div className="bg-[#141418] w-full border border-[#79778C29] p-5 rounded-[12px]">
      <div className="flex items-center justify-between">
        <div>{t('withdrawal.transactionHistory')}</div>
        <div className="flex items-center text-[14px] text-[#79778C] gap-1 cursor-pointer" onClick={seeMore}>
          {t('futuresMarket.showMore')}
          <IconChevronRight />
        </div>
      </div>
      <div>
        <TabFundingRecords
          showFilter={false}
          itemClassName="px-0"
          groupHeaderClassName="px-0"
          className="max-h-[50vh] overflow-y-scroll no-scrollbar"
        />
      </div>
    </div>
  )
}
