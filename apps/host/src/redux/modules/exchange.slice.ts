import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ExchangeDialogConfig {
  defaultTab?: 'deposit' | 'withdraw' | 'transfer'
  defaultChainId?: number
}

interface PerpsDepositAddresses {
  depositAddress?: string
  depositSolAddress?: string
  depositBtcAddress?: string
  depositTvmAddress?: string
}

interface ExchangeState {
  exchangeDialogOpen: boolean
  exchangeDialogConfig: ExchangeDialogConfig
  perpsDepositAddresses: PerpsDepositAddresses

  perpsDepositLoading: boolean
}

const initialState: ExchangeState = {
  exchangeDialogOpen: false,
  exchangeDialogConfig: {},
  perpsDepositAddresses: {},
  perpsDepositLoading: false,
}

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    openExchangeDialog: (state, action: PayloadAction<ExchangeDialogConfig>) => {
      state.exchangeDialogOpen = true
      state.exchangeDialogConfig = action.payload
    },
    closeExchangeDialog: (state) => {
      state.exchangeDialogOpen = false
      state.exchangeDialogConfig = {}
    },
    setPerpsDepositLoading: (state, action: PayloadAction<boolean>) => {
      state.perpsDepositLoading = action.payload
    },

    setPerpsDepositAddresses: (state, action: PayloadAction<PerpsDepositAddresses>) => {
      state.perpsDepositAddresses = action.payload
      state.perpsDepositLoading = false
    },
  },
})

export const exchangeActions = exchangeSlice.actions
export default exchangeSlice
