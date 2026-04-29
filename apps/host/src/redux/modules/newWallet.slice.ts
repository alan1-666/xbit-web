import {
  ChainType,
  ExportPrivateKeyWithoutVerifyInput,
  UpdateWalletOrderInputDto,
  UserEmbeddedWalletDto,
} from '@/@generated/gql/graphql-user'
import { NEW_TYPE_ACCOUNT, RPC_URL, TYPE_CHAIN } from '@/lib/blockchain'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import ls from '@/lib/local-storage'
import {
  approveExportPrivateKeyWithoutVerifyMutate,
  getUserInfoQuery,
  updateWalletOrderMutation,
} from '@/services/auth.service'
import { ChainIds } from '@/types/enums'
import { decryptPrivateKey } from '@/utils/agent/cryptoUtils'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { formatEther, toBigInt } from 'ethers'
import { REHYDRATE, RehydrateAction } from 'redux-persist'
import { RootState } from '../store'
import { createThunk } from './common'
import { _userInfo } from './newAuth.slice'

// const getSOLBalance = async (wallet: string): Promise<any[]> => {
//   const response = await fetch(`${RPC_URL}?chain=SOLANA`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${ServiceConfig.token}`,
//     },
//     body: JSON.stringify({
//       jsonrpc: '2.0',
//       id: 1,
//       method: 'getBalance',
//       params: [wallet, { commitment: 'finalized' }],
//     }),
//   })
//   const result = await response.json()
//   return result.result.value
// }

// const getETHBalance = async (wallet: string, rpcUrl: string) => {
//   const response = await fetch(rpcUrl, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${ServiceConfig.token}`,
//     },
//     body: JSON.stringify({
//       jsonrpc: '2.0',
//       id: 1,
//       method: 'eth_getBalance',
//       params: [wallet, 'latest'],
//     }),
//   })
//   const data = await response.json()
//   return data.result
// }

// const hexToEth = (hexValue: string) => {
//   try {
//     const wei = toBigInt(hexValue)
//     const eth = formatEther(wei)
//     return eth
//   } catch (error) {
//     return 0
//   }
// }

