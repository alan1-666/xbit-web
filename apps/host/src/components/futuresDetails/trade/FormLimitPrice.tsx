import { coinOptionsSelector, symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice.ts'
import { RootState, useAppSelector, useAppDispatch } from '@/redux/store.ts'
import { UITab } from '@/types/uiTabs'
import { useRef, useMemo, useEffect } from 'react'
import useHandleChangeValue from '../hooks/useHandleChangeValue.tsx'
import CalcOrderInfo from './CalcOrderInfo.tsx'
import GroupOption from './GroupOption.tsx'
import InputBorderGradient from './InputBorderGradient.tsx'
import InputControl from './InputControl.tsx'
import { OrderContractState } from './type.order.ts'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { setOrderInfo } from '@/redux/modules/orderContract.slice'
import { useOrderTradeData } from '@/hooks/hyperliquid/useOrderTradeData'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { selectPricePrecisionBySymbol } from '@/redux/modules/futuresMeta.slice'
import FormSlider from './FormSlider'
import { cn } from '@/lib/utils'


interface FormLimitPriceProps {
  baseCoinCtx: any
}

const FormLimitPrice = ({ baseCoinCtx }: FormLimitPriceProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const priceRef = useRef<HTMLInputElement>(null)
  const usdRef = useRef<HTMLInputElement>(null)
  const needUpdatePriceRef = useRef<boolean>(false)
  const { lastTradePrice, baseCoin } = useAppSelector(symbolInfoSelector)
  const { isDesktop } = useResponsive()

  const {
    orderInfo: { size, price, currency, sliderValue },
  } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)

  const coinOptions = useAppSelector(coinOptionsSelector)
  // 获取当前代币最小精度
  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
  const tick = tiers && Number(tiers[0]?.tick)

  const { handleSizeChange, onSliderValueChange, handleOrderInfoChange, resetSizeValue } = useHandleChangeValue()
  const trades = useOrderTradeData(baseCoin);
  const lastPrice = trades[0]?.price;

  const pricePrecision = useAppSelector(selectPricePrecisionBySymbol(baseCoin));
  

  //监听代币切换，标记需要更新价格
  useEffect(() => {
    if (orderInfo.orderCoin === baseCoin) {
      needUpdatePriceRef.current = true
    }
  }, [baseCoin, orderInfo.orderCoin])

  // 监听价格数据，只在需要更新时更新一次
  useEffect(() => {
    if (needUpdatePriceRef.current && lastPrice && Number(lastPrice) > 0) {
      dispatch(setOrderInfo({
        ...orderInfo,
        price: Number(lastPrice)
      }))
      // 更新完成后，重置标志位
      needUpdatePriceRef.current = false
    }
  }, [lastPrice, dispatch, orderInfo, baseCoin])




  /* 计算百分比 公式：（输入框的数值-最新价格）/最新价格*100%（四舍五入保留两位小数）*/
  // price 是输入框的数值,lastTradePrice 是最新成交价格
  const percentageValue = useMemo(() => {
    // 确保 price 和 lastTradePrice 都是有效数字
    const currentPrice = parseFloat(price?.toString() || '0')
    const lastPrice = parseFloat(lastTradePrice?.toString() || '0')
    // 如果任一价格无效或为0，返回0
    if (!currentPrice || !lastPrice || lastPrice === 0) {
      return 0
    }
    const percentage = ((currentPrice - lastPrice) / lastPrice) * 100
    return Math.round(percentage * 100) / 100
  }, [price, lastTradePrice])

  const handlePriceChange = (operation: 'plus' | 'minus') => {
    if (!price || !tick) return;
    const currentPrice = Number(price);
    const tickValue = Number(tick);
    const newPrice = operation === 'plus'
      ? currentPrice + tickValue
      : currentPrice - tickValue;
    if (operation === 'minus' && newPrice <= 0) return;

    const decimalPlaces = String(tickValue).includes('.')
      ? String(tickValue).split('.')[1].length
      : 0;
    handleOrderInfoChange('price', newPrice.toFixed(decimalPlaces));
  };


  const handlePlacePrice = () => {
    if (!baseCoinCtx?.midPx || !tick) return;
    const newPrice = baseCoinCtx?.lastestPx

    handleOrderInfoChange('price', Number(newPrice).toFixed(pricePrecision as number));
  };

  const handleSizeOnFocus = () => {
    resetSizeValue()
  }




  
  return (
    <div>
      <InputBorderGradient
        unit={
          <div
            className="text-[#FFFFFF] cursor-pointer"
            onClick={() => {handlePlacePrice()}}
          >
            <div className="flex items-center text-[#C8A7FD] font-bold">
                {t('futuresDetails.common.latest')}
            </div>
          </div>
     
        }
        inputClassName='w-full'
        placeholder={t('futuresDetails.common.price')}
        value={String(price ?? '')}
        onChange={(e) => {
          handleOrderInfoChange('price', e)
        }
        }
        innerBgClassName="bg-[#1F1E25]"
        containerClassName="mb-2.5 w-full"
        inputProps={{
          ref: priceRef,
        }}
      />
      <InputBorderGradient
        unit={
          <div
            className="text-[#FFFFFF] cursor-pointer"
            onClick={() => {
              handleOrderInfoChange(
                'currency',
                currency === coinOptions[0].value ? coinOptions[1].value : coinOptions[0].value,
              )
            }}
          >
            <div className="flex items-center">
              <span>{currency}</span>
              <img className="ml-1" src="/images/futuresDetail/arrow-swap-icon.svg" alt="arrow-swap-icon" />
            </div>
          </div>
     
        }
        placeholder={t('futuresDetails.common.quantity')}
        value={`${size || ''}`}
        onChange={handleSizeChange}
        onFocus={handleSizeOnFocus}
        innerBgClassName="bg-[#1F1E25]"
        containerClassName="mb-[16px] w-full"
        inputClassName="flex-1"
        inputProps={{
          ref: usdRef,
        }}
      />
      <div className={cn("flex items-center", isDesktop ? 'mb-[36px]' : 'mb-[20px]')}>
        <FormSlider
          containerClassName="flex-1 inline-block"
          sliderValue={sliderValue}
          onSliderValueChange={onSliderValueChange}
          showValue={true}
          label={isDesktop ? ['0%', '25%', '50%', '75%', '100%'] : []}
        />
      </div>

      <GroupOption />

    </div>
  )
}

export default FormLimitPrice
