import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { fundingSelector } from '@/redux/modules/futuresUserInfo.slice'
import { setOrderInfo } from '@/redux/modules/orderContract.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { OrderContractState, OrderTypeEnum,OrderSide, TpslTypeEmum } from '../trade/type.order'
import { futuresTradeConfigActions, futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { MathFun, fixNumber, hasPercent } from '@/lib/utils'
import { validatePrice } from '@/components/futuresDetails/trade/tools'
import { selectSzMap } from '@/redux/modules/futuresMeta.slice'
import { Baseline } from 'lucide-react'
import { useEffect } from 'react'



const useHandleChangeValue = () => {
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)

  const { price: symbolPrice, baseCoin, quoteCoin, szDecimals } = useAppSelector(symbolInfoSelector)

  const { available: availableToTrade } = useAppSelector(fundingSelector)
  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))

  const leverage = Number(tradeConfigs.leverage)
  const szMap = useAppSelector(selectSzMap)

  const dispatch = useAppDispatch()


  const handleOrderInfoChange = (key: keyof typeof orderInfo, value: any) => {
    if (key === 'type' && value === OrderTypeEnum.market) {
      // 市价单：使用当前价格
      dispatch(
        setOrderInfo({
          ...orderInfo,
          type: value,
          price: Number(symbolPrice),
        }),
      )
    } 
    else if (key === 'side' && (value === OrderSide.sell || value === OrderSide.buy)) {
      // 切换做多/做空时清空止盈止损价格
      dispatch(
        setOrderInfo({
          ...orderInfo,
          side: value,
          tpPrice: '',
          slPrice: '',
        }),
      )
    } 
    else if (key === 'currency') {
      const prevCurrency = orderInfo.currency 
      const price = Number(orderInfo.price) || Number(symbolPrice)
      const currentSize = Number(orderInfo.size)

      let newSize = currentSize

      if (price && currentSize && value !== prevCurrency) {
        if (prevCurrency === quoteCoin && value !== quoteCoin) {
          newSize = currentSize / price
        } else if (prevCurrency !== quoteCoin && value === quoteCoin) {
          newSize = currentSize * price
        }
      }

      const decimalPlaces = value === quoteCoin ? 2 : szDecimals


      dispatch(
        setOrderInfo({
          ...orderInfo,
          currency: value,
          size: isNaN(newSize) ? orderInfo.size : Number(fixNumber(newSize, decimalPlaces))
        }),
      )

    } else if (
      (key === 'price' && orderInfo.type !== OrderTypeEnum.market)
      || (key === 'tpValue' && orderInfo.tpType === TpslTypeEmum.Price)
      || (key === 'slValue' && orderInfo.slType === TpslTypeEmum.Price)
    ) {

      const priceStr = String(value).trim()
      const isTypingIntermediate = priceStr === '' || priceStr === '.' || priceStr === '0.'

      // 中间输入状态，允许更新但不校验
      if (isTypingIntermediate) {
        dispatch(
          setOrderInfo({
            ...orderInfo,
            [key]: priceStr as any,
          }),
        )
        return
      }

      // 校验最终格式
      const isValid = validatePrice(baseCoin, priceStr, szMap)
      if (!isValid) return

      // const priceNum = parseFloat(priceStr)
      // if (isNaN(priceNum)) return

      dispatch(
        setOrderInfo({
          ...orderInfo,
          [key]: priceStr,
        }),
      )
    } else if (
      (key === 'tpValue' && orderInfo.tpType === TpslTypeEmum.ROI)
      || (key === 'slValue' && orderInfo.slType === TpslTypeEmum.ROI)
    ) {
      const sanitizedValue = value.replace(/(\.\d{0,2}).*$/, '$1') // 小数最多保留2位
      dispatch(
        setOrderInfo({
          ...orderInfo,
          [key]: sanitizedValue,
        }),
      )

    } else {
      dispatch(
        setOrderInfo({
          ...orderInfo,
          [key]: value,
        }),
      )
    }
  }


  const handleSizeChange = (value: string) => {
    const isTypingIntermediate = value === '' || value === '.' || value === '0.'

    // 获取小数限制：USD 为 2，否则用 szDecimals
    const maxDecimalPlaces = orderInfo.currency === quoteCoin ? 2 : szDecimals

    // 构造限制小数位的正则
    const decimalLimitRegex = new RegExp(`^\\d*(\\.\\d{0,${maxDecimalPlaces}})?$`)
    if (!isTypingIntermediate && !decimalLimitRegex.test(value)) {
      return // 不符合小数位格式
    }

    const parsedValue = parseFloat(value)
    const safeValue = !isNaN(parsedValue) ? parsedValue : 0

    let sliderPercentage = 0

    if (!isTypingIntermediate && safeValue > 0) {
      
        // 计算可用于交易的最大值
        const maxTradeValue = (orderInfo.side === 'buy' ? availableToTrade[0] : availableToTrade[1]) * leverage;
      
        if (orderInfo.currency === quoteCoin) {
          // 如果是法币（如 USDT），直接计算百分比
          sliderPercentage = (safeValue / maxTradeValue) * 100
        } else {
          // 如果是加密货币（如 BTC），先转换为等值法币
          const usdEquivalent = safeValue * Number(symbolPrice);
          // 然后计算百分比
          sliderPercentage = (usdEquivalent / maxTradeValue) * 100
        }
  
        // 确保百分比在 0-100 之间
        sliderPercentage = Math.min(Math.max(sliderPercentage, 0), 100)
        
        // 对于非常小的值，确保至少显示最小进度
        if (safeValue > 0 && sliderPercentage < 0.01) {
          sliderPercentage = 0.01;
        }
      // if (orderInfo.currency === quoteCoin) {
      //   sliderPercentage = (safeValue / (availableToTrade * leverage)) * 100
      // } else {
      //   const usdValue = (safeValue * Number(symbolPrice)) / leverage
      //   sliderPercentage = (usdValue / (availableToTrade * leverage)) * 100
      // }

      // sliderPercentage = Math.min(Math.max(sliderPercentage, 0), 100)
    }

    dispatch(
      setOrderInfo({
        ...orderInfo,
        size: value as any,
        // sliderValue: [sliderPercentage],
      }),
    )
  }

  const resetSizeValue = () => {
    if (typeof orderInfo.size === 'string' && hasPercent(orderInfo.size)) {
      dispatch(
        setOrderInfo({
          ...orderInfo,
          sliderValue: [0],
          size: '',
        }),
      )
    }
  }

  const onSliderValueChange = (value: number[]) => {
    const percentage = value[0]

    const newSize = `${percentage}%`

    dispatch(
      setOrderInfo({
        ...orderInfo,
        sliderValue: value,
        size: newSize,
      }),
    )
  }

  useEffect(() => {
    handleSizeChange(`${orderInfo.size}`)
  }, [orderInfo.side])


  return {
    handleOrderInfoChange,
    handleSizeChange,
    onSliderValueChange,
    resetSizeValue
  }
}

export default useHandleChangeValue
