import { TransactionType } from '@/@generated/gql/graphql-core'
import { ModifyOrderInput, Order } from '@/@generated/gql/graphql-trading'
import ImgWithFallback from '@/components/common/ImgWithFallback'
import Loader from '@/components/common/Loader'
import SliderGradient from '@/components/orderForm/SliderGradient'
import { Button } from '@/components/ui/button'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { getChainId, getDefaultDecimalsByChain, getNativeTokenByActiveChain } from '@/lib/blockchain'
import { formatPrice, formatVolume } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client'
import { useSubscription } from '@/lib/mqtt'
import { formatInputNumber, formatSmallPrice } from '@/lib/number.ts'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { useAppSelector } from '@/redux/store'
import { modifyOrderMutation } from '@/services/order.service'
import { ChainIds } from '@/types/enums'
import { zodResolver } from '@hookform/resolvers/zod'
import useTokenPriceAndMC from '@hooks/useTokenPriceAndMC.ts'
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import CardTag from '../CardTag'
import InputPrice from './InputPrice'
import InputUnit from './InputUnit'
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'

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
const ModifySellFormSchema = z.object({
  id: z.string({
    required_error: 'required',
  }),
  limitPrice: z.string(),
  limitMarketCap: z.string().optional(),
  quoteAmount: z.string(),
  baseAmount: z.string(),
})

/**
 * Calculates the base amount based on quote amount, rate, and token price
 * @param {number} quoteAmount - The quote amount in chain currency
 * @param {number} rate - The exchange rate between chain currency and USD
 * @param {number} tokenPrice - The token price in USD
 * @returns {number} The calculated base amount
 */
const calculateBaseAmount = (quoteAmount: number, rate: number, tokenPrice: number) => {
  if (!quoteAmount || !rate || !tokenPrice) return 0
  return (quoteAmount * rate) / tokenPrice
}

/**
 * Calculates the quote amount based on base amount, token price, and rate
 * @param {number} baseAmount - The base amount
 * @param {number} tokenPrice - The token price in USD
 * @param {number} rate - The exchange rate between chain currency and USD
 * @returns {number} The calculated quote amount in chain currency
 */
const calculateQuoteAmount = (baseAmount: number, tokenPrice: number, rate: number) => {
  if (!baseAmount || !tokenPrice || !rate) return 0
  return (baseAmount * tokenPrice) / rate
}

export type ModifySellFormValues = z.infer<typeof ModifySellFormSchema>

/**
 * Props for the ModifySellForm component
 */
interface ModifySellFormProps {
  /** The order object to modify */
  order: Order
  /** Optional state setter to close the parent drawer */
  setOpen?: Dispatch<SetStateAction<boolean>>
  refetch?: () => void
  totalToken: number | string
  quantityLimitSell: string
  orderAmountLimitSell: string
}

/**
 * ModifySellForm component provides a form to modify an existing buy order
 * @param {Order} order - The order object to modify
 * @param {Dispatch<SetStateAction<boolean>>} [setOpen] - Optional state setter to close the parent drawer
 */
