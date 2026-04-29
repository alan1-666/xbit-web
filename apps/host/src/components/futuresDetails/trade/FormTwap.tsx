import { cn } from '@/lib/utils.ts'
import { RootState, useAppSelector } from '@/redux/store.ts'
import { UITab } from '@/types/uiTabs.ts'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useRef } from 'react'
import useHandleChangeValue from '../hooks/useHandleChangeValue.tsx'
import ButtonRandom from './ButtonRandom.tsx'
import ButtonReducePosition from './ButtonReducePosition.tsx'
import ButtonTwap from './ButtonTwap.tsx'
import CalcOrderInfo from './CalcOrderInfo.tsx'
import { periods } from './Constans.ts'
import InputBorderGradient from './InputBorderGradient.tsx'
import { OrderContractState } from './type.order.ts'
import { coinOptionsSelector } from '@/redux/modules/futuresCurrentSymbol.slice.ts'

const calcList: UITab[] = [
  {
    label: '执行频率',
    value: '30秒',
  },
  {
    label: '运行时长',
    value: '23小时11分钟',
  },

  {
    label: '拆分数量',
    value: '331',
  },

  {
    label: '每单大小',
    value: '0.00012BTC',
  },
]

const FormTwap = () => {
  const usdRef = useRef<HTMLInputElement>(null)
  const coinOptions = useAppSelector(coinOptionsSelector)
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)

  const { currency, sliderValue, size, duration } = orderInfo

  const { handleSizeChange, onSliderValueChange, handleOrderInfoChange } = useHandleChangeValue()

  return (
    <div>
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
        value={`${size || ''}`}
        onChange={handleSizeChange}
        innerBgClassName="!bg-[#14141480]"
        containerClassName="mb-[16px] w-full"
        inputClassName="flex-1"
        inputProps={{
          ref: usdRef,
          type: 'number',
          step: '0.0001',
          min: '0',
        }}
      />
      <SliderGradient sliderValue={sliderValue} onSliderValueChange={onSliderValueChange} />
      <ButtonTwap currentDuration={duration} onTimeSelected={(minutes) => handleOrderInfoChange('duration', minutes)} />

      <div className="flex gap-[4px] mb-2.5">
        {periods.map((period) => (
          <button
            key={`${period.value}-${period.unit}`}
            className={cn(
              'flex-1 py-1.5 text-xs border-solid border-[#ECECED14] border rounded-[4px] cursor-pointer transition duration-500',
              duration === period.value ? ' bg-[#ECECED14] text-[#FFFFFFCC]' : 'text-[#FFFFFFB2]',
            )}
            onClick={() => handleOrderInfoChange('duration', period.value)}
          >
            {period.lable}
            {period.unit}
          </button>
        ))}
      </div>

      <ButtonRandom
        className="mb-2.5"
        handleChangeRandomize={(e) => handleOrderInfoChange('randomize', e)}
        randomize={orderInfo.randomize}
      />
      <ButtonReducePosition
        className="mb-4"
        isReducePosition={orderInfo.reduceOnly}
        onReducePositionChange={(e) => handleOrderInfoChange('reduceOnly', e)}
      />

      <CalcOrderInfo calcList={calcList} />
    </div>
  )
}

export default FormTwap
