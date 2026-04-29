import { IconStar } from '@components/icon/gradient/IconStar.tsx'
import { useTranslation } from 'react-i18next'
import MoneyFormatted from '../common/MoneyFormatted'

export interface TotalPointCardProps {
  totalPoints: number
}

export const TotalPointCard = (props: TotalPointCardProps) => {
  const { t } = useTranslation()
  const { totalPoints } = props
  
  return (
    <div className="bg-[#1F1F27] rounded-[16px] p-4 flex flex-col items-center justify-center py-12">
      <IconStar className="mb-7" />
      <div className="text-[calc(20rem/16)] text-[#A9A9B9] font-[305] mb-9">
        {t('loyalty.myTotalPoints')}
      </div>
      <div className="text-[calc(36rem/16)] font-[450]">
       <MoneyFormatted value={totalPoints} unit='' />
      </div>
    </div>
  )
}