const ModifySellForm: React.FC<ModifySellFormProps> = ({
  order,
  setOpen,
  refetch,
  totalToken,
  quantityLimitSell,
  orderAmountLimitSell,
}) => {
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const rateChainToUsd = useAppSelector(priceChain(activeChain))
  const [tokenPrice, setTokenPrice] = useState<number>(0)
  const [tokenMC, setTokenMC] = useState<number>(0)
  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const [_isLoading, setLoading] = useState(false)
  const baseAddress = order?.baseAddress

  const {
    tokenPrice: initTokenPrice,
    marketCap: initMarketCap,
    totalSupply: initTotalSupply,
    loading: initLoading,
  } = useTokenPriceAndMC(baseAddress)

  const chain: ChainIds = order?.chainId as unknown as ChainIds
  const { logo: logoUrl } = useTokenInfo(baseAddress, chain)
  const transactionType = order?.transactionType
  const orderType = order?.type
  const limitPrice = orderType === 'TPSL' ? order?.tp2 : (order?.limitPrice ?? '')
  const chainId = getChainId(activeChain)
  const decimal = order?.baseDecimal ? order?.baseDecimal : getDefaultDecimalsByChain(activeChain)
  const baseSymbol = order?.baseSymbol ?? ''
  const doublePrincipalAfterPurchase = order?.doublePrincipalAfterPurchase
  const messageTokenOHLC = useSubscription(`public/kline/ohlc_1s/${chainId}/${baseAddress}`)

  const defaultValues: ModifySellFormValues = {
    id: order?.id,
    limitPrice,
    limitMarketCap: order?.limitMarketCap || '',
    quoteAmount: formatInputNumber(+orderAmountLimitSell, getDefaultDecimalsByChain(activeChain)),
    baseAmount: formatInputNumber(+quantityLimitSell, decimal),
  }

  const methods = useForm<ModifySellFormValues>({
    resolver: zodResolver(ModifySellFormSchema),
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

  const submitModifyOrder = useCallback(
    async (formValues: ModifySellFormValues) => {
      if (order.status === 'Confirmed') {
        toast.error(t('orderForm.errors.orderTriggered'))
        return
      }
      // base amount validation
      if (+formValues.baseAmount > +totalToken) {
        toast.error(t('currentOrdersList.toast.insufficientTokenBalance'))
        return
      }
      if (+formValues.baseAmount <= 0) {
        toast.error(t('currentOrdersList.toast.invalidSellAmount'))
        return
      }
      // end base amount validation

      if (setOpen) {
        setOpen(false)
      }

      try {
        setLoading(true)
        const mutationInput: ModifyOrderInput = {
          id: formValues.id,
          limitPrice: formValues.limitPrice,
          baseAmount: formValues.baseAmount,
        }
        if (formValues.limitMarketCap && +formValues.limitMarketCap > 0) {
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
    },
    [totalToken, t, setOpen, refetch],
  )

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

    const baseAmount = calculateBaseAmount(+value, rateChainToUsd, tokenPrice)
    setValue('baseAmount', +baseAmount > 0 ? formatInputNumber(baseAmount, 6) + '' : '')

    const percentageCalculated = (+baseAmount * 100) / +totalToken
    const percentageLimited = percentageCalculated < 0 ? 0 : percentageCalculated > 100 ? 100 : percentageCalculated
    setSliderValue([percentageLimited])
  }

  // base amount change handler
  const onChangeBaseAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('baseAmount', value)

    const quoteAmount = calculateQuoteAmount(+value, tokenPrice, rateChainToUsd)
    // setValue('quoteAmount', +quoteAmount > 0 ? formatInputValue(quoteAmount, 6) + '' : '')
    setValue(
      'quoteAmount',
      +quoteAmount > 0 ? formatInputNumber(quoteAmount, getDefaultDecimalsByChain(activeChain)) + '' : '',
    )

    const percentageCalculated = (+value * 100) / +totalToken
    const percentageLimited = percentageCalculated < 0 ? 0 : percentageCalculated > 100 ? 100 : percentageCalculated
    setSliderValue([percentageLimited])
  }

  // slider change handler
  const onChangeSlider = (value: number[]) => {
    if (orderType === 'TPSL') return
    setSliderValue(value)
    const val = value[0]

    // if (+val > 0 && balance && transactionType === TransactionType.Buy) {
    //   const quoteAmount = formatInputValue((+val * balance) / 100)
    //   setValue('quoteAmount', quoteAmount)
    //   const baseAmount = calculateBaseAmount(+quoteAmount, rateChainToUsd, tokenPrice)
    //   setValue('baseAmount', +baseAmount > 0 ? formatInputValue(baseAmount, 6) + '' : '')
    // }
    if (+val > 0 && +totalToken > 0) {
      // const baseAmount = formatInputValue((+val * +totalToken) / 100, 6)
      const baseAmount = (+val * +totalToken) / 100
      setValue('baseAmount', formatInputNumber(baseAmount, decimal).toString())
      // const priceUsd = formatInputValue(+baseAmount * +tokenPrice)
      const priceUsd = +baseAmount * +tokenPrice
      setValue(
        'quoteAmount',
        formatInputNumber(+priceUsd / +rateChainToUsd, getDefaultDecimalsByChain(activeChain)).toString(),
      )
    }

    if (+val <= 0) {
      setValue('baseAmount', formatInputNumber(+quantityLimitSell, decimal))
      setValue('quoteAmount', formatInputNumber(+orderAmountLimitSell, getDefaultDecimalsByChain(activeChain)))
    }
  }

  const handleMinus = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if(orderType === 'TPSL') return
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
    if(orderType === 'TPSL') return
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
      {orderType === 'TPSL' && (
        <p className="text-[11px] leading-none text-[#ffffffcc] mb-[10px]">
          {t('currentOrdersList.orderTPSLTriggeredModify')}
        </p>
      )}
      <form onSubmit={handleSubmit(submitModifyOrder)}>
        <div className="relative overflow-hidden mb-6">
          <div className="flex items-center justify-between gap-[10px] p-3.5 pr-4.5 bg-[#2b2b34] relative z-1 rounded-[10px]">
            <div className="flex items-center gap-[10px]">
              <ImgWithFallback
                src={logoUrl}
                srcFallback="/images/kairox-logo-rounded.svg"
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
                <span className="text-[calc(1rem*(12/16))] text-white leading-none">
                  {initLoading ? (
                    <Loader />
                  ) : (
                    formatPrice(tokenPrice, {
                      showCurrency: true,
                    })
                  )}
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
                      onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                      ...register('limitMarketCap', {
                        onChange: onChangeLimitMarketCap,
                        disabled: orderType === 'TPSL' ? true : false,
                      }),
                    }}
                    containerClassName={`${orderType === 'TPSL' ? '**:!cursor-not-allowed' : ''}`}
                  />
                ) : (
                  <InputPrice
                    label={t('modifyOrder.buyPrice')}
                    onMinus={handleMinus}
                    onPlus={handlePlus}
                    inputProps={{
                      onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                      ...register('limitPrice', {
                        onChange: onChangeLimitPrice,
                        disabled: orderType === 'TPSL' ? true : false,
                      }),
                    }}
                    containerClassName={`${orderType === 'TPSL' ? '**:!cursor-not-allowed' : ''}`}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center mt-5">
              <div className="w-1/4 font-[380] text-[14px] leading-[22px] text-white">{t('modifyOrder.quantity')}</div>
              <div className="flex-1">
                {/* <InputUnit
                  label={t('modifyOrder.estimatedExchange')}
                  unit={baseSymbol}
                  className={orderType === 'TPSL' ? 'cursor-not-allowed' : ''}
                  inputProps={{
                    onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                    ...register('baseAmount', {
                      onChange: onChangeBaseAmount,
                      disabled: orderType === 'TPSL' ? true : false,
                    }),
                  }}
                /> */}
                <InputUnit
                  label={t('modifyOrder.quantity')}
                  unit={baseSymbol}
                  className={orderType === 'TPSL' ? 'cursor-not-allowed' : ''}
                  inputProps={{
                    onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                    ...register('baseAmount', {
                      onChange: onChangeBaseAmount,
                      disabled: orderType === 'TPSL' ? true : false,
                    }),
                  }}
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-1/4 font-[380] text-[14px] leading-[22px] text-white"></div>
              <div className="flex-1">
                <SliderGradient
                  containerClassName={`mt-6 mb-6 ${orderType === 'TPSL' ? '**:!cursor-not-allowed' : ''}`}
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
                  unit={getNativeTokenByActiveChain(activeChain)}
                  className={orderType === 'TPSL' ? 'cursor-not-allowed' : ''}
                  inputProps={{
                    onKeyDown: (e) => onKeyDownValidateInput(e, getDefaultDecimalsByChain(activeChain)),
                    ...register('quoteAmount', {
                      onChange: onChangeQuoteAmount,
                      disabled: orderType === 'TPSL' ? true : false,
                    }),
                  }}
                />
              </div>
            </div>
          </div>
          {/* checkbox area */}
          {doublePrincipalAfterPurchase && (
            <div className="pt-4">
              <CheckboxWithLabel
                label={t('orderForm.form.doublePrincipalAfterPurchase')}
                defaultChecked={doublePrincipalAfterPurchase as boolean}
                containerClassName="pointer-events-none"
              />
            </div>
          )}
        </div>
        <div className="flex gap-[8px] mb-[16px]">
          <Button
            type="submit"
            variant="gradient"
            className={`!bg-[#843bea] rounded-full text-[calc(1rem*(16/16))] text-white font-[450] hover-scale h-11 !shadow-inset-purple ${
              _isLoading || orderType === 'TPSL' ? '**:!cursor-not-allowed' : ''
            }`}
            disabled={_isLoading || orderType === 'TPSL'}
          >
            {t('modifyOrder.confirm')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default ModifySellForm
