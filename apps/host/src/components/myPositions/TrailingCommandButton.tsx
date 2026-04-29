import { Order, OrderType, TransactionType } from '@/@generated/gql/graphql-trading.ts'
import useGetErrorMsg from '@/hooks/useGetErrorMsg'
import { getChainId, getQuoteAddessByChain } from '@/lib/blockchain.ts'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_PENDING_ORDERS } from '@/lib/eventMessages.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import TrailingProfitStopLossFrom from '@components/common/form/TraillingProfitStopLoss'
import { EVENT_MESSAGE_ORDER_CREATED } from '@components/orderForm'
import { Button } from '@components/ui/button.tsx'
import { DialogTitle } from '@components/ui/dialog.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
} from '@components/ui/drawer.tsx'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { SOL_ADDRESS, useCreateOrder } from '@hooks/useCreateOrder.ts'
import useShowToastOrder from '@hooks/useShowToastOrder.tsx'
import { Loader2, X } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import RestrictRegiongDialog from '../RestrictRegiongDialog'

type TrailingCommandButtonProps = {
  symbol: string
  baseAddress: string
  holdingQuantity: number | string
  disabled?: boolean
}

const TrailingCommandButton = ({
  symbol,
  baseAddress,
  holdingQuantity,
  disabled = false,
}: TrailingCommandButtonProps) => {
  const { t } = useTranslation()
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)
  const [open, setOpen] = useState<boolean>(false)
  const [callbackRate, setCallbackRate] = useState<string>('')
  const [baseAmount, setBaseAmount] = useState<string>('')
  const [triggerPrice, setTriggerPrice] = useState<string>('')

  const { createOrder, loading } = useCreateOrder()
  const activeWallet = useSelector(_activeWallet)
  const { tradeConfigs } = useAppSelector((state: RootState) => state.tradeConfigs)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const selectedPresetKey = useAppSelector((state) => state.tradeSettings.selectedPreset[activeChain])
  const newConfigs = useAppSelector((state) => state.tradeSettings.settings)?.[activeChain]?.[selectedPresetKey - 1]
  const config = newConfigs?.Sell

  const { handleGetErrorMessage } = useGetErrorMsg()

  const {
    showToastProcessOrder,
    showErrorMessageSubmitOrder,
    newHiddenToastProcessOrder,
    showToastSubmittedSuccessOrder,
  } = useShowToastOrder()

  const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
  const address = activeWallet?.walletAddress
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
  const slippage = (config?.slippage && config?.slippage !== 'auto' ? config?.slippage : 20) / 100

  const handleOnChangeCallBackRate = (e: ChangeEvent<HTMLInputElement>) => {
    const value = clamp(parseFloat(e.target.value), 0, 100)
    setCallbackRate(value.toString())
  }
  const handleOnChangeBaseAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setBaseAmount(e.target.value)
  }
  const handleOnChangeSliderValue = (value: number[]) => {
    if (value[0] === 0) setBaseAmount('0')
    else if (value[0] === 100) setBaseAmount(holdingQuantity.toString())
    else setBaseAmount(`${(value[0] / 100) * +holdingQuantity}`)
  }
  const handleDisableSubmitButton = () => {
    if (!callbackRate || callbackRate === '') return true
    if (!baseAmount || baseAmount === '') return true
    return loading
  }

  const handleConfirmClick = async () => {
    const param = {
      quoteAddress: getQuoteAddessByChain(activeChain).toString(),
      baseAddress,
      userAddress: address,
      type: OrderType.TrailingTpsl,
      transactionType: TransactionType.Sell,
      slippage: slippage,
      priorityFeePrice: tradeConfigs?.sol?.priorityFeePrice,
      baseAmount,
      callbackRate: Number(callbackRate) / 100,
      triggerPrice,
      chainId: (activeChain ? getChainId(activeChain) : ChainIds.Solana) + '',
    }

    const id = new Date().getTime() + ''
    try {
      showToastProcessOrder({
        ...param,
        id: id,
        baseSymbol: symbol,
      } as Order)

      const response = await createOrder(param)
      if (response && response?.createOrder) {
        // showToastProcessOrder(response?.createOrder)
        newHiddenToastProcessOrder({ ...response?.createOrder, id: id })
        showToastSubmittedSuccessOrder(response?.createOrder)
        eventBus.dispatch(EVENT_MESSAGE_ORDER_CREATED, {
          data: response?.createOrder,
        })
        eventBus.dispatch(REFETCH_PENDING_ORDERS, {
          data: {
            needRefetch: true,
          },
        })
        channel.postMessage({ data: response?.createOrder })
      } else {
        // const err = error?.message
        // showErrorMessageSubmitOrder(err ? err : t('orderForm.errors.orderFailed'))
        newHiddenToastProcessOrder({
          ...param,
          id: id,
        } as Order)
        showErrorMessageSubmitOrder(t('orderForm.errors.orderFailed'))
      }
    } catch (err) {
      const errCode = (err as any[])?.[0]?.code as string
      if (errCode === 'ErrAccessTokenInvalid' || errCode === 'UNAUTHENTICATED') {
        return
      }
      newHiddenToastProcessOrder({
        ...param,
        id: id,
      } as Order)
      showErrorMessageSubmitOrder(handleGetErrorMessage(errCode))
      // showErrorMessageSubmitOrder(errCode ? t(`orderForm.status.${errCode}`) : t('orderForm.errors.orderFailed'))
    } finally {
      setBaseAmount('')
      setCallbackRate('')
      setOpen(false)
    }
  }

  useEffect(() => {
    return () => {
      setBaseAmount('')
      setCallbackRate('')
    }
  }, [])

  return (
    <>
      <Button
        variant="borderGradientCard"
        size="btm-card"
        className="rounded-full"
        disabled={disabled || +holdingQuantity <= 0}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (enabled) {
            setOpenRestrictRegiongDialog(true)
          } else {
            setOpen(true)
          }
        }}
      >
        {t('detail.myPositions.trailingStopLoss')}
      </Button>
      <Drawer open={open} onOpenChange={(openState) => setOpen(openState)} repositionInputs={false}>
        <DrawerContent className="w-full !bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto">
          <DrawerHeader>
            <DialogTitle>
              <div className="text-white text-[16px] leading-[18px]">{t('detail.myPositions.trailingStopLoss')}</div>
            </DialogTitle>
            <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-5" onClick={() => setOpen(false)} />
            </DrawerClose>
          </DrawerHeader>
          <DrawerDescription className="mt-2">
            <TrailingProfitStopLossFrom
              sliderValue={[0]}
              triggerPriceValue={triggerPrice}
              onChangeTriggerValue={(e) => setTriggerPrice(e.target.value)}
              onSliderValueChange={handleOnChangeSliderValue}
              inputFields={[
                {
                  label: t('detail.myPositions.highPointPullback'),
                  unit: '%',
                  inputProps: {
                    maxLength: 3,
                    value: callbackRate,
                    onChange: handleOnChangeCallBackRate,
                  },
                },
                {
                  label: t('detail.myPositions.soldQuantity'),
                  unit: symbol,
                  inputProps: {
                    value: baseAmount,
                    onChange: handleOnChangeBaseAmount,
                  },
                },
              ]}
            />
          </DrawerDescription>
          <DrawerFooter>
            <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
              <Button
                size="lg"
                disabled={loading}
                variant="close"
                className="flex-1 rounded-full !bg-[#2b2b33]"
                onClick={() => setOpen(false)}
              >
                {t('chart.buttons.cancel')}
              </Button>
              <Button
                size="lg"
                disabled={handleDisableSubmitButton()}
                variant="gradient"
                className="text-[#261236] flex-1 rounded-[50px]"
                onClick={handleConfirmClick}
              >
                {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
                {t('chart.buttons.confirm')}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </>
  )
}

export default TrailingCommandButton