export const getAccountInfo = createThunk('newWallet/getUserInfo', async () => {
  try {
    const resp = await userGqlClient?.query<any>({
      query: getUserInfoQuery,
      variables: {},
      fetchPolicy: 'no-cache',
    })
    const userEmbeddedWallets = resp?.data?.account?.userEmbeddedWallets || []
    const walletAddressLogin = resp?.data?.account?.walletAddress || ''
    // const solWallets = userEmbeddedWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Solana)
    // const ethWallets = userEmbeddedWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Evm)
    // const arbWallets = userEmbeddedWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Arb)
    // const bscWallets = userEmbeddedWallets.filter((wallet: UserEmbeddedWalletDto) => wallet.chain === ChainType.Bsc)

    // // Process SOL wallets with proper error handling
    // const solWalletsWithBalance = await Promise.allSettled(
    //   solWallets.map(async (wallet: UserEmbeddedWalletDto) => {
    //     try {
    //       const lamports = await getSOLBalance(wallet.walletAddress)
    //       const solBalance = lamports ? Number(lamports) / 1e9 : 0
    //       return {
    //         ...wallet,
    //         balance: solBalance,
    //       }
    //     } catch (error) {
    //       console.error('Error fetching SOL balance for wallet:', wallet.walletAddress, error)
    //       return {
    //         ...wallet,
    //       }
    //     }
    //   }),
    // )

    // // Process ETH wallets with proper error handling
    // const ethWalletsWithBalance = await Promise.allSettled(
    //   ethWallets.map(async (wallet: UserEmbeddedWalletDto) => {
    //     try {
    //       const balance = await getETHBalance(wallet.walletAddress, `${RPC_URL}?chain=ETHEREUM`)
    //       const ethBalance = hexToEth(balance)
    //       return {
    //         ...wallet,
    //         balance: ethBalance,
    //       }
    //     } catch (error) {
    //       console.error('Error fetching ETH balance for wallet:', wallet.walletAddress, error)
    //       return {
    //         ...wallet,
    //       }
    //     }
    //   }),
    // )

    // // Process ARB wallets with proper error handling
    // const arbWalletsWithBalance = await Promise.allSettled(
    //   arbWallets.map(async (wallet: UserEmbeddedWalletDto) => {
    //     try {
    //       const balance = await getETHBalance(wallet.walletAddress, `${RPC_URL}?chain=ARBITRUM`)
    //       const ethBalance = hexToEth(balance)
    //       return {
    //         ...wallet,
    //         balance: ethBalance,
    //       }
    //     } catch (error) {
    //       console.error('Error fetching ARB balance for wallet:', wallet.walletAddress, error)
    //       return {
    //         ...wallet,
    //       }
    //     }
    //   }),
    // )
    // // Process BSC wallets with proper error handling
    // const bscWalletsWithBalance = await Promise.allSettled(
    //   bscWallets.map(async (wallet: UserEmbeddedWalletDto) => {
    //     try {
    //       const balance = await getETHBalance(wallet.walletAddress, `${RPC_URL}?chain=BSC`)
    //       const ethBalance = hexToEth(balance)
    //       return {
    //         ...wallet,
    //         balance: ethBalance,
    //       }
    //     } catch (error) {
    //       console.error('Error fetching BSC balance for wallet:', wallet.walletAddress, error)
    //       return {
    //         ...wallet,
    //       }
    //     }
    //   }),
    // )

    // const processedSolWallets = solWalletsWithBalance
    //   .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    //   .map((result) => result.value)

    // const processedEthWallets = ethWalletsWithBalance
    //   .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    //   .map((result) => result.value)

    // const processedArbWallets = arbWalletsWithBalance
    //   .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    //   .map((result) => result.value)

    // const processedBscWallets = bscWalletsWithBalance
    //   .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    //   .map((result) => result.value)

    // const allProcessedWallets = [
    //   ...processedSolWallets,
    //   ...processedEthWallets,
    //   ...processedArbWallets,
    //   ...processedBscWallets,
    // ]

    const updatedData = {
      ...resp?.data,
      account: {
        ...resp?.data?.account,
        // userEmbeddedWallets: allProcessedWallets,
        userEmbeddedWallets: userEmbeddedWallets,
        walletAddressLogin,
      },
    }

    return updatedData
  } catch (error) {
    console.error('Error in getAccountInfo:', error)
    throw error
  }
})

export const updateWalletOrder = createThunk(
  'newWallet/updateWalletOrder',
  async ({ input }: { input: UpdateWalletOrderInputDto }) => {
    const resp = await userGqlClient?.mutate<any>({
      mutation: updateWalletOrderMutation,
      variables: {
        input: input,
      },
    })
    return resp?.data
  },
)

export const approveExportPrivateKeyWithoutVerify = createThunk(
  'newWallet/approveExportPrivateKeyWithoutVerify',
  async ({ input }: { input: ExportPrivateKeyWithoutVerifyInput }) => {
    const resp = await userGqlClient?.mutate<any>({
      mutation: approveExportPrivateKeyWithoutVerifyMutate,
      variables: {
        input: input,
      },
    })
    return resp?.data
  },
)

export const WALLET_ACTIONS = {
  UPDATE_WALLET: 'newWallet/updateWallet',
  SET_ACTIVE_CHAIN: 'newWallet/setActiveAccount',
}
type TypeListWallets = {
  type: NEW_TYPE_ACCOUNT
  list: UserEmbeddedWalletDto[]
}

interface WalletState {
  listWallets: TypeListWallets[]
  activeChain: string
  activeAccount: NEW_TYPE_ACCOUNT
  activeAccountWallet: string
  isExportedWallet: boolean
  isFirstLogin: boolean
  turnkeyRootUserId: string | null
  subOrgId: string | null
  listWalletsByChain: UserEmbeddedWalletDto[]
  bundle: any[]
  verify: any
  isEnscape: boolean
  email: string
  walletAddressLogin?: string
  connectedWalletName?: string
  connectedWalletIcon?: string
}

