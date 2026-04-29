import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { BossWalletName } from './wallets/BossWalletAdapter'
import { OKXWalletName } from './wallets/OKXWalletAdapter'
import { MetaMaskWalletName } from './wallets/MetaMaskWalletAdaper'
import { BitgetWalletName } from './wallets/BitgetWalletAdapter'
import { WalletConnectWalletName } from './wallets/WalletConnectWalletAdapter'
import { Configs } from '@/const/configs'
import { Connection } from '@solana/web3.js'
import { ChainIds } from '@/types/enums'
import { ChainType } from '@/@generated/gql/graphql-user'
import { ServiceConfig } from '@/lib/gql/service-config'
import ls from '@/lib/local-storage.ts'

export const isDevelopmentMode = import.meta.env.VITE_STAGE === 'development' || import.meta.env.VITE_STAGE === 'unstable'
// EVM Chain IDs
export const CHAINS_ID = {
  ETHEREUM: 11155111,
  SOLANA: 901, //mainnet: 900
  BINANCE: 97,
  TRON: 1001,
  MON: 143
}

// Get EVM chain name from chain ID
export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case CHAINS_ID.ETHEREUM:
      return 'Ethereum'
    case CHAINS_ID.BINANCE:
      return 'BNB Chain'
    case CHAINS_ID.SOLANA:
      return 'Solana'
    case CHAINS_ID.MON:
      return 'Monad'
    default:
      return 'Unknown Chain'
  }
}

export const getIconChain = (chain: string): string => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return '/images/icons/icon-sol.svg'
    case TYPE_CHAIN.ETH:
      return '/images/ether.svg'
    case TYPE_CHAIN.ARB:
      return '/images/icons/chains/ic-arbitrum.svg'
    case TYPE_CHAIN.BSC:
      return '/images/bsc.svg'
    case TYPE_CHAIN.MON:
      return '/images/icons/chains/ic-monad.svg'
    default:
      return '/images/icons/icon-sol.svg'
  }
}

export const enum TYPE_CHAIN {
  ETH = 'eth',
  SOLANA = 'sol',
  ARB = 'arb',
  BSC = 'bsc',
  MON = 'mon'
}

export const TYPE_CHAIN_VALUES = ['eth', 'sol', 'arb', 'bsc', 'mon'] as const

export const enum TYPE_ACCOUNT {
  CHAIN = 'chain',
  TELEGRAM = 'telegram',
}

export const enum NEW_TYPE_CHAIN {
  ETH = ChainType.Evm,
  SOLANA = ChainType.Solana,
  ARB = ChainType.Arb,
  BSC = ChainType.Bsc,
  MON = ChainType.Mon,
}

export const enum NEW_TYPE_ACCOUNT {
  EMAIL = 'email',
  GOOGLE = 'google',
  WALLET = 'wallet',
  APPLE = 'apple',
  WC = 'walletConnect',
}

export const CHAIN_DEFAULT = TYPE_CHAIN.SOLANA

export type SupportedChain = {
  value: TYPE_CHAIN
  chain_id: ChainIds
  label: string
  img: string
  isActive: boolean
}

export const LIST_CHAIN_SUPPORTED: SupportedChain[] = [
  {
    value: TYPE_CHAIN.SOLANA,
    chain_id: ChainIds.Solana,
    label: 'Solana',
    img: '/images/icons/icon-sol.svg',
    isActive: Configs.enableSolana(),
  },
  {
    value: TYPE_CHAIN.BSC,
    chain_id: ChainIds.Bsc,
    label: 'BNB Chain',
    img: '/images/bsc.svg',
    isActive: Configs.enableBSC(),
  },
  {
    value: TYPE_CHAIN.ETH,
    chain_id: ChainIds.Ethereum,
    label: 'Ethereum',
    img: '/images/ether.svg',
    isActive: false,
  },
  {
    value: TYPE_CHAIN.ARB,
    chain_id: ChainIds.Arbitrum,
    label: 'Arbitrum',
    img: '/images/icons/chains/ic-arbitrum.svg',
    isActive: false,
  },
  {
    value: TYPE_CHAIN.MON,
    chain_id: ChainIds.Mon,
    label: 'Monad',
    img: '/images/icons/chains/ic-monad.svg',
    isActive: true,
  },
]

