import { Launchpad } from '@/@generated/gql/graphql-core'
import { CreateOrderInput, Order, OrderType, TransactionType } from '@/@generated/gql/graphql-trading'
import LoadingSpinner from '@/components/ui/loading-spinner.tsx'
import { SOL_ADDRESS, SOL_DECIMALS } from '@/hooks/useCreateOrder'
import useGetErrorMsg from '@/hooks/useGetErrorMsg'
import { useNetworkFee } from '@/hooks/useNetworkFee'
import useShowToastOrder from '@/hooks/useShowToastOrder'
import {
  BASIC_FEE,
  getMinBalanceTradeByChain,
  getNativeTokenByActiveChain,
  getQuoteAddessByChain,
  MIN_BALANCE_FORM_BUY,
  // MIN_BALANCE_SOL,
  TYPE_CHAIN,
} from '@/lib/blockchain'
// import eventBus from '@/lib/eventBus'
import { ServiceConfig } from '@/lib/gql/service-config'
import { cn } from '@/lib/utils.ts'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { orderActions } from '@/redux/modules/order.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { fetchPumpfunOrder, PreOrder } from '@/services/onchain.service'
import { decryptPrivateKey } from '@/utils/agent/cryptoUtils'
import { formatMoney, formatPrice2 } from '@/utils/helpers'
import { appendToLocalStorageArrayWithTTL } from '@/utils/storage.ts'
import { TTL_PORTFOLIO_STORAGE } from '@const/configs.ts'
import { latestBlockHash } from '@const/latestBlockHash.ts'
import { Keypair, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'
import Decimal from 'decimal.js'
import { HTMLAttributes, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { z } from 'zod'
import { EVENT_MESSAGE_ORDER_CREATED } from '../orderForm'
import { useTradeConfig } from '@/hooks/useTradeConfig'
import { useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import { PendingOrder } from '../myPositions/useHoldingData'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import RestrictRegiongDialog from '../RestrictRegiongDialog'
import { EVENT_MESSAGE_OPEN_LOGIN } from '../auth/LoginHandler'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
import eventBus from '@/lib/eventBus'

const formSchema = z.object({
  transactionType: z.string({
    required_error: 'required',
  }),
  type: z.string({
    required_error: 'required',
  }),
  baseAddress: z.string({
    required_error: 'required',
  }),
  quoteAddress: z.string({
    required_error: 'required',
  }),
  userAddress: z.string({
    required_error: 'required',
  }),
  chainId: z.string({
    required_error: 'required',
  }),
  quoteAmount: z.string({}),
  doublePrincipalAfterPurchase: z.boolean({}),
})

export type FormValues = z.infer<typeof formSchema>

type Props = {
  className?: HTMLAttributes<HTMLButtonElement>['className']
  token: {
    token?: string
    marketcap?: number | null
    symbol: string
    dexes?: string[] | null
    decimals?: string | number | null
    address?: string
    avatarUrl?: string | null
  }
  customAction?: () => void
  showUnit?: boolean
}

export const QuickBuyButton = (props: Props) => {
  const { t } = useTranslation()
  const { handleGetErrorMessage } = useGetErrorMsg()
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)

  const { className, token, customAction, showUnit = false, ...rest } = props
  const dispatch = useAppDispatch()
  const activeWallet = useAppSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const amount = useSelector((state: RootState) => state.quickBuy.amount)
  const nativeTokenSymbol = useNativeTokenSymbol()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { showToastProcessOrder, showErrorMessageSubmitOrder, isOrderProcessing } = useShowToastOrder()
  const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
  const { slippage, config, fee, priorityFeePriceOrder, briberyFee } = useTradeConfig({
    transactionType: TransactionType.Buy,
  })
  const { showToastSubmittedSuccessOrder, newHiddenToastProcessOrder } = useShowToastOrder()
  const { feeAccount, platformFee } = useNetworkFee()

  const createOrder = async (params: CreateOrderInput) => {
    setIsLoading(true)
    const id = new Date().getTime() + ''
    const orderProcessParam = {
      ...params,
      id,
      marketCap: token?.marketcap,
      baseSymbol: token?.symbol,
    } as Order
    showToastProcessOrder(orderProcessParam)
    logEvent2(ACTIONS.meme_buy, {
      token_address: params.baseAddress || '',
      amount: params.baseAmount || '',
      slippage: params.slippage || '',
    })
    dispatch(orderActions.newCreateOrder({ input: params }))
      .then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const orderRes = res?.payload?.createOrder
          if (params?.type === OrderType.Market) {
            newHiddenToastProcessOrder({ ...orderRes, id: id })
            showToastSubmittedSuccessOrder(orderRes)
            const dataPending: PendingOrder = {
              ...orderRes,
              logoUrl: token?.avatarUrl,
              lastTxTime: orderRes?.updatedAt,
            }
            channel.postMessage({ data: dataPending })
            appendToLocalStorageArrayWithTTL<PendingOrder>('holdingUnCompleted', dataPending, TTL_PORTFOLIO_STORAGE)
          } else {
            toast.success(t('orderForm.status.createOrderSuccess'))
          }
        } else {
          newHiddenToastProcessOrder(orderProcessParam)
          const errCode = res?.payload?.[0]?.code as string
          if (errCode === 'ErrAccessTokenInvalid' || errCode === 'UNAUTHENTICATED') {
            return
          }
          showErrorMessageSubmitOrder(handleGetErrorMessage(errCode))
          // showErrorMessageSubmitOrder(errCode ? t(`orderForm.status.${errCode}`) : t('orderForm.errors.orderFailed'))
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleCheckErrorSubmitBuyOrder = (values: FormValues) => {
    if (!values?.quoteAmount) {
      toast.error(t('orderForm.errors.orderInvalidAmountBuying'))
      return false
    }

    if (activeWallet?.balance?.formatted < getMinBalanceTradeByChain(activeChain)) {
      toast.error(
        t('orderForm.errors.rechargeIfBalanceInsufficientMinimum', {
          chain: getNativeTokenByActiveChain(activeChain),
          balance: getMinBalanceTradeByChain(activeChain),
        }),
      )
      return false
    }

    if (+values?.quoteAmount > activeWallet?.balance?.formatted) {
      toast.error(t('orderForm.errors.rechargeIfBalanceInsufficient'))
      return false
    }

    if (+values?.quoteAmount < MIN_BALANCE_FORM_BUY) {
      toast.error(
        t('orderForm.errors.minimumBuyQuantity', {
          balance: MIN_BALANCE_FORM_BUY,
          chain: getNativeTokenByActiveChain(activeChain),
        }),
      )
      return false
    }

    const estimateQuoteAmount = +values?.quoteAmount * 1.01 + BASIC_FEE
    if (estimateQuoteAmount > activeWallet?.balance?.formatted && values.transactionType === TransactionType.Buy) {
      toast.error(t('orderForm.errors.rechargeIfBalanceInsufficient'))
      return false
    }

    if (!token) {
      toast.error(t('orderForm.errors.selectTransactionQuantity'))
      return false
    }

    return true
  }

  const [privateKey, setPrivateKey] = useState('')
  const bundle = useAppSelector((state) =>
    state.newWallet.bundle?.find((item: any) => item?.key === activeWallet?.walletAddress),
  )
  const refreshToken = useSelector(_userInfo)?.refresh_token

  useEffect(() => {
    if (bundle && refreshToken) {
      const dec = decryptPrivateKey(
        Buffer.from(bundle?.privateKeyEncrypted, 'base64'),
        Buffer.from(bundle?.iv, 'base64'),
        bundle?.key + refreshToken,
      )

      dec
        .then((key) => {
          // console.log('private key decrypted: ', key)
          setPrivateKey(key)
        })
        .catch((err) => console.error('Error decrypting private key:', err))
    }
  }, [bundle, refreshToken])

  const submitBuyOrder = async (values: FormValues) => {
    if (!handleCheckErrorSubmitBuyOrder(values)) return
    let params: CreateOrderInput = {} as CreateOrderInput
    let transaction = null

    if (token?.dexes?.length && token?.dexes.includes(Launchpad.Pumpfun) && activeChain === TYPE_CHAIN.SOLANA) {
      const isBuy = values.transactionType == 'Buy'
      const inputMint = isBuy ? SOL_ADDRESS : values.baseAddress
      const outputMint = !isBuy ? SOL_ADDRESS : values.baseAddress
      const inputDecimals = isBuy ? SOL_DECIMALS : Number(token?.decimals) || 9

      const preOrder: PreOrder = {
        userAddress: activeWallet?.walletAddress,
        inputMint,
        outputMint,
        amount: new Decimal(+values.quoteAmount || 0),
        inputDecimals,
        slippage: slippage,
        priorityFee: new Decimal(fee),
        mevProtect: config?.mevProtect || false,
        isToken2022: false,
        dexes: token?.dexes || [],
        priorityFeePrice: new Decimal(priorityFeePriceOrder),
      }
      const newBlockHash = latestBlockHash?.blockhash
      const res = await fetchPumpfunOrder(preOrder, newBlockHash, feeAccount, platformFee)
      transaction = res?.transaction || null
    }

    let signedTx: string | null = null

    try {
      if (privateKey && transaction) {
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKey))
        const transactionBuff = Buffer.from(transaction, 'base64')
        const tx = VersionedTransaction.deserialize(transactionBuff)

        tx.sign([keypair])
        signedTx = Buffer.from(tx.serialize()).toString('base64')
      }
    } catch (error) {
      console.log('Failed to signing', {
        error,
        transaction: transaction,
        userAddress: activeWallet?.walletAddress,
      })
    }

    params = {
      ...params,
      ...values,
      quoteAmount: (+values.quoteAmount).toString(),
      priorityFeePrice: priorityFeePriceOrder.toString(),
      slippage: slippage.toString(),
      ...(activeChain !== TYPE_CHAIN.SOLANA && { mevProtect: config?.mevProtect }),
      ...(activeChain === TYPE_CHAIN.SOLANA && {
        mevProtectionType: config?.mevProtectionType,
        transaction: transaction,
        signedTx: signedTx,
        ...(!!briberyFee && { briberyFeePrice: briberyFee }),
        ...(!!config?.customRPC && { customRPC: config?.customRPC }),
      }),
    } as CreateOrderInput

    createOrder(params).catch(console.error)
  }

  const onSubmitOrder = () => {
    const values: FormValues = {
      transactionType: TransactionType.Buy,
      type: OrderType.Market,
      baseAddress: token?.address ? token?.address : token?.token ? token?.token : '',
      quoteAddress: getQuoteAddessByChain(activeChain).toString(),
      userAddress: activeWallet?.walletAddress,
      chainId: activeWallet?.chainId?.toString(),
      quoteAmount: amount,
      doublePrincipalAfterPurchase: false,
    }
    submitBuyOrder(values).catch(console.error)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (!ServiceConfig.token) {
      // Not login, show toast
      // toast.warning(t('appSettings.loginRequired'))
      eventBus.dispatch(EVENT_MESSAGE_OPEN_LOGIN, {
        data: {
          isOpen: true,
        },
      })
      return
    }
    
    onSubmitOrder()
  }

  return (
    <>
      <button
        className={cn(
          'bg-[#843BEA] rounded-full flex items-center justify-center gap-0.5 h-6 min-w-14 px-2',
          'text-[12px] text-white! font-[450] hover:scale-105 transition-transform duration-200',
          className,
        )}
        {...rest}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (enabled) {
            setOpenRestrictRegiongDialog(true)
          } else {
            if (customAction) {
              customAction()
            } else {
              handleClick(e)
            }
          }
        }}
        disabled={isLoading || isOrderProcessing}
      >
        {isLoading || isOrderProcessing ? (
          <LoadingSpinner size={16} />
        ) : Number(amount) > 0 ? (
          <div className="flex items-center gap-1 min-w-max">
            <img src="/images/icons/quick-buy.svg" alt="Quick Buy" className="h-3.25 w-2.5" />
            <span className="max-w-16 overflow-hidden text-ellipsis whitespace-nowrap leading-[1.2]">
              {amount < 1 ? formatPrice2(amount) : formatMoney(amount, false)}
              {showUnit ? <> {nativeTokenSymbol}</> : null}
            </span>
          </div>
        ) : (
          <>
            <img src="/images/icons/quick-buy.svg" alt="Quick Buy" className="h-3.25 w-2.5" />
            {t('transaction.buy')}
          </>
        )}
      </button>
      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </>
  )
}
