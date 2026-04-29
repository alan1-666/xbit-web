import { MevProtectionType, TransactionType } from '@/@generated/gql/graphql-trading'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { REHYDRATE, RehydrateAction } from 'redux-persist'

export interface TradeSetting {
  key: number
  [TransactionType.Buy]: {
    mevProtect: boolean
    slippage: string
    mevProtectionType?: MevProtectionType
    customRPC?: string
    //Priority Fee
    fee: {
      type: string
      value: string | undefined
    }
    briberyFee?: {
      type: string
      value: string | undefined
    }
    newSlippage?: {
      type: string
      value: string | undefined
    }
  }
  [TransactionType.Sell]: {
    mevProtect: boolean
    slippage: string
    mevProtectionType?: MevProtectionType
    customRPC?: string
    //Priority Fee
    fee: {
      type: string
      value: string | undefined
    }
    briberyFee?: {
      type: string
      value: string | undefined
    }
    newSlippage?: {
      type: string
      value: string | undefined
    }
  }
}

export type ChainType = 'eth' | 'sol' | 'arb' | 'bsc' | 'mon'

export interface TradeSettingsState {
  settings: {
    [key in ChainType]: TradeSetting[]
  }
  selectedPreset: {
    [key in ChainType]: {
      [type in TransactionType]: number
    }
  }
}

export const SlippageOptions = ['20']
export const initialTradeSettings: TradeSettingsState['settings'] = {
  eth: [
    {
      key: 1,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        slippage: '20',
        mevProtect: true,
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
    {
      key: 2,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
    {
      key: 3,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
  ],
  sol: [
    {
      key: 1,
      [TransactionType.Buy]: {
        mevProtect: true,
        mevProtectionType: MevProtectionType.Normal,
        customRPC: '',
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        briberyFee: {
          type: 'auto',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        mevProtectionType: MevProtectionType.Normal,
        customRPC: undefined,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        briberyFee: {
          type: 'auto',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
    {
      key: 2,
      [TransactionType.Buy]: {
        mevProtect: true,
        mevProtectionType: MevProtectionType.Normal,
        customRPC: '',
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        briberyFee: {
          type: 'auto',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        mevProtectionType: MevProtectionType.Normal,
        customRPC: '',
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        briberyFee: {
          type: 'auto',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
    {
      key: 3,
      [TransactionType.Buy]: {
        mevProtect: true,
        mevProtectionType: MevProtectionType.Normal,
        customRPC: '',
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        briberyFee: {
          type: 'auto',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        mevProtectionType: MevProtectionType.Normal,
        customRPC: '',
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        briberyFee: {
          type: 'auto',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
  ],
  arb: [
    {
      key: 1,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
    {
      key: 2,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
    {
      key: 3,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
  ],
  bsc: [
    {
      key: 1,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
    {
      key: 2,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
    {
      key: 3,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'high',
          value: '',
        },
        newSlippage: {
          type: 'auto',
          value: '',
        },
      },
    },
  ],
  mon: [
    {
      key: 1,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'low',
          value: undefined,
        },
      },
      [TransactionType.Sell]: {
        slippage: '20',
        mevProtect: true,
        fee: {
          type: 'low',
          value: undefined,
        },
      },
    },
    {
      key: 2,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'low',
          value: undefined,
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'low',
          value: undefined,
        },
      },
    },
    {
      key: 3,
      [TransactionType.Buy]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'low',
          value: undefined,
        },
      },
      [TransactionType.Sell]: {
        mevProtect: true,
        slippage: '20',
        fee: {
          type: 'low',
          value: undefined,
        },
      },
    },
  ],
}

const initialState: TradeSettingsState = {
  settings: initialTradeSettings,
  selectedPreset: {
    eth: {
      [TransactionType.Buy]: 1,
      [TransactionType.Sell]: 1,
    },
    sol: {
      [TransactionType.Buy]: 1,
      [TransactionType.Sell]: 1,
    },
    arb: {
      [TransactionType.Buy]: 1,
      [TransactionType.Sell]: 1,
    },
    bsc: {
      [TransactionType.Buy]: 1,
      [TransactionType.Sell]: 1,
    },
    mon: {
      [TransactionType.Buy]: 1,
      [TransactionType.Sell]: 1,
    },
  },
}

export const tradeSettingsSlice = createSlice({
  name: 'tradeSettings_v2',
  initialState,
  reducers: {
    updateTradeSettings: (state, action: PayloadAction<{ chain: ChainType; settings: TradeSetting[] }>) => {
      const { chain, settings } = action.payload
      state.settings[chain] = settings
    },
    resetTradeSettings: (state, action: PayloadAction<ChainType>) => {
      const chain = action.payload
      state.settings[chain] = initialTradeSettings[chain]
      state.selectedPreset[chain] = {
        Buy: 1,
        Sell: 1,
      }
    },
    setSelectedPreset: (
      state,
      action: PayloadAction<{ chain: ChainType; presetKey: number; transactionType: TransactionType }>,
    ) => {
      const { chain, presetKey, transactionType } = action.payload
      if (!state.selectedPreset[chain]) {
        state.selectedPreset[chain] = {
          Buy: 1,
          Sell: 1,
        }
      }
      state.selectedPreset[chain][transactionType] = presetKey
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      localStorage.removeItem('persist:tradeSettings')
    })
  },
})

export const { updateTradeSettings, resetTradeSettings, setSelectedPreset } = tradeSettingsSlice.actions
export default tradeSettingsSlice.reducer
