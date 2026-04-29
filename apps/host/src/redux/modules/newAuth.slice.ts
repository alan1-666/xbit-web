import { RootState } from '@/redux/store'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import { createThunk } from './common'
import { userGqlClient } from '@/lib/gql/apollo-client'
import {
  createWalletSubOrgWalletMutation,
  createGoogleSubOrgWalletMutation,
  getAccessTokenMutation,
  getNonceQuery,
  getUserInfoQuery,
  loginByTGMutation,
  loginByWalletMutation,
  loginByWalletV2Mutation,
  loginWithGoogleMutation,
  loginWithEmailOtpMutation,
  initEmailOtpMutate,
  requestReverifyOtpMutation,
  migrateTurnkeyAccountMutation,
  loginWithAppleMutation,
  checkRegisteredWalletMutaion,
} from '@/services/auth.service'
import {
  AuthChainType,
  ChainType,
  GetGoogleSubOrgInputDto,
  InputLoginWalletV2Dto,
  LoginWithEmailOtpInputDto,
} from '@/@generated/gql/graphql-user'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { ServiceConfig } from '@/lib/gql/service-config'

export interface AuthState {
  token: {
    email: {
      access_token: string
      refresh_token: string
      userId: string
      subOrgId: string
    }
    google: {
      access_token: string
      refresh_token: string
      userId: string
      subOrgId: string
    }
    wallet: {
      access_token: string
      refresh_token: string
      userId: string
      subOrgId: string
    }
  }
}

