import { Launchpad, TokenDetail } from '@/@generated/gql/graphql-meme2'
import { CreateOrderInput, Order, OrderType, SubmitEngineType, TransactionType } from '@/@generated/gql/graphql-trading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import LoadingSpinner from '@/components/ui/loading-spinner.tsx'
import { TTL_PORTFOLIO_STORAGE } from '@/const/configs'
import { SOL_ADDRESS, SOL_DECIMALS } from '@/hooks/useCreateOrder'
import useGetErrorMsg from '@/hooks/useGetErrorMsg'
import { SolanaNetworkFee, useGetNetworkFee } from '@/hooks/useGetNetWorkFee'
import { useNetworkFee } from '@/hooks/useNetworkFee'
import { usePreference } from '@/hooks/usePreference'
import useShowToastOrder from '@/hooks/useShowToastOrder'
import { useTradeConfig } from '@/hooks/useTradeConfig'
import {
  BASIC_FEE,
  getChainId,
  getMinBalanceTradeByChain,
  getNativeTokenByActiveChain,
  getQuoteAddessByChain,
  LIST_CHAIN_SUPPORTED,
  MIN_BALANCE_FORM_BUY,
  MIN_BALANCE_FORM_SELL,
  TYPE_CHAIN,
} from '@/lib/blockchain'
import { X_STOCK_TAG } from '@/lib/constant.ts'
import { formatAmount, formatPercent } from '@/lib/format'
import ls from '@/lib/local-storage'
import { cn } from '@/lib/utils.ts'
import { useGetHoldingToken } from '@/pages/detail/orderForm/desktop/hook/useGetHoldingToken'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { orderActions } from '@/redux/modules/order.slice'
import { priceChain } from '@/redux/modules/price.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import {
  fetchIsToken2022,
  fetchJupiterOrder,
  fetchPumpfunOrder,
  JupiterOrderResponse,
  PreOrder,
} from '@/services/onchain.service'
import { ChainIds } from '@/types/enums'
import { decryptPrivateKey } from '@/utils/agent/cryptoUtils'
import { formatMoney } from '@/utils/helpers'
import { appendToLocalStorageArrayWithTTL } from '@/utils/storage'
import NewLoginDrawer from '@components/auth/NewLoginDrawer.tsx'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import FilterSelect, { FilterSelectOption } from '@components/common/FilterSelect'
import FormLimitPrice from '@components/orderForm/FormLimitPrice.tsx'
import FormOneClick from '@components/orderForm/FormOneClick.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Keypair, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'
import clsx from 'clsx'
import Decimal from 'decimal.js'
import { debounce } from 'lodash-es'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { z } from 'zod'
import { IconSolana } from '../common/Icon'
import { PendingOrder } from '../myPositions/useHoldingData'
import RestrictRegiongDialog from '../RestrictRegiongDialog'
import { Button } from '../ui/button'
import DoublePrincipalAfterPurchaseExplained from './DoublePrincipalAfterPurchaseExplained'
import FormTrailing from './FormTrailing'
import LimitPriceExplained from './LimitPriceExplained'
import NewFormSwitchWallet from './NewFormSwitchWallet'
import TPSLExplained from './TPSLExplained'
import NewFormMarketPrice from './NewFormMarketPrice'
import NewTradeSettings from '../common/tradeSetting'
import { IconCash } from '../icon/stroke/IconCash'
import { IconShield } from '../icon/stroke/IconShield'
import IconShield2 from '../icon/stroke/IconShield2'
import {
  getIonShieldByChainSolana,
  getTextMevByChainSolana,
} from '@/pages/detail/orderForm/desktop/component/TradeSetting'
import { isBlackListTokenAddress } from '@/utils/token.ts'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

type DetailOrderType = 'oneClick' | 'marketPrice' | 'limitPrice' | 'trailingTpSl'

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
  baseAmount: z.string({}),
  doublePrincipalAfterPurchase: z.boolean({}),
  tp: z.string({}),
  sl: z.string({}),
  limitPrice: z.string({}),
  limitMarketCap: z.string({}),
  callbackRate: z.string({}),
  triggerPrice: z.string({}),
})

export type FormValues = z.infer<typeof formSchema>

export const EVENT_MESSAGE_ORDER_CREATED = 'EVENT_MESSAGE_ORDER_CREATED'

