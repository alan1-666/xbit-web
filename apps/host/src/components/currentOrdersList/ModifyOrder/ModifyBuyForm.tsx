import { TransactionType } from '@/@generated/gql/graphql-core'
import { ModifyOrderInput, Order } from '@/@generated/gql/graphql-trading'
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'
import ImgWithFallback from '@/components/common/ImgWithFallback'
import SliderGradient from '@/components/orderForm/SliderGradient'
import { Button } from '@/components/ui/button'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { getChainId, getDefaultDecimalsByChain } from '@/lib/blockchain'
import { formatPrice, formatVolume } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client'
import { useSubscription } from '@/lib/mqtt'
import { formatInputNumber, formatSmallPrice } from '@/lib/number.ts'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { useAppSelector } from '@/redux/store'
import { modifyOrderMutation } from '@/services/order.service'
import { ChainIds } from '@/types/enums'
import { zodResolver } from '@hookform/resolvers/zod'
import useTokenPriceAndMC from '@hooks/useTokenPriceAndMC.ts'
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { z } from 'zod'
import CardTag from '../CardTag'
import InputPrice from './InputPrice'
import InputUnit from './InputUnit'

function getStep(num: number): number {
  const str = num.toString()
  const decimalPart = str.split('.')[1]
  if (!decimalPart) return 1 // No decimals, step is 1
  const precision = decimalPart.length
  return Math.pow(10, -precision)
}

function safeSub(num: number, step: number) {
  // Determine decimal precision from step size (e.g., 1e-7 → 7 digits)
  const stepStr = step.toExponential().split('e-')
  const precision = stepStr.length === 2 ? parseInt(stepStr[1], 10) : 0

  // Perform subtraction and round to the correct number of digits
  const result = num - step
  return parseFloat(result.toFixed(precision))
}

/**
 * Zod schema for the modify buy form validation
 */
const modifyBuyFormSchema = z.object({
  id: z.string({
    required_error: 'required',
  }),
  limitPrice: z.string(),
  limitMarketCap: z.string().optional(),
  quoteAmount: z.string(),
  exchangeCoin: z.string(),
  doublePrincipalAfterPurchase: z.boolean(),
})

/**
 * Calculates the exchange coin amount based on quote amount, rate, and token price
 * @param {number} quoteAmount - The quote amount in chain currency
 * @param {number} rate - The exchange rate between chain currency and USD
 * @param {number} tokenPrice - The token price in USD
 * @returns {number} The calculated exchange coin amount
 */
const calculateExchangeCoin = (quoteAmount: number, rate: number, tokenPrice: number) => {
  if (!quoteAmount || !rate || !tokenPrice) return 0
  return (quoteAmount * rate) / tokenPrice
}

/**
 * Calculates the quote amount based on exchange coin amount, token price, and rate
 * @param {number} amountExchangeCoin - The amount of exchange coins
 * @param {number} tokenPrice - The token price in USD
 * @param {number} rate - The exchange rate between chain currency and USD
 * @returns {number} The calculated quote amount in chain currency
 */
const calculateQuoteAmount = (amountExchangeCoin: number, tokenPrice: number, rate: number) => {
  if (!amountExchangeCoin || !tokenPrice || !rate) return 0
  return (amountExchangeCoin * tokenPrice) / rate
}

export type ModifyBuyFormValues = z.infer<typeof modifyBuyFormSchema>

/**
 * Props for the ModifyBuyForm component
 */
interface ModifyBuyFormProps {
  /** The order object to modify */
  order: Order
  /** Optional state setter to close the parent drawer */
  setOpen?: Dispatch<SetStateAction<boolean>>
  refetch?: () => void
  quantityLimitBuy: string
  orderAmountLimitBuy: string
}

/**
 * ModifyBuyForm component provides a form to modify an existing buy order
 * @param {Order} order - The order object to modify
 * @param {Dispatch<SetStateAction<boolean>>} [setOpen] - Optional state setter to close the parent drawer
 */