const initialState: WalletState = {
  listWallets: [] as TypeListWallets[],
  activeChain: TYPE_CHAIN.MON,
  activeAccount: NEW_TYPE_ACCOUNT.EMAIL,
  activeAccountWallet: '',
  isExportedWallet: true,
  isFirstLogin: false,
  turnkeyRootUserId: null,
  subOrgId: null,
  listWalletsByChain: [] as UserEmbeddedWalletDto[],
  bundle: [],
  verify: {},
  isEnscape: false,
  email: '',
  walletAddressLogin: '',
  connectedWalletName: '',
  connectedWalletIcon: '',
}

interface WalletBalancePayload {
  balances: Record<string, number>
  chain: ChainType
}

const newWalletSlice = createSlice({
  name: 'newWallet',
  initialState,
  reducers: {
    updateWallet: (state, action) => {
      return { ...state, ...action.payload }
    },
    updateBundle: (state, action) => {
      state.bundle = [...state.bundle, action.payload]
    },
    updateListWallets: (state, action) => {
      state.listWallets = [...state.listWallets, action.payload]
    },
    updateListWalletsByChain: (state, action) => {
      state.listWalletsByChain = action.payload
    },
    updateBalanceByWalletId: (state, action) => {
      const { walletAddress, balance } = action.payload
      const wallet = state.listWalletsByChain.find((w) => w.walletAddress === walletAddress)
      if (wallet) {
        wallet.balance = balance
      }
    },
    updateBalanceByWalletAddresses: (state, action: PayloadAction<WalletBalancePayload>) => {
      const balances = action.payload?.balances
      const chain = action.payload?.chain
      state.listWalletsByChain.forEach((wallet) => {
        if (chain === wallet.chain) {
          wallet.balance = balances[wallet.walletAddress] ?? 0
        }
      })
    },
    updateIsExportedWallet: (state, action) => {
      state.isExportedWallet = action.payload
    },
    updateIsFirstLogin: (state, action) => {
      state.isExportedWallet = action.payload
    },
    updateVerifyWallet: (state, action) => {
      state.verify = action.payload
    },
    setActiveAccount: (state, action) => {
      state.activeAccount = action.payload
    },
    updateEmail: (state, action) => {
      state.email = action.payload
    },
    logoutWallet: (state, action) => {
      state.listWallets = [] as TypeListWallets[]
      state.activeAccountWallet = ''
      state.listWalletsByChain = []
      state.isExportedWallet = true
      state.isFirstLogin = false
      state.turnkeyRootUserId = null
      state.subOrgId = null
      state.bundle = []
      state.verify = {}
      state.isEnscape = false
      state.email = ''
      state.walletAddressLogin = ''
      state.connectedWalletName = ''
      state.connectedWalletIcon = ''
    },
    setActiveChain: (state, action) => {
      state.activeChain = action.payload
    },
    setActiveAccountWallet: (state, action) => {
      state.activeAccountWallet = action.payload
    },
    updateIsEnscape: (state, action) => {
      state.isEnscape = action.payload
    },
    setConnectedWalletInfo: (state, action: PayloadAction<{ name: string; icon: string }>) => {
      state.connectedWalletName = action.payload.name
      state.connectedWalletIcon = action.payload.icon
    },
  },
  extraReducers: (builder) => {
    // Handle rehydration with migration
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      if (typeof state.bundle === 'object' && !Array.isArray(state.bundle) && Object.keys(state.bundle).length === 0) {
        state.bundle = []
      }
    })
    builder.addCase(getAccountInfo.fulfilled, (state, action) => {
      state.isExportedWallet = action?.payload?.account?.isExportedWallet
      state.isFirstLogin = action?.payload?.account?.isFirstLogin
      state.turnkeyRootUserId = action?.payload?.account?.turnkeyRootUserId
      state.subOrgId = action?.payload?.account?.subOrgId
      const listAccount = action?.payload?.account?.userEmbeddedWallets
      state.walletAddressLogin = action?.payload?.account?.walletAddress || ''
      state.listWallets.push({
        type: state.activeAccount,
        list: listAccount,
      })
      state.listWalletsByChain = listAccount
    })
    builder.addCase(approveExportPrivateKeyWithoutVerify.fulfilled, (state, action) => {})
  },
})

