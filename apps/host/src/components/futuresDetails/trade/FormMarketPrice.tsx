import { coinOptionsSelector } from '@/redux/modules/futuresCurrentSymbol.slice.ts'
import { RootState, useAppSelector } from '@/redux/store.ts'
import useHandleChangeValue from '../hooks/useHandleChangeValue.tsx'
import GroupOption from './GroupOption.tsx'
import InputBorderGradient from './InputBorderGradient.tsx'
import { OrderContractState } from './type.order.ts'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import FormSlider from './FormSlider'
import { cn } from '@/lib/utils'



interface FormMarketPriceProps {
}

const FormMarketPrice = ({ }: FormMarketPriceProps) => {
  const { t } = useTranslation()
  const {
    orderInfo: { size, currency, sliderValue },
  } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const coinOptions = useAppSelector(coinOptionsSelector)

  const { handleSizeChange, onSliderValueChange, handleOrderInfoChange, resetSizeValue } = useHandleChangeValue()
  const usdRef = useRef<HTMLInputElement>(null)

  const { isDesktop } = useResponsive()

  const handleSizeOnFocus = () => {
    resetSizeValue()
  }
  

  return (
    <div>
      <InputBorderGradient
        unit={
          <div
            className="text-[#FFFFFF] cursor-pointer"
            onClick={() => {
              handleOrderInfoChange('currency', currency === coinOptions[0].value ? coinOptions[1].value : coinOptions[0].value)
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
        innerBgClassName="bg-[#1F1E25]"
        containerClassName="mb-[16px] w-full "
        inputClassName="flex-1"
        onFocus={handleSizeOnFocus}
        // formatThousands={true}
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

export default FormMarketPrice
