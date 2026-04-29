import { fixNumber, MathFun, hasPercent, removePercent } from '@/lib/utils'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { setOrderInfo } from '@/redux/modules/orderContract.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { formatNumberWithCommas } from '@/utils/helpers'
import { t } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { OrderContractState } from '../trade/type.order'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { userFeeSelector } from '@/redux/modules/futuresUserInfo.slice'
import { useActiveAssetData } from '@/hooks/hyperliquid/useActiveAssetData'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { Leverage } from '@/types/hyperliquid'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import { useOrderBookData } from '@/hooks/hyperliquid/useOrderBookData'
import { useAllMidsData } from '@/hooks/hyperliquid/useAllMidsData'

interface OrderValues {
  orderValue: number
  liquidationPrice: string
  marginRequired: number
  maxOrderValue: number
  slippage: number
}

interface ComputeOrderValuesParams {
  side: 'buy' | 'sell'
  useCurrentOrderInfo?: boolean
}

const useOrderFormCalucate = (baseCoin: string, positions?: any[]) => {
  const dispatch = useAppDispatch()
  const walletDex = useSelector(_walletDex)
  const { price: symbolPrice, szDecimals, markPrice } = useAppSelector(symbolInfoSelector)
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  
  const {takerFee, makerFee} = useAppSelector(userFeeSelector)

  const { leverage, positionMode, depthTick } = useAppSelector(futuresTradeConfigSelector(baseCoin))

  const {
    webData2: { clearinghouseState },
    meta,
  } = useWebData2()

  const allMids = useAllMidsData();

  const { activeAssetData } = useActiveAssetData(orderInfo.orderCoin, walletDex.walletAddress)

  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
  const tier = useMemo(() => tiers.find((item: any) => item.tick === depthTick), [tiers, depthTick])
  const orderBookData = useOrderBookData(baseCoin, tier?.nSigFigs, tier?.mantissa, tier)

  const TokenAccuracy = tier?.tick

  const MaxSlippage = 0.08 // this is from hyperliquid frontend

  const getDecimalPlaces = (num: number): number => {
    if (!num || num === 0) return 0
    const str = num.toString()
    if (str.indexOf('.') === -1) return 0
    return str.split('.')[1].length
  }

  const tokenAccuracyDecimals = useMemo(() => {
    return TokenAccuracy ? getDecimalPlaces(TokenAccuracy) : 2
  }, [TokenAccuracy])

  const getMarginTableIdByCoinName = (coinName: string): number => {
    const coin = meta.universe?.find((c) => c.name === coinName)
    return coin ? coin.marginTableId : 0
  }

  const parseMarginTiers = (marginTableId: number, config: any) => {
    if (!marginTableId || !config) return []

    let marginData

    // ID <= 50 使用简单模式
    if (marginTableId <= 50) {
      marginData = {
        description: '',
        marginTiers: [
          {
            lowerBound: 0,
            maxLeverage: marginTableId,
          },
        ],
      }
    } else {
      // ID > 50 从配置表中查找
      const tableEntry = config.marginTables?.[marginTableId - 50]
      marginData = tableEntry?.[1]
    }

    if (!marginData || !marginData.marginTiers) return []

    let maintenanceDeduction = 0
    const processedTiers = []

    // 处理每个层级，计算维护保证金扣除
    for (let i = 0; i < marginData.marginTiers.length; i++) {
      const currentTier = marginData.marginTiers[i]
      const nextTier = marginData.marginTiers[i + 1]

      processedTiers.push({
        lowerBound: Number(currentTier.lowerBound) || 0,
        upperBound: nextTier ? Number(nextTier.lowerBound) : undefined,
        maxLeverage: Number(currentTier.maxLeverage) || 0,
        maintenanceDeduction: Number(maintenanceDeduction) || 0,
      })

      // 计算下一层级的维护保证金扣除
      if (nextTier) {
        maintenanceDeduction +=
          (Number(nextTier.lowerBound) || 0) *
          ((1 / getMaintenanceMarginRateInverse(Number(nextTier.maxLeverage) || 0)) -
            (1 / getMaintenanceMarginRateInverse(Number(currentTier.maxLeverage) || 0)))
      }
    }

    return processedTiers
  }

  const findMarginTier = (marginTiers: any[], positionValue: number) => {
    if (!marginTiers || marginTiers.length === 0) {
      return {
        lowerBound: 0,
        maxLeverage: 50,
        maintenanceDeduction: 0,
      }
    }

    for (const tier of marginTiers) {
      if (positionValue >= tier.lowerBound && (tier.upperBound === undefined || positionValue < tier.upperBound)) {
        return tier
      }
    }

    console.error('无法找到保证金层级', marginTiers, positionValue)
    return {
      lowerBound: 0,
      maxLeverage: 50,
      maintenanceDeduction: 0,
    }
  }

  const getMaintenanceMarginRateInverse = (maxLeverage: number) => {
    return 2 * maxLeverage
  }

  const calculateMaintenanceMargin = (tier: any, notionalPosition: number) => {
    if (!tier || notionalPosition === 0) return 0
    return notionalPosition / getMaintenanceMarginRateInverse(tier.maxLeverage) - (tier.maintenanceDeduction || 0)
  }

  const calculateLiquidation = (
    markPx: number,
    floatSide: number,
    liveAccountValue: number,
    totalNtlPos: number,
    absPosition: number,
    leverage: number,
    tiers: any[],
  ) => {
    if (absPosition === 0 || !markPx || !liveAccountValue || !tiers || tiers.length === 0) {
      return null
    }

    const currentTier = findMarginTier(tiers, Math.abs(totalNtlPos))
    const maxAccountValue = Math.max(liveAccountValue, totalNtlPos / Math.min(leverage, currentTier.maxLeverage))

    let liquidationPrice = null

    for (const tier of tiers) {
      const maintenanceMarginRate = 1 - floatSide / getMaintenanceMarginRateInverse(tier.maxLeverage)
      if (maintenanceMarginRate === 0) continue

      const price =
        markPx -
        (floatSide * (maxAccountValue - calculateMaintenanceMargin(tier, totalNtlPos))) /
          absPosition /
          maintenanceMarginRate

      if (price <= 0 || price > 1e15) {
        continue
      }

      const positionValue = price * absPosition

      if (positionValue >= tier.lowerBound && (tier.upperBound === undefined || positionValue < tier.upperBound)) {
        liquidationPrice = price
        break
      }
    }

    return liquidationPrice
  }

  const getIsolatedLiquidationPrice = (
    markPrice: number,
    leverage: Leverage,
    positionSzi: number,
    sizeChange: number,
    totalValue: number,
    totalPosition: number,
    marginTableId: number,
    config: any,
  ) => {
    if (!markPrice || !leverage || !config) return null

    const marginTiers = parseMarginTiers(marginTableId, config)
    if (marginTiers.length === 0) return null

    // 逐仓模式特殊计算逻辑
    let adjustedSizeChange = sizeChange
    let adjustedRawUsd: number = Number(leverage.rawUsd) || 0

    // 处理仓位对冲情况
    if (positionSzi !== 0 && (adjustedSizeChange > 0) !== (positionSzi > 0)) {
      const hedgeAmount = Math.min(Math.abs(adjustedSizeChange), Math.abs(positionSzi))
      const hedgeDirection = adjustedSizeChange < 0 ? -hedgeAmount : hedgeAmount

      adjustedRawUsd -= (adjustedRawUsd + markPrice * positionSzi) * (hedgeAmount / Math.abs(positionSzi))
      adjustedSizeChange -= hedgeDirection
      positionSzi += hedgeDirection
      adjustedRawUsd -= markPrice * hedgeDirection
    }

    // 处理同向仓位增加
    if (positionSzi === 0 || !(adjustedSizeChange > 0 !== positionSzi > 0)) {
      adjustedRawUsd += Math.abs(markPrice * adjustedSizeChange) / (leverage.value || 1)
      positionSzi += adjustedSizeChange
      adjustedRawUsd -= markPrice * adjustedSizeChange
    }

    if (positionSzi === 0) {
      adjustedRawUsd = 0
    }

    return calculateLiquidation(
      markPrice,
      totalPosition > 0 ? 1 : -1,
      totalPosition * markPrice + adjustedRawUsd,
      totalValue,
      Math.abs(totalPosition),
      leverage.value || 1,
      marginTiers,
    )
  }

  const getCrossLiquidationPrice = (
    markPx: number,
    floatSide: number,
    leverageConfig: Leverage,
    liveAccountValue: number,
    totalValue: number,
    totalPosition: number,
    marginTiers: any[],
  ) => {
    if (!markPx || !leverageConfig || !marginTiers || marginTiers.length === 0) return null

    const absolutePosition = Math.abs(totalPosition)
    if (absolutePosition === 0) return null

    return calculateLiquidation(
      markPx,
      floatSide,
      liveAccountValue,
      totalValue,
      absolutePosition,
      leverageConfig.value || 1,
      marginTiers,
    )
  }

  const roundToDecimals = (value: number, t: number, mode: 'round' | 'floor' | 'ceil' = 'round'): number => {
    const factor = Math.pow(10, t)

    const [roundFn, epsilon] = (() => {
      switch (mode) {
        case 'round':
          return [Math.round, 0]
        case 'floor':
          return [Math.floor, 1e-9]
        case 'ceil':
          return [Math.ceil, -1e-9]
      }
    })()

    return roundFn(value * factor + epsilon) / factor
  }

  const applySlippage = (price: number, isBuy: boolean, tickSize: number): number => {
    if (!price) return 0

    const floatSide = isBuy ? 1 : -1
    let effectiveSlippage = MaxSlippage

    // If no order, reduce slippage by a cap
    if (!isBuy) effectiveSlippage = Math.min(effectiveSlippage, 0.7)

    const adjustedPrice = price * (1 + floatSide * effectiveSlippage)

    const r = Math.abs(adjustedPrice),
      i = 5 - Math.floor(Math.log(r) / Math.log(10)) - 1
    tickSize = Math.max(0, Math.min(i, 6 - tickSize))

    return roundToDecimals(adjustedPrice, tickSize, 'floor')
  }

  const getClearingPrice = (
    orderPrice: number | null,
    midPrice: number,
    size: number,
    orderBook: { bids: any[]; asks: any[] },
    isBuy: boolean,
    decimals: number,
  ) => {
    if (!orderBook || size <= 0) return orderPrice || midPrice

    const sideBook = isBuy ? orderBook.asks : orderBook.bids
    if (!sideBook || sideBook.length === 0) {
      return orderPrice || applySlippage(midPrice, isBuy, decimals)
    }

    // Use orderPrice or fallback with slippage-adjusted price
    const referencePrice = orderPrice ?? applySlippage(midPrice, isBuy, decimals)

    for (const { price, quantity } of sideBook) {
      // Stop if price is outside allowed slippage range
      if (isBuy ? price > referencePrice : price < referencePrice) break

      if (quantity >= size) {
        return price
      }
    }

    // If orderbook is thin, take the rest at reference price
    return referencePrice
  }

  const getAvailableToTrade = (side: string) => {
    let available = 0
    const currentBaseCoinPosition = (positions || []).filter((item: any) => item.coin === baseCoin)
    const hyperliuiqd_side = side === 'buy' ? 'B' : 'A'
    const currentPositionSide = currentBaseCoinPosition?.[0]?.side
    const isSameSide = hyperliuiqd_side === currentPositionSide
    
    if (orderInfo.reduceOnly && currentBaseCoinPosition.length) {
      available = (isSameSide ? 0 : currentBaseCoinPosition[0].positionValue || 0) / Number(leverage)
    } else {
      if (side === 'buy') {
        available = activeAssetData?.availableToTrade?.[0] || 0
      } else {
        available = activeAssetData?.availableToTrade?.[1] || 0
      }
    }
    
    
    return available
  }

  const getOrderSize = (executionPrice: number, orderFloatSide: number, side: string) => {
    let orderSize, available = 0

    available = getAvailableToTrade(side)

    if (typeof orderInfo.size === 'string' && hasPercent(orderInfo.size)) {
        const percent = Number(removePercent(orderInfo.size)) / 100
        const orderValue = percent * available * Number(leverage)
        if (orderInfo.currency === 'USDC') {
          const amount = fixNumber(MathFun.div(orderValue, executionPrice), szDecimals)
          orderSize = MathFun.mul(orderFloatSide, Number(amount))
        } else {
          orderSize = MathFun.mul(orderFloatSide, MathFun.div(orderValue, executionPrice))
        }
      } else {
        if (orderInfo.currency === 'USDC') {
          const orderValue = getOrderValue(orderInfo.side, orderInfo.size)
          const amount = fixNumber(MathFun.div(orderValue, executionPrice), szDecimals)
          orderSize = MathFun.mul(orderFloatSide, Number(amount))
        } else {
          orderSize = MathFun.mul(orderFloatSide, Number(orderInfo.size))
        }
      }
    
    return orderSize
  }

  // 计算最大可下单价值
  const getMaxOrderValue = (side: 'buy' | 'sell') => {
    const { currency } = orderInfo
    if (!activeAssetData?.availableToTrade) return 0

    const entryPrice = orderInfo.type.toLowerCase() === 'market' ? Number(symbolPrice) : Number(orderInfo.price)
    if (!entryPrice) return 0

    const available = getAvailableToTrade(side)

    const maxDecimalPlaces = currency === 'USDC' ? 2 : szDecimals

    let maxValue
    if (currency === 'USDC') {
      maxValue = available * Number(leverage || 1)
    } else {
      if (!entryPrice || !available) return 0
      maxValue = available * Number(leverage || 1) / entryPrice
    }
    return fixNumber(maxValue, maxDecimalPlaces)
  }

  // 计算订单价值
  const getOrderValue = (side: 'buy' | 'sell', size?: string | number) => {
    const { currency } = orderInfo
    if (!activeAssetData?.availableToTrade) return 0

    const entryPrice = orderInfo.type.toLowerCase() === 'market' ? Number(symbolPrice) : Number(orderInfo.price)
    if (!entryPrice) return 0

    const available = getAvailableToTrade(side)

    const currentSize = size || orderInfo.size
    if (!currentSize) return 0

    let orderValue

    // 百分比下单
    if (typeof currentSize === 'string' && hasPercent(currentSize)) {
      const percentageNum = Number(removePercent(currentSize)) / 100
      orderValue = available * Number(leverage || 1) * percentageNum
    } else {
      // 非百分比下单，判断是币本位还是U本位，算出订单价值
      const positionSize = Number(currentSize)
      if (!entryPrice || !positionSize || !leverage) return 0
      orderValue = currency === 'USDC' ? positionSize : positionSize * entryPrice
    }

    return fixNumber(orderValue || 0, 2)
  }

  // 计算保证金需求
  const getMarginRequired = (orderValue: number) => {
    if (!orderValue || !leverage || orderInfo.reduceOnly) return 0
    return fixNumber(MathFun.div(orderValue, Number(leverage)), 2)
  }

  // 计算强平价格
  const getLiquidationPrice = (side: 'buy' | 'sell', size?: string | number, price?: number): string => {
    try {
      if (!clearinghouseState || !activeAssetData || !leverage || orderInfo.reduceOnly) return '--'

      const currentSize = size || orderInfo.size
      const currentPrice = price || orderInfo.price

      if (!currentSize) return '--'

      const isSell = side.toLowerCase() === 'sell'
      let orderFloatSide = isSell ? -1 : 1
      const isMarket = orderInfo.type.toLowerCase() === 'market'
      let executionPrice: number = isMarket ? Number(markPrice || 0) : Number(currentPrice || 0)

      if (executionPrice === 0) {
        return '--'
      }

      if (!isMarket) {
        if (isSell) {
          if (Number(currentPrice || 0) < Number(markPrice || 0)) {
            executionPrice = Number(markPrice || 0)
          }
        } else {
          if (Number(currentPrice || 0) > Number(markPrice || 0)) {
            executionPrice = Number(markPrice || 0)
          }
        }
      }

      let available = 0
      if (side === 'buy') {
        available = activeAssetData?.availableToTrade[0] || 0
      } else {
        available = activeAssetData?.availableToTrade[1] || 0
      }

      let currentSizeNum: number = getOrderSize(executionPrice, orderFloatSide, side)

      const currentPosition = positions?.find((p) => p.coin === orderInfo.orderCoin)
      let positionFloatSide = 0,
        currentPositionSize = 0

      if (currentPosition) {
        positionFloatSide = currentPosition.side === 'A' ? -1 : 1
        currentPositionSize = currentPosition ? positionFloatSide * Number(currentPosition.szi) : 0
        orderFloatSide = MathFun.add(currentPositionSize, currentSizeNum) > 0 ? 1 : -1
      }

      const clearingPrice = getClearingPrice(
        isMarket ? null : executionPrice,
        Number(allMids?.mids?.[baseCoin as any] || 0),
        Math.abs(currentSizeNum),
        orderBookData,
        orderFloatSide === 1,
        szDecimals,
      )

      const totalPosition = MathFun.add(currentPositionSize, currentSizeNum)
      const totalValue = Math.abs(totalPosition * clearingPrice)

      let liquidationPrice: number | null = null

      if (positionMode === 'isolated') {
        liquidationPrice = getIsolatedLiquidationPrice(
          executionPrice,
          activeAssetData.leverage,
          currentPositionSize,
          currentSizeNum,
          totalValue,
          totalPosition,
          getMarginTableIdByCoinName(baseCoin),
          meta,
        )
      } else {
        const marginTiers = parseMarginTiers(getMarginTableIdByCoinName(baseCoin), meta)
        const currentTier = findMarginTier(
          marginTiers,
          Math.abs(MathFun.add(currentPositionSize, currentSizeNum)) * Number(currentPosition?.markPrice || executionPrice),
        )

        const liveAccountValue =
          Number(clearinghouseState.crossMarginSummary?.accountValue || 0) -
          Number(clearinghouseState.crossMaintenanceMarginUsed || 0) +
          calculateMaintenanceMargin(
            currentTier,
            Math.abs(currentPositionSize) * Number(currentPosition?.markPrice || executionPrice),
          )

        liquidationPrice = getCrossLiquidationPrice(
          executionPrice,
          orderFloatSide,
          activeAssetData.leverage,
          liveAccountValue,
          totalValue,
          totalPosition,
          marginTiers,
        )
      }

      return !liquidationPrice || liquidationPrice < 0
        ? '--'
        : `${formatNumberWithCommas(liquidationPrice.toFixed(tokenAccuracyDecimals))}`

    } catch (error) {
      console.error('计算强平价格出错:', error)
      return '--'
    }
  }

  // 计算预估滑点
  const getEstimatedSlippage = (side: 'buy'| 'sell') => {

    let executionPrice: number = Number(markPrice || 0)

    if (executionPrice === 0) {
      return '0'
    }
    const isSell = side === 'sell'

    let orderFloatSide = isSell ? -1 : 1
    
    // If order size is 0, no slippage
    const orderSize = MathFun.mul(orderFloatSide, getOrderSize(executionPrice, orderFloatSide, side))

    if (orderSize === 0) return "0";

    // Current mid or mark price for the active coin
    const currentPrice = Number(allMids?.mids?.[baseCoin as any] || 0);
    if (!orderBookData || currentPrice === undefined) return "N/A";

    // Pick the correct side of the orderbook
    const bookSide = isSell ? orderBookData.bids : orderBookData.asks;

    let totalCost = 0;      // total notional used to fill order
    let remainingSize = orderSize;

    // Walk through the orderbook and simulate filling
    for (const level of bookSide) {
      const levelSize = level.quantity;
      const levelPrice = level.price;

      if (remainingSize <= levelSize) {
        totalCost += remainingSize * levelPrice;
        remainingSize = 0;
        break;
      }

      totalCost += levelSize * levelPrice;
      remainingSize -= levelSize;
    }

    const filledSize = orderSize - remainingSize;
    if (filledSize < 1e-6) return "N/A";

    // Average fill price of simulated order
    const averageFillPrice = totalCost / filledSize;

    // Calculate slippage = % difference between fill price and mid price
    const slippageRatio = Math.abs(1 - averageFillPrice / currentPrice) * orderSize / filledSize;

    // Format as percentage with 4 decimals
    const formatted = `${Number(100 * slippageRatio).toFixed(4)}`;
    return formatted;
  }

  const computeOrderValues = (params: ComputeOrderValuesParams): OrderValues => {
    const { side, useCurrentOrderInfo = true } = params
    
    const size = useCurrentOrderInfo ? orderInfo.size : undefined
    const price = useCurrentOrderInfo ? orderInfo.price : undefined
    
    const orderValue = getOrderValue(side, size)
    const liquidationPrice = getLiquidationPrice(side, size, price)
    const marginRequired = getMarginRequired(Number(orderValue))
    const maxOrderValue = getMaxOrderValue(side)
    const slippage = getEstimatedSlippage(side)

    return {
      orderValue: Number(orderValue),
      liquidationPrice,
      marginRequired: Number(marginRequired),
      maxOrderValue: Number(maxOrderValue),
      slippage: Number(slippage)
    }
  }

  const { orderValue: buyOrderValue, liquidationPrice: buyOrderLiqPrice, marginRequired: buyOrderMarginRequired, maxOrderValue: maxBuyOrderValue, slippage: buySlippage } = computeOrderValues({ side: 'buy' })
  const { orderValue: sellOrderValue, liquidationPrice: sellOrderLiqPrice, marginRequired: sellOrderMarginRequired, maxOrderValue: maxSellOrderValue, slippage: sellSlippage } = computeOrderValues({ side: 'sell' })

  return {
    buyOrderValue,
    buyOrderLiqPrice,
    buyOrderMarginRequired,
    maxBuyOrderValue,
    buySlippage,
    
    sellOrderValue,
    sellOrderLiqPrice,
    sellOrderMarginRequired,
    maxSellOrderValue,
    sellSlippage,

    takerFee,
    makerFee,

    computeOrderValues,
    getOrderValue,
    getMaxOrderValue,
    getMarginRequired,
    getLiquidationPrice,
    getEstimatedSlippage
  }
}

export default useOrderFormCalucate