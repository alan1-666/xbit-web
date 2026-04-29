import { coinOptionsSelector, symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice.ts'
import { setOrderInfo } from '@/redux/modules/orderContract.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store.ts'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useRef } from 'react'
import useHandleChangeValue from '../hooks/useHandleChangeValue.tsx'
import ButtonReducePosition from './ButtonReducePosition.tsx'
import CalcOrderInfo from './CalcOrderInfo.tsx'
import { calcList, orderTypeOptions, triggerTypeOptions } from './Constans.ts'
import InputBorderGradient from './InputBorderGradient.tsx'
import { OrderContractState, TriggerTypeEmum } from './type.order.ts'
import { useTranslation } from 'react-i18next'

const FormPhased = () => {
  const { t } = useTranslation()
  const usdRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()
  const { price: symbolPrice } = useAppSelector(symbolInfoSelector)
  const coinOptions = useAppSelector(coinOptionsSelector)
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const { size, price, currency, sliderValue, triggerType, triggerPrice } = orderInfo

  const { handleSizeChange, onSliderValueChange, handleOrderInfoChange } = useHandleChangeValue()

  const onChangePriceUsd = () => {}
  const handleOnInput = () => {}

  return (
    <div className="mb-6">
      <InputBorderGradient
        unit={'USD'}
        placeholder="触发价"
        containerClassName="mb-2 w-full"
        inputClassName="flex-1"
        value={triggerPrice == 0 ? '' : triggerPrice.toString()}
        onChange={(value) => handleOrderInfoChange('triggerPrice', value)}
        innerBgClassName="!bg-[#14141480]"
      />

      <InputBorderGradient
        unit={
          <DrawerCheckSelect
            childrenTrigger={
              <div className="whitespace-nowrap text-[#FFFFFF]">
                <div className="flex items-center">
                  <span>
                    {triggerType === TriggerTypeEmum.LimitOrder ? orderTypeOptions()[1].label : orderTypeOptions()[0].label}
                  </span>
                  <img className="ml-1" src="/images/futuresDetail/arrow-swap-icon.svg" alt="icon swap" />
                </div>
              </div>
            }
            options={triggerTypeOptions}
            value={triggerType}
            onChange={(value) => {
              dispatch(
                setOrderInfo({
                  ...orderInfo,
                  triggerType: value as TriggerTypeEmum,
                  price: Number(symbolPrice),
                }),
              )
            }}
          />
        }
        placeholder="委托价"
        containerClassName="mb-[16px] w-full"
        readonly={triggerType === TriggerTypeEmum.MarketOrder}
        readonlyLabel={'市价'}
        innerBgClassName="!bg-[#14141480]"
        inputClassName="flex-1"
        value={`${price == 0 ? '' : price}`}
        onChange={(value) => handleOrderInfoChange('price', value)}
        inputProps={{
          ref: usdRef,
          onChange: onChangePriceUsd,
          onKeyDown: handleOnInput,
        }}
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
        placeholder={t('futuresDetails.common.quantity')}
        containerClassName="mb-[16px] w-full"
        // innerBgClassName="!bg-[#14141480]"
        inputClassName="flex-1"
        value={`${size || ''}`}
        onChange={handleSizeChange}
        inputProps={{
          ref: usdRef,
          onChange: onChangePriceUsd,
          onKeyDown: handleOnInput,
        }}
      />
      <SliderGradient
        containerClassName="mb-[30px]"
        sliderValue={sliderValue}
        onSliderValueChange={onSliderValueChange}
      />

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

      <CalcOrderInfo calcList={calcList} />
    </div>
  )
}

export default FormPhased
