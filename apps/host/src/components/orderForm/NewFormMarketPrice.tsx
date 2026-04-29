import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { ChangeEvent, useEffect, useRef } from 'react'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useFormContext } from 'react-hook-form'
import { FormValues } from '.'
import { RootState, useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { useState } from 'react'
import { formatInputNumber, formatRoundedNumberInput } from '@/lib/number'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { useTranslation } from 'react-i18next'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { getDefaultDecimalsByChain, getNativeTokenByActiveChain } from '@/lib/blockchain'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import Decimal from 'decimal.js'
import FilterSelect, { FilterSelectOption } from '../common/FilterSelect'

type TYPE_FOCUS = 'quoteAmount' | 'usdt' | 'baseAmount' | ''

const NewFormMarketPrice = ({ tokenDetail, totalToken }: { tokenDetail: TokenDetail; totalToken: string }) => {
  const { setValue, register, watch } = useFormContext<FormValues>()
  const { t } = useTranslation()
  const [sliderValue, setSliderValue] = useState([0])
  const activeWallet = useSelector(_activeWallet)
  const activeChain = activeWallet.chainType
  const balance = activeWallet?.balance?.formatted
  const usdRef = useRef<HTMLInputElement>(null)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const [priceToken, setPriceToken] = useState(tokenDetail?.price ? tokenDetail?.price : '0')
  const transactionType = watch('transactionType')
  const quoteAmount = watch('quoteAmount')
  const baseAmount = watch('baseAmount')
  const { price } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const [tempUsdAmount, setTempUsdAmount] = useState('')
  const [lastBlur, setLastBlur] = useState<'quoteAmount' | 'usdt' | 'baseAmount' | ''>('')
  const [focusedInput, setFocusedInput] = useState<'quoteAmount' | 'usdt' | 'baseAmount' | ''>('')
  const decimalBaseToken = getDefaultDecimalsByChain(activeChain)
  const decimal = tokenDetail?.decimals ? +tokenDetail?.decimals : decimalBaseToken
  const isBuy = transactionType === TransactionType.Buy
  const inputOptions: FilterSelectOption[] = [
    {
      value: 'token',
      label: isBuy ? getNativeTokenByActiveChain(activeChain) : tokenDetail?.symbol,
    },
    {
      value: 'usdt',
      label: 'USDT',
    },
  ]
  const [inputType, setInputType] = useState(inputOptions[0].value)

  useEffect(() => {
    if (!!price) {
      setPriceToken(price)
    }
  }, [price])
  // Initialize base amount
  useEffect(() => {
    setValue('quoteAmount', '')
    setValue('baseAmount', '')
  }, [])

  useEffect(() => {
    if (transactionType) {
      setValue('quoteAmount', '')
      setValue('baseAmount', '')
      usdRef.current!.value = ''
      setTempUsdAmount('')
      setSliderValue([0])
    }
  }, [transactionType, tokenDetail])
  // Update USD price
  const setPriceUsd = (price: string) => {
    if (usdRef.current) {
      usdRef.current.value = +price > 0 ? formatInputNumber(+price * priceNativeToken, decimal).toString() : ''
      setTempUsdAmount(+price > 0 ? formatInputNumber(+price * priceNativeToken, decimal).toString() : '')
    }
  }

  // Slider value change handler
  const onSliderValueChange = (value: number[]) => {
    setSliderValue(value)
    setLastBlur('')
    setFocusedInput('')
    const val = value[0]
    if (+val >= 0 && balance && transactionType === TransactionType.Buy) {
      const quoteAmount = formatRoundedNumberInput((+val * balance) / 100).toString()
      setValue('quoteAmount', quoteAmount)
      setPriceUsd(quoteAmount)
      const priceUsd = usdRef.current!.value
      setTempUsdAmount(priceUsd)
      setValue(
        'baseAmount',
        +priceUsd > 0 && +priceToken > 0 ? formatRoundedNumberInput(+priceUsd / +priceToken!).toString() : '',
      )
      // setLastBlur('quoteAmount')
      // setFocusedInput('quoteAmount')
    }

    if (+totalToken >= 0 && transactionType === TransactionType.Sell) {
      const baseAmount =
        +val === 100
          ? totalToken
          : formatRoundedNumberInput((+val * +totalToken) / 100).toString()
          // : new Decimal(totalToken).mul(val).div(100).toDecimalPlaces(+decimal, Decimal.ROUND_DOWN).toString()
      setValue('baseAmount', +baseAmount >= 0 ? baseAmount : '')
      const priceUsd = formatRoundedNumberInput(+baseAmount * +priceToken).toString()
      setValue(
        'quoteAmount',
        +priceUsd > 0 ? formatRoundedNumberInput(+priceUsd / +priceNativeToken).toString() : '',
      )
      if (usdRef.current) {
        usdRef.current.value = +priceUsd > 0 ? priceUsd : ''
        setTempUsdAmount(+priceUsd > 0 ? priceUsd : '')
      }
      // setLastBlur('baseAmount')
      // setFocusedInput('baseAmount')
    }
  }

  // quote amount change handler
  const onChangeQuoteAmount = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue('quoteAmount', value)
    setSliderValue([0])
    setPriceUsd(value)
    const priceUsd = +usdRef.current!.value
    const baseAmountCalc = formatRoundedNumberInput(+priceUsd / +priceToken!).toString()
    setValue('baseAmount', +baseAmountCalc > 0 && value ? (+baseAmountCalc > 0 ? baseAmountCalc : '') : '')
    // const valueSlider = Math.floor((+value * 100) / balance)
    // setSliderValue(valueSlider > 100 ? [100] : [valueSlider])
  }

  // Base amount change handler
  const onChangeBaseAmount = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue('baseAmount', value)
    const priceUsd = formatRoundedNumberInput(+value * +priceToken).toString()
    const quote = formatRoundedNumberInput(+priceUsd / +priceNativeToken).toString()
    setValue('quoteAmount', +quote > 0 && value ? quote : '')
    if (usdRef.current) {
      usdRef.current.value = +priceUsd > 0 && value ? priceUsd : ''
      setTempUsdAmount(+priceUsd > 0 && value ? priceUsd : '')
    }
    setSliderValue([0])
  }

  // USD price change handler
  const onChangePriceUsd = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setTempUsdAmount(value)
    const priceChain = +value / priceNativeToken
    setValue('quoteAmount', +value > 0 ? formatRoundedNumberInput(priceChain).toString() : '')
    setValue('baseAmount', +value > 0 ? formatRoundedNumberInput(+value / +priceToken!).toString() : '')
    setSliderValue([0])
    // const valueSlider = Math.floor((+priceChain * 100) / balance)
    // setSliderValue(valueSlider > 100 ? [100] : [valueSlider])
  }

  const tooltipText =
    transactionType === TransactionType.Buy
      ? t('orderForm.buySettings.buyAmount1')
      : t('orderForm.buySettings.sellAmount1')

  const handleBlur = (str: string) => {
    setLastBlur(str)
  }

  const handleFocus = (str: string) => {
    setFocusedInput(str)
  }

  useEffect(() => {
    if (lastBlur) {
      if (
        lastBlur === 'quoteAmount' &&
        !!quoteAmount &&
        usdRef &&
        usdRef.current &&
        price &&
        priceNativeToken &&
        focusedInput !== 'baseAmount' &&
        focusedInput !== 'usdt'
      ) {
        const priceUsd = +quoteAmount * priceNativeToken
        setTempUsdAmount(formatRoundedNumberInput(priceUsd) + '')
        setValue('baseAmount', +priceUsd > 0 ? formatRoundedNumberInput(+priceUsd / +priceToken!) + '' : '')
      }

      if (
        lastBlur === 'baseAmount' &&
        !!baseAmount &&
        usdRef &&
        usdRef.current &&
        price &&
        priceNativeToken &&
        focusedInput !== 'quoteAmount' &&
        focusedInput !== 'usdt'
      ) {
        const priceUsd = formatRoundedNumberInput(+baseAmount * +priceToken)
        setTempUsdAmount(priceUsd + '')
        setValue(
          'quoteAmount',
          +priceUsd > 0 && baseAmount ? formatRoundedNumberInput(+priceUsd / +priceNativeToken) + '' : '',
        )
      }

      if (
        lastBlur === 'usdt' &&
        !!baseAmount &&
        usdRef &&
        usdRef.current &&
        tempUsdAmount &&
        price &&
        priceNativeToken &&
        focusedInput !== 'quoteAmount' &&
        focusedInput !== 'baseAmount'
      ) {
        const priceChain = +tempUsdAmount / priceNativeToken
        setValue('quoteAmount', tempUsdAmount ? formatRoundedNumberInput(priceChain).toString() : '')
        setValue(
          'baseAmount',
          tempUsdAmount ? formatRoundedNumberInput(+tempUsdAmount / +priceToken!).toString() : '',
        )
      }
    }
  }, [lastBlur, tempUsdAmount, priceNativeToken, focusedInput, usdRef, usdRef.current])

  const onChangeInputType = (value: string) => {
    setInputType(value)
    setValue('quoteAmount', '')
    setValue('baseAmount', '')
    setTempUsdAmount('')
    setSliderValue([0])
  }

  return (
    <div>
      <div className="relative">
        {isBuy ? (
          <InputBorderGradient
            unit=""
            placeHolder={t('orderForm.form.amount')}
            inputClassName="flex-1"
            // containerClassName="mb-4 w-full p-0"
            containerClassName={`mb-4 w-full p-0 ${inputType !== 'token' && 'hidden' }`}
            innerBgClassName="bg-[#141414]"
            containerInputClassName="bg-[#201e25] h-[56px] px-3 pt-2 pb-1"
            unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-3"
            isFocusShowTooltip={true}
            textTooltip={`${tooltipText}` + ` (` + `${getNativeTokenByActiveChain(activeChain)}` + `)`}
            hasValue={!!watch('quoteAmount')}
            inputProps={{
              ...register('quoteAmount', {
                onChange: onChangeQuoteAmount,
              }),
              onKeyDown: (e) => onKeyDownValidateInput(e, decimalBaseToken),
            }}
            onBlur={() => handleBlur('quoteAmount')}
            onFocus={() => handleFocus('quoteAmount')}
          />
        ) : (
          <InputBorderGradient
            unit=""
            placeHolder={t('orderForm.form.amount')}
            inputClassName="flex-1"
            containerClassName={`mb-4 w-full p-0 ${inputType !== 'token' && 'hidden' }`}
            innerBgClassName="bg-[#141414]"
            containerInputClassName="bg-[#201e25] h-[56px] px-3 pt-2 pb-1"
            unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-3"
            isFocusShowTooltip={true}
            textTooltip={`${tooltipText}` + ` (` + `${tokenDetail?.symbol ? tokenDetail?.symbol : ''}` + `)`}
            hasValue={!!watch('baseAmount')}
            inputProps={{
              ...register('baseAmount', {
                onChange: onChangeBaseAmount,
              }),
              onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
            }}
            onBlur={() => handleBlur('baseAmount')}
            onFocus={() => handleFocus('baseAmount')}
          />
        )}
        <InputBorderGradient
          unit=""
          placeHolder={t('orderForm.form.amount')}
          inputClassName="flex-1"
          // containerClassName="mb-4 w-full p-0"
            containerClassName={`mb-4 w-full p-0 ${inputType !== 'usdt' && 'hidden' }`}
          innerBgClassName="bg-[#141414]"
          containerInputClassName="bg-[#201e25] h-[56px] px-3 pt-2 pb-1"
          unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-3"
          isFocusShowTooltip={true}
          textTooltip={`${tooltipText}` + ` (USDT)`}
          // hasValue={!!tempUsdAmount}
          hasValue={!!watch('baseAmount') || !!tempUsdAmount}
          inputProps={{
            ref: usdRef,
            value: tempUsdAmount,
            onChange: onChangePriceUsd,
            onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
          }}
          onBlur={() => handleBlur('usdt')}
          onFocus={() => handleFocus('usdt')}
        />
        <div className="absolute top-[50%] translate-y-[-50%] right-3 h-4/5 flex items-center justify-between bg-[#201e25] pl-2.5">
          <FilterSelect
            triggerIconClassname="w-4 h-4"
            triggerIcon="/images/icons/ic-down-new.svg"
            options={inputOptions}
            defaultValue={inputOptions[0].value}
            selectTriggerProps={{
              className: '!w-max max-w-[200px] flex border-none bg-[none] !p-0 text-[12px] text-white',
            }}
            onValueChange={(value) => onChangeInputType(value)}
          />
        </div>
      </div>
      <SliderGradient
        sliderValue={sliderValue}
        onSliderValueChange={onSliderValueChange}
        containerClassName="h-[0.5px]"
      />
      {transactionType === TransactionType.Buy ? (
        <InputBorderGradient
          unit={tokenDetail?.symbol ? tokenDetail?.symbol : ''}
          placeHolder={t('orderForm.form.estimatedExchange')}
          containerClassName="mt-4 w-full p-0 min-h-7"
          innerBgClassName="bg-[#141414]"
          containerInputClassName="bg-[#161617] h-7 px-3 pt-1 pb-1"
          unitClassName="leading-none min-w-8 text-[11px] text-[#908e98]"
          inputClassName="flex-1 text-[11px] font-[330]"
          isFocusShowTooltip={false}
          textTooltip={t('orderForm.form.estimatedExchange')}
          hasValue={!!watch('baseAmount')}
          inputProps={{
            ...register('baseAmount', {
              onChange: onChangeBaseAmount,
            }),
            onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
          }}
          onBlur={() => handleBlur('baseAmount')}
          onFocus={() => handleFocus('baseAmount')}
        />
      ) : (
        <InputBorderGradient
          unit={getNativeTokenByActiveChain(activeChain)}
          placeHolder={t('orderForm.form.estimatedExchange')}
          containerClassName="mt-4 w-full p-0 min-h-7"
          innerBgClassName="bg-[#141414]"
          containerInputClassName="bg-[#161617] h-7 px-3 pt-1 pb-1"
          unitClassName="leading-none min-w-8 text-[11px] text-[#908e98]"
          inputClassName="flex-1 text-[11px] font-[330]"
          isFocusShowTooltip={false}
          textTooltip={t('orderForm.form.estimatedExchange')}
          hasValue={!!watch('quoteAmount')}
          inputProps={{
            ...register('quoteAmount', {
              onChange: onChangeQuoteAmount,
            }),
            onKeyDown: (e) => onKeyDownValidateInput(e, decimalBaseToken),
          }}
          onBlur={() => handleBlur('quoteAmount')}
          onFocus={() => handleFocus('quoteAmount')}
        />
      )}
    </div>
  )
}

export default NewFormMarketPrice
