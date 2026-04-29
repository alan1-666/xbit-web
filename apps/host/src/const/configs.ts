import { ChainIds } from '@/types/enums.ts'
import ls from '@/lib/local-storage.ts'

const isDev = import.meta.env.DEV

// const isMainnet = true

export class Configs {
  static get commitSHA(): string {
    return (import.meta.env.VITE_COMMIT_SHA || '').trim()
  }
  static get isDev() {
    return isDev
  }
  static get socketUrl() {
    return (import.meta.env.VITE_SOCKET_URL || '').trim()
  }
  static get socketUrlDex() {
    return (import.meta.env.VITE_SOCKET_URL_DEX || '').trim()
  }
  static get trackingId(): string {
    return (import.meta.env.VITE_GA_TRACKING_ID || '').trim()
  }
  static get telegramBot(): string {
    return (import.meta.env.VITE_TELEGRAM_BOT || '').trim()
  }
  static get urlApiJup(): string {
    return 'https://api.jup.ag'
  }
  static get hyperliquidInfoUrl(): string {
    return 'https://api.hyperliquid.xyz/info'
  }
  static getHyperliquidConfig() {
    const isMainnet = import.meta.env.VITE_HYPERLIQUID_NETWORK === 'mainnet'

    const baseUrl = isMainnet ? 'https://api.hyperliquid.xyz' : 'https://api.hyperliquid-testnet.xyz'

    const chainIdHex = isMainnet ? '0xa4b1' : '0x66eee'
    const env = isMainnet ? 'mainnet' : 'testnet'
    const imgUrl = baseUrl.replace('api.', 'app.') + '/coins'

    const wssUrl = baseUrl.replace('https', 'wss') + '/ws'

    return {
      wss: wssUrl,
      apiUrl: baseUrl,
      chainIdHex,
      env,
      imgUrl,
    }
  }

  static get rpcProxyUrl(): string {
    return (import.meta.env.VITE_RPC_PROXY_MEME || '').trim()
  }
  static get rpcSocketUrl(): string {
    return (import.meta.env.VITE_RPC_PROXY_MEME || '').replace('http', 'ws').trim()
  }
  static getMinimalWithdrawableSol(): number {
    return Number(import.meta.env.VITE_MIN_WITHDRAWABLE_SOL || 0.01)
  }
  static getMinimalWithdrawableEth(): number {
    return Number(import.meta.env.VITE_MIN_WITHDRAWABLE_ETH || 0.0002)
  }
  static getMinimalWithdrawableArb(): number {
    return Number(import.meta.env.VITE_MIN_WITHDRAWABLE_ARB || 0.00004)
  }
  static getMinimalWithdrawableBnb(): number {
    return Number(import.meta.env.VITE_MIN_WITHDRAWABLE_BNB || 0.0001)
  }
  static getMinimalWithdrawableMon(): number {
    return Number(import.meta.env.VITE_MIN_WITHDRAWABLE_MON || 0.05)
  }
  static isProdEnv(): boolean {
    return import.meta.env.VITE_STAGE === 'prod'
  }
  // 专用于 K 线历史数据 candleSnapshot
  static getHypertraderInfoUrl(): string {
    return (import.meta.env.VITE_CANDLE_SNAPSHOT_INFO_URL || Configs.hyperliquidInfoUrl).trim()
  }
  // 专用于 K 线 WebSocket 订阅
  static getCandleWssUrl(): string {
    return (import.meta.env.VITE_CANDLE_WSS_URL || 'wss://unstable-hypertrader-ws-broadcaster.xbit.live/ws').trim()
  }
  static enableBSC(): boolean {
    return false
  }
  static enableMonad(): boolean {
    return true
  }
  static enableSolana(): boolean {
    const isProd = Configs.isProdEnv()
    if (!isProd) {
      return ls.get('enable_solana')
    }
    return false
  }
  static getRelayHost(): string {
    return import.meta.env.VITE_RELAY_HOST
  }
  static supportedRouteChains = () => {
    const supportedChains = ['eth', 'arb', 'mon']
    if (Configs.enableBSC()) {
      supportedChains.push('bsc')
    }
    if (Configs.enableSolana()) {
      supportedChains.push('sol')
    }
    if (Configs.enableMonad()) {
      supportedChains.push('mon')
    }
    return supportedChains
  }
  static getDefaultPortfolioChain(): ChainIds {
    if (Configs.enableSolana()) return ChainIds.Solana
    if (Configs.enableBSC()) return ChainIds.Bsc
    if (Configs.enableMonad()) return ChainIds.Mon
    return ChainIds.Solana
  }
  static getDefaultTransferToken(): string {
    if (Configs.enableSolana()) return 'SOL'
    if (Configs.enableBSC()) return 'BNB'
    if (Configs.enableMonad()) return 'MON'
    return 'SOL'
  }
  static getStage(): string {
    return (import.meta.env.VITE_STAGE || 'dev').trim()
  }
  static enablePerpetualSmartMoney(): boolean {
    return true
  }
  static enableFundingRate(): boolean {
    return !Configs.isProdEnv()
  }
  static enablePredictionMarket(): boolean {
    return !Configs.isProdEnv()
  }
  static oneSignalAppId(): string {
    return (import.meta.env.VITE_ONE_SIGNAL_APP_ID || '').trim()
  }
}

export const TTL_STORAGE = 1000 * 60 * 60 * 24 // 24 hours
export const TTL_PORTFOLIO_STORAGE = 30000 // 30 seconds
export const TTL_MAINTENANCE = 1000 * 60 * 30 // 30 minutes

export const NOTICE_DEPRECATED_STORAGE_KEY = 'deprecated_asset_notice'
export const BACK_UP_MNEMONIC_STORAGE_KEY = 'private-keys-backup'
export const OPEN_BACKUP_MODAL = 'OPEN_BACKUP_MODAL'
