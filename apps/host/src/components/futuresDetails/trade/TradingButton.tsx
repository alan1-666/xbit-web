import { cn } from '@/lib/utils'
import { RootState, useAppSelector } from '@/redux/store'
import useHandleChangeValue from '../hooks/useHandleChangeValue'
import { OrderContractState } from './type.order'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'

const TradingButton = () => {
  const { t } = useTranslation()
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)

  const { handleOrderInfoChange } = useHandleChangeValue()

  const { isDesktop } = useResponsive()

  return (
    <>
    {
      isDesktop ?  
        <div className="flex w-full text-center rounded-full relative h-[38px] mb-[20px] bg-[#212127] text-[#FFFFFF]">
          <div
            className={`w-[50%] rounded-full py-[12px] font-medium text-[16px] leading-[16px] cursor-pointer 
              ${orderInfo.side === 'buy' ? 'bg-[var(--tab-buy-bg)]' : 'bg-transparent'}`}
            onClick={() => {
               if (orderInfo.side !== 'buy') { 
                handleOrderInfoChange('side', 'buy')
              }
            }}   
          >
             {t('futuresDetails.common.buyLong')}
          </div>
          <div
            className={`flex-1 rounded-full  py-[12px] font-medium text-[16px] leading-[16px] cursor-pointer 
              ${orderInfo.side === 'sell' ? 'bg-[var(--tab-sell-bg)]' : 'bg-transparent'}`}
            onClick={() => {
              if (orderInfo.side !== 'sell') {
              handleOrderInfoChange('side', 'sell')
            }
            }}
          >
            {t('futuresDetails.common.sellShort')}
          </div>
      </div>
      : <div className="flex w-full  text-center bg-transparent relative h-[30px]">
          <div
            className={`w-[50%] rounded-l-full py-2 font-medium text-[14px] leading-none cursor-pointer ${orderInfo.side === 'buy' ? 'bg-[var(--tab-buy-bg)]' : 'bg-[#ECECED1F] text-[#d7d7d7]'}`}
            onClick={() => {
               if (orderInfo.side !== 'buy') {
                handleOrderInfoChange('side', 'buy')
              }
            }}
            style={{ clipPath: 'polygon(0px 0px, 100% 0px, 97% 100%, 0px 100%)' }}
          >
            {t('futuresDetails.common.long')}
          </div>
          <div
            className={`flex-1 rounded-r-full py-2 font-medium text-[14px] leading-none cursor-pointer ${orderInfo.side === 'sell' ? 'bg-[var(--tab-sell-bg)]' : 'bg-[#ECECED1F] text-[#d7d7d7]'}`}
            onClick={() => {
              if (orderInfo.side !== 'sell') {
              handleOrderInfoChange('side', 'sell')
            }
            }}
            style={{ clipPath: 'polygon(3% 0px, 100% 0px, 100% 100%, 0% 100%)' }}
          >
            {t('futuresDetails.common.short')}
          </div>
        </div>
    }
   
      
    </>
  )
}

export default TradingButton
