import { setOrderInfo } from '@/redux/modules/orderContract.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store.ts'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useRef } from 'react'
import useHandleChangeValue from '../hooks/useHandleChangeValue.tsx'
import ButtonEffectiveTime from './ButtonEffectiveTime.tsx'
import ButtonReducePosition from './ButtonReducePosition.tsx'
import InputBorderGradient from './InputBorderGradient.tsx'
import { OrderContractState } from './type.order.ts'
import { coinOptionsSelector } from '@/redux/modules/futuresCurrentSymbol.slice.ts'

const FormPhased = () => {
  const usdRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()
  const coinOptions = useAppSelector(coinOptionsSelector)
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const { currency, sliderValue, startPrice, endPrice, orderCount, size, sizeSkew } = orderInfo

  const { handleSizeChange, onSliderValueChange, handleOrderInfoChange } = useHandleChangeValue()

  return (
    <div className="mb-4">
      <InputBorderGradient
        unit={'USD'}
        placeholder="最低价格"
        containerClassName="mb-2 w-full"
        inputClassName="flex-1"
        innerBgClassName="!bg-[#14141480]"
        value={`${startPrice == 0 ? '' : startPrice}`}
        onChange={(e) => handleOrderInfoChange('startPrice', e)}
      />

      <InputBorderGradient
        unit={'USD'}
        placeholder="最高价格"
        containerClassName="mb-2 w-full"
        inputClassName="flex-1"
        innerBgClassName="!bg-[#14141480]"
        value={`${endPrice == 0 ? '' : endPrice}`}
        onChange={(e) => handleOrderInfoChange('endPrice', e)}
      />

      <InputBorderGradient
        unit={'1-100'}
        placeholder="订单数"
        containerClassName="mb-2 w-full"
        inputClassName="flex-1"
        innerBgClassName="!bg-[#14141480]"
        value={`${orderCount == 0 ? '' : orderCount}`}
        onChange={(e) => handleOrderInfoChange('orderCount', e)}
      />

      <InputBorderGradient
        unit={
          <DrawerCheckSelect
            childrenTrigger={
              <div className="text-[#FFFFFF]">
                <div className="flex items-center">
                  <span>{currency}</span>
                  <img className="ml-1" src="/images/futuresDetail/arrow-swap-icon.svg" alt="icon swap" />
                </div>
              </div>
            }
            options={coinOptions}
            value={currency}
            onChange={(e) => handleOrderInfoChange('currency', e)}
          />
        }
        placeholder="数量"
        containerClassName="mb-[16px] w-full"
        innerBgClassName="!bg-[#14141480]"
        inputClassName="flex-1"
        value={`${size || ''}`}
        onChange={handleSizeChange}
        inputProps={{
          ref: usdRef,
          type: 'number',
          step: '0.0001',
          min: '0',
        }}
      />

      <SliderGradient sliderValue={sliderValue} onSliderValueChange={onSliderValueChange} />

      <InputBorderGradient
        unit={
          <div className="flex items-center">
            <span className="mr-1">1-100</span>
            <img src="/images/futuresDetail/info-icon.svg" alt="icon info" />
          </div>
        }
        placeholder="数量分配"
        containerClassName="mb-2.5 w-full mt-7"
        inputClassName="flex-1"
        innerBgClassName="!bg-[#14141480]"
        value={`${sizeSkew == 0 ? '' : sizeSkew}`}
        onChange={(e) => handleOrderInfoChange('sizeSkew', e)}
      />

      <div className="flex items-center justify-between">
        <ButtonEffectiveTime />
        <ButtonReducePosition
          className="mb-4"
          isReducePosition={orderInfo.reduceOnly}
          onReducePositionChange={(e) =>
            dispatch(
              setOrderInfo({
                ...orderInfo,
                reduceOnly: e,
                isShowTPSl: false,
              }),
            )
          }
        />
      </div>
    </div>
  )
}

export default FormPhased
