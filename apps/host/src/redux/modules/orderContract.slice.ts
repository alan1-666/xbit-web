import { periods } from '@/components/futuresDetails/trade/Constans'
import {
  OrderContractState,
  OrderInfo,
  OrderSide,
  OrderTypeEnum,
  TriggerTypeEmum,
  TpslTypeEmum
} from '@/components/futuresDetails/trade/type.order'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: OrderContractState = {
  orderInfo: {
    type: OrderTypeEnum.market,
    side: OrderSide.buy,
    size: '',
    price: '',
    reduceOnly: false,
    isShowTPSl: false,
    currency: 'USDC',
    sliderValue: [0],
    tpPrice: '',
    slPrice: '',
    tpType: TpslTypeEmum.Price,
    tpValue: '',
    slType: TpslTypeEmum.Price,
    slValue: '',
    triggerPrice: 0,
    triggerType: TriggerTypeEmum.LimitOrder,
    orderCount: 0,
    endPrice: 0,
    sizeSkew: 1,
    startPrice: 0,
    tif: 'Gtc',
    duration: periods[0].value,
    randomize: false,
    tpslUnit: '%',
    liquidationPrice: 0,
    positionValue: 0,
    marginRequired: 0,
    orderCoin: 'USDC',
  },
}

const orderContractSlice = createSlice({
  name: 'orderContract',
  initialState,
  reducers: {
    initOrderInfo(state, action: PayloadAction<{ side: OrderSide; orderType: OrderTypeEnum }>) {
      state.orderInfo = { ...initialState.orderInfo, side: action.payload.side, type: action.payload.orderType }
    },

    setOrderInfo(state, action: PayloadAction<OrderInfo>) {
      state.orderInfo = action.payload
    },
    resetOrderInfo(state, action: PayloadAction<{ currency: string,orderCoin: string }>) {
      const { type, side, isShowTPSl, tpslUnit, reduceOnly } = state.orderInfo
      state.orderInfo = {
        ...initialState.orderInfo,
        type,
        side,
        isShowTPSl,
        tpslUnit,
        reduceOnly,
        currency: action.payload.currency,
        orderCoin: action.payload.orderCoin
      }
    }
 
  },
})

export const orderContractActions = orderContractSlice.actions

export const { setOrderInfo, initOrderInfo, resetOrderInfo } = orderContractSlice.actions

export default orderContractSlice.reducer
