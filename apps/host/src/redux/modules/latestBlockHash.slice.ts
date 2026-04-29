import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'
import { BlockHashData } from '@const/latestBlockHash.ts'

export interface LatestBlockHashState {
  latestBlockHash?: BlockHashData
}

const initialLatestBlockHashState: LatestBlockHashState = {}

export const latestBlockHashSlice = createSlice({
  name: 'latestBlockHash',
  initialState: initialLatestBlockHashState,
  reducers: {
    updateLatestBlockHash: (state, action: PayloadAction<BlockHashData>) => {
      if (!action.payload) return

      state.latestBlockHash = action.payload
    },
  },
})

export const selectLatestBlockHash = (state: RootState) => state.blockHash.latestBlockHash

export const {
  updateLatestBlockHash,
} = latestBlockHashSlice.actions

export default latestBlockHashSlice
