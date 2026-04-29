import { randomBytes } from 'crypto'
import { Wallet } from 'ethers'

export function generateAgentWallet(): Wallet {
  const entropy = randomBytes(32)
  const wallet = Wallet.createRandom({ extraEntropy: entropy })
  return wallet
}
