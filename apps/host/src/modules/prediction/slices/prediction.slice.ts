import { createSelector, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { logout } from '@/redux/modules/newAuth.slice.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { EnableTradingInput, EnableTradingResponse } from '@/modules/prediction/types'

export interface PredictionState {
  favoriteEventIds: string[]
  currentProxyWallet: string
}

const initialState: PredictionState = {
  favoriteEventIds: [],
  currentProxyWallet: '',
}

export const fetchProxyWallet = createAsyncThunk<string, void>(
  'prediction/fetchProxyWallet',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      return await userService.getPolymarketProxyWallet()
    } catch (error) {
      // Auto-enable trading disabled — user must manually enable via EnableTradingButton
      // try {
      //   const result = await dispatch(enableTrading({})).unwrap()
      //   if (result?.proxyWalletAddress) {
      //     return result.proxyWalletAddress
      //   }
      // } catch (enableError) {
      //   const enableErrorMessage = enableError instanceof Error ? enableError.message : 'Failed to enable trading'
      //   return rejectWithValue(enableErrorMessage)
      // }

      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch proxy wallet'
      return rejectWithValue(errorMessage)
    }
  },
)

export const enableTrading = createAsyncThunk<EnableTradingResponse | undefined, EnableTradingInput>(
  'prediction/enableTrading',
  async (input: EnableTradingInput, { rejectWithValue }) => {
    try {
      return await userService.enablePolymarketTrading(input)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable trading'
      return rejectWithValue(errorMessage)
    }
  },
)

const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    addFavoriteEvent: (state, action) => {
      if (!state.favoriteEventIds.includes(action.payload)) {
        state.favoriteEventIds.push(action.payload)
      }
    },
    removeFavoriteEvent: (state, action) => {
      state.favoriteEventIds = state.favoriteEventIds.filter((id) => id !== action.payload)
    },
    clearFavoriteEvents: (state) => {
      state.favoriteEventIds = []
    },
    setCurrentProxyWallet: (state, action) => {
      state.currentProxyWallet = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProxyWallet.fulfilled, (state, action) => {
      state.currentProxyWallet = action.payload
    })
    builder.addCase(enableTrading.fulfilled, (state, action) => {
      if (action.payload?.proxyWalletAddress) {
        state.currentProxyWallet = action.payload.proxyWalletAddress
      }
    })

    // Handle logout
    builder.addCase(logout, (state) => {
      state.favoriteEventIds = []
      state.currentProxyWallet = ''
    })
  },
})

export const predictionActions = predictionSlice.actions
export const predictionReducer = predictionSlice.reducer

export const predictionSelectors = {
  selectFavoriteEventIds: createSelector(
    (state: { prediction: PredictionState }) => state.prediction.favoriteEventIds,
    (favoriteEventIds) => favoriteEventIds,
  ),
  selectCurrentProxyWallet: createSelector(
    (state: { prediction: PredictionState }) => state.prediction.currentProxyWallet,
    (currentProxyWallet) => currentProxyWallet,
  ),
}
