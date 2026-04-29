import dayjs from 'dayjs'
import ImgWithFallback from '../common/ImgWithFallback'
import { Configs } from '@/const/configs'
import { IconArrowRight } from '../icon'
import CardWithGradient from '../common/CardWithGradient'

interface FundingFeeItemProps {
  fundingFee: any
}

const FundingFeeItem = ({ fundingFee }: FundingFeeItemProps) => {
  const isBuy = fundingFee?.side === 'B' ? true : false

  return (
    <CardWithGradient
      isHoverScaleCard={false}
      bgColor={isBuy ? 'green' : 'purple'}
      header={
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <ImgWithFallback
                src={`${Configs.getHyperliquidConfig().imgUrl}/${fundingFee?.coin}.svg`}
                srcFallback="/images/logo-pair-fallback.webp"
                sharedClassName="size-5"
              />
              <div className="flex items-center gap-1">
                <p className="text-[calc(14rem/16)] leading-[calc(14rem/16)] app-font-medium">
                  {fundingFee?.coin}USD永续
                </p>
                <IconArrowRight />
              </div>
            </div>
            <span className="text-[#FFFFFF80] text-[calc(12rem/16)] leading-[calc(12rem/16)]">
              {dayjs(fundingFee?.timestamp).format('MM-DD HH:mm:ss')}
            </span>
          </div>
        </div>
      }
      classNameHeader="px-3 py-2.5"
      content={
        <div className="p-3 grid grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)]">数量 (BTC)</span>
            <span className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)] font-semibold">0.08638</span>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col gap-1.5">
              <span className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)]">资金费率</span>
              <span className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)] font-semibold">
                {fundingFee?.fundingRate}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <span className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)]">支付 (USDT)</span>
            <span
              className={`text-[calc(14rem/16)] leading-[calc(14rem/16)] font-semibold ${isBuy ? 'border-[#00FFB4] text-[#00FFB4]' : 'border-[#AB57FF] text-[#AB57FF]'}`}
            >
              {fundingFee?.paymentUSDT}
            </span>
          </div>
        </div>
      }
    />
  )
}

export default FundingFeeItem
