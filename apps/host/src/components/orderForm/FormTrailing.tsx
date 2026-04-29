import { ChangeEvent, useEffect, useRef, useState } from 'react'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { FormValues } from '.'
import { useFormContext } from 'react-hook-form'
import { TransactionType } from '@/@generated/gql/graphql-trading'
import { formatInputValue, formatRoundedNumberInput } from '@/lib/number'
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@components/ui/accordion'
import { useTranslation } from 'react-i18next'
import { RootState, useAppSelector } from '@/redux/store'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import TrailingTabExplained from './TrailingTabExplained'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import { getDefaultDecimalsByChain } from '@/lib/blockchain'
import Decimal from 'decimal.js'

const FormTrailing = ({ tokenDetail, totalToken }: { tokenDetail: TokenDetail; totalToken: string }) => {
  const { setValue, register, watch } = useFormContext<FormValues>()
  const { t } = useTranslation()
  const [sliderValue, setSliderValue] = useState([0])
  const transactionType = watch('transactionType')
  const [priceToken, setPriceToken] = useState(tokenDetail?.price ? tokenDetail?.price : '0')
  const usdRef = useRef<HTMLInputElement>(null)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const { price } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const decimals = tokenDetail?.decimals ? +tokenDetail?.decimals : getDefaultDecimalsByChain(activeChain)

  useEffect(() => {
    if (!!price) {
      setPriceToken(price)
    }
  }, [price])
  // Initialize base amount
  useEffect(() => {
    setValue('baseAmount', '')
    setValue('callbackRate', '')
  }, [])

  useEffect(() => {
    if (transactionType) {
      setValue('baseAmount', '')
      setValue('callbackRate', '')
      setValue('triggerPrice', '')
      // usdRef.current!.value = ''
      setSliderValue([0])
    }
  }, [transactionType, tokenDetail])

  // useEffect(() => {
  //   if (!message) return
  //   try {
  //     const data = JSON.parse(message.toString() || '')
  //     if (data) {
  //       setPriceToken(data?.usd_price)
  //     }
  //   } catch (error) {
  //     console.warn('WalletBalanceSubscription error: ', error)
  //   }
  // }, [message])

  const onSliderValueChange = (value: number[]) => {
    setSliderValue(value)
    const val = value[0]

    if (+totalToken >= 0 && transactionType === TransactionType.Sell) {
      const baseAmount = +val === 100 ? totalToken : formatRoundedNumberInput((+val * +totalToken) / 100).toString()
      // new Decimal(totalToken)
      //   .mul(val)
      //   .div(100)
      //   .toDecimalPlaces(+decimals, Decimal.ROUND_DOWN)
      //   .toString()

      setValue('baseAmount', +baseAmount > 0 ? baseAmount : '0')
    }
  }

  const onChangeCallbackRate = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue('callbackRate', value)
  }

  // Base amount change handler
  const onChangeBaseAmount = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue('baseAmount', value)
    const priceUsd = formatInputValue(+value * +priceToken)
    if (usdRef.current) {
      usdRef.current.value = +priceUsd > 0 ? priceUsd : ''
    }
    setSliderValue([0])
  }

  const onTriggerPrice = (val: ChangeEvent<HTMLInputElement>) => {
    let value = val.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue('triggerPrice', value)
  }

  const onOpenPriceUsd = (_: string) => {}

  return (
    <div>
      <InputBorderGradient
        unit="%"
        placeHolder={t('orderForm.trailingTab.highPointPullback')}
        inputClassName="flex-1"
        containerClassName="mb-2 w-full p-0"
        innerBgClassName="bg-[#141414]"
        containerInputClassName="bg-[#201e25] h-[56px] px-3 pt-2 pb-1"
        unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-4 text-end"
        isFocusShowTooltip={true}
        hasValue={!!watch('callbackRate')}
        textTooltip={t('orderForm.trailingTab.highPointPullback')}
        inputProps={{
          ...register('callbackRate', {
            onChange: onChangeCallbackRate,
          }),
          onKeyDown: (e) => onKeyDownValidateInput(e, 2),
        }}
      />
      <InputBorderGradient
        unit={tokenDetail?.symbol ? tokenDetail?.symbol : ''}
        placeHolder={t('orderForm.trailingTab.soldQuantity')}
        inputClassName="flex-1"
        containerClassName="mb-4 w-full p-0"
        innerBgClassName="bg-[#141414]"
        containerInputClassName="bg-[#201e25] h-[56px] px-3 pt-2 pb-1"
        unitClassName="text-[9px] leading-none min-w-[32px] text-xs mt-3"
        isFocusShowTooltip={true}
        hasValue={!!watch('baseAmount')}
        textTooltip={t('orderForm.trailingTab.soldQuantity')}
        inputProps={{
          ...register('baseAmount', {
            onChange: onChangeBaseAmount,
          }),
          onKeyDown: (e) => onKeyDownValidateInput(e, decimals),
        }}
      />
      <SliderGradient sliderValue={sliderValue} onSliderValueChange={onSliderValueChange} />
      <Accordion type="single" collapsible defaultValue="open" onValueChange={(open: string) => onOpenPriceUsd(open)}>
        <AccordionItem value="open" className="mt-4 border-none">
          <AccordionTrigger className="pt-2.5 pb-3.5">
            <TrailingTabExplained />
            <p className="text-[11px] leading-none text-[#ffffffcc] ml-1 mr-1">
              {t('orderForm.trailingTab.tooltipActive')}
            </p>
          </AccordionTrigger>
          <AccordionContent>
            <InputBorderGradient
              unit="USDT"
              placeHolder={t('orderForm.trailingTab.activationPrice')}
              inputClassName="flex-1 text-[11px]"
              containerClassName="w-full p-0 !min-h-[28px] !h-[30px]"
              innerBgClassName="bg-[#141414] !h-[28px]"
              containerInputClassName="bg-[#201e25] h-[28px] px-3 pt-1 pb-1"
              unitClassName="text-[9px] leading-none min-w-[32px] text-xs text-[#908e98]"
              // isFocusShowTooltip={true}
              hasValue={!!watch('triggerPrice')}
              textTooltip={t('orderForm.trailingTab.activationPrice')}
              inputProps={{
                ...register('triggerPrice', {
                  onChange: onTriggerPrice,
                }),
                onKeyDown: (e) => onKeyDownValidateInput(e, decimals),
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default FormTrailing