export const {
  updateWallet,
  updateBundle,
  updateListWallets,
  updateListWalletsByChain,
  updateBalanceByWalletId,
  setActiveAccount,
  setActiveAccountWallet,
  logoutWallet,
  updateIsFirstLogin,
  updateVerifyWallet,
  updateIsEnscape,
  updateEmail,
  setActiveChain,
  setConnectedWalletInfo,
} = newWalletSlice.actions
export const newWalletActions = {
  ...newWalletSlice.actions,
  getAccountInfo,
  updateWalletOrder,
  approveExportPrivateKeyWithoutVerify,
}
export default newWalletSlice

const selectPrivateKeyEncrypted = (state: RootState) => state.newWallet.privateKeyEncrypted
const selectPrivateKeyIv = (state: RootState) => state.newWallet.iv

const selectActiveChain = (state: RootState) => state.newWallet.activeChain
const selectActiveAccountWallet = (state: RootState) => state.newWallet.activeAccountWallet
export const selectListWallets = (state: RootState) => state.newWallet.listWalletsByChain

export const mappedChainName: Record<number, string> = {
  [ChainIds.Solana]: 'Solana',
  [ChainIds.Ethereum]: 'Ethereum',
  [ChainIds.Arbitrum]: 'Arbitrum',
  [ChainIds.Bsc]: 'BNB',
}

export const mappedChainIdToChainType = (chainId: number) => {
  switch (chainId) {
    case ChainIds.Solana:
      return ChainType.Solana
    case ChainIds.Ethereum:
      return ChainType.Evm
    case ChainIds.Arbitrum:
      return ChainType.Arb
    case ChainIds.Bsc:
      return ChainType.Bsc
    case ChainIds.Mon:
      return ChainType.Mon
    default:
      return ChainType.Solana
  }
}

export const mappedTypeChain = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return ChainType.Solana
    case TYPE_CHAIN.ETH:
      return ChainType.Evm
    case TYPE_CHAIN.ARB:
      return ChainType.Arb
    case TYPE_CHAIN.BSC:
      return ChainType.Bsc
    case TYPE_CHAIN.MON:
      return ChainType.Mon  
    default:
      return ChainType.Solana
  }
}

export const mappedChainTypeToChainId = (chain: ChainType | string) => {
  switch (chain) {
    case ChainType.Solana:
      return ChainIds.Solana
    case ChainType.Evm:
      return ChainIds.Ethereum
    case ChainType.Arb:
      return ChainIds.Arbitrum
    case ChainType.Bsc:
      return ChainIds.Bsc
    case ChainType.Mon:
      return ChainIds.Mon   
    default:
      return ChainIds.Solana
  }
}

export const mappedChainId = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return ChainIds.Solana
    case TYPE_CHAIN.ETH:
      return ChainIds.Ethereum
    case TYPE_CHAIN.ARB:
      return ChainIds.Arbitrum
    case TYPE_CHAIN.BSC:
      return ChainIds.Bsc
     case TYPE_CHAIN.MON:
      return ChainIds.Mon   
    default:
      return ChainIds.Solana
  }
}

export const mappedChainIdToTypeChain = (chainId: ChainIds) => {
  switch (chainId) {
    case ChainIds.Solana:
      return ChainType.Solana
    case ChainIds.Ethereum:
      return ChainType.Evm
    case ChainIds.Arbitrum:
      return ChainType.Arb
    case ChainIds.Bsc:
      return ChainType.Bsc
    case ChainIds.Mon:
      return ChainType.Mon
    default:
      return ChainType.Solana
  }
}

