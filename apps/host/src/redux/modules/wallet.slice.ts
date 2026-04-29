// walletSlice.js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import ls from '@/lib/local-storage'
import { createSlice } from '@reduxjs/toolkit'
import { createThunk } from './common'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { getUserInfoQuery } from '@/services/auth.service'
import { TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'
import { ChainIds } from '@/types/enums'
import { ChainType, UserManagedWalletDto } from '@/@generated/gql/graphql-user'
import { REHYDRATE, RehydrateAction } from 'redux-persist'

export const getAccountInfo = createThunk('wallet/getUserInfo', async () => {
  const resp = await userGqlClient?.query<any>({
    query: getUserInfoQuery,
    variables: {},
  })
  console.log('getAccountInfo resp', resp)
  return resp?.data
})

export const WALLET_ACTIONS = {
  UPDATE_WALLET: 'wallet/updateWallet',
  SET_ACTIVE_CHAIN: 'wallet/setActiveChain',
}
interface WalletState {
  wallets: {
    eth: {
      chain: {
        walletId: string
        balance: any
        isConnected: boolean
        error: string
        avatar: string
        chainId?: string | number
        walletInfo: any
      }
      telegram: {
        walletId: string
        balance: any
        isConnected: boolean
        error: string
        avatar: string
        chainId?: string | number
        walletInfo: any
      }
    }
    sol: {
      chain: {
        walletId: string
        balance: any
        isConnected: boolean
        error: string
        avatar: string
        chainId?: string | number
        walletInfo: any
      }
      telegram: {
        walletId: string
        balance: any
        isConnected: boolean
        error: string
        avatar: string
        chainId?: string | number
        walletInfo: any
      }
    }
    arb: {
      chain: {
        walletId: string
        balance: any
        isConnected: boolean
        error: string
        avatar: string
        chainId?: string | number
      }
      telegram: {
        walletId: string
        balance: any
        isConnected: boolean
        error: string
        avatar: string
        chainId?: string | number
        walletInfo: any
      }
    }
    activeChain: string
    activeAccount: TYPE_ACCOUNT
    enabledChains: TYPE_CHAIN[]
  }
  listWalletTeleGram: UserManagedWalletDto[]
}

const initialState = {
  wallets: {
    eth: {
      chain: {
        walletId: null,
        balance: null,
        isConnected: false,
        error: null,
        avatar: '/images/img-avatar-ether.png',
        walletInfo: {
          name: '',
          icon: '',
        },
      },
      telegram: {
        walletId: null,
        balance: null,
        isConnected: false,
        error: null,
        avatar: '/images/img-avatar-ether.png',
        walletInfo: {
          name: 'Telegram',
          icon: '/images/icons/telegram.png',
        },
      },
    },
    sol: {
      chain: {
        walletId: null,
        balance: null,
        isConnected: false,
        error: null,
        avatar: '/images/img-avatar-sol.png',
        walletInfo: {
          name: '',
          icon: '',
        },
      },
      telegram: {
        walletId: null,
        balance: null,
        isConnected: false,
        error: null,
        avatar: '/images/img-avatar-sol.png',
        walletInfo: {
          name: 'Telegram',
          icon: '/images/icons/telegram.png',
        },
      },
    },
    arb: {
      chain: {
        walletId: null,
        balance: null,
        isConnected: false,
        error: null,
        avatar: '/images/img-avatar-arbitrum.png',
        walletInfo: {
          name: '',
          icon: '',
        },
      },
      telegram: {
        walletId: null,
        balance: null,
        isConnected: false,
        error: null,
        avatar: '/images/img-avatar-arbitrum.png',
        walletInfo: {
          name: 'Telegram',
          icon: '/images/icons/telegram.png',
        },
      },
    },
  },
  activeChain: ls.get('meme_chain') ?? TYPE_CHAIN.SOLANA,
  activeAccount: TYPE_ACCOUNT.CHAIN, // chain || telegram
  enabledChains: [TYPE_CHAIN.ETH, TYPE_CHAIN.SOLANA, TYPE_CHAIN.ARB],
  listWalletTeleGram: [],
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    updateWallet: (state, action) => {
      return { ...state, ...action.payload }
    },
    setActiveChain: (state, action) => {
      state.activeChain = action.payload
      if (
        state.activeAccount === TYPE_ACCOUNT.CHAIN &&
        !state.wallets?.[action.payload]?.[state?.activeAccount]?.isConnected
      ) {
        state.activeAccount = TYPE_ACCOUNT.TELEGRAM
      }
      if (
        state.activeAccount === TYPE_ACCOUNT.TELEGRAM &&
        !state.wallets?.[action.payload]?.[state?.activeAccount]?.isConnected
      ) {
        state.activeAccount = TYPE_ACCOUNT.CHAIN
      }
    },
    setActiveAccount: (state, action) => {
      state.activeAccount = action.payload
    },
    logoutChain: (state, action) => {
      const { chain, isSwitchChain } = action.payload
      if (chain === TYPE_CHAIN.SOLANA) {
        state.wallets = {
          ...state.wallets,
          sol: {
            ...state.wallets?.[chain],
            chain: {
              ...state.wallets?.[chain]?.chain,
              walletId: null,
              balance: null,
              isConnected: false,
              error: null,
              chainId: null,
              chainName: null,
            },
          },
        }
      }
      if (chain === TYPE_CHAIN.ETH || chain === TYPE_CHAIN.ARB) {
        state.wallets = {
          ...state.wallets,
          eth: {
            ...state.wallets?.eth,
            chain: {
              ...state.wallets?.eth?.chain,
              walletId: null,
              balance: null,
              isConnected: false,
              error: null,
              chainId: null,
              chainName: null,
            },
          },
          arb: {
            ...state.wallets?.arb,
            chain: {
              ...state.wallets?.arb?.chain,
              walletId: null,
              balance: null,
              isConnected: false,
              error: null,
              chainId: null,
              chainName: null,
            },
          },
        }
      }

      if (
        state.wallets?.[chain]?.telegram?.isConnected &&
        state.activeAccount === TYPE_ACCOUNT.CHAIN &&
        isSwitchChain
      ) {
        state.activeAccount = TYPE_ACCOUNT.TELEGRAM
      }
    },
    logoutTelegram: (state, action) => {
      state.wallets = {
        ...state.wallets,
        eth: {
          ...state.wallets?.eth,
          telegram: {
            ...state.wallets?.eth?.telegram,
            walletId: null,
            balance: null,
            isConnected: false,
            error: null,
            chainId: null,
            chainName: null,
          },
        },
        sol: {
          ...state.wallets?.sol,
          telegram: {
            ...state.wallets?.sol?.telegram,
            walletId: null,
            balance: null,
            isConnected: false,
            error: null,
            chainId: null,
            chainName: null,
          },
        },
        arb: {
          ...state.wallets?.arb,
          telegram: {
            ...state.wallets?.arb?.telegram,
            walletId: null,
            balance: null,
            isConnected: false,
            error: null,
            chainId: null,
            chainName: null,
          },
        },
      }
      state.listWalletTeleGram = []
      if (state.wallets?.[state.activeChain]?.chain?.isConnected) {
        state.activeAccount = TYPE_ACCOUNT.CHAIN
      }
    },
    logoutActiveChain: (state, action) => {
      if (state.activeAccount === TYPE_ACCOUNT.CHAIN) {
        state.wallets = {
          ...state.wallets,
          [action.payload]: {
            ...state.wallets?.[action.payload],
            chain: {
              ...state.wallets?.[action.payload]?.chain,
              walletId: null,
              balance: null,
              isConnected: false,
              error: null,
              chainId: null,
              chainName: null,
            },
          },
        }
        //Return account
        state.activeAccount = TYPE_ACCOUNT.TELEGRAM
        return
      }
      if (state.activeAccount === TYPE_ACCOUNT.TELEGRAM) {
        state.wallets = {
          ...state.wallets,
          eth: {
            ...state.wallets?.eth,
            telegram: {
              ...state.wallets?.eth?.telegram,
              walletId: null,
              balance: null,
              isConnected: false,
              error: null,
              chainId: null,
              chainName: null,
            },
          },
          sol: {
            ...state.wallets?.sol,
            telegram: {
              ...state.wallets?.sol?.telegram,
              walletId: null,
              balance: null,
              isConnected: false,
              error: null,
              chainId: null,
              chainName: null,
            },
          },
          arb: {
            ...state.wallets?.arb,
            telegram: {
              ...state.wallets?.arb?.telegram,
              walletId: null,
              balance: null,
              isConnected: false,
              error: null,
              chainId: null,
              chainName: null,
            },
          },
        }
        state.listWalletTeleGram = []
        //Return account
        state.activeAccount = TYPE_ACCOUNT.CHAIN
        return
      }
    },
  },
  extraReducers: (builder) => {
    // Handle rehydration with migration
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      state.enabledChains = [TYPE_CHAIN.ETH, TYPE_CHAIN.SOLANA, TYPE_CHAIN.ARB]
      if (!state.wallets?.eth?.telegram?.walletInfo && !state.wallets?.eth?.telegram?.walletInfo?.name) {
        state.wallets = {
          ...state.wallets,
          eth: {
            ...state.wallets.eth,
            telegram: {
              ...state.wallets?.eth?.telegram,
              walletInfo: {
                name: 'Telegram',
                icon: '/images/icons/telegram.png',
              },
            },
          },
          sol: {
            ...state.wallets.sol,
            telegram: {
              ...state.wallets?.sol?.telegram,
              walletInfo: {
                name: 'Telegram',
                icon: '/images/icons/telegram.png',
              },
            },
          },
          arb: {
            ...state.wallets.arb,
            telegram: {
              ...state.wallets?.arb?.telegram,
              walletInfo: {
                name: 'Telegram',
                icon: '/images/icons/telegram.png',
              },
            },
          },
        }
      }
    })
    builder.addCase(getAccountInfo.fulfilled, (state, action) => {
      const listAccount = action.payload.account.userManagedWallets
      state.listWalletTeleGram = listAccount.filter((item) => item?.chain !== ChainType.Tron)
      listAccount.forEach((item: UserManagedWalletDto) => {
        // const chain = item?.chain === 'EVM' ? TYPE_CHAIN.ETH : item?.chain === 'SOLANA' ? TYPE_CHAIN.SOLANA : ''
        let chain = ''
        let chainId = ''
        switch (item?.chain) {
          case ChainType.Evm:
            chain = TYPE_CHAIN.ETH
            chainId = ChainIds.Ethereum
            break
          case ChainType.Solana:
            chain = TYPE_CHAIN.SOLANA
            chainId = ChainIds.Solana
            break
          case ChainType.Arb:
            chain = TYPE_CHAIN.ARB
            chainId = ChainIds.Arbitrum
            break
          default:
            chain = ''
            chainId = ''
        }
        if (state.enabledChains.includes(chain)) {
          state.wallets = {
            ...state.wallets,
            [chain]: {
              ...state?.wallets?.[chain],
              telegram: {
                ...state?.wallets?.[chain]?.telegram,
                walletId: item?.walletAddress,
                chainId: chainId,
                balance: {
                  value: item?.balance,
                  formatted: item?.balance,
                },
                isConnected: true,
              },
            },
          }
        }
      })
    })
  },
})

export const { updateWallet, setActiveChain, setActiveAccount, logoutActiveChain } = walletSlice.actions
export const walletActions = { ...walletSlice.actions, getAccountInfo }
export default walletSlice
