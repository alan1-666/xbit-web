import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { cn } from '@/lib/utils.ts'
import { FormProvider, useForm, useFormContext, UseFormReturn, useWatch } from 'react-hook-form'
import { OrderFormData } from '@/modules/prediction/components/shared/order-form/OrderFormData.ts'
import { OrderButton } from '@/modules/prediction/components/shared/order-form/OrderButton.tsx'
import { MarketInfo } from '@/modules/prediction/components/shared/order-form/MarketInfo.tsx'
import { OrderTypeSelector } from '@/modules/prediction/components/shared/order-form/OrderTypeSelector.tsx'
import { SideSelector } from '@/modules/prediction/components/shared/order-form/SideSelector.tsx'
import { OutcomeSelector } from '@/modules/prediction/components/shared/order-form/OutcomeSelector.tsx'
import { Order } from '@/modules/prediction/components/shared/order-form/Order.tsx'
import { Summary } from '@/modules/prediction/components/shared/order-form/Summary.tsx'
import { ApprovalAlert } from '@/modules/prediction/components/shared/order-form/ApprovalAlert.tsx'
import { usePlaceOrderMutation } from '@/modules/prediction/components/shared/order-form/hooks/usePlaceOrder.ts'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'
import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { OrderFormDataSchema } from '@/modules/prediction/components/shared/order-form/schema/orderForm.schema.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { MarketClosedCard } from '@/modules/prediction/components/shared/MarketClosedCard.tsx'
import eventBus from '@/lib/eventBus.ts'
import { OrderConfirmedToast } from '@/modules/prediction/components/shared/order-form/OrderConfirmedToast.tsx'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { EVENT_MESSAGE_OPEN_LOGIN } from '@/components/auth/LoginHandler'
import { useTranslation } from 'react-i18next'
import Decimal from 'decimal.js'
import { useMarketConditionalTokenBalance } from '@/modules/prediction/components/shared/order-form/hooks/useMarketConditionalTokenBalance.ts'
import { useConditionalTokenBalance } from '@/modules/prediction/components/shared/order-form/hooks/useConditionalTokenBalance.ts'
import { getFromIndexedDB } from '@/utils/indexedDB/errorMessagesDB'
import { getErrorMessage } from '@/utils/helpers'
import { LanguageCode } from '@/redux/modules/errorMessages.slice'
import { LockedBalanceIndicator } from './order-form/LockedBalanceIndicator'

export interface OrderFormProps {
  market: MarketModel | MarketBase | undefined
  selectedOutcome: string
  setSelectedOutcome?: (outcome: 'yes' | 'no') => void
  className?: string
  isEventEnded?: boolean
  onCompleted?: () => void
  side?: 'buy' | 'sell'
  initialSize?: number
  updateId?: number
  marketInfoClassName?: string
  selectedSide?: 'buy' | 'sell' | null
  onSideChange?: (side: 'buy' | 'sell' | undefined) => void
  minTickSize?: number
  formRef?: RefObject<UseFormReturn<OrderFormData> | null>
}

export const OrderForm = (props: OrderFormProps) => {
  const { market, className } = props

  // Show skeleton when market is loading or changing
  if (!market?.question) {
    return <></>
  }

  // Check if market is closed
  if (market?.closed === true) {
    return <MarketClosedCard market={market} className={className} />
  }

  // Otherwise render the order form
  return <OrderFormV2 {...props} />
}

const initialData: OrderFormData = {
  side: 'buy',
  orderType: 'market',
  outcome: 'yes',
  data: {},
}

const OrderFormListener = () => {
  const { data: tokenBalance } = useMarketConditionalTokenBalance()
  const form = useFormContext<OrderFormData>()

  useEffect(() => {
    type Payload = {
      data: {
        marketId: string
        outcome: 'yes' | 'no'
        side: 'buy' | 'sell'
        size: number
      }
    }
    const handler = (data: Payload) => {
      const newSize = data.data.size
      const roundedSize = new Decimal(newSize).toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber()
      // const normalizedSize = Math.max(0, Math.min(roundedSize, tokenBalance || 0)) // Ensure non-negative size
      const normalizedSize = Math.max(0, roundedSize) // Ensure non-negative size, but allow exceeding balance for buy orders
      form.setValue('outcome', data.data.outcome, { shouldValidate: true })
      form.setValue('side', data.data.side, { shouldValidate: true })
      form.setValue('data.size', normalizedSize, { shouldValidate: true })
      form.setValue('orderType', 'market', { shouldValidate: true })
    }
    eventBus.on('FILL_PREDICTION_ORDER_FORM', handler)
    return () => {
      eventBus.remove('FILL_PREDICTION_ORDER_FORM', handler)
    }
  }, [tokenBalance])

  return null
}