export const getDefaultMemeChain = (): TYPE_CHAIN => {
  if(isDevelopmentMode) return ls.get('meme_chain') || TYPE_CHAIN.MON
  if (!Configs.enableBSC()) return TYPE_CHAIN.MON
  if (!Configs.enableSolana()) return TYPE_CHAIN.BSC
  return ls.get('meme_chain') || TYPE_CHAIN.MON
}

export const getChainNameByTypeChain = (chain: TYPE_CHAIN) => {
  const founded = LIST_CHAIN_SUPPORTED.find((item) => item.value === chain)
  return founded ? founded.label : '--'
}

export const getShortNameByTypeChain = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return 'SOL'
    case TYPE_CHAIN.ETH:
      return 'ETH'
    case TYPE_CHAIN.ARB:
      return 'ARB'
    case TYPE_CHAIN.BSC:
      return 'BNB'
    case TYPE_CHAIN.MON:
      return 'MON'
    default:
      return '--'
  }
}

export const getChainId = (chain: string) => {
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

export const getImgIconChain = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.ETH:
      return '/images/icons/ic-ethereum.png'
    case TYPE_CHAIN.SOLANA:
      return '/images/icons/icon-sol.svg'
    case TYPE_CHAIN.ARB:
      return '/images/icons/ic-ethereum.png'
    case TYPE_CHAIN.BSC:
      return '/images/bsc.svg'
    case TYPE_CHAIN.MON:
      return '/images/icons/chains/ic-monad.svg'
    default:
      return '/images/icons/ic-solana.png'
  }
}

export const networkMap: Record<number, string> = {
  [ChainIds.Solana]: 'Solana',
  [ChainIds.Ethereum]: 'Ethereum',
  [ChainIds.Arbitrum]: 'Arbitrum',
  [ChainIds.HyperEVM]: 'Hyperliquid',
  [ChainIds.Bsc]: 'BNB Chain',
  [ChainIds.Hyperliquid]: 'Hyperliquid',
  [ChainIds.Mon]: 'Monad',
  [ChainIds.Polygon]: 'Polygon',
}

export const telegramBotConfig = {
  botName: Configs.telegramBot,
}

export const message_to_sign = (address: string, nonce: string) => {
  let message = 'Welcome to KairoX!\n\n'
  message += 'Click to sign in and accept the KairoX Terms of Service https://kairox.com/terms-of-use\n\n'
  message += 'This request will not trigger a blockchain transaction or cost any gas fees.\n\n'
  message += `Wallet address:\n\n${address}\n\n`
  message += `Nonce:\n${nonce}`
  return message
}

export const getImgFromNameWallet = (name: string) => {
  switch (name) {
    case BossWalletName:
      return '/images/wallets/ic-boss-wallet.svg'
    case OKXWalletName:
      return '/images/wallets/ic-okx-wallet-1.svg'
    case MetaMaskWalletName:
      return '/images/wallets/ic-metamask-wallet.svg'
    case BitgetWalletName:
      return '/images/wallets/ic-bitget-wallet.svg'
    // case PhantomWalletName:
    //   wallet = new PhantomWalletAdapter()
    //   break
    case WalletConnectWalletName:
      return '/images/wallets/ic-connect-wallet.svg'
    // break
    default:
      return '/images/kairox-logo.svg'
  }
}

//Sol config
export const networkSolana = WalletAdapterNetwork.Mainnet
export const MIN_BALANCE_SOL = 0.03
export const MIN_BALANCE_BNB = 0.005
export const MIN_BALANCE_MON = 0.005
export const MIN_BALANCE_FORM_SELL = 0.000001
export const MIN_BALANCE_FORM_BUY = 0.00001
export const FRIST_FEE_SOL = 0.002
export const SOL_ADDRESS = 'So11111111111111111111111111111111111111111'
export const BNB_ADDRESS = '0x0000000000000000000000000000000000000000'
export const MON_ADDRESS = '0x0000000000000000000000000000000000000000'
export const PLATFORM_FEE_SOL = 0.01
export const BASIC_FEE = 0.00005
//RPC: https://www.helius.dev/
export const RPC_SOL = 'https://mainnet.helius-rpc.com/?api-key=b50e6eca-31f0-47f1-bad1-d22374c948dc'
export const RPC_URL = import.meta.env.VITE_RPC_PROXY_MEME

