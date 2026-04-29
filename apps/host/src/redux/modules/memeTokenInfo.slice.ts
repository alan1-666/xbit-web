import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MemeTokenInfoRaw } from '@/types/tokenInfo.ts'

export interface MemeTokenInfoState {
  [key: string]: MemeTokenInfoRaw
}

const initialState: MemeTokenInfoState = {}

export const memeTokenInfoSlice = createSlice({
  name: 'memeTokenInfo',
  initialState,
  reducers: {
    addInfo: (state, action: PayloadAction<MemeTokenInfoRaw[]>) => {
      const infos = action.payload
      infos.forEach((info) => {
        const key = `${info.chainId}-${info.tokenAddress?.toLowerCase()}`
        state[key] = {
          ...state[key],
          ...info,
        }
      })
    },
    clearInfo: (state, action: PayloadAction<string[]>) => {
      const keys = action.payload
      keys.forEach((key) => {
        delete state[key]
      })
    },
    clearAll: (state) => {
      Object.keys(state).forEach((key) => {
        delete state[key]
      })
    },
  },
})

export const memeTokenInfoSelectors = {
  selectMemeTokenInfo: (chainId: number, tokenAddress: string) => {
    const key = `${chainId}-${tokenAddress.toLowerCase()}`
    return (state: { memeTokenInfo: MemeTokenInfoState }) => state.memeTokenInfo[key]
  },
  selectTokens: (chainId: number, addresses: string[]) => {
    const lowercasedAddresses = addresses.map((addr) => addr.toLowerCase())
    return (state: { memeTokenInfo: MemeTokenInfoState }) => {
      const result: { [key: string]: MemeTokenInfoRaw | undefined } = {}
      lowercasedAddresses.forEach((address) => {
        const key = `${chainId}-${address}`
        result[address] = state.memeTokenInfo[key]
      })
      return result
    }
  },
}

export const selectFromMemeToken = <T extends keyof MemeTokenInfoRaw>(
  chainId: number,
  tokenAddress: string,
  prop: T,
) => {
  const key = `${chainId}-${tokenAddress.toLowerCase()}`
  return (state: { memeTokenInfo: MemeTokenInfoState }) => state.memeTokenInfo[key]?.[prop]
}

export const memeTokenInfoActions = memeTokenInfoSlice.actions
