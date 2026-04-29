import { getClearinghouseState } from '@/api/hyperliquid'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer'
import ButtonGreen from '@/components/common/buttons/ButtonGreen'
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'
import { validateTpSlPrices } from '@/components/futuresDetails/helper/validateFunc'
import RestrictRegiongDialog from '@/components/RestrictRegiongDialog'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import useCustomToast from '@/hooks/useCustomToast'
import { useResponsive } from '@/hooks/useResponsive'
import { userGqlClient } from '@/lib/gql/apollo-client'
import ls from '@/lib/local-storage'
import { cn, hasPercent, MathFun, removePercent } from '@/lib/utils'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { futuresUserInfoActions, isAuthorizedSelector, isDepositSelector } from '@/redux/modules/futuresUserInfo.slice'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import {
  getAgentWallet,
  hasAgentWallet,
  hashAddress,
  initAgentWalletIfNeeded
} from '@/utils/agent/agentWalletManager'
import { isMobile } from '@/utils/os.ts'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { checkHyperLiquidWallet } from '@services/auth.service.ts'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../ui/dialog'
import usePlaceAnOrder from '../hooks/usePlaceAnOrder'
import ButtonApproveAgent from './ButtonApproveAgent'
import { MIN_AVAILABLE } from './index'
import { IPOrderForm } from './OrderForm'
import { OrderInfo, OrderSide, OrderTypeEnum, TpslTypeEmum } from './type.order'

import { formatPrice, formatSize } from '@/components/futuresDetails/trade/tools'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { X } from 'lucide-react'


import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { selectSzMap } from '@/redux/modules/futuresMeta.slice'
import {
  selectFuturesTradePreferences,
  futuresTradePreferencesActions
} from '@/redux/modules/futuresTradePreferences.slice'
import { fundingSelector } from '@/redux/modules/futuresUserInfo.slice'
import useHandleChangeValue from '../hooks/useHandleChangeValue.tsx'
import eventBus from '@/lib/eventBus.ts'
import { NEED_APPROVE } from '@/components/futuresDetails/helper/handleHyperliquidOrderError.ts'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

interface CalcInfo {
  buyOrderValue: number
  maxBuyOrderValue: number
  buyOrderLiqPrice: string | number
  buyOrderMarginRequired: any
  sellOrderValue: number
  maxSellOrderValue: number
  sellOrderLiqPrice: string | number
  sellOrderMarginRequired: any
  takerFee: number
  makerFee: number
  buySlippage: number
  sellSlippage: number
}

export interface ConfirmPlaceOrderProps extends IPOrderForm {
  orderInfo: OrderInfo
  orderSide: OrderSide
  price: string
  calcInfo: CalcInfo
  containerClassName?: string
  memeBalance: string
  calcTpPrice?: string
  calcSlPrice?: string
  currentPositionSzi: number
}
export interface CalcTpSlPriceProps {
  trigger: 'tp' | 'sl'
  type: TpslTypeEmum
  value: string
  side: OrderSide
}
interface isVaildPlaceOrderProps {
  order_side: OrderSide
  calcTpPrice: string
  calcSlPrice: string
}

