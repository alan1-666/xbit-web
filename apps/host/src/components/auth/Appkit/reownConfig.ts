import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { solana } from '@reown/appkit/networks'

const PROJECT_ID = '614721f736ac2a1d6073d5adf36ced6e'

const solanaAdapter = new SolanaAdapter({})

// Tạo AppKit instance với error handling
let modal: any = null

const metadata = {
  name: 'KairoX WalletConnect',
  description: 'AppKit Solana Example',
  url: 'http://localhost:3000', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

try {
  modal = createAppKit({
    adapters: [solanaAdapter],
    networks: [solana], // Mainnet và Devnet
    metadata: metadata,
    projectId: PROJECT_ID,
    features: {
      analytics: true, // Optional
    },
    themeVariables: {
      '--w3m-z-index': 1000,
    },
    // enableWalletConnect: true,
    // enableInjected: true,
    // enableCoinbase: false, // Tắt Coinbase cho Solana
  })
} catch (error) {
  console.error('Failed to initialize AppKit:', error)
}

export { modal }

// Thêm debug info
if (typeof window !== 'undefined') {
  ;(window as any).debugAppKit = modal
}
