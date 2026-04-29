import { PublicKey } from '@solana/web3.js'
export function isSolanaWallet(wallet: string) {
  try {
    new PublicKey(wallet)
    return true
  } catch (e) {
    return false
  }
}
export function isEthereumWallet(wallet: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet)
}
export function isBitcoinWallet(wallet: string) {
  return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(wallet)
}
export function isTronWallet(wallet: string) {
  return /^T[a-zA-Z0-9]{33}$/.test(wallet)
}
export function isLitecoinWallet(wallet: string) {
  return /^[LM3][a-zA-Z0-9]{26,33}$/.test(wallet)
}
export function isRippleWallet(wallet: string) {
  return /^[rR][a-zA-Z0-9]{25,34}$/.test(wallet)
}
export function isDogecoinWallet(wallet: string) {
  return /^[D9][a-zA-Z0-9]{26,33}$/.test(wallet)
}
export function isCardanoWallet(wallet: string) {
  return /^(addr1|DdzFFzC)[a-zA-Z0-9]{58,}$/.test(wallet)
}
export function isPolygonWallet(wallet: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet)
}
export function isAvalancheWallet(wallet: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet)
}
export function isCosmosWallet(wallet: string) {
  return /^[a-zA-Z0-9]{42}$/.test(wallet)
}
export function isTezosWallet(wallet: string) {         
  return /^[a-zA-Z0-9]{36}$/.test(wallet)
}
export function isAlgorandWallet(wallet: string) {
  return /^[A-Z2-7]{58}$/.test(wallet)
}
export function isZilliqaWallet(wallet: string) {
  return /^[a-zA-Z0-9]{42}$/.test(wallet)
}
export function isStellarWallet(wallet: string) {
  return /^[G][a-zA-Z0-9]{55}$/.test(wallet)
}
export function isNearWallet(wallet: string) {
  return /^[a-zA-Z0-9]{64}$/.test(wallet)
}
export function isBscWallet(wallet: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet)
}
export function isBaseWallet(wallet: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet)
}
export function isTrxWallet(wallet: string) {
  return /^T[a-zA-Z0-9]{33}$/.test(wallet)
}