const OrderForm = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const { t } = useTranslation()
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const isBlackListed = isBlackListTokenAddress(tokenDetail?.address)

  const orderTypesOptions: FilterSelectOption[] = [
    {
      value: 'oneClick' as DetailOrderType,
      label: t('orderForm.tabs.quickTrade'),
    },
    {
      value: 'marketPrice' as DetailOrderType,
      label: t('orderForm.tabs.marketTrade'),
    },
    {
      value: 'limitPrice' as DetailOrderType,
      label: t('orderForm.tabs.limitOrder'),
    },
  ]
  const orderSellOptions: FilterSelectOption[] = [
    {
      value: 'oneClick' as DetailOrderType,
      label: t('orderForm.tabs.quickTrade'),
    },
    {
      value: 'marketPrice' as DetailOrderType,
      label: t('orderForm.tabs.marketTrade'),
    },
    {
      value: 'limitPrice' as DetailOrderType,
      label: t('orderForm.tabs.limitOrder'),
    },
    {
      value: 'trailingTpSl' as DetailOrderType,
      label: t('orderForm.tabs.trailingStopLoss'),
    },
  ]

  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')
  const [orderType, setOrderType] = useState<DetailOrderType>(orderTypesOptions[0].value as DetailOrderType)
  const activeWallet = useSelector(_activeWallet)
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const priceToken = useAppSelector((state) => state.tokenDetail?.price)
  const priceNativeToken = useAppSelector(priceChain(activeChain))

  useEffect(() => {
    if (activeWallet?.isConnected) {
      setShowLoginDrawer(false)
    }
  }, [activeWallet?.isConnected])

  const { handleGetErrorMessage } = useGetErrorMsg()
  const {
    showToastProcessOrder,
    showErrorMessageSubmitOrder,
    newHiddenToastProcessOrder,
    showToastSubmittedSuccessOrder,
    isOrderProcessing,
  } = useShowToastOrder()
  const [isOneClickTrading, setIsOneClickTrading] = useState(ls.get('isOneClickTrading') ?? false)

  const setDefaultValue = () => {
    return {
      transactionType: TransactionType.Buy,
      type: OrderType.Market,
      baseAddress: '', //Token1
      quoteAddress: SOL_ADDRESS,
      userAddress: activeWallet?.walletAddress,
      quoteAmount: '',
      baseAmount: '',
      doublePrincipalAfterPurchase: false,
      chainId: ChainIds.Solana + '',
    }
  }

  const { preference } = usePreference()
  const priceChangeColor = preference?.priceChangeColor || 'normal'
  const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
  const [isToken2022, setIsToken2022] = useState<boolean>(false)

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: setDefaultValue(),
  })
  const { totalToken: totalToken, setTotalToken } = useGetHoldingToken(tokenDetail)
  const { handleSubmit, setValue, watch } = methods
  const doublePrincipalAfterPurchase = watch('doublePrincipalAfterPurchase')
  const transactionType = watch('transactionType')
  const baseAmount = watch('baseAmount')
  const quoteAmount = watch('quoteAmount')
  const limitMarketCap = watch('limitMarketCap')

  const { slippage, config, fee, briberyFee, priorityFeePriceOrder, isWarningMinPriorityFee, isWarningMinBriberyFee } =
    useTradeConfig({
      transactionType: transactionType as TransactionType,
    })

  useEffect(() => {
    if (orderType) {
      if (orderType === 'oneClick' || orderType === 'marketPrice') {
        setValue('type', OrderType.Market)
      }
      if (orderType === 'limitPrice') {
        setValue('type', OrderType.Limit)
      }
      if (orderType === 'trailingTpSl') {
        setValue('type', OrderType.TrailingTpsl)
      }
    }
  }, [orderType])

  useEffect(() => {
    if (activeChain !== TYPE_CHAIN.SOLANA) return
    if (tokenDetail?.address) {
      jupOrderRef.current = null
      fetchIsToken2022(tokenDetail?.address).then((isNewVersion: boolean) => setIsToken2022(isNewVersion))
    }
  }, [tokenDetail])

  const handleCheckErrorSubmitCreateOrder = (values: FormValues) => {
    // if (!values?.quoteAmount) {
    //   toast.error(t('orderForm.errors.orderInvalidAmount'))
    //   return false
    // }

    if (activeWallet?.balance?.formatted < getMinBalanceTradeByChain(activeChain)) {
      toast.error(
        t('orderForm.errors.rechargeIfBalanceInsufficientMinimum', {
          chain: getNativeTokenByActiveChain(activeChain),
          balance: getMinBalanceTradeByChain(activeChain),
        }),
      )
      return false
    }

    if (values.transactionType === TransactionType.Buy) {
      if (+values?.quoteAmount > +activeWallet?.balance?.formatted) {
        toast.error(t('orderForm.errors.rechargeIfBalanceInsufficient'))
        return false
      }
      const estimateQuoteAmount = +values?.quoteAmount * 1.01 + BASIC_FEE
      if (estimateQuoteAmount > activeWallet?.balance?.formatted && values.transactionType === TransactionType.Buy) {
        toast.error(t('orderForm.errors.rechargeIfBalanceInsufficient'))
        return false
      }

      if (+values?.quoteAmount < MIN_BALANCE_FORM_BUY) {
        toast.error(
          t('orderForm.errors.minimumOrderQuantity', {
            balance: MIN_BALANCE_FORM_BUY,
            chain: getNativeTokenByActiveChain(activeChain),
          }),
        )
        return false
      }
    }
    if (!tokenDetail) {
      toast.error(t('orderForm.errors.noTokenAvailable'))
      return false
    }

    if (values.transactionType === TransactionType.Sell) {
      if (+values?.baseAmount === 0) {
        toast.error(
          t('orderForm.errors.minimumOrderQuantity', {
            balance: MIN_BALANCE_FORM_SELL,
            chain: getNativeTokenByActiveChain(activeChain),
          }),
        )
        return false
      }

      if (+values?.baseAmount > +totalToken) {
        toast.error(t('orderForm.errors.Order_CreateOrder_InsufficientTokenBalance'))
        return false
      }

      if (!values.callbackRate && values.type === OrderType.TrailingTpsl) {
        toast.error(t('orderForm.errors.invalidCallbackRate'))
        return false
      }

      const price = !!priceToken ? +priceToken : +tokenDetail.price
      const quoteAmountFormSell = (+values?.baseAmount * price) / +priceNativeToken
      if (quoteAmountFormSell < MIN_BALANCE_FORM_SELL) {
        toast.error(
          t('orderForm.errors.minimumOrderQuantity', {
            balance: MIN_BALANCE_FORM_SELL,
            chain: getNativeTokenByActiveChain(activeChain),
          }),
        )
        return false
      }

      if (orderType === 'trailingTpSl' && values?.triggerPrice !== '' && +values?.triggerPrice <= 0) {
        toast.error(t('orderForm.errors.invalidActivationPrice'))
        return false
      }
    }

    return true
  }

  const createOrderByTele = async (params: CreateOrderInput) => {
    setIsLoading(true)
    const id = new Date().getTime() + ''
    const orderProcessParam = {
      ...params,
      id,
      marketCap: tokenDetail?.marketCap,
      baseSymbol: tokenDetail?.symbol,
      quoteSymbol: getNativeTokenByActiveChain(activeChain),
    } as Order
    if (params?.type === OrderType.Market) {
      showToastProcessOrder(orderProcessParam)
    }
    if (params?.transactionType === TransactionType.Buy || params?.transactionType === TransactionType.Sell) {
      const action = params?.transactionType === TransactionType.Buy ? ACTIONS.meme_buy : ACTIONS.meme_sell
      logEvent2(action, {
        token_address: params.baseAddress || '',
        amount: params.baseAmount || '',
        slippage: params.slippage || '',
      })
    }
    dispatch(orderActions.newCreateOrder({ input: params }))
      .then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const orderRes = res?.payload?.createOrder
          if (params?.type === OrderType.Market) {
            newHiddenToastProcessOrder({ ...orderRes, id: id })
            showToastSubmittedSuccessOrder(orderRes)

            const dataPending: PendingOrder = {
              ...orderRes,
              logoUrl: tokenDetail?.info?.logoUrl,
              lastTxTime: orderRes?.updatedAt,
            }
            channel.postMessage({ data: dataPending })
            appendToLocalStorageArrayWithTTL<PendingOrder>('holdingUnCompleted', dataPending, TTL_PORTFOLIO_STORAGE)
            if (transactionType === TransactionType.Sell) {
              setTotalToken((prev) => {
                const total = new Decimal(prev).sub(orderRes?.baseAmount)
                return total.toString()
              })
            }
          } else {
            toast.success(t('orderForm.status.createOrderSuccess'))
          }
        } else {
          newHiddenToastProcessOrder(orderProcessParam)
          const errCode = res?.payload?.[0]?.code as string
          // console.log('errCode', errCode, res)

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
  const [privateKey, setPrivateKey] = useState('')

  const bundle = useAppSelector((state) =>
    state.newWallet.bundle?.find((item: any) => item?.key === activeWallet?.walletAddress),
  )
  const token = useSelector(_userInfo)?.refresh_token
  const { feeAccount, platformFee, xstockPlatformFee } = useNetworkFee()
  const networkFee = useGetNetworkFee(activeChain as TYPE_CHAIN) as SolanaNetworkFee

  useEffect(() => {
    if (bundle && token) {
      const dec = decryptPrivateKey(
        Buffer.from(bundle?.privateKeyEncrypted, 'base64'),
        Buffer.from(bundle?.iv, 'base64'),
        bundle?.key + token,
      )

      dec
        .then((key) => {
          // console.log('private key decrypted: ', key)
          setPrivateKey(key)
        })
        .catch((err) => console.error('Error decrypting private key:', err))
    }
  }, [bundle, token])

  async function onSubmit(values: FormValues) {
    if (!handleCheckErrorSubmitCreateOrder(values)) return
    let signedTx: string | null = null

    try {
      if (privateKey && jupOrderRef.current?.transaction) {
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKey))
        const transactionBuff = Buffer.from(jupOrderRef.current?.transaction, 'base64')
        const transaction = VersionedTransaction.deserialize(transactionBuff)

        transaction.sign([keypair])
        signedTx = Buffer.from(transaction.serialize()).toString('base64')
      }
    } catch (error) {
      console.log('Failed to signing', {
        error,
        transaction: jupOrderRef.current?.transaction,
        userAddress: activeWallet?.walletAddress,
      })
    }

    console.log('values', values)
    let params: CreateOrderInput = {} as CreateOrderInput
    params = {
      ...params,
      ...values,
      chainId: getChainId(activeChain).toString(),
      quoteAddress: getQuoteAddessByChain(activeChain).toString(),
      quoteAmount: values.quoteAmount,
      baseAmount: values.baseAmount,
      userAddress: activeWallet?.walletAddress,
      baseAddress: tokenDetail?.address ? tokenDetail?.address : '',
      priorityFeePrice: priorityFeePriceOrder + '',
      slippage: slippage + '',
      ...(activeChain !== TYPE_CHAIN.SOLANA && { mevProtect: config?.mevProtect }),
      ...(activeChain === TYPE_CHAIN.SOLANA && {
        mevProtectionType: config?.mevProtectionType,
        engine:
          mode === 'swap' ? SubmitEngineType.Swap : mode === 'ultra' ? SubmitEngineType.Ultra : SubmitEngineType.Swap,
        transaction: jupOrderRef.current?.transaction,
        signedTx: signedTx,
        customRPC: config?.customRpc,
        briberyFeePrice: briberyFee,
      }),
    } as CreateOrderInput

    if (orderType === 'trailingTpSl') {
      params.callbackRate = +values?.callbackRate / 100
    } else {
      delete params['callbackRate']
      delete params['triggerPrice']
      // delete params['limitPrice']
    }
    if (values?.limitPrice) {
      delete params['limitMarketCap']
    }
    if (values?.limitMarketCap) {
      delete params['limitPrice']
    }
    if (values.transactionType === TransactionType.Buy) {
      delete params['baseAmount']
    }
    if (values.transactionType === TransactionType.Sell) {
      delete params['quoteAmount']
      delete params['doublePrincipalAfterPurchase']
    }
    console.log('[params create order]: ', params)
    createOrderByTele(params).catch(console.error)
    // if (activeAccount === TYPE_ACCOUNT.TELEGRAM) {
    //   createOrderByTele(params).catch(console.error)
    // }
    // if (activeAccount === TYPE_ACCOUNT.CHAIN) {
    //   if (activeChain === TYPE_CHAIN.ETH) {
    //     toast.info(t('orderForm.errors.changeTeleWalletToContinue'))
    //     return
    //   }
    //   createOrderByWallet(params).catch(console.error)
    // }
  }

  const jupOrderRef = useRef<JupiterOrderResponse | null>(null)

  useEffect(() => {
    if (!activeWallet?.isConnected || activeChain !== TYPE_CHAIN.SOLANA) return

    let unmounted = false
    const start = () => {
      if (unmounted) {
        return
      }
      const tokenAddress = tokenDetail?.address || ''
      const isBuy = transactionType == TransactionType.Buy
      const inputMint = isBuy ? SOL_ADDRESS : tokenAddress
      const outputMint = !isBuy ? SOL_ADDRESS : tokenAddress
      const inputDecimals = isBuy ? SOL_DECIMALS : Number(tokenDetail?.decimals) || 9

      const preOrder: PreOrder = {
        userAddress: activeWallet?.walletAddress,
        inputMint,
        outputMint,
        amount:
          transactionType === TransactionType.Sell
            ? new Decimal(!!baseAmount ? +baseAmount : 0)
            : new Decimal(!!quoteAmount ? quoteAmount : 0),
        inputDecimals,
        slippage: slippage,
        priorityFee: new Decimal(fee),
        mevProtect: config?.mevProtect || false,
        isToken2022,
        dexes: tokenDetail?.dexes || [],
        priorityFeePrice: new Decimal(priorityFeePriceOrder),
      }

      if (tokenDetail?.dexes?.length === 1 && tokenDetail?.dexes.includes(Launchpad.Pumpfun)) {
        fetchPumpfunOrder(
          preOrder,
          undefined,
          feeAccount ?? networkFee?.feeAccount,
          platformFee ?? networkFee?.platformFee,
        ).then((res) => {
          if (!unmounted) {
            jupOrderRef.current = res
          }

          // if (!res || !res.transaction) {
          //   // retry with Jupiter
          //   fetchJupiterOrder(preOrder).then((res) => {
          //     jupOrderRef.current = res
          //   })
          // }
        })
      } else if (tokenDetail?.tags?.includes(X_STOCK_TAG)) {
        fetchJupiterOrder(
          preOrder,
          feeAccount ?? networkFee?.feeAccount,
          xstockPlatformFee ?? networkFee.xstockPlatformFee,
        ).then((res) => {
          if (!unmounted) {
            jupOrderRef.current = res
          }
        })
      }
    }
    const startDebounce = debounce(start, 200)
    startDebounce()
    const interval = setInterval(startDebounce, 5000)
    return () => {
      unmounted = true
      clearInterval(interval)
    }
  }, [
    transactionType,
    quoteAmount,
    baseAmount,
    slippage,
    fee,
    tokenDetail,
    isToken2022,
    activeWallet?.isConnected,
    activeChain,
  ])

  const onConfirmSubmit = () => {
    const formValues = methods.getValues()
    onSubmit(formValues)
  }

  const isShowMessageTradeWeb3 = false

  const bgBuy = priceChangeColor === 'normal' ? 'bg-[#00a85c] shadow-inset-green' : 'bg-[#EA3B4F] shadow-inset-red'
  const bgSell = priceChangeColor === 'normal' ? 'bg-[#EA3B4F] shadow-inset-red' : 'bg-[#00a85c] shadow-inset-green'
  const bgMultiBuy = priceChangeColor === 'normal' ? 'bg-[#00a85c] shadow-multi-green' : 'bg-[#EA3B4F] shadow-multi-red'
  const bgMultiSell =
    priceChangeColor === 'normal' ? 'bg-[#EA3B4F] shadow-multi-red' : 'bg-[#00a85c] shadow-multi-green'
  const getButtonLabel = () => {
    const { t } = useTranslation()
    const baseSymbol = tokenDetail?.symbol || ''
    const isSell = transactionType === TransactionType.Sell
    const defaultLabel = isSell ? t('orderForm.form.sell') : t('orderForm.form.buy')
    const actionText = isSell ? t('orderForm.form.sell') : t('orderForm.form.buy')
    const isLoggedIn = activeWallet?.isConnected

    if (transactionType === TransactionType.Buy) {
      if (!isLoggedIn) {
        return t('orderForm.form.loginToBuy')
      }
    }

    if (transactionType === TransactionType.Sell) {
      if (!isLoggedIn) {
        return t('orderForm.form.loginToSell')
      }
    }

    const chainIcon =
      activeChain === TYPE_CHAIN.SOLANA ? (
        <IconSolana color={'#ffffff'} className="w-5 h-5" />
      ) : (
        <img src={LIST_CHAIN_SUPPORTED.find((item) => item.value === activeChain)?.img} className="w-5 h-5" alt="" />
      )

    const renderLabelWithIcon = (action: string, amount?: string | number, showIcon = true, midText?: string) => (
      <div className="flex items-center gap-1 overflow-hidden">
        <span className="truncate">{`${action}${midText ?? ' '}${baseSymbol} ${amount}`}</span>
        {showIcon && chainIcon}
      </div>
    )

    if (orderType === 'oneClick' && Number(quoteAmount) > 0 && transactionType === TransactionType.Buy) {
      return renderLabelWithIcon(actionText, formatMoney(Number(quoteAmount), false))
    }

    if (orderType === 'oneClick' && Number(baseAmount) > 0 && transactionType === TransactionType.Sell) {
      return renderLabelWithIcon(actionText, '', false, ` ${formatMoney(Number(baseAmount), false)} `)
    }

    if (orderType === 'marketPrice' && Number(quoteAmount) > 0) {
      return renderLabelWithIcon(actionText, formatMoney(Number(quoteAmount), false))
    }

    if (orderType === 'limitPrice' && Number(limitMarketCap) > 0 && Number(quoteAmount) > 0) {
      return renderLabelWithIcon(
        actionText,
        formatMoney(Number(quoteAmount), false),
        true,
        ` @${formatMoney(Number(limitMarketCap))} ${t('orderBook.marketCap')} `,
      )
    }

    if (orderType === 'limitPrice' && Number(quoteAmount) > 0) {
      return renderLabelWithIcon(actionText, formatMoney(Number(quoteAmount), false))
    }

    return defaultLabel
  }

  return (
    <FormProvider {...methods}>
      <form className="w-[calc(60%-4px)] rounded-[6px] ml-auto" onSubmit={handleSubmit(onSubmit)}>
        {activeWallet.isConnected && (
          <NewFormSwitchWallet
            token={tokenDetail?.address}
            logoUrl={tokenDetail?.info?.logoUrl}
            symbol={tokenDetail?.symbol}
          />
        )}
        <div className="flex w-full mb-2 text-center bg-[#1a1a20] relative h-[30px] rounded-[26px]">
          <div
            className={clsx(
              'flex-1 rounded-full py-2 font-medium text-[14px] leading-none cursor-pointer',
              transactionType === TransactionType.Buy ? `${bgBuy}` : 'bg-transparent',
            )}
            onClick={() => {
              setValue('transactionType', TransactionType.Buy)
              if (orderType === 'trailingTpSl') {
                setOrderType('oneClick')
              }
            }}
          >
            {t('orderForm.tabs.buy')}
          </div>
          <div
            className={clsx(
              'flex-1 rounded-full py-2 font-medium text-[14px] leading-none cursor-pointer',
              transactionType === TransactionType.Sell ? `${bgSell}` : 'bg-transparent',
            )}
            onClick={() => {
              setValue('transactionType', TransactionType.Sell)
            }}
          >
            {t('orderForm.tabs.sell')}
          </div>
        </div>
        <div className="relative">
          <FilterSelect
            options={transactionType === TransactionType.Buy ? orderTypesOptions : orderSellOptions}
            value={orderType}
            onValueChange={(value) => {
              setOrderType(value as DetailOrderType)
            }}
            selectTriggerProps={{
              className: cn(
                'w-full max-w-auto justify-start bg-[#201e25] rounded-[6px] border-none relative p-2.5 leading-none text-white mb-2 !shadow-inset-dark text-[14px] tex-white',
                // lang === 'en' ? '[&>span>div]:leading-[16px]' : '',
              ),
            }}
            triggerIconClassname="w-4 h-4 absolute top-[50%] translate-y-[-50%] right-2.5"
            triggerIcon="/images/icons/ic-down-new.svg"
            childrenTrigger={<></>}
            infoProps={
              orderType === 'limitPrice' ? (
                <LimitPriceExplained />
              ) : orderType === 'trailingTpSl' ? (
                <TPSLExplained />
              ) : (
                <></>
              )
            }
          />
          {/* {orderType === 'trailingTpSl' && <TPSLExplained />} */}
          {/* {orderType === 'limitPrice' && <LimitPriceExplained />} */}
        </div>
        {orderType === 'oneClick' && <FormOneClick tokenDetail={tokenDetail} totalToken={totalToken} />}
        {/* {orderType === 'marketPrice' && <FormMarketPrice tokenDetail={tokenDetail} totalToken={totalToken} />} */}
        {orderType === 'marketPrice' && <NewFormMarketPrice tokenDetail={tokenDetail} totalToken={totalToken} />}
        {orderType === 'limitPrice' && <FormLimitPrice tokenDetail={tokenDetail} totalToken={totalToken} />}
        {orderType === 'trailingTpSl' && <FormTrailing tokenDetail={tokenDetail} totalToken={totalToken} />}

        {transactionType === TransactionType.Buy && (
          <div className="flex items-center gap-1.5 mt-4 h-[16px]">
            <CheckboxWithLabel
              defaultChecked={doublePrincipalAfterPurchase}
              label={t('orderForm.form.doublePrincipalAfterPurchase')}
              onChange={(value) => {
                setValue('doublePrincipalAfterPurchase', !!value)
              }}
              labelWrapperClassName="text-[11px] leading-none text-[#908e98]"
            />
            <DoublePrincipalAfterPurchaseExplained />
            {/* <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <img src="/images/orderSetting/icon-info.svg" className="w-[12px] min-w-[12px]" alt="" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[360px]">
                    <p className="text-xs leading-[16px]">{t('walletDetail.tooltip.doublePrincipal')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
          </div>
        )}
        <NewTradeSettings
          open={openTradeSettings}
          setOpen={setOpenTradeSettings}
          type={2}
          transactionType={transactionType as TransactionType}
        />
        <div className="w-full mt-2.5 bg-[#ECECED14] rounded-[2px] px-1.5 py-[5px] flex items-center gap-[3px]">
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="w-full flex item-center gap-3">
              <div className="flex items-center gap-[3px]">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <img src="/images/icons/slippage.svg" alt="slippage" className="h-3 w-3 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[360px]">
                      <p className="text-xs leading-none">{t('tradeSettings.slippage')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-[400] text-[11px] text-[#CCCADB] whitespace-nowrap">
                  {formatPercent(slippage * 100)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-[3px]">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <img src="/images/icons/gas-fee.svg" alt="gas-fee" className="h-3 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[360px]">
                      <p className="text-xs leading-none">{t('tradeSettings.priorityFee')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span
                  className={cn('font-[400] text-[11px] text-[#CCCADB] whitespace-nowrap', {
                    'text-[#EA963A]': isWarningMinPriorityFee,
                  })}
                >
                  {formatAmount(fee, {
                    roundMode: 'ceil',
                  })}
                  {/* {` ${getNativeTokenByActiveChain(activeChain)}`} */}
                </span>
              </div>
              {activeChain === TYPE_CHAIN.SOLANA && (
                <div className="flex items-center justify-center gap-[3px]">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <IconCash className="w-3 h-3 ml-3 text-[#878787]" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[360px]">
                        <p className="text-xs leading-none">{t('tradeSettings.priorityFee')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span
                    className={cn('font-[400] text-[11px] text-[#CCCADB] whitespace-nowrap', {
                      'text-[#EA963A]': isWarningMinBriberyFee,
                    })}
                  >
                    {formatAmount(briberyFee, {
                      roundMode: 'ceil',
                    })}
                    {/* {` ${getNativeTokenByActiveChain(activeChain)}`} */}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-end gap-[3px] text-right">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      {activeChain !== TYPE_CHAIN.SOLANA &&
                        (config?.mevProtect ? (
                          <IconShield className="w-3 h-3 text-[#878787]" />
                        ) : (
                          <IconShield2 className="w-3 h-3 text-[#878787]" />
                        ))}
                      {activeChain === TYPE_CHAIN.SOLANA && getIonShieldByChainSolana(config?.mevProtectionType)}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[360px]">
                      <p className="text-xs leading-none">{t('tradeSettings.antiClipping')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-[400] text-[11px] text-[#CCCADB] whitespace-nowrap">
                  {activeChain !== TYPE_CHAIN.SOLANA &&
                    (config?.mevProtect ? t('tradeSettings.antiClippingOn') : t('tradeSettings.antiClippingOff'))}
                  {activeChain === TYPE_CHAIN.SOLANA && getTextMevByChainSolana(t, config?.mevProtectionType)}
                </span>
              </div>
            </div>
          </div>
          <img
            src="/images/icons/arrow-down-icon.svg"
            className="w-[12px] min-w-[12px] cursor-pointer"
            onClick={() => setOpenTradeSettings(true)}
            alt=""
          />
        </div>
        {isOneClickTrading || !activeWallet?.isConnected ? (
          <>
            {isShowMessageTradeWeb3 ? (
              <p className="text-[#FF5454] text-[calc(1rem*14/16)] pt-[5px] pb-[2px]">
                {t('orderForm.form.errExternalWallet')}
              </p>
            ) : (
              <Button
                disabled={isLoading || isShowMessageTradeWeb3 || isOrderProcessing || isBlackListed}
                type="submit"
                className={cn(
                  'rounded-full w-full mt-[10px] hover-scale text-[#fff]',
                  transactionType === TransactionType.Sell ? `${bgMultiSell}` : `${bgMultiBuy}`,
                )}
                onClick={() => {
                  if (!activeWallet?.isConnected) {
                    setShowLoginDrawer(true)
                    return
                  }
                  onConfirmSubmit()
                }}
              >
                {(isLoading || isOrderProcessing) && <LoadingSpinner size={16} />}
                {getButtonLabel()}
              </Button>
            )}
          </>
        ) : (
          <PopupConfirmSubmitOrder
            transactionType={transactionType}
            onConfirmSubmit={() => onConfirmSubmit()}
            disabled={
              isLoading || !activeWallet?.isConnected || isShowMessageTradeWeb3 || isOrderProcessing || isBlackListed
            }
            showLoading={isLoading || isOrderProcessing}
            isShowMessageTradeWeb3={isShowMessageTradeWeb3}
            priceChangeColor={priceChangeColor}
            orderType={orderType}
            baseSymbol={tokenDetail?.symbol || ''}
            setIsOneClickTrading={setIsOneClickTrading}
            buttonLabel={getButtonLabel()}
            bgBuy={bgMultiBuy}
            bgSell={bgMultiSell}
          />
        )}
      </form>
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
    </FormProvider>
  )
}

export default OrderForm

const PopupConfirmSubmitOrder = ({
  transactionType,
  onConfirmSubmit,
  disabled,
  isShowMessageTradeWeb3,
  showLoading = false,
  priceChangeColor = 'normal',
  setIsOneClickTrading,
  buttonLabel,
  bgBuy,
  bgSell,
}: {
  transactionType: string
  onConfirmSubmit: () => void
  disabled: boolean
  isShowMessageTradeWeb3: boolean
  showLoading?: boolean
  priceChangeColor?: 'normal' | 'inverse'
  orderType?: string
  baseSymbol?: string
  setIsOneClickTrading?: Dispatch<any>
  buttonLabel?: React.ReactNode
  bgBuy?: string
  bgSell?: string
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(ls.get('isOneClickTrading') ?? false)

  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)

  // const bgConfirmBuy =
  //   priceChangeColor === 'normal' ? '!bg-gradient-to-r !from-[#01AC79] !to-[#00e9a4]' : 'red-gradient'
  // const bgConfirmSell =
  //   priceChangeColor === 'normal' ? 'red-gradient' : '!bg-gradient-to-r !from-[#01AC79] !to-[#00e9a4]'
  const bgConfirmBuy = bgBuy
  const bgConfirmSell = bgSell

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild className={isShowMessageTradeWeb3 ? 'pointer-events-none' : ''}>
          {isShowMessageTradeWeb3 ? (
            <p className="text-[#FF5454] text-[calc(1rem*14/16)] pt-[5px] pb-[2px]">
              {t('orderForm.form.errExternalWallet')}
            </p>
          ) : (
            <Button
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault()
                if (enabled) {
                  setOpenRestrictRegiongDialog(true)
                } else {
                  setOpen(true)
                }
              }}
              className={cn(
                'rounded-full w-full mt-[10px] hover-scale text-[#fff]',
                transactionType === TransactionType.Sell ? bgConfirmSell : bgConfirmBuy,
              )}
            >
              {showLoading && <LoadingSpinner size={16} />}

              {buttonLabel}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="w-[335px] bg-[#232329] rounded-2xl p-5">
          <DialogTitle></DialogTitle>
          <DialogHeader>
            <p className="text-lg leading-none font-medium pt-3">{t('orderForm.form.confirmBuying')}?</p>
            <div className="flex items-center gap-1.5 mt-2">
              <CheckboxWithLabel
                label={t('orderForm.form.noMorePrompt')}
                defaultChecked={checked}
                onChange={(value) => setChecked(value)}
                containerClassName="mt-0.5"
                labelWrapperClassName="text-[15px] text-[#ffffffb3]"
              />
            </div>
            <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
              <Button variant="close" className="flex-1" onClick={() => setOpen(false)}>
                {t('orderForm.form.cancel')}
              </Button>
              <Button
                variant="gradient"
                className="text-[#261236] flex-1 rounded-[50px]"
                onClick={() => {
                  ls.set('isOneClickTrading', checked)
                  if (setIsOneClickTrading) {
                    setIsOneClickTrading(checked)
                  }
                  onConfirmSubmit()
                  setOpen(false)
                }}
              >
                {t('orderForm.form.sure')}
              </Button>
            </div>
          </DialogHeader>
          <DialogDescription />
        </DialogContent>
      </Dialog>

      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </>
  )
}
