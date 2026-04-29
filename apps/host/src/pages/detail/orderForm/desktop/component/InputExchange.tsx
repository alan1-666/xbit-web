import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import InputBorderGradient from '@/components/orderForm/InputBorderGradient'
import { Controller, useFormContext } from 'react-hook-form'
import { LIMIT_DECIMAL_PRICE, onKeyDownValidateInput, OrderFormType } from '../../useOrderForm'
import IconArrowSwap3 from '@/components/icon/stroke/IconArrowSwap3'
import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import SliderForm from './SliderForm'
import { useAppSelector } from '@/redux/store'
import { getDefaultDecimalsByChain } from '@/lib/blockchain'

const InputExchange = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const { t } = useTranslation()
  const { control, watch, setValue } = useFormContext<OrderFormType>()
  const [inputType, setInputType] = useState<'price' | 'marketCap'>('price')
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const decimals = tokenDetail?.decimals ? tokenDetail?.decimals : getDefaultDecimalsByChain(activeChain)

  const onChangeLimit = (val: string) => {
    let value = val.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    if (inputType === 'price') {
      setValue('limitPrice', value)
    } else {
      setValue('limitMarketCap', value)
    }
  }

  // useEffect(() => {
  //   if (tokenDetail) {
  //     if (inputType === 'price' && !!tokenDetail?.price) {
  //       setValue('limitPrice', formatSmallPrice(+tokenDetail?.price))
  //     }
  //     if (inputType === 'marketCap') {
  //       setValue('limitMarketCap', formatSmallPrice(+tokenDetail?.marketCap))
  //     }
  //   }
  // }, [tokenDetail, inputType])

  useEffect(() => {
    setValue('quoteAmount', '')
    setValue('baseAmount', '')
    setValue('percent', '')
  }, [inputType])

  return (
    <div>
      <Controller
        // name="limitMarketCap"
        name={inputType === 'price' ? 'limitPrice' : 'limitMarketCap'}
        control={control}
        render={({ field }) => (
          <InputBorderGradient
            unit={'USD'}
            placeHolder={t('orderForm.form.amount')}
            inputClassName="flex-1"
            containerClassName="mt-5 w-full p-0"
            innerBgClassName="bg-[#141414]"
            containerInputClassName="bg-[#ececed14] h-[48px] px-3 pt-2 pb-1"
            unitClassName="min-w-[32px] text-xs"
            value={field.value}
            // isFocusShowTooltip={true}
            // textTooltip={`${tooltipText}` + ` (` + `${activeChain.toUpperCase()}` + `)`}
            hasValue={inputType === 'price' ? !!watch('limitPrice') : !!watch('limitMarketCap')}
            inputProps={{
              onKeyDown: (e) => onKeyDownValidateInput(e, LIMIT_DECIMAL_PRICE),
            }}
            onChange={(value: string) => {
              onChangeLimit(value)
            }}
            isShowPrefix={true}
            prefix={
              <div className="flex items-center gap-2.5">
                {/* <p className="text-base font-[330]">{t('transaction.marketCap')}</p> */}
                <p className="text-base font-[330] text-white/80 min-w-10">
                  {inputType === 'price' ? t('orderForm.form.price') : t('orderForm.form.limitMC')}
                </p>
                <IconArrowSwap3
                  className="w-3.5 h-3.5 text-[#878787] cursor-pointer"
                  onClick={() => {
                    setInputType((prev) => {
                      if (prev === 'price') return 'marketCap'
                      return 'price'
                    })
                  }}
                />
              </div>
            }
          />
        )}
      />
      <SliderForm tokenDetail={tokenDetail} inputType={inputType} />
    </div>
  )
}

export default InputExchange
