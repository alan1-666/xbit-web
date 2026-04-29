import { ACCOUNT_TYPE } from '@/components/swap/lib/constants'
import { SwapFormState, Token } from '@/components/swap/lib/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: SwapFormState = {
  fromAccountType: ACCOUNT_TYPE.MEME,
  fromAmount: null,
  toAccountType: ACCOUNT_TYPE.MEME,
  toAmount: null,
  isLoading: false,
  fromToken: null,
  toToken: null,
  fromWalletAddress: '',
  toWalletAddress: '',
  fromAvailableBalance: '',
  fromDisplayedAvailableBalance: '',
  toAvailableBalance: '',
  toDisplayedAvailableBalance: '',
  swapTokens: [],
  transactionData: null,
  isQuoteing: false,
  errors: null,
}

const swapFormSlice = createSlice({
  name: 'swapForm',
  initialState,
  reducers: {
    updateSwapForm(_, action: PayloadAction<SwapFormState>) {
      return action.payload
    },
    updateSwapToken(state, action: PayloadAction<Token[]>) {
      state.swapTokens = action.payload
    },
  },
})
export const swapTokenSelector = (state: { swapForm: SwapFormState }) => state.swapForm?.swapTokens

export const { updateSwapForm, updateSwapToken } = swapFormSlice.actions

export default swapFormSlice.reducer