const ConfirmPlaceOrder = ({
  orderInfo,
  orderSide,
  baseCoin,
  price,
  calcInfo,
  memeBalance,
  containerClassName,
  currentPositionSzi,
}: ConfirmPlaceOrderProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const isLogin = useCheckLoginOnArb()

  // Block regional trading features
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)

  const navigate = useNavigate()

  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const { szDecimals, price: marketPrice } = useAppSelector(symbolInfoSelector)

  const walletDex = useSelector(_walletDex) as any

  const {
    buyOrderValue,
    maxBuyOrderValue,
    buyOrderLiqPrice,
    buyOrderMarginRequired,
    sellOrderValue,
    maxSellOrderValue,
    sellOrderLiqPrice,
    sellOrderMarginRequired,
    buySlippage,
    sellSlippage,
  } = calcInfo

  const { maxSlippage, isShowOrderConfirm } = useAppSelector(selectFuturesTradePreferences)

  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  const { available: availableToTrade } = useAppSelector(fundingSelector)

  const szMap = useAppSelector(selectSzMap)
  const { handleOrderInfoChange } = useHandleChangeValue()

  const { positions } = useWebData2()

  const isApproveAgent = useAppSelector(isAuthorizedSelector)
  const isDeposit = useAppSelector(isDepositSelector)
  const leverage = Number(tradeConfigs.leverage)

  const { isDesktop } = useResponsive()

  const { showToast, dismissToast } = useCustomToast()
  const {
    orderContract: { mutateAsync: placeOrder, isPending },
    handleSetPayload,
    twapOrderHandling,
    scaleOrderHandling,
  } = usePlaceAnOrder()

  const orderType = orderInfo.type

  const [showPrompt, setshowPrompt] = useState(false)
  const [isOpenConfirmDrawer, setIsOpenConfirmDrawer] = useState(false)

  const [approveInfo, setApproveInfo] = useState({
    feeBuilderAddress: '',
    feeBuilderPercent: '',
    agentName: isMobile() ? 'KAIROX_MOBILE' : 'KAIROX',
    agentAddress: '',
    referralCode: 'BWIN888',
  })

  const orderSideDisplay =
    orderSide === OrderSide.buy ? t('futuresDetails.common.buyLong') : t('futuresDetails.common.sellShort')
  const orderSideClass = orderSide === OrderSide.buy ? 'text-rise' : 'text-fall'

  const currentBaseCoinPosition = useMemo(() => {
    return positions.filter((item: any) => item.coin === baseCoin)
  }, [positions, baseCoin])

  // 1：新账户，合约和meme都没钱 显示 - 请充值
  // 2：meme账号有钱<10u  显示-请充值
  // 3：meme账号>10u ,没转入到合约 显示 -划转

  const minMemeBalance = 10
  const isTransfer = Number(memeBalance) > minMemeBalance
  const buttonStatus = useMemo(() => {
    if (!isLogin) {
      return 'login'
    } else if (isLogin && !isDeposit && !isTransfer) {
      return 'deposit'
    } else if (isLogin && !isDeposit && isTransfer) {
      return 'transfer'
    } else if (isLogin && isDeposit && !isApproveAgent) {
      return 'approve'
    } else {
      return 'order'
    }
  }, [isLogin, isApproveAgent, isDeposit, isTransfer])

  const getOrderIsCanReducePosition = (order_side: OrderSide) => {
    const positionSide = order_side === OrderSide.buy ? 'B' : 'A'
    if (orderInfo.reduceOnly && !currentBaseCoinPosition.length) return false

    if (currentBaseCoinPosition.length && orderInfo.reduceOnly) {
      // 同向开单
      if (currentBaseCoinPosition[0].side === positionSide) {
        return false
      } else {
        const size = orderInfo.size
        let usdValue
        // 百分比下单
        if (typeof size === 'string' && hasPercent(size)) {
          return true
        } else {
          //  // 非百分比下单，判断是币本位还是U本位，算出订单价值
          const positionSize = Number(size)
          if (!price || !positionSize) return true // positionSize下单数量为0，不需要判断
          usdValue = orderInfo.currency === 'USDC' ? positionSize : positionSize * Number(price)

          const tokenSize = usdValue / Number(price)
          const orderNewSize = formatSize(tokenSize, szDecimals)
          if (Number(orderNewSize) > Number(currentBaseCoinPosition[0].szi)) {
            return false
          }
        }
      }
    }
    return true
  }

  const getOrderIsEnoughMargin = (order_side: OrderSide) => {
    const available = order_side === OrderSide.buy ? availableToTrade?.[0] || 0 : availableToTrade?.[1] || 0
    const marginRequired = order_side === OrderSide.buy ? buyOrderMarginRequired : sellOrderMarginRequired
    if (Number(available) < Number(marginRequired)) {
      return false
    }
    return true
  }

  const getOrderBtnLabel = (order_side: OrderSide) => {
    if (!getOrderIsEnoughMargin(order_side)) {
      return t('futuresDetails.confirmPlaceOrder.insufficientMargin')
    } else if (!getOrderIsCanReducePosition(order_side)) {
      return t('futuresDetails.confirmPlaceOrder.reduceOnlyLarge')
    } else {
      return order_side === OrderSide.buy ? (
        <div className="">
          <p>
            {t('futuresDetails.common.buyLong')} {`${leverage}x`}
          </p>
          {buyOrderValue ? (
            <p className="text-[calc(11rem/16)] whitespace-pre-line">{`≈${buyOrderValue}`} USDC</p>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div>
          <p>
            {t('futuresDetails.common.sellShort')} {`${leverage}x`}
          </p>
          {sellOrderValue ? (
            <p className="text-[calc(11rem/16)] whitespace-pre-line">{`≈${sellOrderValue}`} USDC</p>
          ) : (
            <></>
          )}
        </div>
      )
    }
  }

  const getCalcTpSlPrice = ({ type, value, trigger, side }: CalcTpSlPriceProps) => {
    let newPrice = ''

    if (type === TpslTypeEmum.Price) {
      newPrice = value
    } else if (type === TpslTypeEmum.ROI) {
      const numericInput = Number(value)
      const entryPrice = orderInfo.type === OrderTypeEnum.market ? Number(marketPrice) : Number(orderInfo.price)

      const priceOffset = MathFun.div(MathFun.mul(numericInput, entryPrice), leverage * 100)

      const isPositive = (trigger === 'tp' && side === OrderSide.buy) || (trigger === 'sl' && side === OrderSide.sell)
      newPrice = isPositive ? MathFun.add(entryPrice, priceOffset) : MathFun.sub(entryPrice, priceOffset)
    }
    return formatPrice(newPrice, szMap[baseCoin], { limitSigFigs: true })
  }

  const isSlippageValid = ({ orderSide, slippage }: { orderSide: OrderSide; slippage: number }) => {
    if (orderSide === OrderSide.buy) {
      return slippage > Number(buySlippage)
    } else {
      return slippage > Number(sellSlippage)
    }
  }

  const isVaildPlaceOrder = ({ order_side, calcTpPrice, calcSlPrice }: isVaildPlaceOrderProps) => {
    const orderValue = order_side === OrderSide.buy ? buyOrderValue : sellOrderValue
    if (orderValue <= 10) {
      showToast(t('futuresDetails.confirmPlaceOrder.orderValueTooSmall'))
      return false
    }

    const slippage = Number(maxSlippage || 0)

    if (orderType === OrderTypeEnum.market) {
      if (
        !isSlippageValid({
          orderSide: order_side,
          slippage,
        })
      ) {
        showToast(t('futuresDetails.confirmPlaceOrder.slippageExceeded'))
        return false
      }
    }


    const { isShowTPSl, type } = orderInfo
    const orderPirce = type === OrderTypeEnum.market ? price : orderInfo.price

    if (isShowTPSl) {
      const resultValidateTpSlPrices = validateTpSlPrices({
        side: order_side,
        marketPrice: Number(orderPirce),
        takeProfit: calcTpPrice,
        stopLoss: calcSlPrice,
      })
      if (!resultValidateTpSlPrices.isValid) {
        showToast(resultValidateTpSlPrices.message as string)
        return false
      }
    }
    return true
  }

  const handleConfirmOrder = async ({ order_side, calcTpPrice, calcSlPrice }: isVaildPlaceOrderProps) => {
    if (showPrompt) {
      dispatch(futuresTradePreferencesActions.updateTradePreferences({
        isShowOrderConfirm: false
      }))
    }
    setIsOpenConfirmDrawer(false)
    try {
      if (orderType === OrderTypeEnum.twap) {
        const twapPayload = twapOrderHandling({ orderInfo, orderSide })
        await placeOrder(twapPayload)
      } else if (orderType === OrderTypeEnum.phased) {
        const scalePayload = scaleOrderHandling({ orderInfo, orderSide })
        await placeOrder(scalePayload)
      } else {
        // Standard Order Handling
        const payload = handleSetPayload({
          baseCoin,
          orderInfo,
          orderSide: order_side,
          price,
          calcTpPrice: calcTpPrice,
          calcSlPrice: calcSlPrice,
          currentPositionSzi: currentPositionSzi,
        } as any)

        if ('orders' in payload) {
          await placeOrder({
            ...payload,
            grouping: 'normalTpsl' as const,
          })
        } else {
          await placeOrder(payload)
        }
      }
    } catch (error) {
      console.error('error:', error)
    }
  }



  const checkDeposit = async () => {
    try {
      const data = await getClearinghouseState(walletDex?.walletAddress)
      const balance = parseFloat(data?.crossMarginSummary?.accountValue)
      dispatch(futuresUserInfoActions.updateDepositStatus(balance >= MIN_AVAILABLE))
    } catch (err: any) {}
  }

  const handleDisablePlaceOrderButton = (order_side: OrderSide) => {
    // need login
    if (!isLogin) return true
    if (typeof orderInfo.size === 'string' && hasPercent(orderInfo.size)) {
      if (Number(removePercent(orderInfo.size)) === 0) return true
    }

    if (Number(orderInfo.size) === 0) return true

    if (orderType === OrderTypeEnum.limit && !orderInfo.price) return true

    if (!getOrderIsEnoughMargin(order_side)) return true
    if (!getOrderIsCanReducePosition(order_side)) return true
    return false
  }

  const handleClickBtnLogin = () => {
    setShowLoginDrawer(true)
  }

  const getNewSize = () => {

    const available = orderSide === OrderSide.buy
      ? availableToTrade?.[0]
      : availableToTrade?.[1]

    const { size, currency } = orderInfo
     let usdValue, newSize
    if (typeof size === 'string' && hasPercent(size)) {
      const percentageNum = Number(removePercent(size)) / 100
      if (!orderInfo.reduceOnly) {
        usdValue = available * percentageNum * leverage
        const tokenSize = (usdValue) / Number(price);
        newSize = formatSize(tokenSize, szDecimals);
      } else {
        const tokenSize = percentageNum * currentPositionSzi
        newSize = formatSize(tokenSize, szDecimals);
      }

    } else {
    //  // 非百分比下单，判断是币本位还是U本位，算出订单价值
      const positionSize = Number(size)
      if (!price || !positionSize || !leverage) return 0
      usdValue = currency === 'USDC' ? positionSize : positionSize * Number(price)
      const tokenSize = (usdValue) / Number(price);
      newSize = formatSize(tokenSize, szDecimals);
    }
    return newSize
  }

  const getCalcTpslPrice = (side: OrderSide) => {
    const { isShowTPSl, type, tpValue, slValue, tpType, slType } = orderInfo
    // 算出tpPrice, slPrice
    const calcTpPrice = (isShowTPSl && tpValue) ? getCalcTpSlPrice({
      trigger: 'tp',
      type: tpType,
      value: tpValue,
      side: side
    }) : ''

    const calcSlPrice = (isShowTPSl && slValue) ? getCalcTpSlPrice({
      trigger: 'sl',
      type: slType,
      value: slValue,
      side: side
    }) : ''

    return {
      calcTpPrice,
      calcSlPrice
    }
  }


  const handleClickOrderBtn = (side: OrderSide, isShowConfirmModal: boolean = true) => {
    const { isShowTPSl, type, tpValue, slValue, tpType, slType } = orderInfo
    if (type === OrderTypeEnum.limit) {
      logEvent2(ACTIONS.contract_limit_order, {
        limit_price: orderInfo.price,
        symbol: orderInfo.orderCoin,
        direction: side === OrderSide.buy ? 'long' : 'short',
        amount: orderInfo.size,
        leverage: tradeConfigs.leverage,
        margin_mode: tradeConfigs.positionMode,
        unit_type: orderInfo.currency === 'USDC' ? 'USDC' : 'COIN',
        input_type: orderInfo.sliderValue[0] === 0 ? 'manual' : 'percent',
        stop_loss: orderInfo.slPrice,
        take_profit: orderInfo.tpPrice,
        reduce_only: orderInfo.reduceOnly,
      })
    }
    if (type === OrderTypeEnum.market) {
      logEvent2(ACTIONS.contract_market_order, {
        symbol: orderInfo.orderCoin,
        direction: side === OrderSide.buy ? 'long' : 'short',
        amount: orderInfo.size,
        leverage: tradeConfigs.leverage,
        margin_mode: tradeConfigs.positionMode,
        unit_type: orderInfo.currency === 'USDC' ? 'USDC' : 'COIN',
        input_type: orderInfo.sliderValue[0] === 0 ? 'manual' : 'percent',
        stop_loss: orderInfo.slPrice,
        take_profit: orderInfo.tpPrice,
        reduce_only: orderInfo.reduceOnly,
      })
    }
    // 算出tpPrice, slPrice
    const calcTpPrice =
      isShowTPSl && tpValue
        ? getCalcTpSlPrice({
            trigger: 'tp',
            type: tpType,
            value: tpValue,
            side: side,
          })
        : ''

    const calcSlPrice =
      isShowTPSl && slValue
        ? getCalcTpSlPrice({
            trigger: 'sl',
            type: slType,
            value: slValue,
            side: side,
          })
        : ''

    if (
      !isVaildPlaceOrder({
        order_side: side,
        calcTpPrice,
        calcSlPrice,
      }) ||
      isPending
    )
      return

    if (!isVaildPlaceOrder({
      order_side: side,
      calcTpPrice,
      calcSlPrice
    }) || isPending) return
    

    if (!isShowOrderConfirm || !isShowConfirmModal) {
      handleConfirmOrder({
      order_side: side,
      calcTpPrice,
      calcSlPrice,
    })
    } else {
      handleOrderInfoChange('side', side)
      setIsOpenConfirmDrawer(true)
    }
  }





  useEffect(() => {
    if (isPending) {
      showToast(`${baseCoin} ${t('futuresDetails.confirmPlaceOrder.orderProcessing')}`)
    } else {
      dismissToast()
    }
  }, [isPending])

  useEffect(() => {
    if (isLogin && walletDex?.walletAddress) {
      checkDeposit()
    }
  }, [isLogin, walletDex?.walletAddress])

  useEffect(() => {
    dispatch(futuresUserInfoActions.updateOrderButtonStatus(buttonStatus))
  }, [buttonStatus])

  useEffect(() => {
    if (isLogin && showLoginDrawer) {
      setShowLoginDrawer(false)
    }
  }, [showLoginDrawer, isLogin])

  const btnContainerClass = 'rounded-[6px] w-full hover-scale h-[38px]'

  const confirmModalContent = (
    <>
      <div className="mb-4">

        <div className="flex items-center justify-between py-2.5">
          <span className="text-[#CACACA] text-[calc(16rem/16)] leading-[calc(16rem/16)]">{`${baseCoin}/${orderInfo.currency}`}</span>
          <div className="flex items-center">
            <p className={`${orderSideClass} text-[calc(15rem/16)] leading-[calc(15rem/16)]`}>{orderSideDisplay}</p>
          </div>
        </div>

         
        <p className="flex items-center justify-between py-2.5">
          <span className="text-[#908E98] text-[calc(14rem/16)] leading-[calc(16rem/16)]">{t('futuresDetails.common.orderPrice')}</span>
          <span className="text-[#FFFFFF] text-[calc(15rem/16)] leading-[calc(15rem/16)]">
            {orderType == OrderTypeEnum.market ? t('futuresDetails.common.market') : `$${orderInfo.price}`}
          </span>
        </p>
        
        <p className="flex items-center justify-between py-2.5">
          <span className="text-[#908E98] text-[calc(14rem/16)] leading-[calc(16rem/16)]">{t('futuresDetails.common.quantity')}</span>
          <span className="text-[#FFFFFF] text-[calc(15rem/16)] leading-[calc(15rem/16)]">
            {orderInfo.currency === 'USDC' ? `${getNewSize()} ${baseCoin}` : `${orderInfo.size} ${orderInfo.currency}`}
          </span>
        </p>
        {
          (orderInfo.isShowTPSl && orderInfo.tpValue) && <p className="flex items-center justify-between py-2.5">
            <span className="text-[#908E98] text-[calc(14rem/16)] leading-[calc(16rem/16)]">{t('futuresDetails.common.tp')}</span>
            <span className="text-[#FFFFFF] text-[calc(15rem/16)] leading-[calc(15rem/16)]">
              {`${t('futuresDetails.common.markPrice')} ${orderSide === OrderSide.buy ? '≥' : '≤'} ${getCalcTpslPrice(orderSide)?.calcTpPrice}`}
            </span>
          </p>
        }

        {
          (orderInfo.isShowTPSl && orderInfo.slValue) && <p className="flex items-center justify-between py-2.5">
          <span className="text-[#908E98] text-[calc(14rem/16)] leading-[calc(16rem/16)]">{t('futuresDetails.common.sl')}</span>
          <span className="text-[#FFFFFF] text-[calc(15rem/16)] leading-[calc(15rem/16)]">
            {`${t('futuresDetails.common.markPrice')} ${orderSide === OrderSide.buy ? '≤' : '≥'} ${getCalcTpslPrice(orderSide)?.calcSlPrice}`}
          </span>
          </p>
        }

        
        


      </div>

      <CheckboxWithLabel
        label={t('futuresDetails.confirmPlaceOrder.noMorePrompt')}
        defaultChecked={showPrompt}
        onChange={() => setshowPrompt(!showPrompt)}
      />
      <div className="grid grid-cols-2 gap-2 mt-5">
        <Button
          className="text-[#fff] bg-[#2B2B33] w-full rounded-[50px] font-bold h-[calc(1rem*(44/16))]"
          onClick={() => setIsOpenConfirmDrawer(false)}
        >
          {t('futuresDetails.common.cancel')}
        </Button>
        <Button
          className={cn("text-white w-full rounded-[50px] font-bold h-[calc(1rem*(44/16))]", orderInfo.side ===  OrderSide.buy ? 'bg-[var(--tab-buy-bg)]' : 'bg-[var(--tab-sell-bg)]')}
          onClick={() => handleClickOrderBtn(orderInfo.side, false)}
          isLoading={isPending}
          disabled={isPending}
        >
          { orderInfo.side ===  OrderSide.buy ? t('futuresDetails.common.buyLong') : t('futuresDetails.common.sellShort')}
        </Button>
      </div>
    </>
  )

  const btnClass = 'bg-[var(--tab-buy-bg)]'

  const buttonChildrenClass = ''

  return (
    <div className={cn('', containerClassName)}>
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />

      {buttonStatus === 'login' && (
        <ButtonGreen
          className={cn(btnContainerClass, btnClass)}
          buttonChildrenClass={buttonChildrenClass}
          onClick={() => handleClickBtnLogin()}
        >
          {t('futuresDetails.confirmPlaceOrder.login')}
        </ButtonGreen>
      )}

      {buttonStatus === 'deposit' && (
        <ButtonGreen
          className={cn(btnContainerClass, btnClass)}
          buttonChildrenClass={buttonChildrenClass}
          onClick={() => {
            dispatch(
              exchangeActions.openExchangeDialog({
                defaultTab: 'deposit',
              }),
            )
          }}
        >
          {t('futuresDetails.confirmPlaceOrder.deposit')}
        </ButtonGreen>
      )}

      {buttonStatus === 'transfer' && (
        <ButtonGreen
          className={cn(btnContainerClass, btnClass)}
          buttonChildrenClass={buttonChildrenClass}
          onClick={() => {
            dispatch(
              exchangeActions.openExchangeDialog({
                defaultTab: 'transfer',
              }),
            )
          }}
        >
          {t('futuresDetails.confirmPlaceOrder.transfer')}
        </ButtonGreen>
      )}

      {buttonStatus === 'approve' &&
        <ButtonGreen
          className={cn(
            btnContainerClass,
            btnClass
          )}
          buttonChildrenClass={buttonChildrenClass}
          onClick={() => {
            eventBus.dispatch(NEED_APPROVE, {
              data: {
              },
            })
          }}
        >
          {t('futuresDetails.loginAuth.button')}
        </ButtonGreen>
      }

      {buttonStatus === 'order' && (
        <div className="flex flex-col xl:flex-row xl:gap-[10px] text-[calc(14rem/16)]">
          <ButtonGreen
            className={cn(
              btnContainerClass,
              'bg-[var(--tab-buy-bg)] mb-[10px] min-h-[38px] py-0 xl:w-[50%] xl:mb-0 xl:min-h-[44px] xl:py-1 h-auto',
            )}
            buttonChildrenClass={buttonChildrenClass}
            disabled={handleDisablePlaceOrderButton(OrderSide.buy)}
            onClick={(e) => { handleClickOrderBtn(OrderSide.buy, true) }}
          >
            {getOrderBtnLabel(OrderSide.buy)}
          </ButtonGreen>

          <ButtonGreen
            className={cn(
              btnContainerClass,
              'bg-[var(--tab-sell-bg)] min-h-[38px] py-0 xl:w-[50%] xl:min-h-[44px]  xl:py-1 h-auto',
            )}
            buttonChildrenClass={buttonChildrenClass}
            disabled={handleDisablePlaceOrderButton(OrderSide.sell)}
            onClick={(e) => { handleClickOrderBtn(OrderSide.sell, true) }}
          >
            {getOrderBtnLabel(OrderSide.sell)}
          </ButtonGreen>
        </div>
      )}

      {
        isDesktop ?
          <Dialog open={isOpenConfirmDrawer} onOpenChange={setIsOpenConfirmDrawer}>


            <DialogContent className="bg-[#232329] w-[400px] py-4 px-0" showDialogPrimitiveClose={false}>
              <DialogHeader className='border-b border-[#302E38] px-4 pb-4'>
                <div className='flex items-center justify-between'>
                  <DialogTitle><div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('futuresDetails.confirmPlaceOrder.confirmOrder')}</div></DialogTitle>

                  <button
                    onClick={() => setIsOpenConfirmDrawer(false)}
                    className="rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </DialogHeader>
              <div className='px-4'>
                {confirmModalContent}
              </div>
            </DialogContent>
          </Dialog>

          : <Drawer open={isOpenConfirmDrawer} onOpenChange={setIsOpenConfirmDrawer}>
            <DrawerContent className="min-h-[258px] w-full bg-[#232329] max-w-[768px] mx-auto">
              <DrawerHeader className="py-4 px-3.5 flex w-full items-center justify-between">
                <DrawerTitle className="flex items-center">
                  <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('futuresDetails.confirmPlaceOrder.confirmOrder')}</div>
                </DrawerTitle>
                <img
                  src="/images/icons/icon-x.svg"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setIsOpenConfirmDrawer(false)}
                  alt=""
                />
              </DrawerHeader>
              {
                <div className="px-4 pb-8">{confirmModalContent}</div>
              }
            </DrawerContent>
          </Drawer>

      }

    <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </div>
  )
}
export default ConfirmPlaceOrder