export const mappedIdToTypeChain = (id: ChainIds) => {
  switch (id) {
    case ChainIds.Solana:
      return TYPE_CHAIN.SOLANA
    case ChainIds.Ethereum:
      return TYPE_CHAIN.ETH
    case ChainIds.Arbitrum:
      return TYPE_CHAIN.ARB
    case ChainIds.Bsc:
      return TYPE_CHAIN.BSC
    case ChainIds.Mon:
      return ChainType.Mon   
    default:
      return TYPE_CHAIN.SOLANA
  }
}

export const mapLabelChain = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return 'Solana'
    case TYPE_CHAIN.ETH:
      return 'Ethereum'
    case TYPE_CHAIN.ARB:
      return 'Arbitrum'
    case TYPE_CHAIN.BSC:
      return 'BNB Chain'
    case TYPE_CHAIN.MON:
      return 'Monad'  
    default:
      return 'Solana'
  }
}

export const _activeWallet = createSelector(
  [selectActiveChain, selectListWallets, selectActiveAccountWallet, _userInfo],
  (activeChain, listWallets, activeAccountWallet, userInfo) => {
    const listAccount = listWallets?.filter(
      (item: UserEmbeddedWalletDto) => item?.chain === mappedTypeChain(activeChain),
    )
    let accountSelected: UserEmbeddedWalletDto = {} as UserEmbeddedWalletDto
    if (!!activeAccountWallet) {
      const accountFind = listAccount?.find(
        (item: UserEmbeddedWalletDto) => item?.walletAddress === activeAccountWallet,
      )
      if (!accountFind) {
        accountSelected = listAccount?.[0]
        if (accountSelected) newWalletActions.setActiveAccountWallet(accountSelected?.walletAddress)
      }
      if (accountFind) {
        accountSelected = accountFind
      } else {
        accountSelected = listAccount?.[0]
        if (accountSelected) newWalletActions.setActiveAccountWallet(accountSelected?.walletAddress)
      }
    } else {
      accountSelected = listAccount?.[0]
      if (accountSelected) newWalletActions.setActiveAccountWallet(accountSelected?.walletAddress)
    }

    return {
      walletAddress: accountSelected?.walletAddress ?? null,
      walletId: accountSelected?.walletId,
      balance: { formatted: accountSelected?.balance ?? null },
      isConnected: !!accountSelected?.walletAddress && !!userInfo?.access_token,
      chainType: activeChain,
      avatar: '',
      chainId: mappedChainId(activeChain),
      chainName: '',
      error: null,
      walletInfo: {},
    }
  },
)

export const _walletDex = createSelector(
  [selectListWallets, selectActiveAccountWallet],
  (listWallets, activeAccountWallet) => {
    const chain = TYPE_CHAIN.ARB
    const listAccount = listWallets?.filter((item: UserEmbeddedWalletDto) => item?.chain === mappedTypeChain(chain))
    let accountSelected: UserEmbeddedWalletDto = {} as UserEmbeddedWalletDto
    if (!!activeAccountWallet) {
      const accountFind = listAccount?.find(
        (item: UserEmbeddedWalletDto) => item?.walletAddress === activeAccountWallet,
      )
      if (!accountFind) {
        accountSelected = listAccount?.[0]
      }
      if (accountFind) {
        accountSelected = accountFind
      } else {
        accountSelected = listAccount?.[0]
      }
    } else {
      accountSelected = listAccount?.[0]
    }

    return {
      walletId: accountSelected?.walletId ?? null,
      walletAddress: accountSelected?.walletAddress ?? null,
      // balance: { formatted: accountSelected?.balance ?? null },
      // isConnected: !!accountSelected?.walletAddress,
      // chainType: chain,
      // avatar: '',
      // chainId: mappedChainId(chain),
      // chainName: '',
      // error: null,
      // walletInfo: {},
    }
  },
)

export const selectNewWalletPrivateKey = createSelector(
  selectPrivateKeyEncrypted,
  selectPrivateKeyIv,
  _userInfo,
  async (encrypted: string, iv: string, user) => {
    const token: string = user?.access_token
    if (!token) return ''
    if (!encrypted || !iv) return ''
    return decryptPrivateKey(Buffer.from(encrypted, 'base64'), Buffer.from(iv, 'base64'), token)
  },
)
