import { CreateOrderInput, Order, OrderType, SubmitEngineType, TransactionType } from '@/@generated/gql/graphql-trading'
import { Button } from '@/components/ui/button'
import { usePreference } from '@/hooks/usePreference'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import LoadingSpinner from '@/components/ui/loading-spinner'
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'
import ls from '@/lib/local-storage'
import {
  BASIC_FEE,
  getNativeTokenByActiveChain,
  getQuoteAddessByChain,
  LIST_CHAIN_SUPPORTED,
  MIN_BALANCE_FORM_BUY,
  MIN_BALANCE_FORM_SELL,
  SOL_ADDRESS,
  TYPE_CHAIN,
  getMinBalanceTradeByChain,
} from '@/lib/blockchain'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { formatMoney } from '@/utils/helpers'
import { debounce } from 'lodash-es'
import useShowToastOrder from '@/hooks/useShowToastOrder'
import { X_STOCK_TAG } from '@/lib/constant'
import { cn } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import { OrderFormType } from '../../useOrderForm'
import { toast } from 'sonner'
import { useNetworkFee } from '@/hooks/useNetworkFee'
import {
  fetchIsToken2022,
  fetchJupiterOrder,
  fetchPumpfunOrder,
  JupiterOrderResponse,
  PreOrder,
} from '@/services/onchain.service'
import { decryptPrivateKey } from '@/utils/agent/cryptoUtils'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { Keypair, VersionedTransaction } from '@solana/web3.js'
import { SolanaNetworkFee, useGetNetworkFee } from '@/hooks/useGetNetWorkFee'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { SOL_DECIMALS } from '@/hooks/useCreateOrder'
import Decimal from 'decimal.js'
import { Launchpad, TokenDetail } from '@/@generated/gql/graphql-meme2'
import { EVENT_MESSAGE_ORDER_CREATED } from '@/components/orderForm'
import useGetErrorMsg from '@/hooks/useGetErrorMsg'
import { orderActions } from '@/redux/modules/order.slice'
import DialogLoginNewLoginDrawer from '@/components/PC/DialogLoginNewLoginDrawer'
import { useGetHoldingToken } from '../hook/useGetHoldingToken'
import { priceChain } from '@/redux/modules/price.slice'
import { useTradeConfig } from '@/hooks/useTradeConfig'
import { appendToLocalStorageArrayWithTTL } from '@/utils/storage'
import { TTL_PORTFOLIO_STORAGE } from '@/const/configs'
import { PendingOrder } from '@/components/myPositions/useHoldingData'
import RestrictRegiongDialog from '@/components/RestrictRegiongDialog'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { isBlackListTokenAddress } from '@/utils/token.ts'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

