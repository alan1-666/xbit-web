import { useTranslation } from 'react-i18next'
import { useLoyalty } from './context/LoyaltyContext'

export const MyRanking = () => {
  const { t } = useTranslation()
  const { status } = useLoyalty()
  
  return (
    <div className="bg-[#1f1f26] flex flex-col gap-[20px] items-center pt-[20px] pb-[16px] rounded-[8px] w-full">
      <div className="flex gap-[12px] items-center justify-center w-full">
        {/* My Share */}
        <div className="flex-1 flex flex-col gap-[10px] items-center text-center">
          <div className="text-[24px] font-medium text-white leading-none">
            {status?.pointPercent ? `${(status.pointPercent * 100).toFixed(4)}%` : '--'}
          </div>
          <div className="text-[14px] text-[#a9a9b9] leading-none">{t('loyalty.myShare')}</div>
        </div>
        {/* Divider */}
        <div className="bg-[#393945] h-[40px] w-px" />
        {/* Bonus */}
        <div className="flex-1 flex flex-col gap-[10px] items-center text-center">
          <div className="text-[24px] font-medium text-white leading-none mt-[12px]">
            {status?.boost ? `${status.boost?.toFixed(1)}X` : '--'}
          </div>
          <div className="text-[14px] text-[#a9a9b9] leading-none">{t('loyalty.pointsBonus')}</div>
        </div>
      </div>
      <div className="space-y-2.5 w-full px-3">
        {/* Trade Card */}
        <div className="bg-[#262630] flex items-start justify-between rounded-[10px] w-full h-[66px] p-[15px]">
          <div className="flex gap-[8px] flex-1 items-start">
            {/* Trade Icon Placeholder */}
            <div className="w-[24px] h-[24px] bg-[#d9d9d9] rounded-full" />
            <div className="flex flex-col flex-1 gap-[5px] w-[66px]">
              <div className="text-[16px] text-white leading-none">{t('loyalty.trade')}</div>
              <div className="text-[11px] text-[#989898] leading-none">{t('loyalty.tradeEarnPoints')}</div>
            </div>
          </div>
          <div className="bg-[#843bea] flex items-center justify-center rounded-[15.5px] h-[31px] w-[79px]">
            <div className="text-[14px] font-semibold text-white text-center">{t('loyalty.goTrade')}</div>
          </div>
        </div>
        {/* Invite Card */}
        <div className="bg-[#262630] flex items-start justify-between rounded-[10px] w-full h-[66px] px-[10px] py-[17px]">
          <div className="flex gap-[8px] flex-1 items-start">
            {/* Invite Icon Placeholder */}
            <div className="w-[24px] h-[24px] bg-[#d9d9d9] rounded-full" />
            <div className="flex flex-col flex-1 gap-[5px] w-[66px]">
              <div className="text-[16px] text-white leading-none">{t('loyalty.invite')}</div>
              <div className="text-[11px] text-[#989898] leading-none">{t('loyalty.inviteEarnPoints')}</div>
            </div>
          </div>
          <div className="bg-[#843bea] flex items-center justify-center rounded-[15.5px] h-[31px] w-[79px]">
            <div className="text-[14px] font-semibold text-white text-center">{t('loyalty.goInvite')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}