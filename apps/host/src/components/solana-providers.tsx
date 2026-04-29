import { PropsWithChildren, useMemo } from 'react'
import {
  ConnectionProvider as SolanaConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react'
import { clusterApiUrl } from '@solana/web3.js'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { OKXWalletAdapter } from '../lib/wallets/OKXWalletAdapter'
import { BossWalletAdapter } from '../lib/wallets/BossWalletAdapter'
import { TokenPocketWalletAdapter } from '../lib/wallets/TokenPocketWalletAdapter'
import { BitgetWalletAdapter } from '../lib/wallets/BitgetWalletAdapter'
import { WalletConnectWalletAdapter as WalletConnectWalletAdapterV2 } from '../lib/wallets/WalletConnectWalletAdapter'
import { networkSolana } from '@/lib/blockchain'
import { PhantomWalletAdapter } from '@/lib/wallets/PhantomWalletAdapter'
import { TrustWalletAdapter } from '@/lib/wallets/TrustWalletAdapter'
// import './auth/Appkit/reownConfig'
// import { createAppKit } from '@reown/appkit/react'
// import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
// import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
// import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

function SolanaProviders({ children }: PropsWithChildren<{}>) {
  const endpoint = useMemo(() => clusterApiUrl(networkSolana), [])
  const autoConnect = true

  const supportedWallets = useMemo(
    () => [
      new BossWalletAdapter(),
      new OKXWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new BitgetWalletAdapter(),
      new PhantomWalletAdapter({ network: networkSolana }),
      new SolflareWalletAdapter({ network: networkSolana }),
      new TrustWalletAdapter(),
      // new TorusWalletAdapter(),
      // new MathWalletAdapter(),
      // new SafePalWalletAdapter(),
      // new TokenPocketWalletAdapter(),
      // new WalletConnectWalletAdapter({
      //   network,
      //   options: {
      //     projectId: '614721f736ac2a1d6073d5adf36ced6e', // Get one from WalletConnect Cloud
      //   },
      // }),
      // new MetaMaskWalletAdapter(),
      new WalletConnectWalletAdapterV2({
        network: networkSolana,
        options: {
          projectId: '614721f736ac2a1d6073d5adf36ced6e', // Get one from WalletConnect Cloud
        },
      }),
    ],
    [],
  )
  // App.tsx
  // 0. Set up Solana Adapter
  // const solanaWeb3JsAdapter = new SolanaAdapter()
  // // 1. Get projectId from https://dashboard.reown.com
  // const projectId = '614721f736ac2a1d6073d5adf36ced6e'
  // // 2. Create a metadata object - optional
  // const metadata = {
  //   name: 'XBIT WalletConnect',
  //   description: 'AppKit Solana Example',
  //   url: window.location.origin, // origin must match your domain & subdomain
  //   icons: ['https://avatars.githubusercontent.com/u/179229932'],
  // }

  // 3. Create modal
  // createAppKit({
  //   adapters: [solanaWeb3JsAdapter],
  //   networks: [solana],
  //   metadata: metadata,
  //   projectId,
  //   features: {
  //     connectMethodsOrder: ['wallet'],
  //     analytics: true, // Optional - defaults to your Cloud configuration
  //   },
  //   themeVariables: {
  //     '--w3m-z-index': 1000,
  //   },
  //   enableWalletGuide: false,
  //   featuredWalletIds: [],
  //   includeWalletIds: [],
  //   excludeWalletIds: [],
  //   allWallets: 'ONLY_MOBILE'
  // })

  return (
    <SolanaConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={supportedWallets} autoConnect={autoConnect}>
        {children}
      </SolanaWalletProvider>
    </SolanaConnectionProvider>
  )
}

export default SolanaProviders
