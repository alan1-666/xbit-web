import { generateAgentWallet } from './agentWallet'
import { encryptPrivateKey, decryptPrivateKey } from './cryptoUtils'
import { loadAgentWallet, saveAgentWallet } from './indexedDbUtils'
import { Wallet } from 'ethers'
import CryptoJS from 'crypto-js'


export function hashAddress(address: string): string {
  return CryptoJS.SHA256(address).toString(CryptoJS.enc.Hex)
}

export async function initAgentWalletIfNeeded(address: string): Promise<void> {
  const key = hashAddress(address)
  const existing = await loadAgentWallet(key)
  if (existing) return

  const agent = generateAgentWallet()
  
  const encrypted = await encryptPrivateKey(agent.privateKey, key)
  await saveAgentWallet(key, encrypted)
}

export async function getAgentWallet(address: string): Promise<Wallet> {
  const key = hashAddress(address)
  const encrypted = await loadAgentWallet(key)
  if (!encrypted) throw new Error('Agent wallet not found')
  const decrypted = await decryptPrivateKey(encrypted.cipher, encrypted.iv, key)
  return new Wallet(decrypted)
}

export async function hasAgentWallet(address: string): Promise<boolean> {
  const key = hashAddress(address)
  const encrypted = await loadAgentWallet(key)
  return !!encrypted
}

export async function getAgentWalletEncrypted(address: string): Promise<any> {
  const key = hashAddress(address)
  const encrypted = await loadAgentWallet(key)
  return encrypted
}

export async function getAgentWalletByHashKey(key: string): Promise<Wallet> {
  const encrypted = await loadAgentWallet(key)
  if (!encrypted) throw new Error('Agent wallet not found')
  const decrypted = await decryptPrivateKey(encrypted.cipher, encrypted.iv, key)
  return new Wallet(decrypted)
}

