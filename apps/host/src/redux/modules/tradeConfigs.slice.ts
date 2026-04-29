import { createSelector, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'
import { REHYDRATE, RehydrateAction } from 'redux-persist'

export interface TradeConfigState {
  tradeConfigs: {
    eth: {
      quickAmount: number[]
      configs: {
        slippage: string
        mevProtect: boolean
        priorityFeePrice: {
          type: string //type:  medium, high, veryHigh, custom
          value: string
        }
      }
      validate: {
        minFee: number
        maxFee: number
      }
    }
    sol: {
      quickAmount: number[]
      configs: {
        slippage: string
        mevProtect: boolean
        priorityFeePrice: {
          type: string //type:  medium, high, veryHigh, custom
          value: string
        }
      }
      validate: {
        minFee: number
        maxFee: number
      }
    }
    bsc: {
      quickAmount: number[]
      configs: {
        slippage: string
        mevProtect: boolean
        priorityFeePrice: {
          type: string //type:  medium, high, veryHigh, custom
          value: string
        }
      }
      validate: {
        minFee: number
        maxFee: number
      }
    }
    mon: {
      quickAmount: number[]
      configs: {
        slippage: string
        mevProtect: boolean
        priorityFeePrice: {
          type: string //type:  medium, high, veryHigh, custom
          value: string
        }
      }
      validate: {
        minFee: number
        maxFee: number
      }
    }
    quickSellPercent: number[]
  }
}

export const initialStateTradeConfig: TradeConfigState = {
  tradeConfigs: {
    eth: {
      quickAmount: [0.1, 0.5, 1.0, 2.0, 5.0],
      configs: {
        slippage: '20',
        mevProtect: true,
        priorityFeePrice: {
          type: 'high',
          value: '',
        },
      },
      validate: {
        minFee: 1,
        maxFee: 4000,
      },
    },
    sol: {
      quickAmount: [0.01, 0.1, 1.0, 10.0, 20.0],
      configs: {
        slippage: '20',
        mevProtect: true,
        priorityFeePrice: {
          type: 'high',
          value: '',
        },
      },
      validate: {
        minFee: 0.00014,
        maxFee: 2,
      },
    },
    bsc: {
      quickAmount: [0.1, 0.5, 1.0, 2.0, 5.0],
      configs: {
        slippage: '20',
        mevProtect: true,
        priorityFeePrice: {
          type: 'high',
          value: '',
        },
      },
      validate: {
        minFee: 0.00014,
        maxFee: 2,
      },
    },
    mon: {
      quickAmount: [0.1, 0.5, 1.0, 2.0, 5.0],
      configs: {
        slippage: '20',
        mevProtect: true,
        priorityFeePrice: {
          type: 'high',
          value: '',
        },
      },
      validate: {
        minFee: 0.00014,
        maxFee: 2,
      },
    },
    quickSellPercent: [10, 25, 50, 75, 100],
  },
}

export const tradeConfigsSlice = createSlice({
  name: 'tradeConfigSetting',
  initialState: initialStateTradeConfig,
  reducers: {
    updateTradeConfig: (state, action) => {
      const chain = action.payload.chain
      state.tradeConfigs = {
        ...state.tradeConfigs,
        [chain]: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...state.tradeConfigs?.[chain],
          configs: {
            ...action.payload.config,
          },
        },
      }
    },
    updateValidateFee: (state, action) => {
      const chain = action.payload.chain
      state.tradeConfigs = {
        ...state.tradeConfigs,
        [chain]: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...state.tradeConfigs?.[chain],
          validate: {
            ...action.payload.validate,
          },
        },
      }
    },
    updateQuickAmount: (state, action) => {
      const chain = action.payload.chain
      state.tradeConfigs = {
        ...state.tradeConfigs,
        [chain]: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...state.tradeConfigs?.[chain],
          quickAmount: action.payload.quickAmount,
        },
      }
    },
    updateQuickSellPercent: (state, action) => {
      state.tradeConfigs = {
        ...state.tradeConfigs,
        quickSellPercent: action.payload.quickSellPercent,
      }
    },
  },
  extraReducers: (builder) => {
    // Handle rehydration with migration
    builder.addCase(REHYDRATE, (_, __: RehydrateAction) => {
      localStorage.removeItem('persist:tradeConfig')
      localStorage.removeItem('persist:tradeConfigs')
    })
  },
})

export const tradeConfigChainSelected = (chain: string) =>
  createSelector([(state: RootState) => state.tradeConfigs.tradeConfigs], (tradeConfigs) => {
    return tradeConfigs?.[chain] ? { ...tradeConfigs?.[chain] } : null
  })
export const { updateTradeConfig, updateValidateFee, updateQuickAmount } = tradeConfigsSlice.actions
export const tradeConfigActions = { ...tradeConfigsSlice.actions }

export default tradeConfigsSlice
