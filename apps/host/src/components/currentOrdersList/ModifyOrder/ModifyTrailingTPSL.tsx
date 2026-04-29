import { ModifyOrderInput, Order } from '@/@generated/gql/graphql-trading'
// import { ChainIds } from '@/types/enums'
// import { getBlockChainLogo } from '@/utils/helpers'
import { TransactionType } from '@/@generated/gql/graphql-core'
import SliderGradient from '@/components/orderForm/SliderGradient'
import { Button } from '@/components/ui/button'
import { tradingClient } from '@/lib/gql/apollo-client'
import { modifyOrderMutation } from '@/services/order.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import InputUnit from './InputUnit'
// import { formatInputValue } from '@/lib/number.ts'
// import { priceChain } from '@/redux/modules/price.slice.ts'
// import { useAppSelector } from '@/redux/store'
import TrailingTabExplained from '@/components/orderForm/TrailingTabExplained'
import { useSubscription } from '@/lib/mqtt'
import { cn } from '@/lib/utils.ts'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { getDefaultDecimalsByChain } from '@/lib/blockchain'
import { useAppSelector } from '@/redux/store'
import { formatInputNumber } from '@/lib/number'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import Decimal from 'decimal.js'
// function getStep(num: number): number {
//   const str = num.toString()
//   const decimalPart = str.split('.')[1]
//   if (!decimalPart) return 1 // No decimals, step is 1
//   const precision = decimalPart.length
//   return Math.pow(10, -precision)
// }

// function safeSub(num: number, step: number) {
//   // Determine decimal precision from step size (e.g., 1e-7 → 7 digits)
//   const stepStr = step.toExponential().split('e-')
//   const precision = stepStr.length === 2 ? parseInt(stepStr[1], 10) : 0
//
//   // Perform subtraction and round to the correct number of digits
//   const result = num - step
//   return parseFloat(result.toFixed(precision))
// }

/**
 * Zod schema for the modify buy form validation
 */
const ModifyTrailingTPSLSchema = z.object({
  id: z.string({
    required_error: 'required',
  }),
  callbackRate: z.string(),
  baseAmount: z.string(),
  triggerPrice: z.string(),
})

/**
 * Calculates the base amount based on quote amount, rate, and token price
 * @param {number} quoteAmount - The quote amount in chain currency
 * @param {number} rate - The exchange rate between chain currency and USD
 * @param {number} tokenPrice - The token price in USD
 * @returns {number} The calculated base amount
 */
// const calculateBaseAmount = (quoteAmount: number, rate: number, tokenPrice: number) => {
//   if (!quoteAmount || !rate || !tokenPrice) return 0
//   return quoteAmount * rate / tokenPrice
// }

/**
 * Calculates the quote amount based on base amount, token price, and rate
 * @param {number} baseAmount - The base amount
 * @param {number} tokenPrice - The token price in USD
 * @param {number} rate - The exchange rate between chain currency and USD
 * @returns {number} The calculated quote amount in chain currency
 */
// const calculateQuoteAmount = (baseAmount: number, tokenPrice: number, rate: number) => {
//   if (!baseAmount || !tokenPrice || !rate) return 0
//   return (baseAmount * tokenPrice) / rate
// }

export type ModifyTrailingTPSLValues = z.infer<typeof ModifyTrailingTPSLSchema>

/**
 * Props for the ModifyTrailingTPSL component
 */
interface ModifyTrailingTPSLProps {
  /** The order object to modify */
  order: Order
  /** Optional state setter to close the parent drawer */
  setOpen?: Dispatch<SetStateAction<boolean>>
  refetch?: () => void
  totalToken: number | string
  quantityTrailingTPSL: string
}

/**
 * ModifyTrailingTPSL component provides a form to modify an existing buy order
 * @param {Order} order - The order object to modify
 * @param {Dispatch<SetStateAction<boolean>>} [setOpen] - Optional state setter to close the parent drawer
 */
