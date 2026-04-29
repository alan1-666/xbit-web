// import { useSubscription } from '@/lib/mqtt'
// import { BaseTokenAddress, ChainIds } from '@/types/enums'
// import { RPC_SOL, TYPE_ACCOUNT, TYPE_CHAIN } from '@/lib/blockchain'
// import { useAppDispatch, useAppSelector } from '@/redux/store'
// import { useEffect } from 'react'
// import { useMultiChainRealtimeBalance } from './useMultiChainRealtimeBalance'
// import { WALLET_ACTIONS } from '@/redux/modules/wallet.slice'
// import { useSelector } from 'react-redux'
// import { _activeWallet } from '@/redux/modules/newWallet.slice'

// export default function BalanceWalletSubcription() {
//   const dispatch = useAppDispatch()
//   const activeChain = useAppSelector((state) => state.newWallet.activeChain)
//   const activeAccount = useAppSelector((state) => state.wallet.activeAccount)
//   const wallets = useAppSelector((state) => state.wallet.wallets)
//   const activeWallet = useSelector(_activeWallet)
//   const ethTeleWallet = wallets?.eth?.telegram
//   const solTeleWallet = wallets?.sol?.telegram
//   const ethWallet = wallets?.eth?.chain
//   const solWallet = wallets?.sol?.chain

//   // Get the currently active wallet ID and appropriate RPC endpoint
//   const getWalletInfo = () => {
//     // Default values
//     let walletId = null
//     let endpoint = ''
//     if (activeWallet?.isConnected && activeWallet?.walletAddress) {
//       walletId = activeWallet?.walletAddress

//       if (activeChain === TYPE_CHAIN.ETH) {
//         // endpoint = getEthereumRpcEndpoint(chainId)
//         endpoint = 'https://rpc.ankr.com/eth/4e026b43fa6e7682c535bf1fff10fa55be61a817fe8e01c6bfb98c49d8d1bf2a'
//       } else if (activeChain === TYPE_CHAIN.SOLANA) {
//         // Public Solana RPC endpoint
//         endpoint = RPC_SOL
//       } else if (activeChain === TYPE_CHAIN.ARB) {
//         endpoint = `https://arb1.arbitrum.io/rpc`
//       }
//     }
//     return { walletId, endpoint }
//   }

//   const { walletId, endpoint } = getWalletInfo()

//   //   // Use the hook to get real-time balance
//   const { balance, accountType } = useMultiChainRealtimeBalance(
//     activeAccount,
//     activeChain,
//     walletId,
//     endpoint,
//     60000, // 60 second refresh interval
//   )

//   useEffect(() => {
//     if (activeChain && walletId && accountType === activeAccount) {
//       if (activeAccount === TYPE_ACCOUNT.CHAIN) {
//         dispatch({
//           type: WALLET_ACTIONS.UPDATE_WALLET,
//           payload: {
//             wallets: {
//               ...wallets,
//               [activeChain]: {
//                 ...wallets?.[activeChain],
//                 chain: {
//                   ...wallets?.[activeChain]?.chain,
//                   balance: {
//                     ...wallets?.[activeChain]?.chain?.balance,
//                     formatted: balance,
//                   },
//                 },
//               },
//             },
//           },
//         })
//       }
//       if (activeAccount === TYPE_ACCOUNT.TELEGRAM) {
//         dispatch({
//           type: WALLET_ACTIONS.UPDATE_WALLET,
//           payload: {
//             wallets: {
//               ...wallets,
//               [activeChain]: {
//                 ...wallets?.[activeChain],
//                 telegram: {
//                   ...wallets?.[activeChain]?.telegram,
//                   balance: {
//                     ...wallets?.[activeChain]?.telegram?.balance,
//                     formatted: balance,
//                   },
//                 },
//               },
//             },
//           },
//         })
//       }
//     }
//   }, [activeChain, activeAccount, balance, walletId, accountType])

