import { Configs } from '@/const/configs'
import ImgWithFallback from '../common/ImgWithFallback'
import dayjs from 'dayjs'
import { xOpenOrders } from '../futuresDetails/trade/types'
import { formatNumberWithCommas } from '@/utils/helpers'
import { getTpOrSlChild } from '../futuresDetails/trade/tools'
import { IconArrowRight } from '../icon'

const HistorycalOrderItem = ({ orderInfo }: { orderInfo: xOpenOrders }) => {
  const origSz = parseFloat(orderInfo.origSz || '0')
  const sz = parseFloat(orderInfo.sz || '0')
  const completedSz = origSz - sz
  const tpOpenOrder = getTpOrSlChild(orderInfo, 'tp')[0]
  const slOpenOrder = getTpOrSlChild(orderInfo, 'sl')[0]
  const isBuy = orderInfo?.side === 'B' ? true : false

  return (
    <div className="bg-[#ECECED14] rounded-[8px]">
      <div className="flex flex-col gap-2 p-3">
        <div className="py-1 flex justify-between">
          <div className="flex items-center gap-1">
            <ImgWithFallback
              src={`${Configs.getHyperliquidConfig().imgUrl}/${orderInfo?.coin}.svg`}
              srcFallback="/images/logo-pair-fallback.webp"
              sharedClassName="size-5"
            />
            <p className="text-[calc(14rem/16)] leading-[calc(14rem/16)] app-font-medium">{orderInfo?.coin}USD永续</p>
            <IconArrowRight />
          </div>
          <div className="text-[calc(13rem/16)] leading-[calc(13rem/16)] text-[#00FFB4]">已成交</div>
        </div>
        <div className="flex gap-2 items-center">
          <div
            className={`border-[0.4px] rounded-[2px] p-1 text-[calc(10rem/16)] leading-[calc(10rem/16)] app-font-medium ${isBuy ? 'border-[#00FFB4] text-[#00FFB4]' : 'border-[#AB57FF] text-[#AB57FF]'}`}
          >
            市价买入
          </div>
          <div className="rounded-[2px] py-[5px] px-1 bg-[#00FFF633] text-[calc(10rem/16)] leading-[calc(10rem/16)] text-[#00FFF6]">
            {`全仓 100x`}
          </div>
          <span className="text-[#FFFFFF80] text-[calc(12rem/16)] leading-[calc(12rem/16)]">
            {dayjs(orderInfo?.timestamp).format('MM-DD HH:mm:ss')}
          </span>
        </div>
      </div>
      <div className="bg-[#ECECED0A] rounded-[8px] p-3 text-[calc(13rem/16)] leading-[calc(13rem/16)]">
        <div className="flex justify-between">
          <div className="pr-2 align-top">
            <p className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">
              委托数量 ({orderInfo?.coin})
            </p>
            <p className="app-font-medium">{origSz}</p>
          </div>
          <div className="pr-2 align-top">
            <p className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">已成交 (BTC)</p>
            <p>{completedSz}</p>
          </div>
          <div className="pr-0 text-right align-top">
            <p className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">委托价格</p>
            <p>{formatNumberWithCommas(orderInfo?.limitPx)}</p>
          </div>
        </div>
        {orderInfo?.isTrigger || orderInfo?.children?.length ? (
          <tr>
            <td className="pt-3.5 pr-2 align-top">
              {!orderInfo?.children?.length ? (
                <>
                  <p className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">触发价格</p>
                  <p>{orderInfo?.triggerPx}</p>
                </>
              ) : (
                <div>
                  <p className="text-[#FFFFFF80] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">止盈止损</p>
                  <p className="text-[calc(14rem/16)] leading-[calc(14rem/16)] font-bold">
                    <span className="text-rise font-semibold">{tpOpenOrder?.triggerPx || '-'}</span>
                    <span className="text-[#FFFFFF80] mx-0.5">/</span>
                    <span className="text-fall font-semibold">{slOpenOrder?.triggerPx || '-'}</span>
                  </p>
                </div>
              )}
            </td>
          </tr>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

export default HistorycalOrderItem
