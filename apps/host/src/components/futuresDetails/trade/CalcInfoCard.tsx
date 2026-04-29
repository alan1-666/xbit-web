import { cn } from '@/lib/utils'
import { OrderInfo, OrderSide, OrderTypeEnum } from './type.order'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@components/discover/Tooltip.tsx'
import { useResponsive } from '@/hooks/useResponsive'
import SetSlippage from './SetSlippage'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { selectFuturesTradePreferences, updateTradePreferences } from '@/redux/modules/futuresTradePreferences.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'





interface CalcInfo {
  buyOrderValue: number;
  maxBuyOrderValue: number;
  buyOrderLiqPrice: string | number;
  buyOrderMarginRequired: any;
  buySlippage: number;
  sellOrderValue: number;
  maxSellOrderValue: number;
  sellOrderLiqPrice: string | number;
  sellOrderMarginRequired: any;
  sellSlippage: number;
  takerFee: number;
  makerFee: number
}


interface CalcOrderInfoProps {
  containerClassName?: string
  calcInfo: CalcInfo
  orderInfo: OrderInfo
}


const CalcOrderInfo = ({ containerClassName, calcInfo, orderInfo }: CalcOrderInfoProps) => {
  const { t } = useTranslation()

  const { isDesktop } = useResponsive()
  const [slippageOpen, setSlippageOpen] = useState(false)

  const dispatch = useAppDispatch()
  const { maxSlippage } = useAppSelector(selectFuturesTradePreferences)


  const {
    buyOrderValue,
    maxBuyOrderValue,
    buyOrderLiqPrice,
    buyOrderMarginRequired,
    buySlippage,
    sellOrderValue,
    maxSellOrderValue,
    sellOrderLiqPrice,
    sellOrderMarginRequired,
    sellSlippage,
    takerFee,
    makerFee,
  } = calcInfo

  const handleSetSlippage = (value: string) => {
    const val = Number(value).toFixed(2)

    dispatch(
      updateTradePreferences({
        maxSlippage: val,
      })
    )

    setSlippageOpen(false)
  }

  return (
    <div className='py-1 px-2 mb-4 border border-[#79778C29] rounded-[6px]'>
      <div className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] flex items-center justify-between gap-0.5 py-1.5 truncate">
        <div className="text-[#908E98]">{t('futuresDetails.common.estLiq')}</div>
        <div className="text-[#6C6A74] flex items-center">
          <span className="text-[#00CE89]">{buyOrderLiqPrice}</span>
          /
          <span className="text-[#EA3B4F]">{sellOrderLiqPrice}</span>
        </div>
      </div>

      <div className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] flex items-center justify-between gap-0.5 py-1.5 truncate">
        <div className="text-[#908E98]">{t('futuresDetails.common.margin')}</div>
        <div className="text-[#6C6A74] flex items-center">
          <span className="text-[#00CE89]">{buyOrderMarginRequired}</span>
          /
          <span className="text-[#EA3B4F]">{sellOrderMarginRequired}</span>
        </div>
      </div>

      <div className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] flex items-center justify-between gap-0.5 py-1.5 truncate">
        <div className="text-[#908E98]">{t('futuresDetails.common.openable')}</div>
        <div className="text-[#6C6A74] flex items-center">
          <span className="text-[#00CE89]">{`${maxBuyOrderValue} ${orderInfo.currency}`}</span>
          /
          <span className="text-[#EA3B4F]">{`${maxSellOrderValue} ${orderInfo.currency}`}</span>
        </div>
      </div>

      {
        <div className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] flex items-center justify-between gap-0.5 py-1.5 truncate">
          <Tooltip
            content={t('futuresDetails.common.feeIntrod', {
              takerFee: takerFee,
              makerFee: makerFee,
            })}
          >
            <div className="text-[#908E98]">{t('assets.transfers.fee')}</div>
          </Tooltip>
          <div className="text-[#6C6A74] flex items-center">
            <span className="text-[#A9A9B3]">{`${t('futuresDetails.common.taker')} ${takerFee}%`}</span>
            /
            <span className="text-[#A9A9B3]">{`${t('futuresDetails.common.maker')} ${makerFee}%`}</span>
          </div>
        </div>
      }

      {
        <div className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] flex items-center justify-between gap-0.5 py-1.5 truncate">

          <Tooltip
            content={`${t('futuresDetails.common.slippageIntrod')}`}
          >
            <Button
              variant={'ghost'}
              className="text-[#908E98] text-[12px] leading-[12px] p-0 h-[12px] hover:text-[#908E98]"
              onClick={() => { setSlippageOpen(true) }}
            >
              {t('tradeSettings.slippage')}
            </Button>
          </Tooltip>
          <div className="text-[#6C6A74] flex items-center">
            {/* buy: {buySlippage}, sell: {sellSlippage} */}
            <div className="flex items-center mr-0.5">
              <span className="text-[#00CE89] ">{buySlippage}%</span>
              /
              <span className="text-[#EA3B4F]">{sellSlippage}%</span>
            </div>
            <span className="text-[#A9A9B3]">Max {maxSlippage}%</span>
          </div>
        </div>
      }
      <SetSlippage
        open={slippageOpen}
        slippage={maxSlippage}
        onOpenChange={setSlippageOpen}
        onConfirm={handleSetSlippage}
      />

    </div>

  )
}

export default CalcOrderInfo