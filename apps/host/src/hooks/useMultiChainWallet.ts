import { useCallback, useEffect } from 'react'
import {
  useAccount,
  useBalance,
  useDisconnect,
  useConnect,
  useChains,
  useSwitchChain,
  useAccountEffect,
  useSignMessage,
} from 'wagmi'
import { Connection, PublicKey } from '@solana/web3.js'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { setActiveAccount, WALLET_ACTIONS, walletActions } from '@/redux/modules/wallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { _changeTokenAccount, authActions } from '@/redux/modules/auth.slice'
import { message_to_sign, telegramBotConfig, TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'
import { useSelector } from 'react-redux'
import { PhantomWalletIcon } from '@/lib/wallets/PhantomWalletAdapter'
import { ChainIds } from '@/types/enums'
import { OKXWalletIcon } from '@/lib/wallets/OKXWalletAdapter'
import { ChainType, InputLoginWalletV2Dto } from '@/@generated/gql/graphql-user'
import { useTurnkey } from '@turnkey/sdk-react'

type Props = {
  enableEvm?: boolean
  enableSolana?: boolean
  enableTron?: boolean
  solanaRpcUrl?: string
  tronRpcUrl?: string
  autoConnect?: boolean
}

export const useMultiChainWallet = (options: Props) => {
  const { enableEvm = true, enableSolana = true, autoConnect = false } = options

  // Redux
  const dispatch = useAppDispatch()
  const wallets = useAppSelector((state) => state.wallet.wallets)
  const activeChain = useAppSelector((state) => state.wallet.activeChain)
  const activeAccount = useAppSelector((state) => state.wallet.activeAccount)
  const enabledChains = useAppSelector((state) => state.wallet.enabledChains)
  const token = useSelector(_changeTokenAccount)

  // EVM hooks
  const { address, isConnected: isEvmConnected, chain: evmChain, chainId, connector: activeEvmConnector } = useAccount()
  const { data: balanceData } = useBalance({
    address,
    query: { enabled: isEvmConnected && enableEvm && !wallets?.eth?.chain?.balance },
  })
  const { disconnect: disconnectEvm, disconnectAsync } = useDisconnect()
  const { connectors, connect } = useConnect()
  // const chains = useChains()
  const { chains, switchChainAsync } = useSwitchChain()

  // Solana hooks
  const solanaWallet = useSolanaWallet()

  // Account effect for EVM connection
  useAccountEffect({
    onConnect(data) {
      if (!data?.isReconnected) {
        dispatch(walletActions.setActiveAccount(TYPE_ACCOUNT.CHAIN))
      }
    },
    onDisconnect() {
      // console.log('Disconnected!')
    },
  })

  // Update EVM wallet in Redux store
  useEffect(() => {
    // if (!enableEvm) return
    // const updateEvmWallet = () => {
    //   const connectorInfo = connectors.find((c) => c.name === activeEvmConnector?.name)

    //   const getLogoIconFromName = (name: string | undefined) => {
    //     if (name === 'Phantom') return PhantomWalletIcon
    //     if (name === 'OKX Wallet') return OKXWalletIcon
    //     if (name === 'MetaMask') return '/images/icons/metamask-icon.png'
    //     return ''
    //   }
    //   // switchEvmChain(ChainIds.Arbitrum)
    //   dispatch({
    //     type: WALLET_ACTIONS.UPDATE_WALLET,
    //     payload: {
    //       wallets: {
    //         ...wallets,
    //         eth: {
    //           ...wallets?.eth,
    //           chain: {
    //             ...wallets?.eth?.chain,
    //             walletId: address || null,
    //             balance: balanceData
    //               ? {
    //                   formatted: activeChain === TYPE_CHAIN.ETH ? balanceData.formatted : 0,
    //                   symbol: balanceData.symbol,
    //                   decimals: balanceData.decimals,
    //                   value: balanceData.value?.toString(),
    //                 }
    //               : null,
    //             isConnected: isEvmConnected,
    //             error: null,
    //             chainId: ChainIds.Ethereum,
    //             walletInfo: {
    //               icon: !!connectorInfo?.icon ? connectorInfo?.icon : getLogoIconFromName(connectorInfo?.name),
    //               name: connectorInfo?.name,
    //             },
    //           },
    //         },
    //         arb: {
    //           ...wallets?.arb,
    //           chain: {
    //             ...wallets?.arb?.chain,
    //             walletId: address || null,
    //             balance: balanceData
    //               ? {
    //                   formatted: activeChain === TYPE_CHAIN.ARB ? balanceData.formatted : 0,
    //                   symbol: balanceData.symbol,
    //                   decimals: balanceData.decimals,
    //                   value: balanceData.value?.toString(),
    //                 }
    //               : null,
    //             isConnected: isEvmConnected,
    //             error: null,
    //             chainId: ChainIds.Arbitrum,
    //             walletInfo: {
    //               icon: !!connectorInfo?.icon ? connectorInfo?.icon : getLogoIconFromName(connectorInfo?.name),
    //               name: connectorInfo?.name,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   })
    //   // dispatch({
    //   //   type: WALLET_ACTIONS.UPDATE_WALLET,
    //   //   payload: {
    //   //     wallets: {
    //   //       ...wallets,
    //   //       eth: {
    //   //         ...wallets?.eth,
    //   //         chain: {
    //   //           ...wallets?.eth?.chain,
    //   //           walletId: address || null,
    //   //           balance: balanceData
    //   //             ? {
    //   //                 formatted: balanceData.formatted,
    //   //                 symbol: balanceData.symbol,
    //   //                 decimals: balanceData.decimals,
    //   //                 value: balanceData.value?.toString(),
    //   //               }
    //   //             : null,
    //   //           isConnected: isEvmConnected,
    //   //           error: null,
    //   //           chainId: evmChain?.id || null,
    //   //           walletInfo: {
    //   //             icon: !!connectorInfo?.icon ? connectorInfo?.icon : getLogoIconFromName(connectorInfo?.name),
    //   //             name: connectorInfo?.name,
    //   //           },
    //   //         },
    //   //       },
    //   //     },
    //   //   },
    //   // })
    // }

    // if (isEvmConnected) {
    //   // switchEvmChain(ChainIds.Arbitrum)
    //   if (
    //     (wallets?.eth?.chain?.isConnected && wallets?.eth?.chain?.balance) ||
    //     (wallets?.arb?.chain?.isConnected && wallets?.arb?.chain?.balance)
    //   )
    //     return
    //   // updateEvmWallet()
    //   // autoSignOnConnectEvm()
    // } else {
    //   dispatch({
    //     type: WALLET_ACTIONS.UPDATE_WALLET,
    //     payload: {
    //       wallets: {
    //         ...wallets,
    //         eth: {
    //           ...wallets?.eth,
    //           chain: {
    //             ...wallets?.eth?.chain,
    //             walletId: null,
    //             balance: null,
    //             isConnected: false,
    //             error: null,
    //           },
    //         },
    //         arb: {
    //           ...wallets?.arb,
    //           chain: {
    //             ...wallets?.arb?.chain,
    //             walletId: null,
    //             balance: null,
    //             isConnected: false,
    //             error: null,
    //           },
    //         },
    //       },
    //     },
    //   })
    // }
  }, [isEvmConnected, balanceData, evmChain, enableEvm, connectors])

  // Update Solana wallet in Redux store
  useEffect(() => {
    // if (!enableSolana) return
    // let flag = 0
    // if (!solanaWallet?.connected) {
    //   flag = 0
    // }
    // if ((wallets?.sol?.chain?.walletId && wallets?.sol?.chain?.balance) || activeChain !== TYPE_CHAIN.SOLANA) return
    // const updateSolanaWallet = async () => {
    //   flag = 1
    //   if (solanaWallet.connected && solanaWallet.publicKey) {
    //     const publicKeyString = solanaWallet.publicKey.toString()

    //     try {
    //       const connection = new Connection('https://wallet.okx.com/fullnode/sol/discover/rpc/', 'confirmed')
    //       const publicKey =
    //         solanaWallet.publicKey instanceof PublicKey ? solanaWallet.publicKey : new PublicKey(solanaWallet.publicKey)

    //       const balanceInLamports = await connection.getBalance(publicKey)
    //       const balanceInSol = balanceInLamports / 1000000000

    //       dispatch({
    //         type: WALLET_ACTIONS.UPDATE_WALLET,
    //         payload: {
    //           wallets: {
    //             ...wallets,
    //             sol: {
    //               ...wallets?.sol,
    //               chain: {
    //                 ...wallets?.sol?.chain,
    //                 walletId: publicKeyString,
    //                 chainId: ChainIds.Solana,
    //                 balance: {
    //                   formatted: balanceInSol.toString(),
    //                   symbol: 'SOL',
    //                   decimals: 9,
    //                   value: balanceInLamports.toString(),
    //                 },
    //                 isConnected: true,
    //                 error: null,
    //                 walletInfo: {
    //                   icon: solanaWallet.wallet?.adapter.icon,
    //                   name: solanaWallet.wallet?.adapter.name,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       })
    //     } catch (err: any) {
    //       console.error('[Error balance Solana]: ', err)
    //       dispatch({
    //         type: WALLET_ACTIONS.UPDATE_WALLET,
    //         payload: {
    //           wallets: {
    //             ...wallets,
    //             sol: {
    //               ...wallets?.sol,
    //               chain: {
    //                 ...wallets?.sol?.chain,
    //                 walletId: publicKeyString,
    //                 chainId: null,
    //                 balance: null,
    //                 isConnected: true,
    //                 error: err.message,
    //               },
    //             },
    //           },
    //         },
    //       })
    //     }
    //   } else {
    //     dispatch({
    //       type: WALLET_ACTIONS.UPDATE_WALLET,
    //       payload: {
    //         wallets: {
    //           ...wallets,
    //           sol: {
    //             ...wallets?.sol,
    //             chain: {
    //               ...wallets?.sol?.chain,
    //               walletId: null,
    //               chainId: null,
    //               balance: null,
    //               isConnected: false,
    //               error: null,
    //             },
    //           },
    //         },
    //       },
    //     })
    //   }
    // }
    // if (flag === 0) {
    //   updateSolanaWallet()
    // }
  }, [solanaWallet.connected, solanaWallet.publicKey, enableSolana])

  // Wallet connection handlers
  const connectEvmWallet = (targetChain: TYPE_CHAIN = TYPE_CHAIN.ETH) => {
    if (!enableEvm) return

    const connector = connectors.find((c) => c.ready)
    console.log('connector', connector)
    if (connector) {
      connect({ connector })
    } else {
      dispatch({
        type: WALLET_ACTIONS.UPDATE_WALLET,
        payload: {
          wallets: {
            ...wallets,
            [targetChain]: {
              ...wallets?.[targetChain],
              chain: {
                ...wallets?.[targetChain]?.chain,
                error: 'Not connector EVM',
              },
            },
          },
        },
      })
    }
  }

  const connectSolanaWallet = async () => {
    if (!enableSolana) {
      console.warn('Chain Solana is disabled')
      return
    }

    if (solanaWallet) {
      try {
        await solanaWallet.connect()
      } catch (err: any) {
        dispatch({
          type: WALLET_ACTIONS.UPDATE_WALLET,
          payload: {
            wallets: {
              ...wallets,
              sol: {
                ...wallets?.sol,
                chain: {
                  ...wallets?.sol?.chain,
                  error: 'Disconnect: ' + err.message,
                },
              },
            },
          },
        })
      }
    } else {
      dispatch({
        type: WALLET_ACTIONS.UPDATE_WALLET,
        payload: {
          wallets: {
            ...wallets,
            sol: {
              ...wallets?.sol,
              chain: {
                ...wallets?.sol?.chain,
                error: 'Cant not find Solana wallet',
              },
            },
          },
        },
      })
    }
  }

  // Wallet disconnection handlers
  const disconnectEvmWallet = (targetChain: TYPE_CHAIN = TYPE_CHAIN.ETH) => {
    if (enableEvm) {
      disconnectEvm()
      dispatch(walletActions.logoutActiveChain(targetChain))
    }
  }

  const disconnectSolanaWallet = async () => {
    if (enableSolana && solanaWallet) {
      await solanaWallet.disconnect()
      dispatch(walletActions.logoutActiveChain(TYPE_CHAIN.SOLANA))
    }
  }

  const disconnectAllWallets = async () => {
    if (enableEvm) disconnectEvm()
    if (enableSolana && solanaWallet) await solanaWallet.disconnect()
  }

  // Utility functions
  const getActiveWalletInfo = () => {
    const wallet =
      activeAccount === TYPE_ACCOUNT.CHAIN ? wallets?.[activeChain]?.chain : wallets?.[activeChain]?.telegram

    if (!wallet || !wallet.isConnected) {
      return {
        walletId: null,
        balance: null,
        isConnected: false,
        chainType: activeChain,
        error: wallet?.error || `Wallet ${activeChain} not connection`,
        isWeb3Wallet: false,
        isTelegramWallet: false,
      }
    }

    return {
      // walletId: wallet.walletId,
      balance: wallet.balance,
      isConnected: true,
      chainType: activeChain,
      avatar: wallet?.avatar,
      chainId: wallet?.chainId,
      chainName: wallet?.chainName,
      error: null,
      walletInfo: wallet.walletInfo,
      isWeb3Wallet: activeAccount === TYPE_ACCOUNT.CHAIN,
      isTelegramWallet: activeAccount === TYPE_ACCOUNT.TELEGRAM,
    }
  }

  const getInActiveWalletInfo = () => {
    const wallet =
      activeAccount === TYPE_ACCOUNT.CHAIN ? wallets?.[activeChain]?.telegram : wallets?.[activeChain]?.chain

    if (!wallet || !wallet.isConnected) {
      return {
        walletId: null,
        balance: null,
        isConnected: false,
        chainType: activeChain,
        error: wallet?.error || `Wallet ${activeChain} not connection`,
      }
    }

    return {
      // walletId: wallet.walletId,
      balance: wallet.balance,
      isConnected: true,
      chainType: activeChain,
      avatar: wallet?.avatar,
      chainId: wallet?.chainId,
      chainName: wallet?.chainName,
      error: null,
    }
  }

  // Action handlers
  const connectActiveWallet = async () => {
    switch (activeChain) {
      case TYPE_CHAIN.ETH:
        // await switchEvmChain(ChainIds.Ethereum)
        connectEvmWallet(TYPE_CHAIN.ETH)
        break
      case TYPE_CHAIN.ARB:
        // await switchEvmChain(ChainIds.Arbitrum)
        connectEvmWallet(TYPE_CHAIN.ARB)
        break
      case TYPE_CHAIN.SOLANA:
        await connectSolanaWallet()
        break
      default:
        console.warn(`[Chain error]: ${activeChain}`)
    }
    dispatch(setActiveAccount('chain'))
  }

  const disconnectActiveWallet = async () => {
    switch (activeChain) {
      case TYPE_CHAIN.ETH:
        disconnectEvmWallet(TYPE_CHAIN.ETH)
        break
      case TYPE_CHAIN.ARB:
        disconnectEvmWallet(TYPE_CHAIN.ARB)
        break
      case TYPE_CHAIN.SOLANA:
        disconnectSolanaWallet()
        break
      default:
        console.warn(`[Chain error]: ${activeChain}`)
    }
    dispatch(
      authActions.logout({
        activeChain: activeChain,
        activeAccount: activeAccount,
      }),
    )
  }

  const disconnectWallet = async (chain: TYPE_CHAIN, isSwitchChain: boolean = true) => {
    switch (chain) {
      case TYPE_CHAIN.ETH:
        if (enableEvm) {
          disconnectEvm()
          await disconnectAsync(
            { connector: activeEvmConnector },
            {
              onSuccess(data, variables, context) {
                console.log('data', data, variables, context, chain)
                variables?.connector?.disconnect()
                // disconnectEvm()
                dispatch(
                  walletActions.logoutChain({
                    chain: TYPE_CHAIN.ETH,
                    isSwitchChain: isSwitchChain,
                  }),
                )
              },
            },
          )
          // dispatch(walletActions.logoutChain(TYPE_CHAIN.ETH))
          // dispatch(
          //   walletActions.logoutChain({
          //     chain: TYPE_CHAIN.ETH,
          //     isSwitchChain: isSwitchChain,
          //   }),
          // )
        }
        break
      case TYPE_CHAIN.ARB:
        if (enableEvm) {
          disconnectEvm()
          await disconnectAsync(
            { connector: activeEvmConnector },
            {
              onSuccess(data, variables, context) {
                variables?.connector?.disconnect()
                dispatch(
                  walletActions.logoutChain({
                    chain: TYPE_CHAIN.ARB,
                    isSwitchChain: isSwitchChain,
                  }),
                )
              },
            },
          )
          // dispatch(walletActions.logoutChain(TYPE_CHAIN.ARB))
          // dispatch(
          //   walletActions.logoutChain({
          //     chain: TYPE_CHAIN.ARB,
          //     isSwitchChain: isSwitchChain,
          //   }),
          // )
        }
        break
      case TYPE_CHAIN.SOLANA:
        if (enableSolana && solanaWallet) {
          await solanaWallet.disconnect()
          // dispatch(walletActions.logoutChain(TYPE_CHAIN.SOLANA))
          dispatch(
            walletActions.logoutChain({
              chain: TYPE_CHAIN.SOLANA,
              isSwitchChain: isSwitchChain,
            }),
          )
        }
        break
      default:
        console.warn(`[Chain error]: ${activeChain}`)
    }

    dispatch(
      authActions.logout({
        activeChain: chain,
        activeAccount: TYPE_ACCOUNT.CHAIN,
      }),
    )
  }

  const switchEvmChain = async (chainId: number) => {
    if (!enableEvm || !isEvmConnected) {
      console.warn('EVM is not connected')
      return false
    }

    try {
      await switchChainAsync(
        { connector: activeEvmConnector, chainId },
        {
          onSuccess(data, variables, context) {
            // console.log('onSuccess switchChainAsync: ', data, variables, context)
          },
          onError(error, variables, context) {
            // console.log('onError switchChainAsync: ', error, variables, context)
          },
        },
      )
    } catch (error) {
      console.error('Error when switch EVM chain:', error)
      return false
    }
  }

  const disconnectWalletTelegram = () => {
    dispatch(walletActions.logoutTelegram({}))
    dispatch(
      authActions.logout({
        activeChain: activeChain,
        activeAccount: TYPE_ACCOUNT.TELEGRAM,
      }),
    )
  }

  const connectTelegramForChain = useCallback(() => {
    const language = localStorage.getItem('i18nextLng') || 'en'
    const referralcode = localStorage.getItem('REFERRER_CODE') || ''
    const domain = ''
    if (!telegramBotConfig.botName) {
      console.error('[Login by TG]: botName not defined')
      return
    }
    try {
      const botUsername = telegramBotConfig.botName
      let telegramUrl = `https://t.me/${botUsername}?start=${btoa(language)}_${btoa(referralcode)}_${btoa(domain)}`
      window.open(telegramUrl, '_blank')
    } catch (err: any) {
      console.error('[Login by TG]: ', err)
    }
  }, [enabledChains, telegramBotConfig.botName, dispatch, wallets])

  // Return hook results
  const result: any = {
    wallets,
    isAnyConnected: false,
    token,
    disconnectAll: disconnectAllWallets,
    activeAccount,
    activeChain,
    activeWallet: getActiveWalletInfo(),
    inActiveWallet: getInActiveWalletInfo(),
    connectActiveWallet,
    disconnectActiveWallet,
    disconnectWallet,
    disconnectWalletTelegram,
    evmChains: enableEvm ? chains : [],
    switchEvmChain: enableEvm ? switchEvmChain : null,
    connectTelegramForChain,
  }

  if (enableEvm) {
    result.eth = {
      ...wallets?.eth,
      connect: () => connectEvmWallet(TYPE_CHAIN.ETH),
      disconnect: () => disconnectEvmWallet(TYPE_CHAIN.ETH),
    }
    result.arb = {
      ...wallets?.arb,
      connect: () => connectEvmWallet(TYPE_CHAIN.ARB),
      disconnect: () => disconnectEvmWallet(TYPE_CHAIN.ARB),
    }
  }

  if (enableSolana) {
    result.sol = {
      ...wallets?.sol,
      connect: connectSolanaWallet,
      disconnect: disconnectSolanaWallet,
    }
  }

  return result
}