const ButtonSubmitOrder = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const { t } = useTranslation()
  const { watch, getValues } = useFormContext<OrderFormType>()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const priceToken = useAppSelector((state) => state.tokenDetail?.price)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const activeWallet = useSelector(_activeWallet)
  const [isOneClickTrading, setIsOneClickTrading] = useState(ls.get('isOneClickTrading') ?? false)
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isToken2022, setIsToken2022] = useState<boolean>(false)
  const [privateKey, setPrivateKey] = useState('')
  const {
    showToastProcessOrder,
    showErrorMessageSubmitOrder,
    newHiddenToastProcessOrder,
    showToastSubmittedSuccessOrder,
    isOrderProcessing,
  } = useShowToastOrder()

  const isBlackListed = isBlackListTokenAddress(tokenDetail?.address)
  const jupOrderRef = useRef<JupiterOrderResponse | null>(null)
  const transactionType = watch('transactionType')
  const orderType = watch('orderType')
  const limitMarketCap = watch('limitMarketCap')
  const quoteAmount = watch('quoteAmount')
  const baseAmount = watch('baseAmount')
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')
  const dispatch = useAppDispatch()
  const { slippage, config, fee, priorityFeePriceOrder, briberyFee } = useTradeConfig({
    transactionType: transactionType as TransactionType,
  })

  const bundle = useAppSelector((state) =>
    state.newWallet.bundle?.find((item: any) => item?.key === activeWallet?.walletAddress),
  )
  const token = useSelector(_userInfo)?.refresh_token
  const { feeAccount, platformFee, xstockPlatformFee } = useNetworkFee()
  const networkFee = useGetNetworkFee(activeChain as TYPE_CHAIN) as SolanaNetworkFee
  const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
  const { handleGetErrorMessage } = useGetErrorMsg()

  const getButtonLabel = () => {
    const { t } = useTranslation()
    const baseSymbol = tokenDetail?.symbol || ''
    const defaultLabel = t('orderForm.form.confirmOrder')
    const isSell = transactionType === TransactionType.Sell
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

    const chainIcon = (
      <img src={LIST_CHAIN_SUPPORTED.find((item) => item.value === activeChain)?.img} className="w-3 h-3" alt="" />
    )

    const renderLabelWithIcon = (action: string, amount?: string | number, showIcon = true, midText?: string) => (
      // <div className="flex items-center gap-1 overflow-hidden">
      //   <span className="truncate">{`${action}${midText ?? ' '}${baseSymbol} ${amount}`}</span>
      //   {showIcon && chainIcon}
      // </div>
      <div className="flex items-center gap-1 overflow-hidden">
        {/* <span className="truncate">{`${action}${midText ?? ' '}${baseSymbol} ${amount}`}{showIcon && chainIcon}</span> */}
        {`${action}${' '}${baseSymbol} ${amount}`}
        {showIcon && chainIcon}
        {`${midText ?? ' '}`}
      </div>
    )

    if (orderType === 'marketPrice' && Number(quoteAmount) > 0 && transactionType === TransactionType.Buy) {
      return renderLabelWithIcon(actionText, formatMoney(Number(quoteAmount), false))
    }

    if (orderType === 'marketPrice' && Number(baseAmount) > 0 && transactionType === TransactionType.Sell) {
      return renderLabelWithIcon(actionText, formatMoney(Number(quoteAmount), false))
    }

    // if (orderType === 'marketPrice' && Number(quoteAmount) > 0) {
    //   return renderLabelWithIcon(actionText, formatMoney(Number(quoteAmount), false))
    // }

    if (orderType === 'limitPrice' && Number(limitMarketCap) > 0 && Number(quoteAmount) > 0) {
      const limitQuoteAmount =
        transactionType === TransactionType.Buy
          ? quoteAmount
          : (+quoteAmount * +limitMarketCap!) / +tokenDetail?.marketCap

      return renderLabelWithIcon(
        actionText,
        formatMoney(Number(limitQuoteAmount), false),
        true,
        ` @${formatMoney(Number(limitMarketCap))} ${t('orderBook.marketCap')} `,
      )
    }

    if (orderType === 'limitMarketCap' && Number(limitMarketCap) > 0 && Number(quoteAmount) > 0) {
      return renderLabelWithIcon(
        actionText,
        formatMoney(Number((+quoteAmount * +limitMarketCap!) / +tokenDetail?.marketCap), false),
        true,
        ` @${formatMoney(Number(limitMarketCap))} ${t('orderBook.marketCap')} `,
      )
    }

    if (orderType === 'limitPrice' && Number(quoteAmount) > 0) {
      return renderLabelWithIcon(actionText, formatMoney(Number(quoteAmount), false))
    }

    return defaultLabel
  }

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

  useEffect(() => {
    if (activeWallet?.isConnected) {
      setShowLoginDrawer(false)
    }
  }, [activeWallet?.isConnected])

  const { preference } = usePreference()
  const priceChangeColor = preference?.priceChangeColor || 'normal'

  const bgbuy = priceChangeColor === 'normal' ? 'bg-gradient-to-r !from-[#01AC79] !to-[#00e9a4]' : 'red-gradient'
  const bgsell = priceChangeColor === 'normal' ? 'red-gradient' : 'bg-gradient-to-r !from-[#01AC79] !to-[#00e9a4]'

  const { totalToken: totalToken, setTotalToken } = useGetHoldingToken(tokenDetail)

  const handleCheckErrorSubmitCreateOrder = (values: OrderFormType) => {
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
            balance: 0.0001,
            chain: getNativeTokenByActiveChain(activeChain),
          }),
        )
        return
      }
      if (+values?.baseAmount > +totalToken) {
        toast.error(t('orderForm.errors.Order_CreateOrder_InsufficientTokenBalance'))
        return
      }

      if (!values.callbackRate && values.type === OrderType.TrailingTpsl) {
        toast.error(t('orderForm.errors.selectTransactionQuantity'))
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
    }
    return true
  }

  useEffect(() => {
    if (activeChain !== TYPE_CHAIN.SOLANA) return
    if (tokenDetail?.address) {
      jupOrderRef.current = null
      fetchIsToken2022(tokenDetail?.address).then((isNewVersion: boolean) => setIsToken2022(isNewVersion))
    }
  }, [tokenDetail])

  useEffect(() => {
    if (!activeWallet?.isConnected || activeChain !== TYPE_CHAIN.SOLANA) return

    let unmounted = false
    const start = () => {
      if (unmounted) {
        return
      }
      const tokenAddress = tokenDetail?.address || ''
      const isBuy = transactionType == 'Buy'
      const inputMint = isBuy ? SOL_ADDRESS : tokenAddress
      const outputMint = !isBuy ? SOL_ADDRESS : tokenAddress
      const inputDecimals = isBuy ? SOL_DECIMALS : Number(tokenDetail?.decimals) || 9

      const preOrder: PreOrder = {
        userAddress: activeWallet?.walletAddress,
        inputMint,
        outputMint,
        amount:
          transactionType === 'Sell'
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
  }, [transactionType, quoteAmount, baseAmount, slippage, fee, tokenDetail, isToken2022, activeWallet?.isConnected])

  const onConfirmSubmit = async () => {
    const values = getValues()
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
    const { orderType, ...rest } = values

    let params: CreateOrderInput = {} as CreateOrderInput
    params = {
      ...params,
      ...rest,
      chainId: activeWallet.chainId.toString(),
      quoteAddress: getQuoteAddessByChain(activeChain).toString(),
      // ...(!!config?.slippage && { slippage: ((config?.slippage !== 'auto' ? config?.slippage : 20) / 100).toString() }),
      quoteAmount: values.quoteAmount,
      baseAmount: values.baseAmount,
      userAddress: activeWallet?.walletAddress,
      baseAddress: tokenDetail?.address ? tokenDetail?.address : '',
      priorityFeePrice: priorityFeePriceOrder.toString(),
      slippage: slippage.toString(),
      ...(activeChain !== TYPE_CHAIN.SOLANA && { mevProtect: config?.mevProtect }),
      ...(activeChain === TYPE_CHAIN.SOLANA && {
        mevProtectionType: config?.mevProtectionType,
        engine:
          mode === 'swap' ? SubmitEngineType.Swap : mode === 'ultra' ? SubmitEngineType.Ultra : SubmitEngineType.Swap,
        transaction: jupOrderRef.current?.transaction,
        signedTx: signedTx,
        ...(!!briberyFee && { briberyFeePrice: briberyFee }),
        ...(!!config?.customRPC && { customRPC: config?.customRPC }),
      }),
    } as CreateOrderInput

    delete params['percent']
    if (orderType === 'trailingTpSl') {
      params.callbackRate = +values?.callbackRate / 100
    } else {
      delete params['callbackRate']
      delete params['triggerPrice']
      // delete params['limitPrice']
    }
    if (values?.limitPrice && +values?.limitPrice > 0) {
      delete params['limitMarketCap']
    }
    if (values?.limitMarketCap && +values?.limitMarketCap > 0) {
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
    onCreateOrder(params).catch(console.error)
  }

  const onCreateOrder = async (params: CreateOrderInput) => {
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

  return (
    <>
      {isOneClickTrading || !activeWallet?.isConnected ? (
        <>
          <Button
            disabled={isLoading || isOrderProcessing || isBlackListed}
            type="submit"
            className={cn(
              'rounded-full w-full mt-[10px] hover-scale text-[#fff]',
              transactionType === TransactionType.Sell ? bgsell : bgbuy,
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
        </>
      ) : (
        <PopupConfirmSubmitOrder
          transactionType={transactionType}
          onConfirmSubmit={() => onConfirmSubmit()}
          disabled={isLoading || !activeWallet?.isConnected || isOrderProcessing || isBlackListed}
          showLoading={isLoading || isOrderProcessing}
          priceChangeColor={priceChangeColor}
          orderType={orderType}
          baseSymbol={tokenDetail?.symbol || ''}
          setIsOneClickTrading={setIsOneClickTrading}
          buttonLabel={getButtonLabel()}
        />
      )}
      {!activeWallet?.isConnected && <DialogLoginNewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />}
    </>
  )
}

export default ButtonSubmitOrder

const PopupConfirmSubmitOrder = ({
  transactionType,
  onConfirmSubmit,
  disabled,
  showLoading = false,
  priceChangeColor = 'normal',
  setIsOneClickTrading,
  buttonLabel,
}: {
  transactionType: string
  onConfirmSubmit: () => void
  disabled: boolean
  showLoading?: boolean
  priceChangeColor?: 'normal' | 'inverse'
  orderType?: string
  baseSymbol?: string
  setIsOneClickTrading?: Dispatch<any>
  buttonLabel?: React.ReactNode
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(ls.get('isOneClickTrading') ?? false)
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)

  const bgConfirmBuy =
    priceChangeColor === 'normal' ? '!bg-gradient-to-r !from-[#01AC79] !to-[#00e9a4]' : 'red-gradient'
  const bgConfirmSell =
    priceChangeColor === 'normal' ? 'red-gradient' : '!bg-gradient-to-r !from-[#01AC79] !to-[#00e9a4]'

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={disabled}
            className={cn(
              'rounded-full w-full mt-[10px] hover-scale text-[#fff]',
              transactionType === TransactionType.Sell ? bgConfirmSell : bgConfirmBuy,
            )}
            onClick={(e) => {
              e.preventDefault()
              if (enabled) {
                setOpenRestrictRegiongDialog(true)
              } else {
                setOpen(true)
              }
            }}
          >
            {showLoading && <LoadingSpinner size={16} />}

            {buttonLabel}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[335px] bg-[#232329] rounded-2xl p-5">
          <DialogTitle></DialogTitle>
          <DialogHeader>
            <p className="text-lg leading-none font-medium pt-3">{t(
              transactionType === TransactionType.Buy
                ? 'orderForm.form.confirmOrderBuy'
                : 'orderForm.form.confirmOrderSell',
            )}</p>
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