//   return (
//     <>
//       {solTeleWallet.isConnected && (
//         <BalanceWalletItemSubcription
//           wallet={solTeleWallet}
//           typeAccount={TYPE_ACCOUNT.TELEGRAM}
//           typeChain={TYPE_CHAIN.SOLANA}
//           wallets={wallets}
//         />
//       )}
//       {ethTeleWallet?.isConnected && (
//         <BalanceWalletItemSubcription
//           wallet={ethTeleWallet}
//           typeAccount={TYPE_ACCOUNT.TELEGRAM}
//           typeChain={TYPE_CHAIN.ETH}
//           wallets={wallets}
//         />
//       )}
//       {solWallet.isConnected && (
//         <BalanceWalletItemSubcription
//           wallet={solWallet}
//           typeAccount={TYPE_ACCOUNT.CHAIN}
//           typeChain={TYPE_CHAIN.SOLANA}
//           wallets={wallets}
//         />
//       )}
//       {ethWallet.isConnected && (
//         <BalanceWalletItemSubcription
//           wallet={ethWallet}
//           typeAccount={TYPE_ACCOUNT.CHAIN}
//           typeChain={TYPE_CHAIN.ETH}
//           wallets={wallets}
//         />
//       )}
//     </>
//   )
// }

// const BalanceWalletItemSubcription = ({
//   wallet,
//   typeAccount,
//   typeChain,
//   wallets,
// }: {
//   wallet: any
//   typeAccount: TYPE_ACCOUNT
//   typeChain: TYPE_CHAIN
//   wallets: any
// }) => {
//   const token =
//     typeChain === TYPE_CHAIN.SOLANA
//       ? BaseTokenAddress?.[ChainIds.Solana].wrapped
//       : BaseTokenAddress?.[ChainIds.Ethereum].wrapped
//   const message = useSubscription(`public/wallet_token/${wallet?.walletId}/${token}`)
//   const dispatch = useAppDispatch()

//   useEffect(() => {
//     if (!message) return
//     try {
//       const messageData = message?.message?.message
//       const data = messageData ? JSON.parse(messageData?.toString()) : null
//       if (data) {
//         if (typeAccount === TYPE_ACCOUNT.CHAIN && wallet?.balance?.formatted !== data?.balance) {
//           if (typeChain === TYPE_CHAIN.ETH) {
//             dispatch({
//               type: WALLET_ACTIONS.UPDATE_WALLET,
//               payload: {
//                 wallets: {
//                   ...wallets,
//                   eth: {
//                     ...wallets?.eth,
//                     chain: {
//                       ...wallets?.eth?.chain,
//                       balance: {
//                         ...wallets?.eth?.chain?.balance,
//                         formatted: data?.balance,
//                       },
//                     },
//                   },
//                   arb: {
//                     ...wallets?.arb,
//                     chain: {
//                       ...wallets?.arb?.chain,
//                       balance: {
//                         ...wallets?.arb?.chain?.balance,
//                         formatted: data?.balance,
//                       },
//                     },
//                   },
//                 },
//               },
//             })
//           }
//           if (typeChain === TYPE_CHAIN.SOLANA) {
//             dispatch({
//               type: WALLET_ACTIONS.UPDATE_WALLET,
//               payload: {
//                 wallets: {
//                   ...wallets,
//                   [typeChain]: {
//                     ...wallets?.[typeChain],
//                     chain: {
//                       ...wallets?.[typeChain]?.chain,
//                       balance: {
//                         ...wallets?.[typeChain]?.chain?.balance,
//                         formatted: data?.balance,
//                       },
//                     },
//                   },
//                 },
//               },
//             })
//           }
//         }
//         if (typeAccount === TYPE_ACCOUNT.TELEGRAM && wallet?.balance?.formatted !== data?.balance) {
//           dispatch({
//             type: WALLET_ACTIONS.UPDATE_WALLET,
//             payload: {
//               wallets: {
//                 ...wallets,
//                 [typeChain]: {
//                   ...wallets?.[typeChain],
//                   telegram: {
//                     ...wallets?.[typeChain]?.telegram,
//                     balance: {
//                       ...wallets?.[typeChain]?.telegram?.balance,
//                       formatted: data?.balance,
//                     },
//                   },
//                 },
//               },
//             },
//           })
//         }
//       }
//     } catch (error) {
//       console.warn('BalanceWalletItemSubcription error: ', error)
//     }
//   }, [message])
//   return <></>
// }
