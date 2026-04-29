import { Configs } from '@/const/configs'
import { useMutation } from '@tanstack/react-query'
import { Decimal } from 'decimal.js'
import { toast } from 'sonner'
import { ConfirmPlaceOrderProps } from '../trade/ConfirmPlaceOrder'
import { triggerTypeOptions } from '../trade/Constans'
import {
  OrderPhasedParams,
  OrderRequest,
  OrderSide,
  OrderType,
  OrderTypeEnum,
  OrderTypeWire,
  OrderWire,
  ScaleRequest,
  Tpsl,
  TpslRequest,
  TwapRequest,
} from '../trade/type.order'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'
import { getAdjustedTriggerPrice } from '@/components/futuresDetails/trade/tools.ts'
import { builderSelector, agentWalletSelector } from '@/redux/modules/futuresUserInfo.slice'
import { isHyperOrderSuccess, formatSize } from '@/components/futuresDetails/trade/tools'
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { useTranslation } from 'react-i18next'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'
import { fixNumber, MathFun, hasPercent, removePercent } from '@/lib/utils'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { fundingSelector } from '@/redux/modules/futuresUserInfo.slice'




const usePlaceAnOrder = () => {
  const { t } = useTranslation()
  const { price: symbolPrice, baseCoin, szDecimals } = useAppSelector(symbolInfoSelector)
  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const builder = useAppSelector(builderSelector)
  const leverage = Number(tradeConfigs.leverage)
  const dispatch = useAppDispatch()

  const agentWallet = useAppSelector(agentWalletSelector)

  const allMeta = useAppSelector(selectAllPerpMeta)

  const { available: availableToTrade } = useAppSelector(fundingSelector)
  

  const coinIndex = allMeta.findIndex(item => (baseCoin === item.name))

  function floatToWire(x: number): string {
    const rounded = x.toFixed(8)
    if (Math.abs(parseFloat(rounded) - x) >= 1e-12) {
      throw new Error('floatToWire causes rounding')
    }
    if (rounded === '-0') {
      return '0'
    }
    return new Decimal(rounded).toString()
  }


  // Scale order utilities
  function generateScaleOrders({
    totalSize,
    startPrice,
    endPrice,
    count,
    skew,
    isBuy,
    reduceOnly = false,
    minNotionalUSD = 10,
    decimals = 5,
    tif = 'Gtc',
  }: OrderPhasedParams): OrderWire[] {
    // 1. Generate prices array
    const prices = generatePrices(startPrice, endPrice, count)


    // 2. Generate skewed sizes
    const sizes = generateSkewSizes({
      totalSize,
      count,
      skew,
      prices,
      minNotionalUSD,
      decimals,
    })

    // 3. Create orders array
    const orders: OrderWire[] = prices.map((price, i) => ({
      a: coinIndex,
      b: isBuy,
      p: price.toString(),
      r: reduceOnly,
      s: sizes[i].toString(),
      t: { limit: { tif } },
    }))

    return orders
  }

  function generateSkewSizes({
    totalSize,
    count,
    skew,
    prices,
    minNotionalUSD,
    decimals = 5,
  }: {
    totalSize: number
    count: number
    skew: number
    prices: number[]
    minNotionalUSD: number
    decimals?: number
  }): number[] {
    const tickSize = Math.pow(10, -decimals)
    const startSize = (2 * totalSize) / (count * (skew + 1))
    const endSize = skew * startSize
    const step = (endSize - startSize) / (count - 1)

    return prices.map((price, i) => {
      const raw = startSize + step * i
      const floored = Math.floor(raw / tickSize) * tickSize
      const minLot = Math.ceil(minNotionalUSD / price / tickSize) * tickSize
      return Number(Math.max(floored, minLot).toFixed(decimals))
    })
  }

  function generatePrices(startUSD: number, endUSD: number, count: number): number[] {
    const step = (endUSD - startUSD) / (count - 1)
    return Array.from({ length: count }, (_, i) => Number((startUSD + step * i).toFixed(0)))
  }

  function orderTypeToWire(orderType: OrderType): OrderTypeWire {
    if ('limit' in orderType) {
      return { limit: orderType.limit }
    } else if ('trigger' in orderType && orderType.trigger) {
      return {
        trigger: {
          isMarket: orderType.trigger.isMarket,
          triggerPx: orderType.trigger.triggerPx,
          tpsl: orderType.trigger.tpsl,
        },
      }
    }
    throw new Error('Invalid order type')
  }

  function orderRequestToOrderWire(order: OrderRequest): OrderWire {
    const orderWire: OrderWire = {
      a: order.asset,
      b: order.is_buy,
      p: order.limit_px,
      s: order.sz,
      r: order.reduce_only,
      t: orderTypeToWire(order.order_type),
    }
    if (order.order_type.trigger) {
      orderWire.r = true
    }

    if (order.cloid) {
      orderWire.c = order.cloid.toRaw()
    }

    return orderWire
  }

  function orderWiresToOrderAction(orderWires: OrderWire[], grouping: string = 'na') {
    return {
      type: 'order',
      orders: orderWires,
      grouping: grouping,
    }
  }

  const handleCheckTpSl = ({
    orderInfo,
    price,
  }: {
    price: string
    orderInfo: ConfirmPlaceOrderProps['orderInfo']
  }): Tpsl => {
    const { triggerPrice, side: is_buy } = orderInfo

    if (!triggerPrice || !price) {
      return 'tp'
    }

    if (is_buy === OrderSide.buy) {
      return Number(triggerPrice) > Number(price) ? 'tp' : 'sl'
    } else {
      return Number(triggerPrice) < Number(price) ? 'tp' : 'sl'
    }
  }

  // handle twap order
  const twapOrderHandling = ({ orderInfo, orderSide }: Pick<ConfirmPlaceOrderProps, 'orderInfo' | 'orderSide'>) => {
    return {
      action: {
        type: 'twapOrder',
        twap: {
          a: 0,
          b: orderSide === OrderSide.buy,
          s: orderInfo.size.toString(),
          r: orderInfo.reduceOnly,
          m: Number(orderInfo.duration || 60),
          t: orderInfo.randomize || false,
        },
      },
    }
  }

  // handle scale order
  const scaleOrderHandling = ({
    orderInfo,
    orderSide,
  }: Pick<ConfirmPlaceOrderProps, 'orderInfo' | 'orderSide'>): ScaleRequest => {
    const orders = generateScaleOrders({
      totalSize: Number(orderInfo.size),
      startPrice: Number(orderInfo.startPrice),
      endPrice: Number(orderInfo.endPrice),
      count: Number(orderInfo.orderCount || 5),
      skew: Number(orderInfo.sizeSkew || 1.0),
      isBuy: orderSide === OrderSide.buy,
      reduceOnly: orderInfo.reduceOnly,
      minNotionalUSD: 10,
      decimals: 5,
      tif: orderInfo.tif,
    })

    return {
      orders,
      grouping: 'na',
      type: 'order',
    }
  }

  // handle set payload for market, limit, tpsl
  const handleSetPayload = ({ orderInfo, orderSide, price, calcTpPrice ,calcSlPrice, currentPositionSzi }: ConfirmPlaceOrderProps) => {
    const orderType = orderInfo.type
    const { currency } = orderInfo

    let usdValue


     const available = orderSide === OrderSide.buy
      ? availableToTrade?.[0]
      : availableToTrade?.[1]

    const size = orderInfo.size
    let newSize

    // 百分比下单
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


   

    const orderPrice = Number(orderInfo.price ? orderInfo.price : price);

    let rawNewPrice = '0';

    if (orderInfo.type === OrderTypeEnum.market) {
      rawNewPrice = getAdjustedTriggerPrice(orderSide, orderPrice, false, szDecimals)
    } else {
      rawNewPrice = orderPrice.toString();
    }


    let isBuy = orderSide === 'buy'

    if (orderInfo.isShowTPSl && (calcTpPrice || calcSlPrice)) {
      const mainOrderRequest: OrderRequest = {
        asset: coinIndex,
        is_buy: isBuy,
        sz: newSize,
        limit_px: rawNewPrice,
        reduce_only: orderInfo.reduceOnly,
        order_type: orderType === 'market' ? { limit: { tif: 'FrontendMarket' } } : { limit: { tif: 'Gtc' } },
      }

      const orders: OrderRequest[] = [mainOrderRequest]

      if (calcTpPrice) {
        const tpOrderRequest: OrderRequest = {
          asset: coinIndex,
          is_buy: !isBuy,
          sz: newSize,
          limit_px: getAdjustedTriggerPrice('buy', calcTpPrice, false, szDecimals),
          reduce_only: orderInfo.reduceOnly,
          order_type: {
            trigger: {
              triggerPx: calcTpPrice.toString(),
              isMarket: orderType === OrderTypeEnum.market,
              tpsl: 'tp',
            },
          },
        }
        orders.push(tpOrderRequest)
      }

      if (calcSlPrice) {
        const slOrderRequest: OrderRequest = {
          asset: coinIndex,
          is_buy: !isBuy,
          sz: newSize,
          limit_px: getAdjustedTriggerPrice('sell', calcSlPrice, false, szDecimals),
          reduce_only: orderInfo.reduceOnly,
          order_type: {
            trigger: {
              triggerPx: calcSlPrice.toString(),
              isMarket: orderType === OrderTypeEnum.market,
              tpsl: 'sl',
            },
          },
        }
        orders.push(slOrderRequest)
      }

      console.log('orders', orders)
      return {
        orders,
        grouping: 'normalTpsl',
      }
    } else {


      let orderRequest: OrderRequest = {
        asset: coinIndex,
        is_buy: orderSide === 'buy',
        sz: newSize,
        limit_px: rawNewPrice,
        reduce_only: orderInfo.reduceOnly,
      } as OrderRequest

      switch (orderType) {
        case OrderTypeEnum.market:
          return (orderRequest = {
            ...orderRequest,
            order_type: {
              limit: {
                tif: 'FrontendMarket',
              },
            },
          })
        case OrderTypeEnum.limit:
          return (orderRequest = {
            ...orderRequest,
            order_type: {
              limit: {
                tif: 'Gtc',
              },
            },
          })
        case OrderTypeEnum.tpsl:
          return (orderRequest = {
            ...orderRequest,
            order_type: {
              trigger: {
                triggerPx: Number(orderInfo.triggerPrice || 0),
                isMarket: orderInfo.triggerType === triggerTypeOptions[0].value,
                tpsl: handleCheckTpSl({ orderInfo, price: price ?? '0' }),
              },
            },
          })
        default:
          return orderRequest
      }
    }
  }

  const orderMutation = useMutation({
    mutationFn: async (payload: OrderRequest | TpslRequest | TwapRequest | ScaleRequest) => {
      let orderAction
      if ('action' in payload && payload.action.type === 'twapOrder') {
        orderAction = payload.action
      } else if ('grouping' in payload && payload.grouping === 'na') {
        orderAction = { ...payload }
      } else if ('grouping' in payload && payload.grouping === 'normalTpsl') {
        let orderWires: OrderWire[] = []
        if ('orders' in payload) {
          orderWires = payload.orders.map((order) => orderRequestToOrderWire(order))
        }
        orderAction = orderWiresToOrderAction(orderWires, 'normalTpsl')
      } else {
        const orderRequest = payload as OrderRequest
        const orderWire = orderRequestToOrderWire(orderRequest)
        orderAction = orderWiresToOrderAction([orderWire])
      }


      orderAction.builder = builder

      console.log('orderAction', orderAction)

      if (!agentWallet) return

      const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)
      const response = await hanleHyperliquidAction({
        agentPrivateKey: realAgentWallet.privateKey, 
        action: orderAction, 
        dispatch: null, 
        showError: false,
        walletAddress: agentWallet.id,
        allMeta: allMeta
      });
   
      return response



    },
    onError: (error) => {
      console.log(error)
      toast.error(error.message)
    },
    onSuccess: async (response: any) => {
      if (response === 'fail') return
      const result = isHyperOrderSuccess(response)
      if (!result.ok) {
        handleHyperliquidOrderError(result.error as string, dispatch)
        return
      }
      toast.success(t('futuresDetails.tips.orderSuccess'))

    },
  })

  return {
    orderContract: orderMutation,
    handleSetPayload,
    twapOrderHandling,
    scaleOrderHandling,
  }
}

export default usePlaceAnOrder
