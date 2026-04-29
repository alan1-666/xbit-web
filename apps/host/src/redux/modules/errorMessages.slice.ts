import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MultiLanguageMessage {
  en: string
  hi: string
  hk: string
  ja?: string
  vi: string
  zh: string
}

type ErrorMessageType = MultiLanguageMessage | Record<string, never>

export interface IErrorMessagesState {
  getErrorMessages:
    | {
        [errorCode: string]: ErrorMessageType
      }
    | undefined
}

export type ErrorCode = keyof NonNullable<IErrorMessagesState['getErrorMessages']>
export type LanguageCode = 'en' | 'hi' | 'hk' | 'ja' | 'vi' | 'zh'

type ErrorMessagesPayload = {
  [errorCode: string]: ErrorMessageType
}

const initialState: IErrorMessagesState = {
  getErrorMessages: undefined,
}

export const errorMessagesSlice = createSlice({
  name: 'errorMessages',
  initialState,
  reducers: {
    setErrorMessages: (state, action: PayloadAction<ErrorMessagesPayload>) => {
      state.getErrorMessages = action.payload
    },
    clearErrorMessages: (state) => {
      state.getErrorMessages = undefined
    },
  },
})

export const { setErrorMessages, clearErrorMessages } = errorMessagesSlice.actions
export default errorMessagesSlice.reducer
