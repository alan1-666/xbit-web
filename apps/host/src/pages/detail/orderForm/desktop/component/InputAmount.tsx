import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import InputBorderGradient from '@/components/orderForm/InputBorderGradient'
import { Controller, useFormContext } from 'react-hook-form'
import { onKeyDownValidateInput, OrderFormType } from '../../useOrderForm'
import { RootState, useAppSelector } from '@/redux/store'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { priceChain } from '@/redux/modules/price.slice'
import { formatRoundedNumberInput } from '@/lib/number'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { getDefaultDecimalsByChain, getNativeTokenByActiveChain } from '@/lib/blockchain'
import { useGetHoldingToken } from '../hook/useGetHoldingToken'
import Decimal from 'decimal.js'

const InputAmount = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const { control, watch, setValue } = useFormContext<OrderFormType>()
  const { price } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const percent = watch('percent')
  const quoteAmount = watch('quoteAmount')
  const baseAmount = watch('baseAmount')

  const transactionType = watch('transactionType')
  const isBuy = transactionType === TransactionType.Buy
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const { totalToken: totalToken } = useGetHoldingToken(tokenDetail)
  const decimalsBaseToken = getDefaultDecimalsByChain(activeChain)
  const decimals = tokenDetail?.decimals ? tokenDetail?.decimals : decimalsBaseToken
  const onChangeQuoteAmount = (val: string) => {
    let value = val.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    if (isBuy) {
      setValue('quoteAmount', value)
    } else {
      setValue('baseAmount', value)
      // setValue('quoteAmount', value)
    }
  }

  // useEffect(() => {
  //   if (transactionType === TransactionType.Sell && !!quoteAmount) {
  //     const baseAmount = (priceSol * +quoteAmount) / price
  //     setValue('baseAmount', formatRoundedNumberInput(baseAmount))
  //   }
  // }, [transactionType, quoteAmount])

  useEffect(() => {
    if (transactionType === TransactionType.Sell && !!baseAmount) {
      const quoteAmountCalc = (+baseAmount * price) / priceNativeToken
      setValue('quoteAmount', formatRoundedNumberInput(quoteAmountCalc))
    }
  }, [baseAmount, price])

  useEffect(() => {
    if (percent && totalToken) {
      if (totalToken) {
        const baseAmount = +percent === 100 ? totalToken : new Decimal(totalToken)
          .mul(percent)
          .div(100)
          .toDecimalPlaces(+decimals, Decimal.ROUND_DOWN)
          .toString()
        setValue('baseAmount', baseAmount)
        setValue('percent', '')
        // setValue('quoteAmount', formatRoundedNumberInput(baseAmountCalc * price), { shouldValidate: true })
      }
    }
  }, [percent])

  useEffect(() => {
    if (transactionType === TransactionType.Sell) {
      setValue('quoteAmount', '')
    }
    if (transactionType === TransactionType.Buy) {
      setValue('baseAmount', '')
      setValue('quoteAmount', '')
    }
  }, [transactionType])

  return (
    <div>
      <Controller
        name={isBuy ? 'quoteAmount' : 'baseAmount'}
        control={control}
        render={({ field }) => (
          <InputBorderGradient
            unit={isBuy ? getNativeTokenByActiveChain(activeChain) : tokenDetail?.symbol}
            placeHolder={t('orderForm.form.amount')}
            inputClassName="flex-1"
            containerClassName="mt-4 w-full p-0"
            innerBgClassName="bg-[#141414]"
            containerInputClassName="bg-[#ececed14] h-[48px] px-3 pt-2 pb-1"
            unitClassName="min-w-[32px] text-xs"
            value={isBuy ? quoteAmount : baseAmount}
            //field.value
            // isFocusShowTooltip={true}
            // textTooltip={`${tooltipText}` + ` (` + `${activeChain.toUpperCase()}` + `)`}
            // hasValue={!!quoteAmount}
            inputProps={{
              onKeyDown: (e) => onKeyDownValidateInput(e, isBuy ? +decimalsBaseToken : +decimals),
            }}
            // onBlur={() => handleBlur('quoteAmount')}
            // onFocus={() => handleFocus('quoteAmount')}
            onChange={(value: string) => {
              onChangeQuoteAmount(value)
            }}
          />
        )}
      />
      {/* <OrderSettingDialog openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} /> */}
    </div>
  )
}

export default InputAmount