const ModifyBuyForm: React.FC<ModifyBuyFormProps> = ({
  order,
  setOpen,
  refetch,
  quantityLimitBuy,
  orderAmountLimitBuy,
}) => {
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const rateChainToUsd = useAppSelector(priceChain(activeChain))
  const [tokenPrice, setTokenPrice] = useState<number>(0)
  const [tokenMC, setTokenMC] = useState<number>(0)
  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const [_isLoading, setLoading] = useState(false)
  const baseAddress = order?.baseAddress
  const decimal = order?.baseDecimal ? order?.baseDecimal : getDefaultDecimalsByChain(activeChain)

  const {
    tokenPrice: initTokenPrice,
    marketCap: initMarketCap,
    totalSupply: initTotalSupply,
  } = useTokenPriceAndMC(baseAddress)

  const chain: ChainIds = order?.chainId as unknown as ChainIds
  const { logo: logoUrl } = useTokenInfo(baseAddress, chain)
  const transactionType = order?.transactionType
  // const orderType = order?.type
  const doublePrincipalAfterPurchase = order?.doublePrincipalAfterPurchase ?? false
  const limitPrice = order?.limitPrice ?? ''
  // const quoteAmount = order?.quoteAmount ?? ''
  // const calculatedBaseAmount = (+orderAmountLimitBuy * rateChainToUsd) / +limitPrice
  // const baseAmount = order?.baseAmount && order?.baseAmount !== '0' ? order?.baseAmount : calculatedBaseAmount
  // const defaultExchangeCoin = order?.baseAmount ?? ''
  const balance = activeWallet?.balance?.formatted
  const baseSymbol = order?.baseSymbol ?? ''
  const chainId = getChainId(activeChain)

  // const messageTokenPrice = useSubscription(`public/prices/usd/${baseAddress}`)`public/kline/ohlc_1d/${token.token}`
  const messageTokenOHLC = useSubscription(`public/kline/ohlc_1s/${chainId}/${baseAddress}`)

  const defaultValues: ModifyBuyFormValues = {
    id: order?.id,
    limitPrice,
    limitMarketCap: order?.limitMarketCap || '',
    quoteAmount: formatInputNumber(+orderAmountLimitBuy, getDefaultDecimalsByChain(activeChain)),
    doublePrincipalAfterPurchase,
    exchangeCoin: formatInputNumber(+quantityLimitBuy, decimal),
  }

  const methods = useForm<ModifyBuyFormValues>({
    resolver: zodResolver(modifyBuyFormSchema),
    defaultValues,
  })

  const {
    handleSubmit,
    setValue,
    register,
    getValues,
    // reset,
    // watch,
    // formState: { errors },
  } = methods

  const submitModifyOrder = useCallback(async (formValues: ModifyBuyFormValues) => {
    if (order.status === 'Confirmed') {
      toast.error(t('orderForm.errors.orderTriggered'))
      return
    }
    if (setOpen) {
      setOpen(false)
    }

    try {
      setLoading(true)
      const mutationInput: ModifyOrderInput = {
        id: formValues.id,
        limitPrice: formValues.limitPrice,
        quoteAmount: formValues.quoteAmount,
        doublePrincipalAfterPurchase: formValues.doublePrincipalAfterPurchase,
      }
      if (formValues.limitMarketCap) {
        mutationInput.limitMarketCap = formValues.limitMarketCap
      }

      const res = await tradingClient.mutate({
        mutation: modifyOrderMutation,
        variables: {
          input: mutationInput,
        },
      })

      if (res?.data?.modifyOrder?.id) {
        toast.success(t('toast.modifyOrderSuccess'))
        refetch?.()
      }
      return res
    } catch (error) {
      console.log(error)
      setLoading(false)
      throw error
    }
  }, [])

  const onChangeLimitPrice = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('limitPrice', value)
    setSliderValue([0])
  }

  const onChangeLimitMarketCap = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('limitMarketCap', value)
    setSliderValue([0])
  }

  // quote amount change handler
  const onChangeQuoteAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('quoteAmount', value)

    const exchangeCoin = calculateExchangeCoin(+value, +rateChainToUsd, +tokenPrice)
    // setValue('exchangeCoin', +exchangeCoin > 0 ? formatInputValue(exchangeCoin, 6) + '' : '')
    setValue(
      'exchangeCoin',
      +exchangeCoin > 0 ? formatInputNumber(exchangeCoin, getDefaultDecimalsByChain(activeChain)) + '' : '',
    )

    const percentageCalculated = (+value * 100) / balance
    const percentageLimited = percentageCalculated < 0 ? 0 : percentageCalculated > 100 ? 100 : percentageCalculated
    setSliderValue([percentageLimited])

    // const quoteAmount = (+val * balance) / 100
  }

  // exchange coin change handler
  const onChangeExchangeCoin = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('exchangeCoin', value)

    const quoteAmount = calculateQuoteAmount(+value, tokenPrice, rateChainToUsd)
    // setValue('quoteAmount', +quoteAmount > 0 ? formatInputValue(quoteAmount, 6) + '' : '')
    setValue(
      'quoteAmount',
      +quoteAmount > 0 ? formatInputNumber(quoteAmount, getDefaultDecimalsByChain(activeChain)) + '' : '',
    )

    const percentageCalculated = (+quoteAmount * 100) / balance
    const percentageLimited = percentageCalculated < 0 ? 0 : percentageCalculated > 100 ? 100 : percentageCalculated
    setSliderValue([percentageLimited])
  }

  // slider change handler
  const onChangeSlider = (value: number[]) => {
    setSliderValue(value)
    const val = value[0]

    if (+val > 0 && balance) {
      // const quoteAmount = formatInputValue((+val * balance) / 100)
      const quoteAmount = (+val * balance) / 100
      setValue(
        'quoteAmount',
        quoteAmount > 0 ? formatInputNumber(+quoteAmount, getDefaultDecimalsByChain(activeChain)).toString() : '',
      )
      const exchangeCoin = calculateExchangeCoin(+quoteAmount, rateChainToUsd, +tokenPrice)
      // setValue('exchangeCoin', formatInputValue(exchangeCoin, 6))
      setValue('exchangeCoin', formatInputNumber(+exchangeCoin, getDefaultDecimalsByChain(activeChain)).toString())
    }

    if (+val <= 0) {
      setValue('quoteAmount', formatInputNumber(+orderAmountLimitBuy, getDefaultDecimalsByChain(activeChain)))
      setValue('exchangeCoin', formatInputNumber(+quantityLimitBuy, decimal))
    }

    // if (+totalToken > 0 && transactionType === TransactionType.Sell) {
    //   const baseAmount = formatInputValue((+val * +totalToken) / 100, 6)
    //   setValue('baseAmount', +baseAmount > 0 ? baseAmount : '')
    //   const priceUsd = formatInputValue(+baseAmount * +tokenPrice)
    //   setValue('quoteAmount', +priceUsd > 0 ? formatInputValue(+priceUsd / +rateChainToUsd) : '')
    // }
  }

  const handleMinus = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (order?.limitMarketCap != 0) {
      const limitMarketCapValue = getValues('limitMarketCap') ?? '0'
      const step = getStep(+formatSmallPrice(+limitMarketCapValue))
      setValue('limitMarketCap', safeSub(+limitMarketCapValue, step) + '')
    } else {
      const step = getStep(+formatSmallPrice(+getValues('limitPrice')))
      setValue('limitPrice', safeSub(+getValues('limitPrice'), step) + '')
    }
  }

  const handlePlus = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (order?.limitMarketCap != 0) {
      const limitMarketCapValue = getValues('limitMarketCap') ?? '0'
      const step = getStep(+formatSmallPrice(+limitMarketCapValue))
      setValue('limitMarketCap', safeSub(+limitMarketCapValue, -step) + '')
    } else {
      const step = getStep(+formatSmallPrice(+getValues('limitPrice')))
      setValue('limitPrice', safeSub(+getValues('limitPrice'), -step) + '')
    }
  }

  // useEffect(() => {
  //   if (!messageTokenPrice) return
  //   try {
  //     const messageTokenPriceData = messageTokenPrice?.message?.message
  //     const data = JSON.parse(messageTokenPriceData?.toString() || '')
  //     if (data) {
  //       setTokenPrice(data?.usd_price)
  //     }
  //   } catch (error) {
  //     console.warn('WalletBalanceSubscription error: ', error)
  //   }
  // }, [messageTokenPrice])

  useEffect(() => {
    let isMounted = true
    if (!messageTokenOHLC) return

    try {
      const messageTokenOHLCData = messageTokenOHLC?.message?.message
      const data = JSON.parse(messageTokenOHLCData?.toString() || '')
      const newPrice = data?.c ?? 0
      const currentTokenMC = +newPrice * initTotalSupply

      if (newPrice && isMounted) {
        setTokenPrice(newPrice)
      }
      if (currentTokenMC && isMounted) {
        setTokenMC(currentTokenMC)
      }
    } catch (error) {
      console.warn('WalletBalanceSubscription error: ', error)
    }

    return () => {
      isMounted = false
    }
  }, [messageTokenOHLC])

  useEffect(() => {
    let isMounted = true

    if (isMounted) {
      setTokenPrice(initTokenPrice)
      setTokenMC(initMarketCap)
    }

    return () => {
      isMounted = false
    }
  }, [initTokenPrice, initMarketCap])

  const labelType = useMemo(() => {
    if (+order?.limitMarketCap > 0) return t('orderBook.marketCap')
    return t('orderForm.form.price')
  }, [order])

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submitModifyOrder)}>
        <div className="relative overflow-hidden mb-6">
          <div className="flex items-center justify-between gap-[10px] p-3.5 pr-4.5 bg-[#2b2b34] relative z-1 rounded-[10px]">
            <div className="flex items-center gap-[10px]">
              <ImgWithFallback
                src={logoUrl}
                srcFallback="/images/xbit-logo-rounded.webp"
                sharedClassName="w-[48px] min-w-[48px] h-[48px] rounded-full"
              />
              <div>
                <div className="text-[calc(1rem*(14/16))] text-white leading-none mb-[6px]">{baseSymbol}</div>
                <CardTag type={transactionType === TransactionType.Buy ? 'limitBuy' : 'limitSell'} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-[20px] text-right">
              <div>
                <div className="text-[calc(1rem*(11/16))] text-[#8c8c94] leading-none">
                  {t('modifyOrder.latestPrice')}
                </div>
                <span className="text-[calc(1rem*(13/16))] text-white leading-none font-[380]">
                  {formatPrice(tokenPrice, {
                    showCurrency: true,
                  })}
                </span>
              </div>
              <div>
                <div className="text-[calc(1rem*(11/16))] text-[#8c8c94] leading-none">
                  {t('modifyOrder.latestMarketCap')}
                </div>
                <span className="text-[calc(1rem*(12/16))] text-white leading-none">
                  {+tokenMC > 0
                    ? formatVolume(tokenMC, {
                        showCurrency: true,
                      })
                    : '--'}
                </span>
              </div>
            </div>
          </div>
          {/* glowing bg */}
          {/* <div className="absolute w-[81px] h-[103px] top-0 right-0 bg-[#08FFB529] blur-[40px] z-0" />
          <div className="absolute w-[99px] h-[125px] bottom-0 left-0 bg-[#9945FF3D] blur-[50px] z-0" /> */}
          {/* end glowing bg */}
          <div className="relative z-1">
            <div className="flex items-center mt-6">
              <div className="w-1/4 font-[380] text-[14px] leading-[22px] text-white">{labelType}</div>
              <div className="flex-1">
                {+order?.limitMarketCap > 0 ? (
                  <InputPrice
                    label={t('modifyOrder.buyMarketCap')}
                    onMinus={handleMinus}
                    onPlus={handlePlus}
                    inputProps={{
                      defaultValue: order?.limitMarketCap,
                      onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                      ...register('limitMarketCap', {
                        onChange: onChangeLimitMarketCap,
                      }),
                    }}
                  />
                ) : (
                  <InputPrice
                    label={t('modifyOrder.buyPrice')}
                    onMinus={handleMinus}
                    onPlus={handlePlus}
                    inputProps={{
                      defaultValue: order?.limitPrice,
                      onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                      ...register('limitPrice', {
                        onChange: onChangeLimitPrice,
                      }),
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center mt-5">
              <div className="w-1/4 font-[380] text-[14px] leading-[22px] text-white">{t('modifyOrder.quantity')}</div>
              <div className="flex-1">
                <InputUnit
                  label={t('modifyOrder.quantity')}
                  unit={order?.quoteSymbol}
                  inputProps={{
                    onKeyDown: (e) => onKeyDownValidateInput(e, getDefaultDecimalsByChain(activeChain)),
                    ...register('quoteAmount', {
                      onChange: onChangeQuoteAmount,
                    }),
                  }}
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-1/4 font-[380] text-[14px] leading-[22px] text-white"></div>
              <div className="flex-1">
                <SliderGradient
                  containerClassName="mt-8 mb-6"
                  sliderValue={sliderValue}
                  onSliderValueChange={(value) => onChangeSlider(value)}
                  showValue={true}
                />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <div className="w-1/4 font-[380] text-[14px] leading-[22px] text-white">
                {t('orderForm.form.estimatedExchange')}
              </div>
              <div className="flex-1">
                <InputUnit
                  label={t('modifyOrder.estimatedExchange')}
                  unit={baseSymbol}
                  inputProps={{
                    onKeyDown: (e) => onKeyDownValidateInput(e, getDefaultDecimalsByChain(activeChain)),
                    ...register('exchangeCoin', {
                      onChange: onChangeExchangeCoin,
                    }),
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-[10px] mt-6">
              <CheckboxWithLabel
                label={t('modifyOrder.doublePrincipalAfterPurchase')}
                defaultChecked={doublePrincipalAfterPurchase}
                labelWrapperClassName="text-[13px] font-[330] text-[#cccadb]"
                onChange={(value) => {
                  setValue('doublePrincipalAfterPurchase', value ?? false)
                }}
              />
            </div>
          </div>
          {/* <div className="flex flex-col gap-[16px] px-[12px] pt-4 pb-5">
              <div className="flex flex-col gap-[12px]">
                {order?.limitMarketCap != 0 ? (
                  <InputPrice
                    label={t('modifyOrder.buyMarketCap')}
                    onMinus={handleMinus}
                    onPlus={handlePlus}
                    inputProps={{
                      defaultValue: order?.limitMarketCap,
                      onKeyDown: handleOnInput,
                      ...register('limitMarketCap', {
                        onChange: onChangeLimitMarketCap,
                      }),
                    }}
                  />
                ) : (
                  <InputPrice
                    label={t('modifyOrder.buyPrice')}
                    onMinus={handleMinus}
                    onPlus={handlePlus}
                    inputProps={{
                      defaultValue: order?.limitPrice,
                      onKeyDown: handleOnInput,
                      ...register('limitPrice', {
                        onChange: onChangeLimitPrice,
                      }),
                    }}
                  />
                )}
                <InputUnit
                  label={t('modifyOrder.quantity')}
                  unit={getNativeTokenByActiveChain(activeChain)}
                  inputProps={{
                    onKeyDown: handleOnInput,
                    ...register('quoteAmount', {
                      onChange: onChangeQuoteAmount,
                    }),
                  }}
                />
              </div>
              <SliderGradient
                containerClassName="mt-[16px] mb-[26px]"
                sliderValue={sliderValue}
                onSliderValueChange={(value) => onChangeSlider(value)}
                showValue={true}
              />
              <InputUnit
                label={t('modifyOrder.estimatedExchange')}
                unit={baseSymbol}
                inputProps={{
                  onKeyDown: handleOnInput,
                  ...register('exchangeCoin', {
                    onChange: onChangeExchangeCoin,
                  }),
                }}
              />
              <div className="flex items-center justify-between gap-[10px]">
                <CheckboxWithLabel
                  label={t('modifyOrder.doublePrincipalAfterPurchase')}
                  defaultChecked={doublePrincipalAfterPurchase}
                  onChange={(value) => {
                    setValue('doublePrincipalAfterPurchase', value ?? false)
                  }}
                />
              </div>
            </div> */}
        </div>
        <div className="flex gap-[8px] mb-[16px] mt-8">
          <Button
            type="submit"
            variant="gradient"
            className="h-[44px] !bg-[#843bea] rounded-[24px] text-[calc(1rem*(16/16))] leading-none hover-scale !shadow-inset-purple"
          >
            {t('modifyOrder.confirm')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default ModifyBuyForm
