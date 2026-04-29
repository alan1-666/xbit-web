import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { userGqlClient } from '@/lib/gql/apollo-client.ts'
import { userSettings } from '@services/userSettings.service.ts'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { CurrencyUnit } from '@/types/currency.ts'
import { setActiveChain } from './newWallet.slice'
import ls from '@/lib/local-storage'
import { TYPE_CHAIN } from '@/lib/blockchain'

export type NotificationPreference = {
  id: string
  userId: string
  notificationTypeCode: string
  channel: string
  isEnabled: boolean
}

export type WithdrawalWhitelistAddress = {
  id: string
  userId: string
  address: string
  nickname?: string | undefined | null
}

export interface GoogleAuthenticator {
  userId: string
  isEnabled: boolean
}

export interface UserSettingsState {
  userId: string
  notificationPreferences: NotificationPreference[]
  withdrawalWhitelistAddresses: WithdrawalWhitelistAddress[]
  googleAuthenticator: GoogleAuthenticator
  dataUnit: CurrencyUnit
  previousActiveChain: string | null
}

const initialState: UserSettingsState = {
  userId: '',
  notificationPreferences: [],
  withdrawalWhitelistAddresses: [],
  googleAuthenticator: {
    userId: '',
    isEnabled: false,
  },
  dataUnit: 'USD',
  previousActiveChain: ls.get('meme_chain') ?? TYPE_CHAIN.SOLANA,
}

export const fetchUserSettings = createAsyncThunk('userSettings/fetchUserSettings', async () => {
  const { data } = await userGqlClient.query({
    query: userSettings,
    context: {
      headers: {
        Authorization: `Bearer ${ServiceConfig.token || ''}`,
      },
    },
  })
  return data.userSettings
})

export const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchUserSettings.fulfilled, (state, action) => {
      const settings = action.payload
      state.userId = settings.id
      state.notificationPreferences = settings.notificationPreferences || []
      state.withdrawalWhitelistAddresses = settings.withdrawalWhitelistAddresses || []
      state.googleAuthenticator = settings.googleAuthenticator || { userId: '', isEnabled: false }
    })
    builder.addCase(setActiveChain, (state, action) => {
      const newChain = action.payload
      // Only reset dataUnit if the chain actually changed
      if (state.previousActiveChain !== newChain) {
        state.dataUnit = 'USD'
      }
      // Update the previous chain tracker
      state.previousActiveChain = newChain
    })
  },
  reducers: {
    updateUserSettings: (state, action: PayloadAction<Partial<UserSettingsState>>) => {
      return {
        ...state,
        ...action.payload,
      }
    },
    setDataUnit: (state, action: PayloadAction<CurrencyUnit>) => {
      state.dataUnit = action.payload
    },
  },
})

export const userSettingsActions = userSettingsSlice.actions

export const { updateUserSettings, setDataUnit } = userSettingsSlice.actions
export default userSettingsSlice.reducer
