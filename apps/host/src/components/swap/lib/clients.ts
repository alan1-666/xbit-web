import { Connection } from '@solana/web3.js';
import { createPublicClient, createWalletClient, http } from 'viem'
import { mainnet, bsc, arbitrum, monad, Chain } from 'viem/chains'

type ChainKey = 'eth' | 'arbitrum' | 'solana' | 'bsc' | 'monad';

export const chainConfigs: Record<ChainKey, { chain?: Chain; rpcUrl: string; type: 'evm' | 'solana' }> = {
  eth: {
    chain: mainnet,
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    type: 'evm',
  },
  bsc: {
    chain: bsc,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    type: 'evm',
  },
  arbitrum: {
    chain: arbitrum,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    type: 'evm',
  },
  solana: {
    rpcUrl: 'https://solana-rpc.publicnode.com',
    type: 'solana',
  },
  monad: {
    chain: monad,
    rpcUrl: 'https://rpc.monad.xyz/',
    type: 'evm',
  },
}

// Factory for public client (EVM only)
export function getPublicClient(chainKey: Exclude<ChainKey, 'solana'>) {
  const config = chainConfigs[chainKey]
  if (config.type !== 'evm' || !config.chain) {
    throw new Error(`Invalid EVM chain: ${chainKey}`)
  }
  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  })
}

// Factory for wallet client (EVM only)
export function getWalletClient(chainKey: Exclude<ChainKey, 'solana'>, account: any) {
  const config = chainConfigs[chainKey]
  if (config.type !== 'evm' || !config.chain) {
    throw new Error(`Invalid EVM chain: ${chainKey}`)
  }
  return createWalletClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
    account,
  })
}

// Factory for Solana connection
export function getSolanaConnection(): Connection {
  const config = chainConfigs.solana
  return new Connection(config.rpcUrl, 'confirmed')
}

// Get chain configuration
export function getChainConfig(chainKey: ChainKey) {
  return chainConfigs[chainKey]
}

// Get all chain keys
export function getAllChainKeys(): ChainKey[] {
  return Object.keys(chainConfigs) as ChainKey[]
}