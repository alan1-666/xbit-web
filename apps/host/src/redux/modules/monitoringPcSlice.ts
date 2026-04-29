import {SmartMoneyFilterType, TimeframeOption} from "@/types/monitoring.ts";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {SmartMoneySortType, TransactionType} from "@/@generated/gql/graphql-future.ts";

export type MonitoringPCState = {
  realtimeTx: {
    filter: SmartMoneyFilterType
  },
  wallets: {
    sort: SmartMoneySortType
  }
}

const initialState: MonitoringPCState = {
  realtimeTx: {
    filter: {
      transactionType: undefined,
      minAmountUsd: undefined,
      maxAmountUsd: undefined,
      address: undefined,
      timeframe: '6h'
    }
  },
  wallets: {
    sort: SmartMoneySortType.FollowTime
  }
}

export const monitoringPcSlice = createSlice({
  name: 'MonitoringPcSlice',
  initialState,
  reducers: {
    setRealtimeTxFilter: (state, action: PayloadAction<SmartMoneyFilterType>) => {
      state.realtimeTx.filter = action.payload;
    },
    setRealtimeTxFilterTxType: (state, action: PayloadAction<TransactionType | undefined>) => {
      state.realtimeTx.filter.transactionType = action.payload;
    },
    setRealtimeTxFilterMinAmount: (state, action: PayloadAction<number|undefined>) => {
      state.realtimeTx.filter.minAmountUsd = action.payload;
    },
    setRealtimeTxFilterMaxAmount: (state, action: PayloadAction<number|undefined>) => {
      state.realtimeTx.filter.maxAmountUsd = action.payload;
    },
    setRealtimeTxFilterAddress: (state, action: PayloadAction<string[] | undefined>) => {
      state.realtimeTx.filter.address = action.payload;
    },
    setRealtimeTxFilterTimeframe: (state, action: PayloadAction<TimeframeOption | undefined>) => {
      state.realtimeTx.filter.timeframe = action.payload;
    },
    resetFilter: (state: MonitoringPCState) => {
      state.realtimeTx.filter = initialState.realtimeTx.filter;
    },
    setWalletSort: (state: MonitoringPCState, action: PayloadAction<SmartMoneySortType>) => {
      state.wallets.sort = action.payload;
    },
    reset: () => initialState
  }
})

export const {
  setRealtimeTxFilter,
  setRealtimeTxFilterTxType,
  setRealtimeTxFilterMinAmount,
  setRealtimeTxFilterMaxAmount,
  setRealtimeTxFilterAddress,
  setRealtimeTxFilterTimeframe,
  setWalletSort,
  resetFilter,
  reset,
} = monitoringPcSlice.actions;

export default monitoringPcSlice.reducer;