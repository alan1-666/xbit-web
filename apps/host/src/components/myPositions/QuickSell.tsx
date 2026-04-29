import { Order, OrderType, TransactionType } from '@/@generated/gql/graphql-trading.ts'
import useGetErrorMsg from '@/hooks/useGetErrorMsg'
import useShowToastOrder from '@/hooks/useShowToastOrder'
import {
  getMinBalanceTradeByChain,
  getNativeTokenByActiveChain,
  getQuoteAddessByChain,
  MIN_BALANCE_FORM_SELL,
  TYPE_CHAIN,
} from '@/lib/blockchain'
import { cn } from '@/lib/utils.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { priceChain } from '@/redux/modules/price.slice'
import { useAppSelector } from '@/redux/store'
import { PortfolioDTO } from '@/types/holding'
import { appendToLocalStorageArrayWithTTL } from '@/utils/storage.ts'
import { TTL_PORTFOLIO_STORAGE } from '@const/configs.ts'
import { useCreateOrder } from '@hooks/useCreateOrder.ts'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { EVENT_MESSAGE_ORDER_CREATED } from '../orderForm'
import { useTradeConfig } from '@/hooks/useTradeConfig'
import { PendingOrder } from './useHoldingData'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import RestrictRegiongDialog from '../RestrictRegiongDialog'
import Decimal from 'decimal.js'

type QuickSellProps = {
  symbol: string
  baseAddress: string
  holdingQuantity: string | number
  quickSellPercent?: number | string
  portfolio?: PortfolioDTO
  price?: number
  isProcessing?: boolean
}

const QuickSell = ({
  symbol,
  baseAddress,
  holdingQuantity,
  price = 0,
  quickSellPercent,
  isProcessing,
  portfolio,
}: QuickSellProps) => {
  const { t } = useTranslation()
  const { handleGetErrorMessage } = useGetErrorMsg()
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)
  const [loading, setIsLoading] = useState(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const decimals = portfolio?.decimals || 6

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

  const { slippage, priorityFeePriceOrder, config, briberyFee } = useTradeConfig({
    transactionType: TransactionType.Sell,
  })
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const validQuickSellPercent = useMemo(() => {
    const percent = Number(quickSellPercent)
    if (!quickSellPercent || isNaN(percent) || percent < 0 || percent > 100) {
      return false
    }
    return true
  }, [quickSellPercent])

  const baseAmount = useMemo(() => {
    if (!validQuickSellPercent) return 0
    if (Number(quickSellPercent) === 100) return holdingQuantity
    // const amount = (holdingQuantity * Number(quickSellPercent)) / 100
    const amount = new Decimal(holdingQuantity).mul(quickSellPercent!).div(100)
    return amount.toDecimalPlaces(decimals, Decimal.ROUND_DOWN).toString()
  }, [holdingQuantity, quickSellPercent])

  const handleQuickSell = async () => {
    if (activeWallet?.balance?.formatted < getMinBalanceTradeByChain(activeChain)) {
      toast.error(
        t('orderForm.errors.rechargeIfBalanceInsufficientMinimum', {
          chain: getNativeTokenByActiveChain(activeChain),
          balance: getMinBalanceTradeByChain(activeChain),
        }),
      )
      return false
    }

    if (+baseAmount <= 0) {
      toast.error(t('orderForm.errors.orderInvalidAmount'))
      return
    }

    const quoteAmountFormSell = (+baseAmount * +price) / +priceNativeToken
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
      baseAmount: baseAmount,
      chainId: activeWallet.chainId.toString(),
      priorityFeePrice: priorityFeePriceOrder.toString(),
      slippage: slippage.toString(),
      ...(activeChain !== TYPE_CHAIN.SOLANA && { mevProtect: config?.mevProtect }),
      ...(activeChain === TYPE_CHAIN.SOLANA && {
        mevProtectionType: config?.mevProtectionType,
        ...(!!briberyFee && { briberyFeePrice: briberyFee }),
        ...(!!config?.customRPC && { customRPC: config?.customRPC }),
      }),
    }

    try {
      showToastProcessOrder({
        ...param,
        id: id,
        baseSymbol: symbol,
      } as Order)

      const response = await createOrder(param)

      if (response && response?.createOrder) {
        const orderRes = response?.createOrder
        newHiddenToastProcessOrder({ ...orderRes, id: id })
        showToastSubmittedSuccessOrder(orderRes)
        const dataPending: PendingOrder = {
          ...orderRes,
          lastTxTime: orderRes?.updatedAt,
        }
        appendToLocalStorageArrayWithTTL<PendingOrder>('holdingUnCompleted', dataPending, TTL_PORTFOLIO_STORAGE)
        channel.postMessage({ data: dataPending })
        setIsLoading(false)
      } else {
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
      newHiddenToastProcessOrder({
        ...param,
        id: id,
      } as Order)
      showErrorMessageSubmitOrder(handleGetErrorMessage(errCode))
    }
  }

  return (
    <>
      <button
        className={cn(
          'max-w-[80px] purple-btn-gradient !text-white flex items-center justify-center gap-0.5 h-6 min-w-[52px] px-2 rounded-full text-[12px] font-[450] hover:scale-105 transition-transform duration-200',
          !validQuickSellPercent || loading || holdingQuantity === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer',
        )}
        disabled={!validQuickSellPercent || loading || holdingQuantity === 0 || isProcessing}
        onClick={(e) => {
          e.stopPropagation()
          if (enabled) {
            setOpenRestrictRegiongDialog(true)
          } else {
            handleQuickSell()
          }
        }}
      >
        {loading || isProcessing ? (
          <Loader2 className="animate-spin w-4 h-4 mr-1" />
        ) : (
          <img src="/images/icons/quick-buy.svg" className="h-[13px] w-2.5" />
        )}

        {!loading && !isProcessing && validQuickSellPercent && `${quickSellPercent}%`}
      </button>

      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </>
  )
}

export default QuickSell
