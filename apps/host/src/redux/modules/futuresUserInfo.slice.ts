import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type OrderButtonStatus = 'connect' | 'toggle' | 'login' | 'deposit' | 'approve' | 'order' | 'transfer'

export interface BuilderInfo {
  b: string
  f: number
}

export interface AgentWalletInfo {
  key: string
  id: string
}

interface FeeInfo {
  makerFee: number
  takerFee: number
}

export interface FuturesUserInfoState {
  funding: {
    available: [number, number], 
    withdrawable: number
  }
  isAuthorized: boolean
  isDeposit: boolean
  orderButtonStatus: OrderButtonStatus
  builder: BuilderInfo
  agentWallet: AgentWalletInfo | null
  fee: FeeInfo
}

export const initialStateUserInfo: FuturesUserInfoState = {
  funding: {
    available: [0,0],
    withdrawable: 0
  },
  isAuthorized: false,
  isDeposit: false,
  orderButtonStatus: 'order',
  builder: {
    b: '',
    f: 0,
  },
  agentWallet: null,
  fee: {
    makerFee: 0,
    takerFee: 0
  }
}

export const futuresUserInfoSlice = createSlice({
  name: 'futuresUserInfo',
  initialState: initialStateUserInfo,
  reducers: {
    updateUserFunding: (
      state,
      action: PayloadAction<Partial<FuturesUserInfoState['funding']>>
    ) => {
      Object.assign(state.funding, action.payload)
    },

    updateAuthorizationStatus: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isAuthorized = action.payload
    },

    updateDepositStatus: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isDeposit = action.payload
    },

    updateOrderButtonStatus: (
      state,
      action: PayloadAction<OrderButtonStatus>
    ) => {
      state.orderButtonStatus = action.payload
    },

    updateBuilderInfo: (
      state,
      action: PayloadAction<Partial<BuilderInfo>>
    ) => {
      Object.assign(state.builder, action.payload)
    },

    updateAgentWallet: (
      state,
      action: PayloadAction<AgentWalletInfo | null>
    ) => {
      state.agentWallet = action.payload
    },

    updateUserFee: (
      state,
      action: PayloadAction<FeeInfo>
    ) => {
      state.fee.makerFee = action.payload.makerFee
      state.fee.takerFee = action.payload.takerFee
    },
  },
  extraReducers: (builder) => {},
})

export const {
  updateUserFunding,
  updateAuthorizationStatus,
  updateDepositStatus,
  updateOrderButtonStatus,
  updateBuilderInfo,
  updateAgentWallet,
} = futuresUserInfoSlice.actions

export const futuresUserInfoActions = {
  ...futuresUserInfoSlice.actions,
}

export const fundingSelector = (state: { futuresUserInfo: FuturesUserInfoState }) =>
  state.futuresUserInfo.funding

export const isAuthorizedSelector = (state: { futuresUserInfo: FuturesUserInfoState }) =>
  state.futuresUserInfo.isAuthorized

export const isDepositSelector = (state: { futuresUserInfo: FuturesUserInfoState }) =>
  state.futuresUserInfo.isDeposit

export const orderButtonStatusSelector = (state: { futuresUserInfo: FuturesUserInfoState }) =>
  state.futuresUserInfo.orderButtonStatus

export const builderSelector = (state: { futuresUserInfo: FuturesUserInfoState }) =>
  state.futuresUserInfo.builder

export const agentWalletSelector = (state: { futuresUserInfo: FuturesUserInfoState }) =>
  state.futuresUserInfo.agentWallet

export const userFeeSelector = (state: { futuresUserInfo: FuturesUserInfoState }) =>
  state.futuresUserInfo.fee

export default futuresUserInfoSlice