const initialState: AuthState = {
  token: {
    email: {
      access_token: '',
      refresh_token: '',
      userId: '',
      subOrgId: '',
    },
    google: {
      access_token: '',
      refresh_token: '',
      userId: '',
      subOrgId: '',
    },
    wallet: {
      access_token: '',
      refresh_token: '',
      userId: '',
      subOrgId: '',
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
  // const resp = await userGqlClient?.mutate<any>({
  //   mutation: loginByTGv2Mutation,
  //   variables: { input: input },
  // })
  // return resp?.data
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

export const initEmailOtp = createThunk('login/initEmailOtp', async ({ email }: { email: string }) => {
  const refCode = localStorage.getItem('REFERRER_CODE')
  const fpPromise = FingerprintJS.load()
  const fp = await fpPromise
  const result = await fp.get()
  const visitorId = result.visitorId
  const variables: {
    email: string
    fingerprint?: string
    referrerCode?: string
  } = {
    email: email,
    fingerprint: visitorId,
    // fingerprint: visitorId,
  }
  if (refCode) {
    variables.referrerCode = refCode
  }
  const resp = await userGqlClient?.mutate<any>({
    mutation: initEmailOtpMutate,
    variables: {
      input: variables,
    },
  })
  return resp?.data
})

export const createGoogleSubOrgWallet = createThunk(
  'login/createGoogleSubOrgWallet',
  async ({ idToken }: { idToken: string }) => {
    const refCode = localStorage.getItem('REFERRER_CODE')
    const fpPromise = FingerprintJS.load()
    const fp = await fpPromise
    const result = await fp.get()
    const visitorId = result.visitorId
    const variables: {
      idToken: string
      fingerprint?: string
      referrerCode?: string
    } = {
      idToken: idToken,
      fingerprint: visitorId,
      // fingerprint: visitorId,
    }
    if (refCode) {
      variables.referrerCode = refCode
    }
    const resp = await userGqlClient?.mutate<any>({
      mutation: createGoogleSubOrgWalletMutation,
      variables: {
        input: variables,
      },
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

export const loginByWalletV2 = createThunk('login/loginByWalletV2', async (input: InputLoginWalletV2Dto) => {
  const resp = await userGqlClient?.mutate<any>({
    mutation: loginByWalletV2Mutation,
    variables: {
      input: input,
    },
  })
  return resp?.data
})

export const migrateTurnkeyAccount = createThunk('login/migrateTurnkeyAccount', async () => {
  const resp = await userGqlClient?.mutate<any>({
    mutation: migrateTurnkeyAccountMutation,
    variables: {},
  })

  return resp?.data
})

// export const loginWithGoogle = createThunk('login/loginWithGoogle', async (input: InputLoginGoogleDto) => {
//   const resp = await userGqlClient?.mutate<any>({
//     mutation: loginWithGoogleMutation,
//     variables: {
//       input: input,
//     },
//   })
//   return resp?.data
// })

export const loginWithGoogle = createThunk('login/loginWithGoogle', async (input: GetGoogleSubOrgInputDto) => {
  const refCode = localStorage.getItem('REFERRER_CODE')
  const fpPromise = FingerprintJS.load()
  const fp = await fpPromise
  const result = await fp.get()
  const visitorId = result.visitorId
  const variables: {
    idToken: string
    targetPublicKey: string
    referrerCode?: string
    fingerprint?: string
  } = {
    idToken: input.idToken,
    targetPublicKey: input.targetPublicKey,
    fingerprint: visitorId,
  }
  if (refCode) {
    variables.referrerCode = refCode
  }

  const resp = await userGqlClient?.mutate<any>({
    mutation: loginWithGoogleMutation,
    variables: {
      input: input,
    },
  })
  return resp?.data
})

export const loginWithApple = createThunk('login/loginWithApple', async (input: GetGoogleSubOrgInputDto) => {
  const refCode = localStorage.getItem('REFERRER_CODE')
  const fpPromise = FingerprintJS.load()
  const fp = await fpPromise
  const result = await fp.get()
  const visitorId = result.visitorId
  const variables: {
    idToken: string
    targetPublicKey: string
    referrerCode?: string
    fingerprint?: string
  } = {
    idToken: input.idToken,
    targetPublicKey: input.targetPublicKey,
    fingerprint: visitorId,
  }
  if (refCode) {
    variables.referrerCode = refCode
  }

  const resp = await userGqlClient?.mutate<any>({
    mutation: loginWithAppleMutation,
    variables: {
      input: input,
    },
  })
  return resp?.data
})

export const loginWithEmailOtp = createThunk('login/loginWithEmailOtp', async (input: LoginWithEmailOtpInputDto) => {
  const resp = await userGqlClient?.mutate<any>({
    mutation: loginWithEmailOtpMutation,
    variables: {
      input: input,
    },
  })
  return resp?.data
})

export const requestReverifyOtp = createThunk('login/requestReverifyOtp', async () => {
  const fpPromise = FingerprintJS.load()
  const fp = await fpPromise
  const result = await fp.get()
  const visitorId = result.visitorId
  const variables: {
    fingerprint?: string
  } = {
    fingerprint: visitorId,
  }

  const resp = await userGqlClient?.mutate<any>({
    mutation: requestReverifyOtpMutation,
    variables: {
      input: variables,
    },
  })
  return resp?.data
})

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

export const checkRegisteredWallet = createThunk('login/checkRegisteredWallet', async ({ walletAddress, chainType }: { walletAddress: string | undefined, chainType: AuthChainType }) => {
  const resp = await userGqlClient?.mutate<any>({
    mutation: checkRegisteredWalletMutaion,
    variables: {
      walletAddress: walletAddress,
      chainType: chainType
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

// Action types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGOUT = 'LOGOUT'

export const newAuthSlice = createSlice({
  name: 'newAuth',
  initialState,
  reducers: {
    logout: (state, action) => {
      state.token = initialState.token
      ServiceConfig.token = ''
      ServiceConfig.refreshToken = ''
    },
    updateAccessToken: (state, action) => {
      const activeAccount = action?.payload?.activeAccount
      const accessToken = action?.payload?.accessToken
      const refreshToken = action?.payload?.refreshToken
      const userId = action?.payload?.userId
      const subOrgId = action?.payload?.subOrgId
      state.token = {
        ...state.token,
        [activeAccount]: {
          ...state.token?.[activeAccount],
          access_token: accessToken,
          refresh_token: refreshToken,
          userId: userId,
          subOrgId: subOrgId,
        },
      }
    },
    updateRefreshToken: (state, action) => {
      const activeAccount = action?.payload?.activeAccount
      const accessToken = action?.payload?.accessToken
      state.token = {
        ...state.token,
        [activeAccount]: {
          ...state.token?.[activeAccount],
          access_token: accessToken,
        },
      }
    },
    updateListTokens: (state, action) => {
      state.token = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginByTGv2.fulfilled, (state, action) => {})
  },
})

export const { updateAccessToken, updateListTokens, logout } = newAuthSlice.actions
export const newAuthActions = {
  ...newAuthSlice.actions,
  loginByTG,
  loginByTGv2,
  loginByWallet,
  getNonce,
  getRefreshToken,
  loginByWalletV2, // turnkey login
  loginWithGoogle, // turnkey login
  loginWithApple, // turnkey login
  createWalletSubOrgWallet,
  createGoogleSubOrgWallet,
  initEmailOtp,
  loginWithEmailOtp, // turnkey login
  requestReverifyOtp,
  migrateTurnkeyAccount,
  checkRegisteredWallet
}
export default newAuthSlice

const selectActiveAccount = (state: RootState) => state.newWallet.activeAccount
const selectListTokens = (state: RootState) => state.newAuth.token

export const _userInfo = createSelector([selectActiveAccount, selectListTokens], (activeAccount, listTokens) => {
  return listTokens?.[activeAccount]
})

export const userIdSelector = createSelector([_userInfo], (userInfo) => {
  return userInfo?.userId
})
