import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, arbitrumSepolia } from 'wagmi/chains'
import {
  coinbaseWallet,
  metaMaskWallet,
  okxWallet,
  // rainbowWallet,
  walletConnectWallet,
  bitgetWallet,
  binanceWallet,
  trustWallet,
  phantomWallet,
  tokenPocketWallet,
} from '@rainbow-me/rainbowkit/wallets'
// export const configWagmi = createConfig({
// })

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Suggested',
      wallets: [
        metaMaskWallet,
        okxWallet,
        // phantomWallet,
        trustWallet,
        binanceWallet,
        // rainbowWallet,
        coinbaseWallet,
        tokenPocketWallet,
        walletConnectWallet,
        bitgetWallet,
      ],
    },
  ],
  { appName: 'xbit-app-web', projectId: '614721f736ac2a1d6073d5adf36ced6e' },
)

export const configWagmi = createConfig({
  chains: [mainnet, arbitrum, arbitrumSepolia],
  transports: {
    [mainnet.id]: http('https://rpc.ankr.com/eth/0212717e87a61a96bb125b2353394e089974c9222e03195bdd7975f41034a980', {
      batch: {
        batchSize: 5
      }
    }),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
  connectors,
})
