import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { FormValues } from '.'
import { useFormContext } from 'react-hook-form'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { formatInputNumber, formatRoundedNumberInput } from '@/lib/number'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { getDefaultDecimalsByChain, getNativeTokenByActiveChain } from '@/lib/blockchain'
import LimitPrice from './LimitPrice'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import Decimal from 'decimal.js'

const FormLimitPrice = ({ tokenDetail, totalToken }: { tokenDetail: TokenDetail; totalToken: string }) => {
  const {
    setValue,
    register,
    // formState: { errors },
    watch,
  } = useFormContext<FormValues>()
  const { t } = useTranslation()
  const [sliderValue, setSliderValue] = useState([0])
  const activeWallet = useSelector(_activeWallet)
  const activeChain = activeWallet.chainType
  const balance = activeWallet?.balance?.formatted
  const transactionType = watch('transactionType')
  const limitPrice = watch('limitPrice')
  const limitMarketCap = watch('limitMarketCap')
  const quoteAmount = watch('quoteAmount')
  const baseAmount = watch('baseAmount')
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const [inputType, setInputType] = useState<'price' | 'marketCap'>('price')
  const totalSupply = tokenDetail?.totalSupply
  const decimalsBaseToken = getDefaultDecimalsByChain(activeChain)
  const decimals = tokenDetail?.decimals ? +tokenDetail?.decimals : decimalsBaseToken
  // Initialize base amount
  useEffect(() => {
    setValue('quoteAmount', '')
    setValue('baseAmount', '')
  }, [])

  useEffect(() => {
    if (transactionType) {
      setValue('quoteAmount', '')
      setValue('baseAmount', '')
      setSliderValue([0])
    }
  }, [transactionType, tokenDetail])

  // useEffect(() => {
  //   setValue('quoteAmount', '')
  //   setValue('baseAmount', '')
  //   setSliderValue([0])

  //   if (inputType === 'price') {
  //     setValue('limitMarketCap', '')
  //   }
  //   if (inputType === 'marketCap') {
  //     setValue('limitPrice', '')
  //   }
  // }, [inputType])

  const onSliderValueChange = (value: number[]) => {
    setSliderValue(value)
    const val = value[0]
    if (inputType === 'price') {
      if (+val > 0 && balance && transactionType === TransactionType.Buy) {
        const quoteAmount = formatRoundedNumberInput((+val * balance) / 100).toString()
        setValue('quoteAmount', quoteAmount)
        const baseAmount = (+quoteAmount * priceNativeToken) / +limitPrice
        setValue('baseAmount', +baseAmount > 0 ? formatRoundedNumberInput(baseAmount).toString() : '0')
      }
      if (transactionType === TransactionType.Sell) {
        const baseAmount =
          val === 100
            ? totalToken
            : formatRoundedNumberInput((+val * +totalToken) / 100).toString()
            // : new Decimal(totalToken).mul(val).div(100).toDecimalPlaces(+decimals, Decimal.ROUND_DOWN).toString()
        setValue('baseAmount', +baseAmount > 0 ? baseAmount : '0')
        const priceUsd = formatRoundedNumberInput(+baseAmount * +limitPrice)
        setValue('quoteAmount', +priceUsd > 0 ? formatRoundedNumberInput(+priceUsd / +priceNativeToken).toString() : '')
      }
    }

    if (inputType === 'marketCap') {
      if (+val > 0 && balance && transactionType === TransactionType.Buy) {
        const quoteAmount = formatRoundedNumberInput((+val * balance) / 100).toString()
        setValue('quoteAmount', quoteAmount)
        // const priceTokenUsd = (+limitMarketCap * Math.pow(10, +decimals!)) / +totalSupply!
        const priceTokenUsd = +limitMarketCap / +totalSupply!
        setValue(
          'baseAmount',
          +priceTokenUsd > 0
            ? formatRoundedNumberInput((+quoteAmount * priceNativeToken) / +priceTokenUsd).toString()
            : '',
        )
      }
      if (transactionType === TransactionType.Sell) {
        const baseAmount =
          +val === 100
            ? totalToken
            : new Decimal(totalToken).mul(val).div(100).toDecimalPlaces(+decimals, Decimal.ROUND_DOWN).toString()
        setValue('baseAmount', +baseAmount > 0 ? baseAmount : '0')
        // const priceTokenUsd = (+limitMarketCap * Math.pow(10, +decimals!)) / +totalSupply!
        const priceTokenUsd = +limitMarketCap / +totalSupply!
        const priceUsd = formatRoundedNumberInput(+baseAmount * +priceTokenUsd)
        setValue('quoteAmount', +priceUsd > 0 ? formatRoundedNumberInput(+priceUsd / +priceNativeToken).toString() : '')
      }
    }
  }

  // Base amount change handler
  const onChangeBaseAmount = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue('baseAmount', value)
    if (inputType === 'price') {
      const priceUsd = formatRoundedNumberInput(+value * +limitPrice).toString()
      setValue(
        'quoteAmount',
        +priceUsd >= 0 && value ? formatRoundedNumberInput(+priceUsd / +priceNativeToken).toString() : '',
      )
      setSliderValue([0])
    }
    if (inputType === 'marketCap') {
      const priceTokenUsd = +limitMarketCap / +totalSupply!
      setValue(
        'quoteAmount',
        +priceTokenUsd >= 0 && value
          ? formatRoundedNumberInput((+value * +priceTokenUsd) / priceNativeToken).toString()
          : '',
      )
      setSliderValue([0])
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
    if (inputType === 'price') {
      setSliderValue([0])
      const baseAmount = (+value * priceNativeToken) / +limitPrice
      setValue(
        'baseAmount',
        +baseAmount > 0 && +limitPrice > 0 && value ? formatRoundedNumberInput(baseAmount).toString() : '',
      )
    }
    if (inputType === 'marketCap') {
      const priceTokenUsd = +limitMarketCap / +totalSupply!
      setValue(
        'baseAmount',
        +priceTokenUsd > 0 && value
          ? formatRoundedNumberInput((+value * priceNativeToken) / +priceTokenUsd).toString()
          : '',
      )
      setSliderValue([0])
    }
  }

  useEffect(() => {
    if (limitPrice) {
      if (+quoteAmount > 0 && transactionType === TransactionType.Buy) {
        const baseAmount = (+quoteAmount * priceNativeToken) / +limitPrice
        setValue(
          'baseAmount',
          +baseAmount > 0 && +limitPrice > 0 ? formatRoundedNumberInput(baseAmount).toString() : '',
        )
      }

      if (+quoteAmount > 0 && transactionType === TransactionType.Sell) {
        const priceUsd = formatRoundedNumberInput(+baseAmount * +limitPrice).toString()
        setValue(
          'quoteAmount',
          +priceUsd > 0 && +limitPrice > 0 ? formatRoundedNumberInput(+priceUsd / +priceNativeToken).toString() : '',
        )
      }
    }
  }, [limitPrice])

  useEffect(() => {
    if (limitMarketCap) {
      if (+quoteAmount > 0 && transactionType === TransactionType.Buy) {
        const priceTokenUsd = +limitMarketCap / +totalSupply!
        const baseAmount = (+quoteAmount * priceNativeToken) / +priceTokenUsd
        setValue(
          'baseAmount',
          +baseAmount > 0 && +priceTokenUsd > 0 ? formatRoundedNumberInput(baseAmount).toString() : '',
        )
      }

      if (+baseAmount > 0 && transactionType === TransactionType.Sell) {
        const priceTokenUsd = +limitMarketCap / +totalSupply!
        const priceUsd = formatRoundedNumberInput(+baseAmount * +priceTokenUsd).toString()
        setValue(
          'quoteAmount',
          +priceUsd > 0 && +priceTokenUsd > 0 ? formatRoundedNumberInput(+priceUsd / +priceNativeToken).toString() : '',
        )
      }
    }
  }, [limitMarketCap])

  const tooltipText =
    transactionType === TransactionType.Buy
      ? t('orderForm.buySettings.buyAmount1')
      : t('orderForm.buySettings.sellAmount1')
  return (
    <div>
      {/* <InputControl
        placeHolder={t('orderForm.form.limitPrice')}
        containerClassName="mb-3 w-full h-[48px]"
        tokenDetail={tokenDetail}
        inputType={inputType}
        setInputType={setInputType}
        side={transactionType as TransactionType}
      /> */}
      {/* <InputBorderGradient
        unit={activeChain.toUpperCase()}
        placeHolder={t('orderForm.form.limitPrice')}
        inputClassName="flex-1"
        containerClassName="mb-4 w-full p-0"
        innerBgClassName="bg-[#141414]"
        containerInputClassName="bg-[#201e25] h-[48px] px-3 pt-2 pb-1"
        unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-3"
        isFocusShowTooltip={true}
        textTooltip={t('orderForm.form.limitPrice')}
        // hasValue={!!watch('quoteAmount')}
        inputProps={{
          ...register('quoteAmount', {
            onChange: onChangeQuoteAmount,
          }),
          onKeyDown: (e) => handleOnInput(e, 4),
        }}
      /> */}
      <LimitPrice
        placeHolder={t('orderForm.form.limitPrice')}
        containerClassName="mb-3 w-full h-[48px]"
        tokenDetail={tokenDetail}
        inputType={inputType}
        setInputType={setInputType}
        side={transactionType as TransactionType}
      />
      {transactionType === TransactionType.Buy ? (
        <InputBorderGradient
          unit={getNativeTokenByActiveChain(activeChain)}
          placeHolder={t('orderForm.form.amount')}
          inputClassName="flex-1"
          containerClassName="mb-4 w-full p-0"
          innerBgClassName="bg-[#141414]"
          containerInputClassName="bg-[#201e25] h-[48px] px-3 pt-2 pb-1"
          unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-3"
          isFocusShowTooltip={true}
          textTooltip={`${tooltipText}` + ` (` + `${getNativeTokenByActiveChain(activeChain)}` + `)`}
          hasValue={!!watch('quoteAmount')}
          inputProps={{
            ...register('quoteAmount', {
              onChange: onChangeQuoteAmount,
            }),
            onKeyDown: (e) => onKeyDownValidateInput(e, decimalsBaseToken),
          }}
        />
      ) : (
        <InputBorderGradient
          unit={tokenDetail?.symbol ? tokenDetail?.symbol : ''}
          placeHolder={t('orderForm.form.amount')}
          inputClassName="flex-1"
          containerClassName="mb-4 w-full p-0"
          innerBgClassName="bg-[#141414]"
          containerInputClassName="bg-[#201e25] h-[48px] px-3 pt-2 pb-1"
          unitClassName="min-w-[32px] text-xs"
          isFocusShowTooltip={true}
          textTooltip={`${tooltipText}` + ` (` + `${tokenDetail?.symbol ? tokenDetail?.symbol : ''}` + `)`}
          hasValue={!!watch('baseAmount')}
          inputProps={{
            ...register('baseAmount', {
              onChange: onChangeBaseAmount,
            }),
            onKeyDown: (e) => onKeyDownValidateInput(e, decimals),
          }}
        />
      )}

      <SliderGradient
        sliderValue={sliderValue}
        onSliderValueChange={onSliderValueChange}
        containerClassName="h-[0.5px]"
      />
      {transactionType === TransactionType.Buy ? (
        <InputBorderGradient
          unit={tokenDetail?.symbol ? tokenDetail?.symbol : ''}
          placeHolder={t('orderForm.form.estimatedExchange')}
          containerClassName="mt-4 w-full p-0 min-h-[28px]"
          innerBgClassName="bg-[#161617]"
          containerInputClassName="bg-[#161617] h-[28px] px-3"
          unitClassName="min-w-[32px] text-[11px] font-[380] mt-0"
          inputClassName="flex-1 text-[11px] font-[330]"
          isFocusShowTooltip={false}
          // textTooltip={t('orderForm.form.estimatedExchange')}
          hasValue={!!watch('baseAmount')}
          inputProps={{
            ...register('baseAmount', {
              onChange: onChangeBaseAmount,
            }),
            onKeyDown: (e) => onKeyDownValidateInput(e, decimals),
          }}
        />
      ) : (
        <InputBorderGradient
          unit={getNativeTokenByActiveChain(activeChain)}
          placeHolder={t('orderForm.form.estimatedExchange')}
          containerClassName="mt-4 w-full p-0 min-h-[28px]"
          innerBgClassName="bg-[#161617]"
          containerInputClassName="bg-[#161617] h-[28px] px-3"
          unitClassName="min-w-[32px] text-[11px] font-[380] mt-0"
          inputClassName="flex-1 text-[11px] font-[330]"
          isFocusShowTooltip={false}
          // textTooltip={t('orderForm.form.estimatedExchange')}
          hasValue={!!watch('quoteAmount')}
          inputProps={{
            ...register('quoteAmount', {
              onChange: onChangeQuoteAmount,
            }),
            onKeyDown: (e) => onKeyDownValidateInput(e, decimalsBaseToken),
          }}
        />
      )}
    </div>
  )
}

export default FormLimitPrice
