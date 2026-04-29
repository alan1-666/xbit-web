import CardWithGrey from '@/components/common/CardWithGrey'
import { useTranslation } from 'react-i18next'
import { xEntrustedHistory } from '@/components/futuresDetails/trade/types'
import dayjs from 'dayjs'
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import React, { useMemo, useState } from 'react'
import {
  CollapsedCardWrap,
  CollapsedCoinItem,
  CollapsedBaseItem,
  CollapsedPnlItem
} from "@/components/futuresDetails/trade/CollapsedCard.tsx"

interface EntrustedHistoryCardProps {
  orderInfo: xEntrustedHistory
}
const EntrustedHistoryCard = ({ orderInfo }: EntrustedHistoryCardProps) => {
  const { t } = useTranslation()

  const formattedstatusTimestamp = dayjs(orderInfo?.statusTimestamp).format('YYYY/MM/DD HH:mm:ss')

  const { order_side, order_orderType } = orderInfo
  const order_side_text = (order_side === 'B' ? t('futuresDetails.common.long') : t('futuresDetails.common.short'))

  const order_limitPx = orderInfo?.order_limitPx
  const price = order_orderType === 'Market' ? 'Market' : `${order_limitPx}`
  const order_filledSz = Number(orderInfo.order_filledSz) === 0 ? '--' : orderInfo.order_filledSz
  const [isExpand, setIsExpand] = useState<boolean>(true)

  function getStateInfo(orderInfo: xEntrustedHistory) {
    if (orderInfo.status.toLowerCase().includes('canceled')) {
      return { name: t('futuresDetails.common.canceled'), color: '#BE4561' }
    }

    const origSz = Number(orderInfo.order_origSz)
    const filled = Number(orderInfo.order_filledSz)
    

    if (filled === 0) {
      return { name: t('futuresDetails.common.notFilled'), color: 'text-[#FFC767]' }
    }

    if (filled > 0 && filled < origSz) {
      return { name: t('futuresDetails.common.someFilled'), color: 'text-[#FFC767]' }
    }

    if (filled === origSz) {
      if (orderInfo.order_isTrigger) {
        return { name: t('futuresDetails.common.triggered'), color: 'text-[#FFFFFF]' }
      } else {
        return { name: t('futuresDetails.common.allFilled'), color: 'text-[#00CE89]' }
      }
    }

    return { name: orderInfo.status, color: 'text-[#FFFFFF]' }
  }
  

  return (
    !isExpand ? 
    <CollapsedCardWrap
      onClickExpand={() => setIsExpand(true)}
    >
      <CollapsedBaseItem label={'币种'} value={<div className='flex items-center'>
        <span className={cn('mr-0.5')}>{orderInfo.order_coin}</span>
        <span className={cn('text-[calc(10rem/16)] leading-[calc(10rem/16)]', order_side === 'B' ? 'text-rise' : 'text-fall')}>{order_side_text}</span>
      </div>}/>
      <CollapsedBaseItem label={`${t('currentOrdersList.orderQuantity')} (${orderInfo.order_coin})`} value={orderInfo.order_origSz} />
      <CollapsedBaseItem label={'类型'} value={orderInfo.order_orderType} />
    </CollapsedCardWrap>
    : <CardWithGrey
        header={
          <div className='flex items-center justify-between gap-1 py-2.5 px-3 bg-[#1D1D22]'>
            <p className="text-[#FFFFFF] flex items-center">
              <span className='font-bold text-[calc(13rem/16)] leading-[calc(14rem/16) mr-2'>{orderInfo.order_coin}USDC {t('futuresDetails.common.perp')}</span>

              <span className={cn("text-[#FFFFFF] text-[calc(11rem/16)] leading-[calc(11rem/16)] py-0.5 px-1 rounded-[3px]",
                order_side === 'B' ? 'bg-[var(--tab-buy-bg)]' : 'bg-[var(--tab-sell-bg)]'
              )}>{order_side_text}</span>
            </p>
            <p className={cn("text-[#FFF] text-[calc(11rem/16)] leading-[calc(11rem/16)]", getStateInfo(orderInfo)?.color)}>{getStateInfo(orderInfo)?.name}</p>
          </div>
        }
        classNameHeader={"p-0"}
        content={
          <div className=" relative z-1">
            <table className="w-full text-[calc(12rem/16)] leading-[calc(12rem/16)] text-white">
              <tbody className=''>
                <tr className="">
                  <td className='pb-2 pl-3 '>
                    <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('history.type')}</p>
                    <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{orderInfo.order_orderType}</p>
                  </td>

                  <td className="pb-2">
                    <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('futuresDetails.common.price')}</p>
                    <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{price}</p>
                  </td>


                  <td className="pb-2 pr-3 text-right">
                    <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('position.triggerCondition')}</p>
                    <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{orderInfo.order_triggerCondition}</p>
                  </td>

                </tr>

                <tr className="">

                  <td className="pb-2 pl-3">
                    <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('position.quantity')}</p>
                    <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{orderInfo.order_origSz}</p>
                  </td>

                  <td className="pb-2">
                    <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('position.completedQuantity')}</p>
                    <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{order_filledSz}</p>
                  </td>

                  <td className="pb-2 pr-3 text-right">
                    <p className="text-[#FFFFFF80] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">TP/SL</p>
                    <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">--</p>
                  </td>

                </tr>

              </tbody>
            </table>

            <div className="pl-4 pr-3 py-3 flex items-center justify-between gap-1 border-t-[0.5px] border-solid border-[#ECECED14]">
              <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)]]">{formattedstatusTimestamp}</p>
                <Button
                  variant={'ghost'}
                  className="p-0 text-[#FFFFFF80]  h-[calc(16rem/16)]"
                  onClick={() => setIsExpand(false)}
                >
                  <img  src="/images/futuresDetail/card-arrow-down2.svg" className="rotate-180" alt="card-arrow-down" />
                </Button>
            </div>

        
          </div>
        }
      />

  )
}

export default EntrustedHistoryCard
