import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { CreateOrderInput, Order, OrderType, SubmitEngineType, TransactionType } from '@/@generated/gql/graphql-trading'
import FilterSelect from '@/components/common/FilterSelect'
import MoneyFormatted from '@/components/common/MoneyFormatted'
import TradeSettingsBottomSheet from '@/components/common/TradeSettingsBottomSheet'
import IconArrowSwap from '@/components/icon/stroke/IconArrowSwap'
import IconBarChart from '@/components/icon/stroke/IconBarChart'
import IconFlash from '@/components/icon/stroke/IconFlash'
import { IconPriorityFee } from '@/components/icon/stroke/IconPriorityFee'
import { IconSetting } from '@/components/icon/stroke/IconSetting'
import { IconShield } from '@/components/icon/stroke/IconShield'
import IconShield2 from '@/components/icon/stroke/IconShield2'
import { IconSlippage } from '@/components/icon/stroke/IconSlippage'
import { EVENT_MESSAGE_ORDER_CREATED } from '@/components/orderForm'
import { Dialog, DialogContent, DialogPortal, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SimpleTooltip } from '@/components/v2/ui-shared/components/SimpleTooltip'
import { SOL_DECIMALS } from '@/hooks/useCreateOrder'
import useGetErrorMsg from '@/hooks/useGetErrorMsg'
import useShowToastOrder from '@/hooks/useShowToastOrder'
import { useTradeConfig } from '@/hooks/useTradeConfig'
import {
  BASIC_FEE,
  getDefaultDecimalsByChain,
  getIconChain,
  getMinBalanceTradeByChain,
  getNativeTokenByActiveChain,
  getQuoteAddessByChain,
  MIN_BALANCE_FORM_SELL,
  TYPE_CHAIN,
} from '@/lib/blockchain'
import ls from '@/lib/local-storage'
import { formatBalanceWallet } from '@/lib/number'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { orderActions } from '@/redux/modules/order.slice'
import { priceChain } from '@/redux/modules/price.slice'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { initialStateTradeConfig, tradeConfigChainSelected } from '@/redux/modules/tradeConfigs.slice'
import { initialTradeSettings, setSelectedPreset, TradeSetting } from '@/redux/modules/tradeSettings.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { decryptPrivateKey } from '@/utils/agent/cryptoUtils'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { SwitchWalletFormTrade } from './wallet/SwitchWalletFormTrade'
import { Rnd } from 'react-rnd'
import { toast } from 'sonner'
import { useGetHoldingToken } from '../hook/useGetHoldingToken'
import { formatPercentage } from '@/utils/helpers'
import { TTL_PORTFOLIO_STORAGE } from '@/const/configs'
import { appendToLocalStorageArrayWithTTL } from '@/utils/storage'
import { PendingOrder } from '@/components/myPositions/useHoldingData'
import { cn } from '@/lib/utils.ts'
import Decimal from 'decimal.js'
import { useGetPortfolioTokenByAddress } from '../hook/useGetPortfolioTokenByAddress'
import { useNewHoldingData } from '@/components/myPositions/hook/useNewHoldingData'
import { useParams } from 'react-router-dom'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { formatAmount, formatBalance, formatPercent } from '@/lib/format'
import { debounce } from 'lodash'
import { useNewTokenPrice } from '@/hooks/useTokenPrice'
import { IconCash } from '@/components/icon/stroke/IconCash'
import { getIonShieldByChainSolana, getTextMevByChainSolana } from './TradeSetting'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import RestrictRegiongDialog from '@/components/RestrictRegiongDialog'

type Position = { x: number; y: number }
Decimal.set({ precision: 100 })

// type Size = { width: number; height: number }

