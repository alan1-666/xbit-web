import { useCallback, useState } from 'react'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { useCreateOrder } from '@hooks/useCreateOrder.ts'
import { Order, OrderType, TransactionType } from '@/@generated/gql/graphql-trading.ts'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog.tsx'
import { useAppSelector } from '@/redux/store'
import { toast } from 'sonner'
import { PortfolioDTO } from '@/types/holding'
import useShowToastOrder from '@/hooks/useShowToastOrder'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { EVENT_MESSAGE_ORDER_CREATED } from '../orderForm'
import { appendToLocalStorageArrayWithTTL } from '@/utils/storage.ts'
import { TTL_PORTFOLIO_STORAGE } from '@const/configs.ts'
import useGetErrorMsg from '@/hooks/useGetErrorMsg'
import { priceChain } from '@/redux/modules/price.slice'
import { getNativeTokenByActiveChain, getQuoteAddessByChain, MIN_BALANCE_FORM_SELL } from '@/lib/blockchain'
import { useTradeConfig } from '@/hooks/useTradeConfig'
import { PendingOrder } from './useHoldingData'
import RestrictRegiongDialog from '../RestrictRegiongDialog'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

type OutsideEvent = CustomEvent<{ originalEvent: PointerEvent }> | CustomEvent<{ originalEvent: FocusEvent }>
type SellAllButtonProps = {
  symbol: string
  baseAddress: string
  holdingQuantity: number | string
  portfolio?: PortfolioDTO
  disabled?: boolean
  price?: number
}
const SellAllButton = ({ symbol, baseAddress, holdingQuantity, disabled = false, price = 0 }: SellAllButtonProps) => {
  const { t } = useTranslation()
  const { handleGetErrorMessage } = useGetErrorMsg()
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)

  const [open, setOpen] = useState(false)
  const [loading, setIsLoading] = useState(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const { createOrder } = useCreateOrder()
  const {
    showToastProcessOrder,
    showErrorMessageSubmitOrder,
    newHiddenToastProcessOrder,
    showToastSubmittedSuccessOrder,
  } = useShowToastOrder()

  const activeWallet = useSelector(_activeWallet)
  const address = activeWallet?.walletAddress
  const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const { slippage, priorityFeePriceOrder } = useTradeConfig({
    transactionType: TransactionType.Sell,
  })

  const createOrderByTele = async () => {
    try {
      if (+holdingQuantity <= 0) {
        toast.error(t('orderForm.errors.orderInvalidAmount'))
        return
      }

      const quoteAmountFormSell = (+holdingQuantity * +price) / +priceNativeToken
      if (quoteAmountFormSell < MIN_BALANCE_FORM_SELL) {
        toast.error(
          t('orderForm.errors.minimumOrderQuantity', {
            balance: MIN_BALANCE_FORM_SELL,
            chain: getNativeTokenByActiveChain(activeChain),
          }),
        )
        return false
      }

      setIsLoading(true)
      const id = new Date().getTime() + ''
      const param = {
        quoteAddress: getQuoteAddessByChain(activeChain).toString(),
        baseAddress,
        userAddress: address,
        type: OrderType.Market,
        transactionType: TransactionType.Sell,
        slippage: slippage.toString(),
        priorityFeePrice: priorityFeePriceOrder.toString(),
        baseAmount: holdingQuantity,
        chainId: activeWallet.chainId.toString(),
      }

      showToastProcessOrder({
        ...param,
        id: id,
        baseSymbol: symbol,
      } as Order)
      const response = await createOrder(param)

      if (response && response?.createOrder) {
        const orderRes = response?.createOrder
        // showToastProcessOrder(response?.createOrder)
        newHiddenToastProcessOrder({ ...orderRes, id: id })
        showToastSubmittedSuccessOrder(orderRes)
        channel.postMessage({ data: { ...orderRes } })
        appendToLocalStorageArrayWithTTL<PendingOrder>('holdingUnCompleted', { ...orderRes }, TTL_PORTFOLIO_STORAGE)
        setIsLoading(false)
      } else {
        // const err = error?.message
        // showErrorMessageSubmitOrder(err ? err : t('orderForm.errors.orderFailed'))
        newHiddenToastProcessOrder({
          ...param,
          id: id,
        } as Order)
        setIsLoading(false)
        showErrorMessageSubmitOrder(t('orderForm.errors.orderFailed'))
      }
    } catch (err) {
      setIsLoading(false)
      const errCode = (err as any[])?.[0]?.code as string
      if (errCode === 'ErrAccessTokenInvalid' || errCode === 'UNAUTHENTICATED') {
        return
      }
      showErrorMessageSubmitOrder(handleGetErrorMessage(errCode))
      // showErrorMessageSubmitOrder(errCode ? t(`orderForm.status.${errCode}`) : t('orderForm.errors.orderFailed'))
      // showErrorMessageSubmitOrder(t('orderForm.errors.orderFailed'))
    }
  }

  const handleOneClickSellAll = () => {
    createOrderByTele().catch()
    setOpen(false)
  }

  const handleOutsideInteraction = useCallback(
    (e: OutsideEvent) => {
      if (loading) e.preventDefault()
    },
    [loading],
  )

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild disabled={+holdingQuantity <= 0}>
          <Button
            variant="borderGradientCard"
            size="btm-card"
            className="rounded-full"
            isLoading={loading}
            disabled={disabled || loading || +holdingQuantity <= 0}
            onClick={(e) => {
              e.preventDefault()
              if (enabled) {
                setOpenRestrictRegiongDialog(true)
              } else {
                setOpen(true)
              }
            }}
          >
            {t('detail.myPositions.oneClickSell')}
          </Button>
        </DialogTrigger>

        <DialogContent
          onPointerDownOutside={handleOutsideInteraction}
          onInteractOutside={handleOutsideInteraction}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="w-[335px] bg-[#232329] rounded-2xl p-5 [&_button.absolute.right-4.top-4]:hidden"
        >
          <DialogHeader>
            <DialogTitle className="leading-[1.4] text-left">
              {t('detail.myPositions.confirmClearance', { symbol })}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription></DialogDescription>

          <DialogFooter>
            <div className="flex justify-center w-full items-center flex-row gap-2.5">
              <Button
                size="lg"
                variant="borderGradient"
                className="flex-1 rounded-full"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                {t('chart.buttons.cancel')}
              </Button>

              <Button
                size="lg"
                variant="gradient"
                className="text-[#261236] flex-1 rounded-[50px]"
                disabled={loading}
                isLoading={loading}
                onClick={handleOneClickSellAll}
              >
                {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
                {t('chart.buttons.confirm')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </>
  )
}

export default SellAllButton
