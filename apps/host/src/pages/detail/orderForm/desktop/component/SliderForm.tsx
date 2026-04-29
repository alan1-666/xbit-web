import { useEffect, useMemo, useRef, useState } from 'react'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import InputBorderGradient from '@/components/orderForm/InputBorderGradient'
import { LIMIT_DECIMAL_PRICE, onKeyDownValidateInput, OrderFormType } from '../../useOrderForm'
import NewSliderGradient from './NewSliderGradient'
import { RootState, useAppSelector } from '@/redux/store'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { useFormContext } from 'react-hook-form'
import { formatNumberLimitPrice } from '@/lib/number'
import { TokenDetail } from '@/@generated/gql/graphql-future'

const SliderForm = ({ tokenDetail, inputType }: { tokenDetail: TokenDetail; inputType: 'price' | 'marketCap' }) => {
  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const { setValue } = useFormContext<OrderFormType>()

  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const [selectedSliderValue, setSelectedSliderValue] = useState<number>(0)

  const totalSupply = Number(tokenDetail?.circulatingSupply ?? tokenDetail?.totalSupply)
  const lastPrice = ohlcPrice && ohlcPrice !== 0 ? ohlcPrice : tokenDetail?.price
  const marketCap = useMemo(() => {
    return lastPrice ? totalSupply * Number(lastPrice) : tokenDetail?.marketCap // fallback to tokenDetail.marketCap if lastPrice is not available
  }, [lastPrice, totalSupply, tokenDetail?.marketCap])

  function getCurrentMarketCap(sliderValue: number) {
    let valueMarketCap = marketCap
    if (sliderValue === undefined) {
      return valueMarketCap
    }
    if (sliderValue !== 0) valueMarketCap = (marketCap * (100 + sliderValue)) / 100
    return valueMarketCap
  }

  function getCurrentPrice(sliderValue: number) {
    let valuePrice = lastPrice
    if (sliderValue === 0) valuePrice = lastPrice
    if (sliderValue !== 0) valuePrice = (lastPrice * (100 + sliderValue)) / 100
    return valuePrice
  }

  const changeLimitValueBaseOnInputType = (value: number) => {
    if (inputType === 'marketCap') {
      setValue('limitMarketCap', formatNumberLimitPrice(getCurrentMarketCap(value), LIMIT_DECIMAL_PRICE))
    }
    if (inputType === 'price') {
      setValue('limitPrice', formatNumberLimitPrice(getCurrentPrice(value), LIMIT_DECIMAL_PRICE))
    }
  }

  // slider change handler
  const onChangeSlider = (value: number[]) => {
    const val = value[0]
    setSelectedSliderValue(val)
    setSliderValue(value)
  }

  useEffect(() => {
    setSliderValue([0])
    setSelectedSliderValue(0)
  }, [inputType])

  const checkedRef = useRef(0)

  useEffect(() => {
    if (inputType) {
      if (inputType === 'price') {
        setValue('limitPrice', formatNumberLimitPrice(lastPrice, LIMIT_DECIMAL_PRICE))
        setValue('limitMarketCap', '')
      }
      if (inputType === 'marketCap') {
        setValue('limitMarketCap', formatNumberLimitPrice(marketCap, LIMIT_DECIMAL_PRICE))
        setValue('limitPrice', '')
      }
    }
  }, [inputType])

  useEffect(() => {
    if (tokenDetail && checkedRef.current === 0) {
      if (inputType === 'price') {
        setValue('limitPrice', formatNumberLimitPrice(lastPrice, LIMIT_DECIMAL_PRICE))
        setValue('limitMarketCap', '')
      }
      if (inputType === 'marketCap') {
        setValue('limitMarketCap', formatNumberLimitPrice(marketCap, LIMIT_DECIMAL_PRICE))
        setValue('limitMarketCap', '')
      }
      checkedRef.current = 1
    }
  }, [tokenDetail])

  useEffect(() => {
    if (inputType === 'marketCap') {
      let valueMarketCap = marketCap
      if (selectedSliderValue === 0) valueMarketCap = marketCap
      if (selectedSliderValue !== 0) valueMarketCap = (marketCap * (100 + selectedSliderValue)) / 100
      if (valueMarketCap) {
        setValue('limitMarketCap', formatNumberLimitPrice(valueMarketCap, LIMIT_DECIMAL_PRICE))
      }
    }
    if (inputType === 'price') {
      let valuePrice = lastPrice
      if (selectedSliderValue === 0) valuePrice = lastPrice
      if (selectedSliderValue !== 0) valuePrice = (lastPrice * (100 + selectedSliderValue)) / 100
      if (valuePrice) {
        setValue('limitPrice', formatNumberLimitPrice(valuePrice, LIMIT_DECIMAL_PRICE))
      }
    }
  }, [selectedSliderValue])

  const onChangeMcValue = (val: string) => {
    let value = val.replace(/[^0-9.-]/g, '')
    if (value === '-') return 0
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setSelectedSliderValue(+value)
    setSliderValue([+value])
  }

  useEffect(() => {
    if (inputType === 'marketCap') {
    setValue('limitMarketCap', formatNumberLimitPrice(getCurrentMarketCap(selectedSliderValue ?? 0), LIMIT_DECIMAL_PRICE))
    } else if (inputType === 'price') {
      setValue('limitPrice', formatNumberLimitPrice(getCurrentPrice(selectedSliderValue ?? 0), LIMIT_DECIMAL_PRICE))
    }
    return () => {
      setValue('limitMarketCap', undefined)
      setValue('limitPrice', undefined)
    }
  }, [])


  return (
    <div className="flex items-center mt-3 gap-4">
      <div className="h-[42px] flex-1">
        <NewSliderGradient
          containerClassName={`mt-[16px] mb-[26px]`}
          sliderValue={sliderValue}
          onSliderValueChange={(value) => onChangeSlider(value)}
          showValue={true}
          label={['-100%', '-50%', '0%', '50%', '100%']}
        />
      </div>
      <InputBorderGradient
        // unit={activeChain.toUpperCase()}
        unit={'%'}
        // placeHolder={t('orderForm.form.amount')}
        inputClassName="flex-1 max-w-none text-xs text-white/80"
        containerClassName="w-full p-0 min-h-[32px] w-[64px]"
        innerBgClassName="bg-[#141414]"
        containerInputClassName="bg-[#ececed14] h-[32px] px-2 py-2 gap-0"
        unitClassName="min-w-fit w-fit text-xs text-white/80 ml-[3px]"
        // value={field.value}
        // isFocusShowTooltip={true}
        // textTooltip={`${tooltipText}` + ` (` + `${activeChain.toUpperCase()}` + `)`}
        // hasValue={!!watch('quoteAmount')}
        value={selectedSliderValue > 0 ? '+' + selectedSliderValue.toString() : selectedSliderValue.toString()}
        inputProps={{
          onKeyDown: (e) => onKeyDownValidateInput(e, 0, true),
        }}
        onChange={(value: string) => {
          onChangeMcValue(value)
        }}
      />
    </div>
  )
}

export default SliderForm
