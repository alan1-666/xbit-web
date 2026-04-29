import { RootState } from '@/redux/store'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import { createThunk } from './common'
import { userGqlClient } from '@/lib/gql/apollo-client'
import {
  createWalletSubOrgWalletMutation,
  getAccessTokenMutation,
  getNonceQuery,
  getUserInfoQuery,
  loginByTGMutation,
  loginByTGv2Mutation,
  loginByWalletMutation,
  loginByWalletV2Mutation,
} from '@/services/auth.service'
import { TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'
import { ServiceConfig } from '@/lib/gql/service-config'
import { ChainType, InputLoginWalletV2Dto } from '@/@generated/gql/graphql-user'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { REHYDRATE, RehydrateAction } from 'redux-persist'

export interface AuthState {
  token: {
    telegram: {
      access_token: string
      refresh_token: string
      user_id: string
    }
    eth: {
      access_token: string
      refresh_token: string
      user_id: string
    }
    sol: {
      access_token: string
      refresh_token: string
      user_id: string
    }
    arb: {
      access_token: string
      refresh_token: string
      user_id: string
    }
  }
}

const initialState: AuthState = {
  token: {
    telegram: {
      access_token: '',
      refresh_token: '',
      user_id: '',
    },
    eth: {
      access_token: '',
      refresh_token: '',
      user_id: '',
    },
    sol: {
      access_token: '',
      refresh_token: '',
      user_id: '',
    },
    arb: {
      access_token: '',
      refresh_token: '',
      user_id: '',
    },
  },
}

export const loginByTG = createThunk('login/loginByTG', async ({ userId, code }: { userId: string; code: string }) => {
  const refCode = localStorage.getItem('REFERRER_CODE')
  const fpPromise = FingerprintJS.load()
  const fp = await fpPromise
  const result = await fp.get()
  const visitorId = result.visitorId
  const variables: {
    userId: string
    code: string
    referrerCode?: string
    fingerprint?: string
  } = {
    userId: userId,
    code: code,
    fingerprint: visitorId,
  }
  if (refCode) {
    variables.referrerCode = refCode
  }
  const resp = await userGqlClient?.mutate<any>({
    mutation: loginByTGMutation,
    variables: variables,
  })
  return resp?.data
})

export const loginByTGv2 = createThunk('login/loginByTGv2', async ({ input }: { input: InputLoginTelegramV2Dto }) => {
  // const refCode = localStorage.getItem('REFERRER_CODE')
  // const fpPromise = FingerprintJS.load()
  // const fp = await fpPromise
  // const result = await fp.get()
  // const visitorId = result.visitorId
  // const variables: {
  //   userId: string
  //   code: string
  //   referrerCode?: string
  //   fingerprint?: string
  // } = {
  //   userId: userId,
  //   code: code,
  // }
  // if (refCode) {
  //   variables.referrerCode = refCode
  //   variables.fingerprint = visitorId
  // }
  const resp = await userGqlClient?.mutate<any>({
    mutation: loginByTGv2Mutation,
    variables: { input: input },
  })
  return resp?.data
})

export const loginByWallet = createThunk(
  'login/loginByWallet',
  async ({ message, signature, chainType }: { message: string; signature: string; chainType: ChainType }) => {
    const refCode = localStorage.getItem('REFERRER_CODE')
    const fpPromise = FingerprintJS.load()
    const fp = await fpPromise
    const result = await fp.get()
    const visitorId = result.visitorId
    const variables: {
      message: string
      signature: string
      chainType: ChainType
      referrerCode?: string
      fingerprint?: string
    } = {
      message: message,
      signature: signature,
      chainType: chainType,
      fingerprint: visitorId,
    }
    if (refCode) {
      variables.referrerCode = refCode
    }
    const resp = await userGqlClient?.mutate<any>({
      mutation: loginByWalletMutation,
      variables: variables,
    })
    return resp?.data
  },
)

export const createWalletSubOrgWallet = createThunk(
  'login/createWalletSubOrgWallet',
  async ({ message, signature, chainType }: { message: string; signature: string; chainType: ChainType }) => {
    const refCode = localStorage.getItem('REFERRER_CODE')
    const fpPromise = FingerprintJS.load()
    const fp = await fpPromise
    const result = await fp.get()
    const visitorId = result.visitorId
    const variables: {
      message: string
      signature: string
      chainType: ChainType
      referrerCode?: string
      fingerprint?: string
    } = {
      message: message,
      signature: signature,
      chainType: chainType,
      fingerprint: visitorId,
    }
    if (refCode) {
      variables.referrerCode = refCode
    }
    const resp = await userGqlClient?.mutate<any>({
      mutation: createWalletSubOrgWalletMutation,
      variables: {
        input: variables,
      },
    })
    return resp?.data
  },
)

export const loginByWalletV2 = createThunk(
  'login/loginByWalletV2',
  async (input : InputLoginWalletV2Dto) => {
    // const refCode = localStorage.getItem('REFERRER_CODE')
    // const fpPromise = FingerprintJS.load()
    // const fp = await fpPromise
    // const result = await fp.get()
    // const visitorId = result.visitorId
    // const variables: {
    //   message: string
    //   signature: string
    //   chainType: ChainType
    //   referrerCode?: string
    //   fingerprint?: string
    // } = {
    //   message: message,
    //   signature: signature,
    //   chainType: chainType,
    //   fingerprint: visitorId,
    // }
    // if (refCode) {
    //   variables.referrerCode = refCode
    // }
    const resp = await userGqlClient?.mutate<any>({
      mutation: loginByWalletV2Mutation,
      variables: {
        input: input,
      },
    })
    return resp?.data
  },
)

export const getUserInfo = createThunk('login/getUserInfo', async () => {
  const resp = await userGqlClient?.query<any>({
    query: getUserInfoQuery,
    variables: {},
  })
  return resp?.data
})

export const getNonce = createThunk('login/getNonce', async ({ address }: { address: string | undefined }) => {
  const resp = await userGqlClient?.query<any>({
    query: getNonceQuery,
    variables: {
      wallAddress: address,
    },
  })
  return resp?.data
})

export const getRefreshToken = createThunk(
  'login/getRefreshToken',
  async ({ refreshToken }: { refreshToken: string }) => {
    const resp = await userGqlClient?.mutate<any>({
      mutation: getAccessTokenMutation,
      variables: {
        refreshToken: refreshToken,
      },
    })
    return resp?.data
  },
)

const authChannel = new BroadcastChannel('auth_sync_channel')

// Action types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGOUT = 'LOGOUT'

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state, action) => {
      const activeChain = action?.payload?.activeChain
      const activeAccount = action?.payload?.activeAccount

      if (activeAccount === TYPE_ACCOUNT.TELEGRAM) {
        state.token = {
          ...state.token,
          telegram: {
            access_token: '',
            refresh_token: '',
            user_id: '',
          },
        }
      } else {
        if (activeChain === TYPE_CHAIN.SOLANA) {
          state.token = {
            ...state.token,
            sol: {
              access_token: '',
              refresh_token: '',
              user_id: '',
            },
          }
        }
        if (activeChain === TYPE_CHAIN.ETH || activeChain === TYPE_CHAIN.ARB) {
          state.token = {
            ...state.token,
            eth: {
              access_token: '',
              refresh_token: '',
              user_id: '',
            },
            arb: {
              access_token: '',
              refresh_token: '',
              user_id: '',
            },
          }
        }
      }
    },

    updateAccessToken: (state, action) => {
      const activeChain = action?.payload?.activeChain
      const activeAccount = action?.payload?.activeAccount
      const accessToken = action?.payload?.accessToken
      console.log('activeChain', activeChain)
      if (activeAccount === TYPE_ACCOUNT.TELEGRAM) {
        state.token = {
          ...state.token,
          telegram: {
            ...state.token.telegram,
            access_token: accessToken,
          },
        }
      } else {
        state.token = {
          ...state.token,
          [activeChain]: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...state.token?.[activeChain],
            access_token: accessToken,
          },
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginByTG.fulfilled, (state, action) => {
        state.token = {
          ...state.token,
          telegram: {
            access_token: action.payload.loginByTelegram.accessToken,
            refresh_token: action.payload.loginByTelegram.refreshToken,
            user_id: action.payload.loginByTelegram.userId,
          },
        }
        ServiceConfig.token = action.payload.loginByTelegram.accessToken

        authChannel.postMessage({
          type: LOGIN_SUCCESS,
          timestamp: Date.now(),
        })
      })
      .addCase(loginByWallet.fulfilled, (state, action) => {
        const chain = action?.meta?.arg?.chainType
        const accessToken = action.payload.loginByWallet.accessToken
        const refreshToken = action.payload.loginByWallet.refreshToken
        const userId = action.payload.loginByWallet.userId
        if (chain === ChainType.Solana) {
          state.token = {
            ...state.token,
            sol: {
              access_token: accessToken,
              refresh_token: refreshToken,
              user_id: userId,
            },
          }
        }
        if (chain === ChainType.Evm || chain === ChainType.Arb) {
          state.token = {
            ...state.token,
            eth: {
              access_token: accessToken,
              refresh_token: refreshToken,
              user_id: userId,
            },
            arb: {
              access_token: accessToken,
              refresh_token: refreshToken,
              user_id: userId,
            },
          }
        }
        ServiceConfig.token = action.payload.loginByWallet.accessToken

        authChannel.postMessage({
          type: LOGIN_SUCCESS,
          timestamp: Date.now(),
        })
      })
      .addCase(loginByTGv2.fulfilled, (state, action) => {
        console.log('[Login telegram v2: ]', action.payload)
        // const accessToken = action.payload.loginTelegramV2.accessToken
        // const refreshToken = action.payload.loginTelegramV2.refreshToken
        // const userId = action.payload.loginTelegramV2.userId
        // state.token = {
        //   ...state.token,
        //   telegram: {
        //     access_token: accessToken,
        //     refresh_token: refreshToken,
        //     user_id: userId,
        //   },
        // }
        // ServiceConfig.token = action.payload.loginTelegramV2.accessToken
      })
  },
})

export const selectToken = (state: RootState) => state.auth.token
const activeChain = (state: RootState) => state.newWallet.activeChain
const activeAccount = (state: RootState) => state.newWallet.activeAccount

export const _changeTokenAccount = createSelector(
  [selectToken, activeChain, activeAccount],
  (token, activeChain, activeAccount) => {
    if (activeAccount === TYPE_ACCOUNT.TELEGRAM) return token?.telegram?.access_token ?? ''
    return token?.[activeChain]?.access_token ?? ''
  },
)

export const _getRefreshTokenActiveAccount = createSelector(
  [selectToken, activeChain, activeAccount],
  (token, activeChain, activeAccount) => {
    if (activeAccount === TYPE_ACCOUNT.TELEGRAM) return token?.telegram?.refresh_token ?? ''
    return token?.[activeChain]?.refresh_token ?? ''
  },
)

export const { logout } = authSlice.actions
export const authActions = {
  ...authSlice.actions,
  loginByTG,
  loginByTGv2,
  loginByWallet,
  getNonce,
  getRefreshToken,
  loginByWalletV2,
  createWalletSubOrgWallet,
}
export default authSlice