export const solanaConnection = new Connection(RPC_SOL, {
  disableRetryOnRateLimit: true,
  commitment: 'confirmed',
})
export const WALLETCONNECT_ID = import.meta.env.VITE_WALLETCONNECT_ID
export const convertChainNameToNativeToken = (str: string) => {
  switch (str) {
    case 'EVM':
      return 'ETH'
    case 'SOLANA':
      return 'SOL'
    case 'ARB':
      return 'ETH'
    default:
      return str
  }
}

export const convertChainTypeToTypeChain = (chain: ChainType): TYPE_CHAIN => {
  switch (chain) {
    case ChainType.Evm:
      return TYPE_CHAIN.ETH
    case ChainType.Solana:
      return TYPE_CHAIN.SOLANA
    case ChainType.Arb:
      return TYPE_CHAIN.ARB
    case ChainType.Bsc:
      return TYPE_CHAIN.BSC
    case ChainType.Mon:
      return TYPE_CHAIN.MON
    default:
      return TYPE_CHAIN.SOLANA
  }
}

export const isValidSolAddress = (address: string): boolean => {
  const solAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/
  return solAddressRegex.test(address)
}

export const isValidEvmAddress = (address: string): boolean => {
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/
  return evmAddressRegex.test(address)
}

export const isValidBtcAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false
  }
  // Legacy (P2PKH) addresses: start with '1', 26-35 characters, base58
  // P2SH addresses: start with '3', 26-35 characters, base58
  const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  // Bech32 (P2WPKH/P2WSH) addresses: start with 'bc1', 42-62 characters total
  const bech32Regex = /^bc1[a-z0-9]{39,59}$/
  // Taproot (P2TR) addresses: start with 'bc1p', exactly 62 characters total
  const taprootRegex = /^bc1p[a-z0-9]{58}$/
  return legacyRegex.test(address) || bech32Regex.test(address) || taprootRegex.test(address)
}

export const isValidTronAddress = (address: string): boolean => {
  const tronAddressRegex = /^(T)[1-9A-HJ-NP-Za-km-z]{33}$/
  return tronAddressRegex.test(address)
}

export const isValidAddress = (address: string, vmType: 'tvm' | 'bvm' | 'hypevm' | 'svm' | 'evm'): boolean => {
  switch (vmType) {
    case 'svm':
      return isValidSolAddress(address)
    case 'bvm':
      return isValidBtcAddress(address)
    case 'tvm':
      return isValidTronAddress(address)
    case 'hypevm':
      return isValidEvmAddress(address)
    case 'evm':
      return isValidEvmAddress(address)
    default:
      return false
  }
}

export const getNativeTokenByActiveChain = (chain: string) => {
  switch (chain) {
    case TYPE_CHAIN.BSC:
      return 'BNB'
    case TYPE_CHAIN.ETH:
      return 'ETH'
    case TYPE_CHAIN.SOLANA:
      return 'SOL'
    case TYPE_CHAIN.MON:
      return 'MON'
    default:
      return chain.toUpperCase()
  }
}

export const getQuoteAddessByChain = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return SOL_ADDRESS
    case TYPE_CHAIN.BSC:
      return BNB_ADDRESS
    case TYPE_CHAIN.MON:
      return MON_ADDRESS   
    default:
      return ''
  }
}

export const getMinBalanceTradeByChain = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      if (isDevelopmentMode) return 0
      return MIN_BALANCE_SOL
    case TYPE_CHAIN.BSC:
      if (isDevelopmentMode) return 0
      return MIN_BALANCE_BNB
    case TYPE_CHAIN.MON:
      if (isDevelopmentMode) return 0
      return MIN_BALANCE_MON
    default:
      return 0
  }
} 

export const getDefaultDecimalsByChain = (chain: TYPE_CHAIN) => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return 9
    case TYPE_CHAIN.BSC:
      return 18
    case TYPE_CHAIN.MON:
      return 18  
    default:
      return 9
  }
}

const proxyFetcher: typeof fetch = async (input, init) => {
  const accessToken = ServiceConfig.token
  if (!accessToken) {
    return Promise.resolve(Response.error())
  }

  const headers = new Headers(init?.headers || {})
  headers.set('Authorization', `Bearer ${ServiceConfig.token}`)
  headers.set('Content-Type', `application/json`)

  return fetch(input, {
    ...init,
    headers,
  })
}

export const solanaMemeProxyConnection = new Connection(`${Configs.rpcProxyUrl}?chain=SOLANA`, {
  disableRetryOnRateLimit: true,
  commitment: 'confirmed',
  fetch: proxyFetcher,
})