const OrderFormV2 = (props: OrderFormProps) => {
  const {
    market,
    className,
    isEventEnded,
    onCompleted,
    side,
    initialSize,
    updateId,
    marketInfoClassName,
    onSideChange,
    setSelectedOutcome,
    formRef,
  } = props
  const activeWallet = useSelector(_activeWallet)
  const { t, i18n } = useTranslation()

  const form = useForm<OrderFormData>({
    defaultValues: initialData,
    resolver: zodResolver(OrderFormDataSchema),
    reValidateMode: 'onChange',
  })

  const watchedSide = useWatch({ control: form.control, name: 'side' })
  const watchedOutcome = useWatch({ control: form.control, name: 'outcome' })
  const lastDispatchedSide = useRef<undefined | 'buy' | 'sell'>(undefined)
  const [orderSuccessKey, setOrderSuccessKey] = useState(0)
  const [sellMaxSelectedKey, setSellMaxSelectedKey] = useState(0)

  useEffect(() => {
    if (formRef) {
      formRef.current = form
    }
  }, [form])

  // Sync side from props (e.g. when opening from positions)
  useEffect(() => {
    if (side) {
      form.setValue('side', side)
      lastDispatchedSide.current = side
    }
  }, [side, updateId, form])

  const mutation = usePlaceOrderMutation({
    onMutate: (data) => {
      console.log('Placing order with data:', data)
    },
    onSuccess: (_order, formData) => {
      const outcomeLabel = formData.outcomeLabels[formData.outcome === 'yes' ? 0 : 1] || formData.outcome
      const limitPrice = formData.orderType === 'limit' ? +formData.data.price : undefined
      const marketPrice = formData.outcome === 'yes' ? formData.yesPrice : formData.noPrice
      toast(
        formData.side === 'buy' ? t(`orderForm.status.buyOderConfirmed`) : t('orderForm.status.sellOderConfirmed'),
        {
          description: (
            <OrderConfirmedToast
              orderType={formData.orderType}
              side={formData.side}
              amount={formData.data.amount}
              size={formData.data.size}
              outcome={outcomeLabel}
              price={formData.orderType === 'limit' ? limitPrice : marketPrice}
            />
          ),
          duration: 3500,
          dismissible: true,
          closeButton: true,
        },
      )

      form.resetField('data.amount')
      form.resetField('data.size')
      // Force clear the size field even if resetField doesn't visually update NumericFormat
      form.setValue('data.size', undefined as unknown as number)
      setOrderSuccessKey((k) => k + 1)
      onCompleted?.()
    },
    onError: async (error) => {
      const firstError = Array.isArray(error) ? error[0] : error
      const errorCode = firstError.code
      const errorMessages = await getFromIndexedDB('errorMessages')

      const lang = i18n.language

      const errorMessage = getErrorMessage(errorMessages, errorCode, lang as LanguageCode) || firstError.message
      toast.error(errorMessage, { duration: 5000, closeButton: true })
    },
  })

  const orderType = useWatch({ control: form.control, name: 'orderType' })

  const fee = useMemo(() => {
    if (!market || !market.feeEnable) return 0
    const { makerBaseFee = 0, takerBaseFee = 0 } = market
    if (orderType === 'limit') {
      return +makerBaseFee
    } else {
      return +takerBaseFee
    }
  }, [market])

  const placeOrder = (data: OrderFormData) => {
    if (!market?.providerId) return
    const clobTokenIds = market?.clobTokenIds || []
    const outcome = data.outcome
    const tokenId = outcome === 'yes' ? clobTokenIds[0] : clobTokenIds[1]
    mutation.mutate({
      ...data,
      marketId: market.providerId,
      tokenId: tokenId,
      conditionId: market.conditionId || '',
      feeRateBps: fee,
      outcomeLabels: market.outcomes || [],
      title: market.question || '',
      slug: market.slug || '',
      icon: market.icon || '',
      eventSlug: (market as any).events?.[0]?.slug || '',
      yesPrice: outcomePrices[0],
      noPrice: outcomePrices[1],
      outcomeIndex: data.outcome === 'yes' ? 0 : 1,
    })
  }

  const buyOutcomePrices = useMemo(() => {
    const yesPrice = market?.tokenYesBestAsk ? +market.tokenYesBestAsk : 0
    const noPrice = market?.tokenNoBestAsk ? +market.tokenNoBestAsk : 0
    return [yesPrice, noPrice]
  }, [market?.tokenYesBestAsk, market?.tokenNoBestAsk])

  const sellOutcomePrices = useMemo(() => {
    const yesPrice = market?.tokenYesBestBid ? +market.tokenYesBestBid : 0
    const noPrice = market?.tokenNoBestBid ? +market.tokenNoBestBid : 0
    return [yesPrice, noPrice]
  }, [market?.tokenYesBestBid, market?.tokenNoBestBid])

  const outcomePrices = useMemo(() => {
    return watchedSide === 'buy' ? buyOutcomePrices : sellOutcomePrices
  }, [watchedSide, buyOutcomePrices, sellOutcomePrices])

  const clobTokenIds = useMemo(() => market?.clobTokenIds || [], [market?.clobTokenIds])
  const tokenId = useMemo(() => {
    return watchedOutcome === 'yes' ? clobTokenIds[0] : clobTokenIds[1]
  }, [watchedOutcome, clobTokenIds])

  const {
    isPending: isBalancePending,
    rawBalance,
    lockedBalance,
    availableBalance,
  } = useConditionalTokenBalance(tokenId, orderType !== 'market')
  const balance = useMemo(() => {
    if (orderType === 'limit') return availableBalance
    return rawBalance
  }, [orderType, availableBalance, rawBalance])

  const contextValue = useMemo(() => {
    return {
      isProcessing: mutation.isPending,
      yesPrice: outcomePrices[0],
      noPrice: outcomePrices[1],
      clobTokenIds,
      fee,
      isEventEnded,
      initialSize,
      minTickSize: market?.orderPriceMinTickSize ? +market.orderPriceMinTickSize : 0.01,
      outcomeLabels: market?.outcomes || [],
      balance,
      isBalancePending,
      rawBalance,
      lockedBalance,
      availableBalance,
      orderSuccessKey,
      sellMaxSelectedKey,
    }
  }, [
    mutation.isPending,
    outcomePrices,
    fee,
    isEventEnded,
    initialSize,
    market?.clobTokenIds,
    market?.orderPriceMinTickSize,
    market?.outcomes,
    balance,
    isBalancePending,
    rawBalance,
    lockedBalance,
    availableBalance,
    orderSuccessKey,
    sellMaxSelectedKey,
  ])

  useEffect(() => {
    if (market?.id) form.setValue('marketId', market.id)
  }, [market?.id, form])

  // Sync initialSize (e.g. from positions "Sell" actions) into the shares input
  useEffect(() => {
    if (typeof initialSize === 'number' && initialSize > 0) {
      form.setValue('data.size', initialSize, { shouldValidate: true })
    }
  }, [initialSize, form])

  // Sync selectedOutcome from props (one-way: parent → form only)
  useEffect(() => {
    if (props.selectedOutcome !== 'yes' && props.selectedOutcome !== 'no') return
    const currentOutcome = form.getValues('outcome')
    if (currentOutcome !== props.selectedOutcome) {
      form.setValue('outcome', props.selectedOutcome as 'yes' | 'no')
    }
  }, [props.selectedOutcome, form])

  useEffect(() => {
    form.setValue('yesPrice', outcomePrices[0])
    form.setValue('noPrice', outcomePrices[1])
  }, [outcomePrices, form])

  const didSetSellMaxRef = useRef(false)
  useEffect(() => {
    form.resetField('data.size')
    didSetSellMaxRef.current = false
  }, [watchedOutcome, form])

  const prevSideRef = useRef<undefined | 'buy' | 'sell'>(undefined)
  useEffect(() => {
    if (watchedSide !== 'sell') {
      didSetSellMaxRef.current = false
      prevSideRef.current = watchedSide
      return
    }
    const justSwitchedToSell = prevSideRef.current !== 'sell'
    prevSideRef.current = 'sell'
    if (rawBalance != null && rawBalance > 0 && (justSwitchedToSell || !didSetSellMaxRef.current)) {
      const maxSize = new Decimal(rawBalance).toDecimalPlaces(6, Decimal.ROUND_DOWN).toNumber()
      form.setValue('data.size', maxSize, { shouldValidate: true })
      didSetSellMaxRef.current = true
      setSellMaxSelectedKey((k) => k + 1)
    }
  }, [watchedSide, rawBalance, form])

  // Only dispatch side when it actually changed (avoid redundant dispatch → re-render loop)
  useEffect(() => {
    if (watchedSide && watchedSide !== lastDispatchedSide.current) {
      lastDispatchedSide.current = watchedSide
      onSideChange?.(watchedSide)
    }
  }, [watchedSide, onSideChange])

  useEffect(() => {
    form.setValue('data.size', undefined)
  }, [orderType])

  return (
    <OrderFormContext.Provider value={contextValue}>
      <FormProvider {...form}>
        <form className={cn('space-y-4 text-sm', className)} onSubmit={form.handleSubmit(placeOrder)} noValidate>
          <OrderFormListener />
          <div className="flex items-center gap-2">
            <SideSelector />
            <OrderTypeSelector />
          </div>

          <MarketInfo market={market} className={marketInfoClassName} />
          <LockedBalanceIndicator />

          <OutcomeSelector
            outcomes={market?.outcomes || []}
            outcomePrices={outcomePrices}
            minTickSize={market?.orderPriceMinTickSize ? +market.orderPriceMinTickSize : 0.01}
            onOutcomeSelect={setSelectedOutcome}
          />
          <Order />
          <Summary />
          {activeWallet?.isConnected ? (
            <>
              <ApprovalAlert />
              <OrderButton />
            </>
          ) : (
            <>
              <Button
                className="w-full rounded-full"
                variant="gradient"
                onClick={() => {
                  if (!activeWallet?.isConnected) {
                    eventBus.dispatch(EVENT_MESSAGE_OPEN_LOGIN, { data: { isOpen: true } })
                    return
                  }
                }}
                type="button"
              >
                {t('personalCenter.pleaseLogin')}
              </Button>
            </>
          )}
        </form>
      </FormProvider>
    </OrderFormContext.Provider>
  )
}
