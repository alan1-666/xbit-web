import { ChainIds } from '@/types/enums'
import { PublicKey } from '@solana/web3.js'
export function isSolanaWallet(wallet: string) {
  try {
    new PublicKey(wallet)
    return true
  } catch (e) {
    return false
  }
}

export function isOnCurve(address: string): boolean {
  try {
    const pubkey = new PublicKey(address)
    return PublicKey.isOnCurve(pubkey.toBytes())
  } catch {
    return false
  }
}

export function isBscWalletAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isCorrectWalletAddress(address: string, chainId: ChainIds) {
  if (chainId === ChainIds.Solana) {
    return isSolanaWallet(address)
  } else if (chainId === ChainIds.Bsc) {
    return isBscWalletAddress(address)
  }
  return false
}