const OneClickTradeDialog = ({
  openDrawer,
  setOpenDrawer,
  tokenDetail,
}: {
  openDrawer: boolean
  setOpenDrawer: Dispatch<SetStateAction<boolean>>
  tokenDetail: TokenDetail
}) => {
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const tradeSettings = useAppSelector((state) => state.tradeSettings.settings) || initialTradeSettings
  const tradeSettingsByChain = tradeSettings?.[activeChain]
  const {
    selectedPresetKey,
    config: configBuy,
    slippage: slippageBuy,
    fee: feeBuy,
    briberyFee: briberyFeeBuy,
    priorityFeePriceOrder: priorityFeePriceOrderBuy,
    isWarningMinBriberyFee: isWarningMinBriberyFeeBuy,
    isWarningMinPriorityFee: isWarningMinPriorityFeeBuy,
  } = useTradeConfig({
    transactionType: TransactionType.Buy,
  })

  const {
    config: configSell,
    slippage: slippageSell,
    fee: feeSell,
    briberyFee: briberyFeeSell,
    priorityFeePriceOrder: priorityFeePriceOrderSell,
    isWarningMinBriberyFee: isWarningMinBriberyFeeSell,
    isWarningMinPriorityFee: isWarningMinPriorityFeeSell,
  } = useTradeConfig({
    transactionType: TransactionType.Sell,
  })

  const [presetBuySelected, setPresetBuySelected] = useState<TradeSetting>(tradeSettingsByChain?.[0])
  const [presetSellSelected, setPresetSellSelected] = useState<TradeSetting>(tradeSettingsByChain?.[0])
  // const [isOneClickTrading, setIsOneClickTrading] = useState(ls.get('isOneClickTrading') ?? false)
  const [isTradeByHotkey, setIsTradeByHotkey] = useState(ls.get('isTradeByHotkey') ?? false)
  const activeWallet = useSelector(_activeWallet)
  const { totalToken: totalToken, setTotalToken } = useGetHoldingToken(tokenDetail)
  const configAmounts = useAppSelector(tradeConfigChainSelected(activeChain))?.quickAmount
  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const price = ohlcPrice ? ohlcPrice : tokenDetail?.price
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const [openTradeSetting, setOpenTradeSetting] = useState(false)

  const quickSellPercents =
    useAppSelector((state) => state.tradeConfigs.tradeConfigs.quickSellPercent) ||
    initialStateTradeConfig?.tradeConfigs?.quickSellPercent
  const decimals = tokenDetail?.decimals ? tokenDetail?.decimals : getDefaultDecimalsByChain(activeChain)

  useEffect(() => {
    if (selectedPresetKey) {
      setPresetBuySelected(tradeSettingsByChain?.[selectedPresetKey?.Buy - 1])
      setPresetSellSelected(tradeSettingsByChain?.[selectedPresetKey?.Sell - 1])
    }
  }, [selectedPresetKey])

  const getInitialPosition = (): Position => {
    const saved = ls.get('popup-one-click-trade-position')
    if (saved) return JSON.parse(saved)
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }
  }

  const [position, setPosition] = useState(getInitialPosition)

  useEffect(() => {
    ls.set('popup-one-click-trade-position', JSON.stringify(position))
  }, [position])

  const handleOneClickTrading = () => {
    setIsTradeByHotkey((prevVal: boolean) => !prevVal)
  }

  useEffect(() => {
    ls.set('isOneClickTrading', isTradeByHotkey)
  }, [isTradeByHotkey])

  // const holdingValue = new Decimal(totalToken).mul(price).toString()
  const [privateKey, setPrivateKey] = useState('')
  const bundle = useAppSelector((state) =>
    state.newWallet.bundle?.find((item: any) => item?.key === activeWallet?.walletAddress),
  )
  const token = useSelector(_userInfo)?.refresh_token
  // const jupOrderRef = useRef<JupiterOrderResponse | null>(null)
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')
  const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)

  const {
    showToastProcessOrder,
    showErrorMessageSubmitOrder,
    newHiddenToastProcessOrder,
    showToastSubmittedSuccessOrder,
  } = useShowToastOrder()
  const { handleGetErrorMessage } = useGetErrorMsg()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (openDrawer) {
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = 'auto'
      })
    }
  }, [openDrawer])

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

  const handleCheckErrorSubmitCreateOrder = (value: number, type: TransactionType) => {
    if (!activeWallet?.isConnected) {
      toast.warning(t('appSettings.loginRequired'))
      return
    }

    if (!tokenDetail) {
      toast.error(t('orderForm.errors.noTokenAvailable'))
      return false
    }

    if (type === TransactionType.Buy) {
      if (activeWallet?.balance?.formatted < getMinBalanceTradeByChain(activeChain)) {
        toast.error(
          t('orderForm.errors.rechargeIfBalanceInsufficientMinimum', {
            chain: getNativeTokenByActiveChain(activeChain),
            balance: getMinBalanceTradeByChain(activeChain),
          }),
        )
        return
      }
      if (+value > +activeWallet?.balance?.formatted) {
        toast.error(t('orderForm.errors.rechargeIfBalanceInsufficient'))
        return
      }

      const estimateQuoteAmount = +value * 1.01 + BASIC_FEE
      if (estimateQuoteAmount > activeWallet?.balance?.formatted) {
        toast.error(t('orderForm.errors.rechargeIfBalanceInsufficient'))
        return
      }
    }

    if (type === TransactionType.Sell) {
      if (+totalToken === 0) {
        toast.error(
          t('orderForm.errors.minimumOrderQuantity', {
            balance: MIN_BALANCE_FORM_SELL,
            chain: getNativeTokenByActiveChain(activeChain),
          }),
        )
        return
      }
    }
    return true
  }

  const onSubmitOrder = (value: number, type: TransactionType) => {
    if (enabled) {
      setOpenRestrictRegiongDialog(true)
      return
    }

    if (!handleCheckErrorSubmitCreateOrder(value, type)) return
    const isBuy = type === TransactionType.Buy
    const slippage = isBuy ? slippageBuy : slippageSell
    const mevProtect = isBuy ? configBuy?.mevProtect : configSell?.mevProtect
    const priorityFeePrice = isBuy ? priorityFeePriceOrderBuy : priorityFeePriceOrderSell
    const mevProtectionType = isBuy ? configBuy?.mevProtectionType : configSell?.mevProtectionType
    const customRPC = isBuy ? configBuy?.customRPC : configSell?.customRPC
    const briberyFee = isBuy ? briberyFeeBuy : briberyFeeSell
    const baseAmount =
      +value === 100
        ? totalToken
        : new Decimal(totalToken).mul(value).div(100).toDecimalPlaces(+decimals, Decimal.ROUND_DOWN).toString()

    let params: CreateOrderInput = {} as CreateOrderInput
    params = {
      ...params,
      ...(type === TransactionType.Buy && { quoteAmount: value.toString() }),
      ...(type === TransactionType.Sell && { baseAmount: baseAmount }),
      transactionType: type,
      userAddress: activeWallet?.walletAddress,
      baseAddress: tokenDetail?.address ? tokenDetail?.address : '',
      type: OrderType.Market,
      chainId: activeWallet?.chainId.toString() || '',
      quoteAddress: getQuoteAddessByChain(activeChain).toString(),
      doublePrincipalAfterPurchase: false,
      priorityFeePrice: priorityFeePrice.toString(),
      slippage: slippage,
      ...(activeChain !== TYPE_CHAIN.SOLANA && { mevProtect: mevProtect }),
      ...(activeChain === TYPE_CHAIN.SOLANA && {
        mevProtectionType: mevProtectionType,
        engine:
          mode === 'swap' ? SubmitEngineType.Swap : mode === 'ultra' ? SubmitEngineType.Ultra : SubmitEngineType.Swap,
        ...(!!customRPC && { customRPC: customRPC }),
        ...(!!briberyFee && { briberyFeePrice: briberyFee }),
      }),
    } as CreateOrderInput

    createOrder(params).catch(console.error)
  }

  const debouncedSubmit = useCallback(
    debounce(
      (value: number, type: TransactionType) => {
        onSubmitOrder(value, type)
      },
      500,
      { leading: true, trailing: false },
    ),
    [onSubmitOrder],
  )

  const createOrder = async (params: CreateOrderInput) => {
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
            appendToLocalStorageArrayWithTTL<PendingOrder>('holdingUnCompleted', dataPending, TTL_PORTFOLIO_STORAGE)
            channel.postMessage({ data: dataPending })
            if (params.transactionType === TransactionType.Sell) {
              setTotalToken((prev) => {
                const val = new Decimal(prev).sub(orderRes?.baseAmount).toString()
                return val
              })
            }
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
        }
      })
      .finally(() => {})
  }

  const [isSpaceHeld, setIsSpaceHeld] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isTradeByHotkey) {
        e.preventDefault()
        setIsSpaceHeld(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isTradeByHotkey) {
        setIsSpaceHeld(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isTradeByHotkey])

  useEffect(() => {
    const handleHotkey = (e: KeyboardEvent) => {
      if (!isSpaceHeld) return
      const key = e.code.replace('Key', '')
      switch (key) {
        case 'Q':
          onSubmitOrder(configAmounts[0], TransactionType.Buy)
          break
        case 'W':
          onSubmitOrder(configAmounts[1], TransactionType.Buy)
          break
        case 'E':
          onSubmitOrder(configAmounts[2], TransactionType.Buy)
          break
        case 'R':
          onSubmitOrder(configAmounts[3], TransactionType.Buy)
          break
        case 'A':
          onSubmitOrder(quickSellPercents[0], TransactionType.Sell)
          break
        case 'S':
          onSubmitOrder(quickSellPercents[1], TransactionType.Sell)
          break
        case 'D':
          onSubmitOrder(quickSellPercents[2], TransactionType.Sell)
          break
        case 'F':
          onSubmitOrder(quickSellPercents[quickSellPercents?.length - 1], TransactionType.Sell)
          break
      }
    }

    window.addEventListener('keydown', handleHotkey)
    return () => window.removeEventListener('keydown', handleHotkey)
  }, [isSpaceHeld])

  return (
    <>
      <Dialog open={openDrawer} onOpenChange={setOpenDrawer} modal={false}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogPortal forceMount>
          <DialogContent
            className="pointer-events-auto left-0 top-0 drag-handle-popup bg-[#232329] mx-auto p-0 gap-0 rounded-[0.75rem] w-[360px]"
            showDialogPrimitiveClose={false}
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            overlayClassName="bg-transparent hidden pointer-events-none"
            // style={{ pointerEvents: 'auto' }}
          >
            <Rnd
              // size={{ width: size.width, height: size.height }}
              position={{ x: position.x, y: position.y }}
              onDragStop={(_, d) => {
                document.body.style.pointerEvents = 'auto'
                setPosition({ x: d.x, y: d.y })
              }}
              onDragStart={() => {
                document.body.style.pointerEvents = 'none'
              }}
              onResizeStop={(_, __, ref, ___, pos) => {
                // setSize({
                //   width: ref.offsetWidth,
                //   height: ref.offsetHeight,
                // })
                setPosition(pos)
              }}
              bounds="window" // giới hạn trong cửa sổ
              enableResizing={{
                top: false,
                right: false,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false,
              }}
              dragHandleClassName="drag-handle-popup"
              className="rounded-xl shadow-lg border overflow-hidden bg-[#232329] !w-[360px]"
            >
              <DialogTitle className=""></DialogTitle>
              <TooltipProvider>
                <div className="relative flex items-center justify-between px-4 pt-6 pb-3 drag-handle-popup active:cursor-grabbing">
                  <div className="flex items-center gap-2">
                    <SimpleTooltip
                      side="top"
                      content={
                        isTradeByHotkey ? t('detail.tokenDetail.pressHotkeys') : t('detail.tokenDetail.enableHotkeys')
                      }
                    >
                      <IconFlash
                        className={clsx('cursor-pointer', {
                          'text-green-500': isTradeByHotkey,
                          'text-[#9B9B9B]': !isTradeByHotkey,
                        })}
                        onClick={() => handleOneClickTrading()}
                      />
                    </SimpleTooltip>
                    <IconBarChart className="text-green-500" />
                  </div>
                  <div className="drag-handle-popup grid grid-cols-4 gap-0.5 absolute left-1/2 translate-x-[-50%] top-1 cursor-grab active:cursor-grabbing">
                    {[...Array(8)].map((_, index) => (
                      <div className="h-0.5 w-0.5 rounded-full bg-[#d9d9d9]" key={index}></div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    {activeWallet?.isConnected && (
                      <SwitchWalletFormTrade tokenDetail={{} as TokenDetail} screen="popup" />
                    )}
                    <IconSetting
                      stroke="#b9b9b9"
                      className="cursor-pointer"
                      onClick={() => {
                        setOpenTradeSetting((prev) => !prev)
                      }}
                    />
                    <X className="h-4 w-4 text-[#9B9B9B] cursor-pointer" onClick={() => setOpenDrawer(false)} />
                  </div>
                </div>
                <div className="p-4 flex items-center flex-col gap-1.5 border-t border-[#ECECED14]">
                  <div className="w-full">
                    <div className="flex items-center gap-3 w-full">
                      <p className="text-[13px] font-[380]">{t('detail.tokenDetail.buy')}</p>
                      <FilterSelect
                        options={tradeSettingsByChain?.map((preset: any) => ({
                          value: preset?.key.toString(),
                          label: `P${preset?.key}`,
                        }))}
                        value={presetBuySelected?.key.toString()}
                        onValueChange={(value) => {
                          const selectedPreset = tradeSettingsByChain?.find(
                            (preset: any) => preset.key === Number(value),
                          )
                          if (selectedPreset) {
                            setPresetBuySelected(selectedPreset)
                            dispatch(
                              setSelectedPreset({
                                chain: activeChain,
                                presetKey: selectedPreset.key,
                                transactionType: TransactionType.Buy,
                              }),
                            )
                          }
                        }}
                        selectTriggerProps={{
                          className:
                            'flex justify-center p-0 text-[13px] font-[380] ml-1 leading-4 text-white font-normal border-none bg-transparent shadow-none w-fit',
                        }}
                        // selectProps={{
                        //   dir: 'rtl',
                        // }}
                        triggerIconClassname="w-3.5 h-3.5"
                        triggerIcon="/images/icons/arrow-down-icon.svg"
                      />
                      <p className="ml-auto text-xs font-[380] text-white/70">
                        {formatBalanceWallet({
                          balance: activeWallet?.balance?.formatted,
                          decimal: 6,
                          round: 'down',
                        })}{' '}
                        {getNativeTokenByActiveChain(activeChain)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-full mt-3">
                      {configAmounts?.slice(0, configAmounts?.length - 1)?.map((item: number, index: number) => (
                        <div
                          key={index}
                          className={cn(
                            'relative flex items-center flex-1 rounded-[200px] justify-center border border-[#00CE89] bg-transparent p-2.5 h-8',
                            'transition-all duration-300 hover:border-[#72ffbb] hover:shadow-[0_0_16px_rgba(47,255,150,0.4)] cursor-pointer',
                          )}
                          onClick={() => debouncedSubmit(item, TransactionType.Buy)}
                        >
                          <p className="text-[13px] leading-none font-[380] text-[#00CE89]">{item}</p>
                          {isSpaceHeld && (
                            <div className="absolute w-5 h-5 -top-[20px] left-1/2 -translate-x-1/2 flex items-center justify-center text-white text-xs leading-none bg-[#00000095] p-1 rounded-[4px]">
                              {['Q', 'W', 'E', 'R'][index]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-0 w-full mt-3">
                      <SimpleTooltip side="top" content={t('tradeSettings.slippage')}>
                        <div className="flex items-center">
                          <IconSlippage className="w-4 h-4 text-[#878787]" />
                          <p className="text-[13px] font-[380] text-white/50"> {formatPercent(slippageBuy * 100)}</p>
                        </div>
                      </SimpleTooltip>
                      <SimpleTooltip side="top" content={t('tradeSettings.priorityFee')}>
                        <div className="flex items-center">
                          <IconPriorityFee className="w-4 h-4 text-[#878787] ml-3" />
                          <p
                            className={cn('text-[13px] font-[380] text-[#878787] ml-0.5', {
                              'text-[#EA963A]': isWarningMinPriorityFeeBuy,
                            })}
                          >
                            {formatAmount(feeBuy, {
                              roundMode: 'ceil',
                            })}
                          </p>
                        </div>
                      </SimpleTooltip>
                      {activeChain === TYPE_CHAIN.SOLANA && (
                        <SimpleTooltip side="top" content={t('tradeSettings.priorityFee')}>
                          <div className="flex items-center">
                            <IconCash className="w-4 h-4 ml-3 text-[#878787]" />
                            <p
                              className={cn('text-[13px] font-[380] text-[#878787] ml-0.5', {
                                'text-[#EA963A]': isWarningMinBriberyFeeBuy,
                              })}
                            >
                              {formatAmount(briberyFeeBuy, {
                                roundMode: 'ceil',
                              })}
                            </p>
                          </div>
                        </SimpleTooltip>
                      )}
                      {/* <SimpleTooltip side="top" content={t('tradeSettings.priotyFee')}>
                      <div className="flex items-center">
                        <IconCash className="w-4 h-4 ml-3 text-[#878787]" />
                        <p className="text-[13px] font-[380] text-white/50 ml-0.5 mr-3">0</p>
                      </div>
                    </SimpleTooltip> */}
                      <SimpleTooltip side="top" content={t('tradeSettings.antiClipping')}>
                        <div className="flex items-center ml-3">
                          {activeChain !== TYPE_CHAIN.SOLANA &&
                            (configBuy?.mevProtect ? (
                              <>
                                <IconShield className="w-3 h-3 text-[#878787]" />
                                <p className="text-[12px] font-[380] text-white/50 ml-0.5">
                                  {t('tradeSettings.antiClippingOn')}
                                </p>
                              </>
                            ) : (
                              <>
                                <IconShield2 className="w-3 h-3 text-[#878787]" />
                                <p className="text-[12px] font-[380] text-white/50 ml-0.5">
                                  {t('tradeSettings.antiClippingOff')}
                                </p>
                              </>
                            ))}
                          {activeChain === TYPE_CHAIN.SOLANA && (
                            <>
                              {getIonShieldByChainSolana(configBuy?.mevProtectionType)}
                              <p className="text-[12px] font-[380] text-white/50 ml-0.5">
                                {getTextMevByChainSolana(t, configBuy?.mevProtectionType)}
                              </p>
                            </>
                          )}
                        </div>
                      </SimpleTooltip>
                      {/* <IconWarning2 className="w-3 h-3 text-[#facc14] ml-0.5" /> */}
                    </div>
                  </div>
                  <div className="w-full mt-5">
                    <div className="flex items-center w-full">
                      <p className="text-[13px] font-[380]">{t('detail.tokenDetail.sell')}</p>
                      <p className="text-[13px] font-[380] text-[#ffffffb3] ml-0.5">%</p>
                      <IconArrowSwap className="w-3 h-3 text-[#878787] ml-1" />
                      {/* <p className="text-[13px] font-[380] ml-1">P1</p> */}
                      <FilterSelect
                        options={tradeSettingsByChain?.map((preset: any) => ({
                          value: preset.key.toString(),
                          label: `P${preset.key}`,
                        }))}
                        value={presetSellSelected?.key.toString()}
                        onValueChange={(value) => {
                          const selectedPreset = tradeSettingsByChain?.find(
                            (preset: any) => preset.key === Number(value),
                          )
                          if (selectedPreset) {
                            setPresetSellSelected(selectedPreset)
                            // dispatch(setSelectedPreset({ chain: activeChain, presetKey: selectedPreset.key }))
                            dispatch(
                              setSelectedPreset({
                                chain: activeChain,
                                presetKey: selectedPreset.key,
                                transactionType: TransactionType.Sell,
                              }),
                            )
                          }
                        }}
                        selectTriggerProps={{
                          className:
                            'flex justify-center p-0 text-[13px] font-[380] ml-1 leading-4 text-white font-normal border-none bg-transparent shadow-none w-fit',
                        }}
                        // selectProps={{
                        //   dir: 'rtl',
                        // }}
                        triggerIconClassname="w-3.5 h-3.5"
                        triggerIcon="/images/icons/arrow-down-icon.svg"
                      />
                      <div className="ml-auto text-xs font-[380] text-white/70 flex items-center flex-wrap justify-end">
                        <MoneyFormatted unit="" value={totalToken} roundType="floor" loading={!price || price === 0} />{' '}
                        {tokenDetail?.symbol}
                        <p>
                          (
                          {formatBalanceWallet({
                            balance: new Decimal(totalToken).div(priceNativeToken).toNumber(),
                          })}{' '}
                          {getNativeTokenByActiveChain(activeChain)})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full mt-3">
                      {/* {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <InputSetting
                      defaultValue="20"
                      containerClassName="bg-transparent p-2.5 h-8 border border-[#ff003c]"
                      focusBorderClassName="border border-[#ff003c]"
                      inputClassName="text-[#ff003c]"
                      unitClassName="text-[#ff003c]"
                      unit="%"
                      decimal={2}
                    />
                  </div>
                ))} */}
                      {quickSellPercents
                        ?.filter((_: any, index: number) => index !== quickSellPercents.length - 2)
                        ?.map((item: number, index: number) => (
                          <div
                            key={index}
                            className={cn(
                              'relative flex items-center flex-1 rounded-[200px] justify-center border border-[#ff003c] bg-transparent p-2.5 h-8',
                              'transition-all duration-300 hover:border-[#ff4f75] hover:shadow-[0_0_20px_rgba(255,0,75,0.5)] cursor-pointer',
                            )}
                            onClick={() => debouncedSubmit(item, TransactionType.Sell)}
                          >
                            <p className="text-[13px] leading-none font-[380] text-[#ff003c]">{item}%</p>
                            {isSpaceHeld && (
                              <div className="absolute w-5 h-5 -top-[20px] left-1/2 -translate-x-1/2 flex items-center justify-center text-white text-xs leading-none bg-[#00000095] p-1 rounded-[4px]">
                                {['A', 'S', 'D', 'F'][index]}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-0 w-full mt-3">
                      <SimpleTooltip side="top" content={t('tradeSettings.slippage')}>
                        <div className="flex items-center">
                          <IconSlippage className="w-4 h-4 text-[#878787]" />
                          <p className="text-[13px] font-[380] text-white/50"> {formatPercent(slippageSell * 100)}</p>
                        </div>
                      </SimpleTooltip>
                      <SimpleTooltip side="top" content={t('tradeSettings.priotyFee')}>
                        <div className="flex items-center">
                          <IconPriorityFee className="w-4 h-4 text-[#878787] ml-3" />
                          <p
                            className={cn('text-[13px] font-[380] text-[#878787] ml-0.5', {
                              'text-[#EA963A]': isWarningMinPriorityFeeSell,
                            })}
                          >
                            {formatAmount(feeSell, {
                              roundMode: 'ceil',
                            })}
                          </p>
                        </div>
                      </SimpleTooltip>
                      {activeChain === TYPE_CHAIN.SOLANA && (
                        <SimpleTooltip side="top" content={t('tradeSettings.priorityFee')}>
                          <div className="flex items-center">
                            <IconCash className="w-4 h-4 ml-3 text-[#878787]" />
                            <p
                              className={cn('text-[13px] font-[380] text-[#878787] ml-0.5', {
                                'text-[#EA963A]': isWarningMinBriberyFeeSell,
                              })}
                            >
                              {formatAmount(briberyFeeSell, {
                                roundMode: 'ceil',
                              })}
                            </p>
                          </div>
                        </SimpleTooltip>
                      )}
                      <SimpleTooltip side="top" content={t('tradeSettings.antiClipping')}>
                        <div className="flex items-center  ml-3">
                          {activeChain !== TYPE_CHAIN.SOLANA &&
                            (configSell?.mevProtect ? (
                              <>
                                <IconShield className="w-3 h-3 text-[#878787]" />
                                <p className="text-[12px] font-[380] text-white/50 ml-0.5">
                                  {t('tradeSettings.antiClippingOn')}
                                </p>
                              </>
                            ) : (
                              <>
                                <IconShield2 className="w-3 h-3 text-[#878787]" />
                                <p className="text-[12px] font-[380] text-white/50 ml-0.5">
                                  {t('tradeSettings.antiClippingOff')}
                                </p>
                              </>
                            ))}
                          {activeChain === TYPE_CHAIN.SOLANA && (
                            <>
                              {getIonShieldByChainSolana(configSell?.mevProtectionType)}
                              <p className="text-[12px] font-[380] text-white/50 ml-0.5">
                                {getTextMevByChainSolana(t, configSell?.mevProtectionType)}
                              </p>
                            </>
                          )}
                        </div>
                      </SimpleTooltip>
                      {/* <p className="text-[13px] font-[380] text-white/50 ml-auto">普通</p> */}
                    </div>
                  </div>
                </div>
                <PofolioToken tokenDetail={tokenDetail} />
              </TooltipProvider>
            </Rnd>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <div className="hidden">
        <TradeSettingsBottomSheet open={openTradeSetting} setOpen={setOpenTradeSetting} />
      </div>
      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </>
  )
}

export default OneClickTradeDialog

const PofolioToken = ({ tokenDetail }: { tokenDetail: TokenDetail }) => {
  const { t, i18n } = useTranslation()
  // const { portfolioData } = useGetPortfolioTokenByAddress(tokenDetail?.address)
  const { currentData } = useNewHoldingData()
  const { address: tokenAddress } = useParams()
  const portfolioData = useMemo(
    () => currentData.find((item) => item.token === tokenAddress),
    [currentData, tokenAddress],
  )
  const [isPrice, setIsPrice] = useState<boolean>(true)
  // const { price } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const [isShowPnl, setIsShowPnl] = useState<boolean>(false)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const priceMqtt = useNewTokenPrice(portfolioData?.token, portfolioData?.chainId)
  const price =
    portfolioData?.token && priceMqtt && +priceMqtt > 0
      ? priceMqtt
      : portfolioData
        ? portfolioData?.price
        : tokenDetail?.price
  const totalBaseEstimate = portfolioData?.estimateOrderValue
    ? new Decimal(portfolioData?.totalBaseAmount).add(portfolioData?.estimateOrderValue).toString()
    : portfolioData?.totalBaseAmount
      ? new Decimal(portfolioData?.totalBaseAmount).toString()
      : 0

  const totalBase = +totalBaseEstimate >= 0 ? totalBaseEstimate : 0
  const balance = portfolioData?.isSellAll ? 0 : totalBase
  const holdingValue = +balance * Number(price)
  const holdingQuoteValue = holdingValue / (priceNativeToken || 1)

  const unrealized = portfolioData ? (Number(price ?? 0) - Number(portfolioData?.avgPriceUsd)) * Number(totalBase) : 0
  const realized = portfolioData?.realizedPnL ? Number(portfolioData?.realizedPnL) : 0
  const PnL = !portfolioData?.avgPriceUsd || !portfolioData?.totalBuyUsd ? '--' : Number(realized) + Number(unrealized)
  const UPnL = PnL !== '--' ? unrealized : '--'
  const PnlQuote = PnL !== '--' ? PnL / (priceNativeToken || 1) : '--'
  const UPnLQuote = unrealized / (priceNativeToken || 1)
  const PnLPercent = PnL !== '--' && portfolioData?.avgPriceUsd ? (PnL * 100) / Number(portfolioData?.totalBuyUsd) : 0
  const UPnLPercent =
    UPnL !== '--' && portfolioData?.avgPriceUsd ? (UPnL * 100) / Number(portfolioData?.totalBuyUsd) : 0

  const totalBuyUsd = isPrice ? portfolioData?.totalBuyUsd : (portfolioData?.totalBuyUsd ?? 0) / (priceNativeToken || 1)
  const totalSellUsd = isPrice
    ? portfolioData?.totalSellUsd
    : (portfolioData?.totalSellUsd ?? 0) / (priceNativeToken || 1)
  const currentLang = i18n.language

  const showPNL = useMemo(() => {
    if (isShowPnl) return PnL
    return UPnL
  }, [isShowPnl, UPnL, PnL])

  const showPNLQuote = useMemo(() => {
    if (isShowPnl) return PnlQuote
    return UPnLQuote
  }, [isShowPnl, PnlQuote, UPnLQuote])

  const showPNLPercent = useMemo(() => {
    if (isShowPnl) return formatPercentage(PnLPercent)
    return formatPercentage(UPnLPercent)
  }, [isShowPnl, PnLPercent, UPnLPercent])

  const isShowLoading = !price || price === 0 || portfolioData?.isProcessing
  return (
    <div className="p-4 flex items-center flex-col gap-1.5 border-t border-[#ECECED14]">
      <div className="flex items-start justify-between w-full">
        <div>
          <div className="flex items-center gap-0.5">
            <p className="text-[12px] font-[380] text-white/50">{t('walletDetail.holdings.balance')}</p>
            <img
              src="/images/orderForm/icon-exchange-coin.svg"
              className="w-3 h-3 cursor-pointer"
              alt=""
              onClick={() => {
                setIsPrice((prev) => !prev)
              }}
            />
          </div>
          <div className="flex items-center gap-0.5">
            <p className="text-[13px] font-[380] text-white/50">
              {isPrice ? '$' : ''}
              {isPrice ? (
                !price || price === 0 ? (
                  <Loader />
                ) : (
                  formatBalance(holdingValue, { roundMode: 'floor' })
                )
              ) : (
                formatAmount(holdingQuoteValue, { roundMode: 'floor' })
              )}
            </p>
            {!isPrice && <img src={getIconChain(activeChain)} className="w-2.5 h-2.5" alt="active chain" />}
          </div>
        </div>
        <div>
          <p className="text-[12px] font-[380] text-white/50">{t('walletDetail.holderTable.totalBuy')}</p>

          <div className="flex items-center gap-0.5">
            <p
              className={clsx('text-[13px] font-[380 text-white/50', !!totalBuyUsd && +totalBuyUsd > 0 && '!text-rise')}
            >
              {!isShowLoading && (isPrice ? '$' : '')}
              {isShowLoading ? <Loader /> : totalBuyUsd ? formatAmount(totalBuyUsd, { roundMode: 'floor' }) : '0'}
            </p>
            {!isPrice && !isShowLoading && totalBuyUsd !== undefined && (
              <img src={getIconChain(activeChain)} className="w-2.5 h-2.5" alt="active chain" />
            )}
          </div>
        </div>
        <div>
          <p className="text-[12px] font-[380] text-white/50">{t('walletDetail.holderTable.totalSell')}</p>
          <div className="flex items-center gap-0.5">
            <p
              className={clsx(
                'text-[13px] font-[380 text-white/50',
                !!totalSellUsd && +totalSellUsd > 0 && '!text-fall',
              )}
            >
              {!isShowLoading && (isPrice ? '$' : '')}
              {isShowLoading ? <Loader /> : totalSellUsd ? formatAmount(totalSellUsd, { roundMode: 'floor' }) : '0'}
            </p>
            {!isPrice && !isShowLoading && totalSellUsd !== undefined && (
              <img src={getIconChain(activeChain)} className="w-2.5 h-2.5" alt="active chain" />
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-0.5">
            <p className="text-[12px] font-[380] text-white/50">
              {currentLang === 'en' ? (isShowPnl ? 'PnL' : 'UPnL') : t('walletDetail.holderTable.profit')}
            </p>
            <IconArrowSwap
              className="w-3 h-3 text-[#878787] hover:text-white cursor-pointer"
              onClick={() => {
                setIsShowPnl((prev) => !prev)
              }}
            />
          </div>
          <div
            // className="text-[13px] font-[380] text-white/50"
            className={clsx(
              'text-[13px] font-[380] text-white/50',
              Number(Number(realized) + Number(unrealized)) === 0 || portfolioData?.isProcessing
                ? 'text-white/50]'
                : Number(showPNL) > 0
                  ? '!text-rise'
                  : '!text-fall',
            )}
          >
            {showPNL !== '--' ? (
              <>
                <div className="flex items-center gap-0.5">
                  {/* <MoneyFormatted
                    unit={isPrice ? '$' : ''}
                    value={isPrice ? showPNL : showPNLQuote}
                    roundType="floor"
                    loading={!price || price === 0}
                  /> */}
                  {isShowLoading ? <Loader /> : formatAmount(isPrice ? showPNL : showPNLQuote, { roundMode: 'floor' })}
                  {!isPrice && !isShowLoading && (
                    <img src={getIconChain(activeChain)} className="w-2.5 h-2.5" alt="active chain" />
                  )}
                </div>
                <div className="flex"> {isShowLoading ? <Loader /> : `(${showPNLPercent})`}</div>
              </>
            ) : (
              '--'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
