// types/wallet.ts
export interface WalletState {
  isConnected: boolean
  publicKey: string | null
  walletName: string | null
}