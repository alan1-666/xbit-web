import CardWithGrey from '@/components/common/CardWithGrey'
import { useTranslation } from 'react-i18next'
import { xFundingHistory } from '@/components/futuresDetails/trade/types'
import dayjs from 'dayjs'


interface FundingHistoryCardProps {
  orderInfo: xFundingHistory
}
const FundingHistoryCard = ({ orderInfo }: FundingHistoryCardProps) => {
  const { t } = useTranslation()

  const formattedTime = dayjs(orderInfo.time).format('YYYY/MM/DD HH:mm:ss')
  const sideText = orderInfo.delta_side === 'Short' ? t('futuresDetails.common.short') : t('futuresDetails.common.long')

  const rate = isNaN(Number(orderInfo.delta_fundingRate)) ? '--' : (Number(orderInfo.delta_fundingRate) * 100).toFixed(4)
  const fee = Number(orderInfo.delta_usdc) < 0  ? `-$${Math.abs(Number(orderInfo.delta_usdc))}` : Number(orderInfo.delta_usdc)
  return (
    <>
      <CardWithGrey
        isHoverScaleCard={false}
        header={
          <div className='flex items-center justify-between py-2.5 px-3 bg-[#1D1D22]'>
            <p className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)] font-bold">{orderInfo.delta_coin}USDC {t('futuresDetails.common.perp')}</p>
            <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)]">{formattedTime}</p>
          </div>
        }
        classNameHeader={"p-0"}
        content={
          <div className="p-3 flex items-center relative z-1 flex items-center justify-between gap-1">
            <div className=''>
              <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{`${t('futuresDetails.common.qty')} (${orderInfo.delta_coin})`}</p>
              <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{`${orderInfo.delta_szi}`}</p>
            </div>

            <div>
              <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('position.direction')}</p>
              <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">
                <span className={`${orderInfo.delta_side === 'Short' ? '!text-fall' : '!text-rise'}`} >{sideText}</span>
              </p>
            </div>

            <div className="">
              <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('futuresDetails.common.fundingRate')}</p>
              <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{`${rate}%`}</p>
            </div>

            <div className='text-right'>
              <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('position.payment')} (USDC)</p>
              <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">
                <span className={`${Number(orderInfo.delta_usdc) < 0 ? '!text-fall' : '!text-rise'}`} >{fee}</span>
              </p>
            </div>
          </div>
        }
      />

    </>
  )
}

export default FundingHistoryCard
