import { createSlice } from '@reduxjs/toolkit'

export interface TokenAvatarsState {
  [tokenAddress: string]: {
    avatarUrl: string
    thumbnailUrl: string
  }
}

export const INITIAL_TOKEN_AVATARS_STATE: TokenAvatarsState = {}

export interface AddTokenAvatarPayload {
  tokenAddress: string
  avatarUrl: string
  thumbnailUrl: string
}

export const tokenAvatarsSlice = createSlice({
  name: 'tokenAvatars',
  initialState: INITIAL_TOKEN_AVATARS_STATE,
  reducers: {
    setTokenAvatar: (state, action: { payload: AddTokenAvatarPayload }) => {
      const { tokenAddress, avatarUrl, thumbnailUrl } = action.payload
      const newAvatarUrl = avatarUrl || state[tokenAddress]?.avatarUrl
      const newThumbnailUrl = thumbnailUrl || state[tokenAddress]?.thumbnailUrl
      state[tokenAddress] = { avatarUrl: newAvatarUrl, thumbnailUrl: newThumbnailUrl }
    },
  },
})

export const tokenAvatarsActions = tokenAvatarsSlice.actions

// Selector
export const selectTokenAvatarByAddress = (tokenAddress: string) => (state: { tokenAvatars: TokenAvatarsState }) => {
  return state.tokenAvatars[tokenAddress]
}
