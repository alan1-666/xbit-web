import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import React, { ChangeEvent, useCallback, useEffect, useRef } from 'react'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useFormContext } from 'react-hook-form'
import { FormValues } from '.'
import { RootState, useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { useState } from 'react'
import { formatInputNumber } from '@/lib/number'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { useTranslation } from 'react-i18next'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { getDefaultDecimalsByChain, getNativeTokenByActiveChain } from '@/lib/blockchain'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import Decimal from 'decimal.js'

const FormMarketPrice = ({ tokenDetail, totalToken }: { tokenDetail: TokenDetail; totalToken: string }) => {
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
    if (+val > 0 && balance && transactionType === TransactionType.Buy) {
      const quoteAmount = formatInputNumber((+val * balance) / 100, decimalBaseToken).toString()
      setValue('quoteAmount', quoteAmount)
      setPriceUsd(quoteAmount)
      const priceUsd = usdRef.current!.value
      setTempUsdAmount(priceUsd)
      setValue(
        'baseAmount',
        +priceUsd > 0 && +priceToken > 0 ? formatInputNumber(+priceUsd / +priceToken!, decimal).toString() : '',
      )
      // setLastBlur('quoteAmount')
      // setFocusedInput('quoteAmount')
    }

    if (+totalToken > 0 && transactionType === TransactionType.Sell) {
      const baseAmount = +val === 100 ? totalToken : new Decimal(totalToken).mul(val).div(100).toDecimalPlaces(+decimal, Decimal.ROUND_DOWN).toString()
      setValue('baseAmount', +baseAmount > 0 ? baseAmount : '')
      const priceUsd = formatInputNumber(+baseAmount * +priceToken, decimal).toString()
      setValue('quoteAmount', +priceUsd > 0 ? formatInputNumber(+priceUsd / +priceNativeToken, decimalBaseToken).toString() : '')
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
    const baseAmountCalc = formatInputNumber(+priceUsd / +priceToken!, decimal).toString()
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
    const priceUsd = formatInputNumber(+value * +priceToken, decimal).toString()
    const quote = formatInputNumber(+priceUsd / +priceNativeToken, decimalBaseToken).toString()
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
    setValue('quoteAmount', +value > 0 ? formatInputNumber(priceChain, decimalBaseToken).toString() : '')
    setValue('baseAmount', +value > 0 ? formatInputNumber(+value / +priceToken!, decimal).toString() : '')
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
        setTempUsdAmount(formatInputNumber(priceUsd, decimal) + '')
        setValue('baseAmount', +priceUsd > 0 ? formatInputNumber(+priceUsd / +priceToken!, decimal) + '' : '')
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
        const priceUsd = formatInputNumber(+baseAmount * +priceToken, decimal)
        setTempUsdAmount(priceUsd + '')
        setValue(
          'quoteAmount',
          +priceUsd > 0 && baseAmount ? formatInputNumber(+priceUsd / +priceNativeToken, decimalBaseToken) + '' : '',
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
        setValue('quoteAmount', tempUsdAmount ? formatInputNumber(priceChain, decimalBaseToken).toString() : '')
        setValue(
          'baseAmount',
          tempUsdAmount ? formatInputNumber(+tempUsdAmount / +priceToken!, decimal).toString() : '',
        )
      }
    }
  }, [lastBlur, tempUsdAmount, priceNativeToken, focusedInput, usdRef, usdRef.current])

  return (
    <div>
      {transactionType === TransactionType.Buy ? (
        <InputBorderGradient
          unit={getNativeTokenByActiveChain(activeChain)}
          placeHolder={t('orderForm.form.amount')}
          inputClassName="flex-1"
          containerClassName="mb-2 w-full p-0"
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
          unit={tokenDetail?.symbol ? tokenDetail?.symbol : ''}
          placeHolder={t('orderForm.form.amount')}
          inputClassName="flex-1"
          containerClassName="mb-2 w-full p-0"
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
        unit="USDT"
        placeHolder={t('orderForm.form.value')}
        containerClassName="mb-4 w-full p-0"
        innerBgClassName="bg-[#141414]"
        containerInputClassName="bg-[#201e25] h-[56px] px-3 pt-2 pb-1"
        unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-3"
        inputClassName="flex-1"
        isFocusShowTooltip={true}
        textTooltip={`${tooltipText}` + ` (` + `USDT` + `)`}
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

export default FormMarketPrice