const ModifyTrailingTPSL: React.FC<ModifyTrailingTPSLProps> = ({
  order,
  setOpen,
  refetch,
  totalToken,
  quantityTrailingTPSL,
}) => {
  const { t } = useTranslation()
  // const rateChainToUsd = useAppSelector(priceChain(activeChain.toUpperCase()))
  // const [_tokenPrice, setTokenPrice] = useState<number>(0)
  // const [_tokenMC, setTokenMC] = useState<number>(0)
  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const [_isLoading, setLoading] = useState(false)
  // const usdRef = useRef<HTMLInputElement>(null)
  const baseAddress = order?.baseAddress
  // const chain: ChainIds = order?.chainId as unknown as ChainIds
  // const logoUrl = getBlockChainLogo(chain, baseAddress ?? '')
  const transactionType = order?.transactionType
  // const orderType = order?.type
  // const limitPrice = order?.limitPrice ?? ''
  // const quoteAmount = order?.quoteAmount ?? ''
  // const defaultBaseAmount = order?.baseAmount ?? ''
  const triggerPrice = order?.triggerPrice
  // const balance = activeWallet?.balance?.formatted
  const baseSymbol = order?.baseSymbol ?? ''
  // const messageTokenPrice = useSubscription(`public/prices/usd/${baseAddress}`)
  const activeChainId = useActiveChainId()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  // const messageTokenStats = useSubscription(`public/token_statistic/${activeChainId}/${baseAddress}`)
  const callbackRate = new Decimal(+order?.callbackRate).times(100).toNumber()
  const trailingOrderTriggered = order?.trailingOrderTriggered
  const decimal = order?.baseDecimal ? order?.baseDecimal : getDefaultDecimalsByChain(activeChain)

  const defaultValues: ModifyTrailingTPSLValues = {
    id: order?.id,
    callbackRate: callbackRate.toString(),
    triggerPrice: !triggerPrice || triggerPrice?.toString() === '0' ? '' : formatInputNumber(triggerPrice, decimal),
    baseAmount: quantityTrailingTPSL,
  }

  const methods = useForm<ModifyTrailingTPSLValues>({
    resolver: zodResolver(ModifyTrailingTPSLSchema),
    defaultValues,
  })

  const {
    handleSubmit,
    setValue,
    register,
    // getValues,
    // reset,
    // watch,
    // formState: { errors },
  } = methods

  const submitModifyOrder = useCallback(async (formValues: ModifyTrailingTPSLValues) => {
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
        callbackRate: +formValues.callbackRate / 100,
        baseAmount: formValues.baseAmount,
      }

      if (!trailingOrderTriggered) {
        mutationInput.triggerPrice = formValues.triggerPrice
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

  // base amount change handler
  const onChangeBaseAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('baseAmount', value)
    // const priceUsd = formatInputValue(+value * +tokenPrice)
    // if (usdRef.current) {
    //   usdRef.current.value = +priceUsd > 0 ? priceUsd : ''
    // }
    // const percent = +value > 0 ? ((totalToken / +value) * 100).toFixed(0).toString() : ''
    // setValue('callbackRate', +percent >= 0 ? percent : '')
    const percentageCalculated = (+value * 100) / +totalToken
    const percentageLimited = percentageCalculated < 0 ? 0 : percentageCalculated > 100 ? 100 : percentageCalculated
    setSliderValue([percentageLimited])
  }

  // slider change handler
  const onChangeSlider = (value: number[]) => {
    if (trailingOrderTriggered) return

    setSliderValue(value)
    const val = value[0]

    if (+val > 0 && +totalToken > 0 && transactionType === TransactionType.Sell) {
      // let baseAmount = formatInputValue((+val * +totalToken) / 100, 6)
      let baseAmount = (+val * +totalToken) / 100
      if (+baseAmount < +quantityTrailingTPSL) {
        baseAmount = +quantityTrailingTPSL
      }
      setValue('baseAmount', +baseAmount > 0 ? formatInputNumber(baseAmount, decimal).toString() : '')
      // const priceUsd = formatInputValue(+baseAmount * +tokenPrice)
      // setValue('callbackRate', +val > 0 ? val + '' : '')
      // if (usdRef.current) {
      //   usdRef.current.value = +priceUsd > 0 ? priceUsd : ''
      // }
    }

    if (+val <= 0) {
      setValue('baseAmount', quantityTrailingTPSL)
    }
  }

  const handleCallbackRateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    if (value && +value <= 0) {
      e.currentTarget.value = '1'
    }
    if (+value > 99) {
      e.currentTarget.value = '99'
    }
  }, [])

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

  // useEffect(() => {
  //   if (!messageTokenStats) return
  //   try {
  //     const messageTokenStatsData = messageTokenStats?.message?.message
  //     const data = JSON.parse(messageTokenStatsData?.toString() || '')
  //     const newPrice = data?.price
  //     const currentTokenMC = data?.marketcap
  //     if (newPrice) {
  //       setTokenPrice(newPrice)
  //     }
  //     if (currentTokenMC) {
  //       setTokenMC(currentTokenMC)
  //     }
  //   } catch (error) {
  //     console.warn('WalletBalanceSubscription error: ', error)
  //   }
  // }, [messageTokenStats])

  return (
    <FormProvider {...methods}>
      <div className="relative z-1 app-font-medium text-[calc(1rem*(18/16))] text-white mb-4">
        {t('modifyOrder.trailingTPSL')}
      </div>
      {trailingOrderTriggered && (
        <p className="text-[11px] leading-none text-[#ffffffcc] mb-5 mt-1">
          {t('currentOrdersList.orderTriggeredModify')}
        </p>
      )}
      <form onSubmit={handleSubmit(submitModifyOrder)}>
        <div className="relative bg-[#232329]">
          {/* glowing bg */}
          {/* <div className="absolute w-[81px] h-[103px] top-0 right-0 bg-[#08FFB529] blur-[40px] z-0" />
          <div className="absolute w-[99px] h-[125px] bottom-0 left-0 bg-[#9945FF3D] blur-[50px] z-0" /> */}
          {/* end glowing bg */}
          <div className="relative z-1">
            {/* <div className="flex items-center justify-between gap-[10px] px-[12px] py-[16px] relative z-1 app-font-medium text-[calc(1rem*(18/16))] text-white">
              {t('modifyOrder.trailingTPSL')}
            </div> */}
            <div className="flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center">
                  <div className="w-1/4 font-[380] text-[14px] leading-[22px] text-white">
                    {t('modifyOrder.callbackRate')}
                  </div>
                  <div className="flex-1">
                    <InputUnit
                      label={t('modifyOrder.callbackRate')}
                      unit="%"
                      inputProps={{
                        onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                        ...register('callbackRate', {
                          onChange: (e) => handleCallbackRateChange(e),
                        }),
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/4 font-[380] text-[14px] leading-[22px] text-white">
                    {t('orderForm.trailingTab.soldQuantity')}
                  </div>
                  <div className="flex-1">
                    <InputUnit
                      label={t('orderForm.trailingTab.soldQuantity')}
                      unit={baseSymbol}
                      className={trailingOrderTriggered ? 'cursor-not-allowed' : ''}
                      inputProps={{
                        onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                        ...register('baseAmount', {
                          onChange: onChangeBaseAmount,
                          disabled: !!trailingOrderTriggered,
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>
              <SliderGradient
                containerClassName={cn('mt-[16px] mb-[16px]', trailingOrderTriggered && '**:!cursor-not-allowed')}
                sliderValue={sliderValue}
                onSliderValueChange={(value) => onChangeSlider(value)}
                showValue={true}
              />
              <Accordion
                type="single"
                collapsible
                defaultValue="open"
                // onValueChange={(open: string) => onOpenPriceUsd(open)}
              >
                <AccordionItem value="open" className="border-none">
                  <AccordionTrigger className="pt-0">
                    {/* <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger>
                          <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[360px]">
                          <p className="text-xs leading-none">{t('orderForm.trailingTab.tooltipText')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider> */}
                    <TrailingTabExplained />
                    <p className="text-[11px] leading-none text-[#ffffffcc] ml-1 mr-1">
                      {t('orderForm.trailingTab.tooltipActive')}
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <InputUnit
                      label={t('orderForm.trailingTab.activationPrice')}
                      unit="USDT"
                      containerClassName={`h-9 ${trailingOrderTriggered ? 'cursor-not-allowed' : ''}`}
                      className={`text-[12px] font-[380] placeholder:text-[#FFFFFFCC] text-white ${trailingOrderTriggered ? 'cursor-not-allowed' : ''}`}
                      unitClassName="text-[12px] font-[330] text-[#FFFFFFCC]"
                      inputProps={{
                        onKeyDown: (e) => onKeyDownValidateInput(e, decimal),
                        ...register('triggerPrice'),
                        disabled: !!trailingOrderTriggered,
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
        <div className="flex gap-[8px] mb-[16px] mt-8">
          <Button
            type="button"
            variant="close"
            className="flex-1"
            onClick={() => {
              if (setOpen) setOpen(false)
            }}
          >
            {t('button.cancel')}
          </Button>
          <Button
            type="submit"
            variant="gradient"
            className="h-11 rounded-full text-[calc(1rem*(16/16))] font-[450] text-white hover-scale"
          >
            {t('modifyOrder.confirm')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default ModifyTrailingTPSL
